import CampaignBasics from '/collections/CampaignBasics'
// this is so that I can clean out the collection from the browser console
// just call Meteor.call('removeCampaignBasics')
// remove all can only be done from server
Meteor.methods({
    'removeCampaigns': function (account) {
        console.log('removing CampaignBasicsList collection for a single account')
        CampaignBasics.remove( {} );
        return "removed!"
    }
});

Meteor.methods({
    'getCampaigns': function (accountNumber) {
        CampaignBasics.remove({account_id: accountNumber});
        console.log('RUNNING getCampaigns!', accountNumber);

        let campaignOverviewArray = [];
        let campaignOverview;
        try {
            let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/act_'+accountNumber+'/campaigns?fields=name,created_time,start_time,stop_time,updated_time,objective,id,account_id&limit=50&access_token='+token+'', {});
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
        try {
            for (let i = 0; i < campaignOverviewArray.length; i++) {
                for (let j = 0; j < campaignOverviewArray[i].length; j++) {
                    CampaignBasics.insert({
                        name: campaignOverviewArray[i][j].name,
                        created_time: moment(campaignOverviewArray[i][j].created_time).format("MM-DD-YYYY hh:mm a"),
                        start_time: moment(campaignOverviewArray[i][j].start_time).format("MM-DD-YYYY hh:mm a"),
                        stop_time: moment(campaignOverviewArray[i][j].stop_time).format("MM-DD-YYYY hh:mm a"),
                        updated_time: moment(campaignOverviewArray[i][j].updated_time).format("MM-DD-YYYY hh:mm a"),
                        objective: campaignOverviewArray[i][j].objective,
                        campaign_id: campaignOverviewArray[i][j].id,
                        inserted: moment().format("MM-DD-YYYY hh:mm a"),
                        received_creative: false,
                        signed_IO: false,
                        approved_targeting: false,
                        received_tracking: false,
                        sort_time_start: campaignOverviewArray[i][j].start_time,
                        sort_time_stop: campaignOverviewArray[i][j].stop_time,
                        account_id: campaignOverviewArray[i][j].account_id
                    });
                }
            }
        } catch(e) {
            console.log('error in the mongo insert clause:', e);
        }

        return "success!";
    }
});

// need a meteor.publish here
Meteor.publish('campaignBasicsList', function (opts) {
  if (! opts) {
    return CampaignBasics.find({});
  } else if (opts.toString().length < 15) {
    return CampaignBasics.find({campaign_id: opts}, {sort: {sort_time_start: -1}});
  } else if (opts.toString().length === 15) {
    return CampaignBasics.find({account_id: opts}, {sort: {sort_time_start: -1}});
  }

});
