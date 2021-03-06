import CampaignBasics from '/collections/CampaignBasics';
import Initiatives from '/collections/Initiatives';
import { apiVersion } from '/server/token/token';
import { Meteor } from 'meteor/meteor';
const token = require('/server/token/token.js');


Meteor.startup(function () {
  CampaignBasics._ensureIndex({"data.campaign_id": 1}, {unique: 1});
});

Meteor.methods({
    'removeCampaigns': function (account) {
        console.log('removing CampaignBasicsList collection for a single account')
        CampaignBasics.remove( {} );
        return "removed!"
    }
});

Meteor.methods({
    'getCampaigns': function (accountNumber) {
        CampaignBasics.remove({'data.account_id': accountNumber});
        let campaignOverviewArray = [];
        let campaignOverview;
        try {
            let result = HTTP.call('GET', 'https://graph.facebook.com/'+apiVersion+'/act_'+accountNumber+'/campaigns?fields=name,created_time,start_time,stop_time,updated_time,objective,id,account_id&limit=50&access_token='+token.token+'', {});
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

        campaignOverviewArray = _.flatten(campaignOverviewArray);

        campaignOverviewArray.forEach(el => {
            try {
                Initiatives._ensureIndex({
                    "search_text": "text"
                });
                let inits = Initiatives.find(
                    {$text: {$search: el.name}},
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
            }
        });
        campaignOverviewArray.forEach(el => {
            el['platform'] = 'facebook';
            if (el.id) {
                el['campaign_id'] = el.id;

                delete el['id'];
            }
        });

        campaignOverviewArray.forEach(el => {
            CampaignBasics.insert({
                data: el
            });
        });
        return "success!";
    },
    deleteCampaignBasic: (camp_id, campName, initName, campaignID) => {
        console.log(campaignID, campName)
        CampaignBasics.remove({_id: camp_id});
        const init = Initiatives.findOne({name: initName});

        Initiatives.update(
          {_id: init._id},
          {$pull: {
            campaign_names: campName,
            campaign_ids: campaignID
            }
          }
        );

        return 'success';
    }
});

// need a meteor.publish here
Meteor.publish('campaignBasicsList', function (opts) {
    const init = Initiatives.findOne(opts._id);

  if (opts.spending === "spending") {
    return CampaignBasics.find({}, {fields: {'data.name': 1, 'data.start_time': 1, 'data.stop_time': 1}});
  }

  if (opts.page === "homepage") {
    const init = Initiatives.findOne({_id: opts._id});
    // lookup initiative and match campaigns to that\
    return CampaignBasics.find({"data.initiative": init.name});

  } else if (init) {

    return CampaignBasics.find({'data.initiative': init.name});

  } else if (opts.page === "edit") {

    return CampaignBasics.find();

  } else if (! opts) {
    return CampaignBasics.find({});

  }  else if (opts.toString().length < 15) {

    // had to add this 'test' logic to say if you can't find anything looking at
    // data.campaign_id, try data.account_id (which is likely to be where the twitter
    // match will come from)

    const test = CampaignBasics.find({"data.campaign_id": opts}, {sort: {"data.start_time": -1}}).fetch();
    if (test.length === 0) {
        const twitterCampaigns = CampaignBasics.find({'data.account_id': opts}, {sort: {'data.start_time': 1}});
        return twitterCampaigns
    } else {
        return CampaignBasics.find({"data.campaign_id": opts}, {sort: {"data.start_time": -1}})
    }

    return test;

  } else if (opts.toString().length >= 15) {
    return CampaignBasics.find({"data.account_id": opts}, {sort: {"data.start_time": -1}});
  }

});
