if (Meteor.isServer) {

    // this is so that I can clean out the collection from the browser console
    // just call Meteor.call('removeCampaign')
    // remove all can only be done from server
    Meteor.methods({
        'removeCampaign': function () {
            console.log('removing CampaignBasicsList collection')
            CampaignBasicsList.remove( {} )
        }
    });

    Meteor.methods({
        'getCampaigns': function (accountNumber) {
            let campaignOverviewArray = [];
            let campaignOverview;
            try{
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
                        CampaignBasicsList.insert({
                            name: campaignOverviewArray[i][j].name,
                            created_time: moment(campaignOverviewArray[i][j].created_time).format("MM-DD-YYYY HH:MM"),
                            start_time: moment(campaignOverviewArray[i][j].start_time).format("MM-DD-YYYY HH:MM"),
                            stop_time: moment(campaignOverviewArray[i][j].stop_time).format("MM-DD-YYYY HH:MM"),
                            updated_time: moment(campaignOverviewArray[i][j].updated_time).format("MM-DD-YYYY HH:MM"),
                            objective: campaignOverviewArray[i][j].objective,
                            campaign_id: campaignOverviewArray[i][j].id,
                            inserted: moment().format("MM-DD-YYYY"),
                            received_creative: false,
                            signed_IO: false,
                            approved_targeting: false,
                            received_tracking: false,
                            sort_time_start: campaignOverviewArray[i][j].start_time,
                            account_id: campaignOverviewArray[i][j].account_id
                        });
                    }
                }
            } catch(e) {
                console.log('error in the mongo insert clause:', e)
            } finally {
                return campaignOverviewArray;
            }
        }
    });


};
