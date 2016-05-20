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
    return parser.text('at 12:38pm')
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
    console.log(initBrandList);
    const brandIds = initBrandList.map((brand) => {
      return MasterAccounts.findOne({name: brand.brand}, {fields: {account_id: 1, _id: 0}});
    });
    console.log(brandIds);

    let counter = 0;
    const setIntervalId = Meteor.setInterval(() => { // starts interval

      if (counter === 1) {
        counter++;
        Meteor.clearInterval(setIntervalId);
      } else {
        // will get all campBasics for each account_id in brandIds array
        const basics = CampaignBasics.find({'data.account_id': brandIds[0].account_id}, {fields: {'data.campaign_id': 1, 'data.name': 1, _id: 0}}).fetch();
        console.log("basics", basics[0], basics[1], basics[2])
        console.log('basics.length', basics.length);

        // now make FB api request to get list of new basics
        let campaignOverview;
        let campaignOverviewArray = [];
        try {
          let result = HTTP.call('GET', 'https://graph.facebook.com/'+apiVersion+'/act_'+brandIds[0].account_id+'/campaigns?fields=name,created_time,start_time,stop_time,updated_time,objective,id,account_id&limit=50&access_token='+token+'', {});
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
            console.log('Error in top level try catch', e);
        }
        console.log('campaignOverviewArray', campaignOverviewArray);
        campaignOverviewArray = _.flatten(campaignOverviewArray);
        const newIds = campaignOverviewArray.map((el) => {
          return el.id;
        });
        console.log("newIds", newIds)
        console.log('newIds.length', newIds.length)
        const onlyIds = _.uniq(newIds);
        console.log("onlyIds", onlyIds)
        console.log('onlyIds.length', onlyIds.length)



        counter++;
      } // end of else
    }, 2000); // end of Meteor.setInterval()
  } // end of job
});
