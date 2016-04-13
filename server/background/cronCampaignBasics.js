
SyncedCron.add({
    name: "Background Campaign Basics Getter",
    schedule: function (parser) {
        return parser.text('at 3:20pm');
    },

    job: function(intendedAt) {
      const accts = MasterAccounts.find(
        {name: {
          $in: ["Tom Gore", "Robert Mondavi Winery", "Luchese", "Ruffino", "Kim Crawford"]
          // $in: ['Ruffino']
        }
      }).fetch();
      // const accts = MasterAccounts.find({}).fetch()

      const idArray = _.map(accts, function (el) { return el.account_id; });
      console.log("idArray", idArray);


      if (idArray) {
        let counter = 0;

        const setIntervalId = Meteor.setInterval(function () {

          if (counter >= idArray.length) {
            console.log('clear the interval')
            counter++;
            Meteor.clearInterval(setIntervalId);
          } else {

            const basicsArray = CampaignBasics.find(
              {account_id: idArray[counter]
            }).fetch();

            console.log('count all basics', CampaignBasics.find().count());

            console.log('length of basicsArray', basicsArray.length);
            // this is an array of all the campaign basics objects

            let filteredArray = _.map(basicsArray, function (el) {
              return el['campaign_id']
            });

            console.log('length of filteredArray', filteredArray.length);
            // this is an array of pure campaign_ids


            try {
              const campaignOverviewArray = [];
              let campaignOverview;

              let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/act_'+ idArray[counter] +'/campaigns?fields=name,created_time,start_time,stop_time,objective,id,account_id&limit=50&access_token='+token+'', {});
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

              const flattenedArray = _.flatten(campaignOverviewArray);
              console.log("campaignOverviewArray length:", flattenedArray.length)

              const lengthDiff = flattenedArray.length - filteredArray.length;
              console.log('lengthDiff', lengthDiff);

              let arrayToInsert = [];

              if (lengthDiff >= 1) {
                // cut API array to only new campaigns, this takes the first
                // n number of camapigns
                arrayToInsert = _.first(flattenedArray, lengthDiff);
                for (let i = arrayToInsert.length - 1; i>= 0; i--) {
                  console.log('to be inserted camp name:', arrayToInsert[i].name);
                  CampaignBasics.insert({
                    name: arrayToInsert[i].name,
                    created_time: moment(arrayToInsert[i].created_time).format("MM-DD-YYYY hh:mm a"),
                    start_time: moment(arrayToInsert[i].start_time).format("MM-DD-YYYY hh:mm a"),
                    stop_time: moment(arrayToInsert[i].stop_time).format("MM-DD-YYYY hh:mm a"),
                    objective: arrayToInsert[i].objective,
                    campaign_id: arrayToInsert[i].id,
                    inserted: moment().format("MM-DD-YYYY hh:mm a"),
                    received_creative: false,
                    signed_IO: false,
                    approved_targeting: false,
                    received_tracking: false,
                    sort_time_start: arrayToInsert[i].start_time,
                    sort_time_stop: arrayToInsert[i].stop_time,
                    account_id: arrayToInsert[i].account_id
                  });
                }
              }
            } catch(e) {
                console.log('Error in top level try catch', e);
            }
          counter++;
          } // end of else block
        }, 5000);
      } // end of if
  } // end of job
}); // end of SyncedCron.add
