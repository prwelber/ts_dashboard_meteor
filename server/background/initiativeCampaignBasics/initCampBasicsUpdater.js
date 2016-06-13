import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import { Moment } from 'meteor/momentjs:moment';
import { apiVersion } from '/server/token/token'
import { HTTP } from 'meteor/http'
import { basicsUpdater } from './initCampBasicsUpdaterFunc';
import CampaignBasics from '/collections/CampaignBasics';
import Initiatives from '/collections/Initiatives';
import MasterAccounts from '/collections/MasterAccounts';
const later = require('later');

SyncedCron.config({
  collectionName: 'cronCollection'
});

SyncedCron.add({
  name: "Campaign Basic Updater",
  schedule: (parser) => {
    return parser.text('at 12:35pm')
  },
  job: () => {
    // first get all active inits
    // second get brand for each init and grab that account_id
    // third get all campBasics according to account_id and boil them down to
    //  an array of campaign_ids
    // fourth make a http request to FB to get campaigns according to account_id
    // fifth make the new campaign list into a list of campaign_ids
    // sixth compare the two and grab the new campaign_ids that do not exist in old list

    const initBrandList = Initiatives.find({userActive: true}, {fields: {brand: 1, _id: 0}}).fetch();

    const brandIds = initBrandList.map((brand) => {
      return MasterAccounts.findOne({name: brand.brand}, {fields: {account_id: 1, _id: 0}});
    });

    let counter = 0;
    const setIntervalId = Meteor.setInterval(() => { // starts interval

      if (counter >= brandIds.length) {
        counter++;
        Meteor.clearInterval(setIntervalId);
      } else {
        // will get all campBasics for each account_id in brandIds array
        const basics = CampaignBasics.find({'data.account_id': brandIds[0].account_id}, {fields: {'data.campaign_id': 1, 'data.name': 1, _id: 0}}).fetch();

        const updatedBasics = basics.map((el) => {
          return el.data.campaign_id;
        });

        // now make FB api request to get list of new basics
        let campaignOverview;
        let campaignOverviewArray = [];
        try {
          let result = HTTP.call('GET', 'https://graph.facebook.com/'+apiVersion+'/act_'+brandIds[counter].account_id+'/campaigns?fields=name,created_time,start_time,stop_time,updated_time,objective,id,account_id&limit=50&access_token='+token+'', {});
          campaignOverview = result;

          campaignOverviewArray.push(campaignOverview.data.data);

          while (true) {
            try {
              campaignOverview = HTTP.call('GET', campaignOverview.data.paging['next'], {});
              campaignOverviewArray.push(campaignOverview.data.data);
            } catch(e) {
              console.log('no more pages and error:', e);
              break;
            }
          }
        } catch(e) {
            console.log('Error in top level http call and try catch', e);
            counter++;
            Meteor.clearInterval(setIntervalId);
        }
        campaignOverviewArray = _.flatten(campaignOverviewArray);

        const newIds = campaignOverviewArray.map((el) => {
          return el.id;
        });

        const onlyIds = _.uniq(newIds);

        const newCampaigns = basicsUpdater.arrayDiffer(updatedBasics, onlyIds);

        // this will leave me with an array of ids that didn't exist
        // in the original set

        // these ids should be grabbed from the updated array and the entire
        // object should be inserted

        // now, loop over newCampaigns, take each one, assign it an initiative
        // then do the other stuff, and finally insert into DB

        let newCampaignBasics = campaignOverviewArray.map((el) => {
          // reads 'if el.id is in newCampaigns, return it'
          if (newCampaigns.indexOf(el.id) >= 0) {
            return el;
          }
        });

        newCampaignBasics = _.without(newCampaignBasics, undefined);

        newCampaignBasics.forEach(el => {
          try {
            Initiatives._ensureIndex({
              "search_text": "text" // set the index to the search text
            });
            let inits = Initiatives.find(
              // compare search_text with campaign name
              {$text: {$search: el.name, $caseSensitive: false}},
              {
                fields: {
                  score: {$meta: "textScore"}
                },
                sort: {
                  score: {$meta: "textScore"}
                }
              }
            ).fetch();
            inits = inits[0];
            el['initiative'] = inits.name;

            Initiatives.update(
              {name: inits.name},
              {$addToSet: {
                campaign_names: el.name,
                campaign_ids: el.id
              }
            });

            el['campaign_id'] = el.id;
            delete el['id'];

          } catch(e) {
            console.log("Error matching campaignBasic and initiative", e);
            console.log("Clearing Interval in initCampBasicsUpdater.js");
            Meteor.clearInterval(setIntervalId);
          }
        });

        newCampaignBasics.forEach(el => {
            if (el.id) {
              el['campaign_id'] = el.id;
              delete el['id'];
            }
        });
        try {
          newCampaignBasics.forEach(el => {
            CampaignBasics.update(
              {'data.campaign_id': el.campaign_id},
              {data: el},
              {upsert: true}
            );
          });
        } catch(e) {
          console.log("Error inserting campaignBasic:", e);
        }

        counter++;
        console.log('COUNTER', counter);
      } // end of else
    }, 4000); // end of Meteor.setInterval()
  } // end of job
});
