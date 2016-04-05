  /*
SyncedCron.add({
    name: "Background Campaign Basics Getter",
    schedule: function (parser) {
        return parser.text('every 15 seconds');
        return parser.text('at 5:00pm');
    },

    job: function(intendedAt) {
      const stuff = Accounts.find(
        {name: {
          $in: ["Tom Gore", "Robert Mondavi Winery", "Luchese"]
        }
      }).fetch();

      if (stuff && stuff[0].account_id) {
        let counter = 0;

        while (true) {

          if (counter >= stuff.length) {
            console.log('nothing to do');
            break;
          } else {
            console.log('running getCampaignBasics job!');
            CampaignBasics.remove({account_id: stuff[counter].account_id});
            let campaignOverviewArray = [];
            let campaignOverview;
            try {

              let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/act_'+stuff[counter].account_id+'/campaigns?fields=name,created_time,start_time,stop_time,updated_time,objective,id,account_id&limit=50&access_token='+token+'', {});
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
              counter++;
              console.log('campain basic insertion completed without error');
            } catch(e) {
                console.log('error in the mongo insert clause:', e);
            }
        console.log('job run at:', intendedAt);
        }
      }
    }
  }
});
  */
