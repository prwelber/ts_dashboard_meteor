const later = require('later');
import { Meteor } from 'meteor/meteor'

SyncedCron.config({
  collectionName: 'cronCollection'
});

SyncedCron.add({
  name: "Background Daily Insights Getter",

  schedule: function (parser) {
    return parser.text('at 3:00pm');
  },

  job: function (time) {

    /**
    * in this cron function we want to pull in daily insights at a set time

    * We will start with a list of campaignInsights which I can get through
    * Mongo find() and we can iterate over that list, and boil it down to just
    * the campaign_id's.

    * We can then run a Meteor.setInterval:

    * Our first checks should be for if the inserted date is in the past and if
    * the counter has hit the length of the array. Two if statements found in
    * other cron functions.

    * We also need to make sure there are no duplicates. Not sure how this will
    * work. If the first two checks have passed, maybe we will remove all dailyInsights
    * with a particular campaign_id.
    *
    *
    **/
    let insightIdArray = CampaignInsights.find({}, {'data.campaign_id': 1, _id: 0}).fetch();


    idArray = _.filter(insightIdArray, (el) => {
      if (moment().isAfter(moment(el.data.date_start, "MM-DD-YYYY hh:mm a"))) {
        return el
      }
    });


    idArray = _.map(idArray, (el) => {
      return el.data.campaign_id;
    });

    // at this point we have a clean array of 
    // just campaign ID's

    if (idArray) {
      
      let counter = 0;

      const setIntervalId = Meteor.setInterval(function () {

        const campaignData = CampaignInsights.findOne({
          'data.campaign_id': idArray[counter]
        });

        

      }); // end of Meteor.setInterval

    } // end if if(idArray)

  } // end of job
});
