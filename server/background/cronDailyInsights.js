// import { Meteor } from 'meteor/meteor'
// import { SyncedCron } from 'meteor/percolate:synced-cron';
// import { Moment } from 'meteor/momentjs:moment'
// import CampaignInsights from '/collections/CampaignInsights'
// import Initiatives from '/collections/Initiatives'
// import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays'
// import { apiVersion } from '/server/token/token'
// const later = require('later');

// SyncedCron.config({
//   collectionName: 'cronCollection'
// });

// SyncedCron.add({
//   name: "Daily Insights Background Getter",

//   schedule: function (parser) {
//     return parser.text('at 12:56pm');
//   },

//   job: function (time) {

//     *
//     * in this cron function we want to pull in daily insights at a set time

//     * We will start with a list of campaignInsights which I can get through
//     * Mongo find() and we can iterate over that list, and boil it down to just
//     * the campaign_id's.

//     * We can then run a Meteor.setInterval:

//     * Our first checks should be for if the inserted date is in the past and if
//     * the counter has hit the length of the array. Two if statements found in
//     * other cron functions.

//     * We also need to make sure there are no duplicates. Not sure how this will
//     * work. If the first two checks have passed, maybe we will remove all dailyInsights
//     * with a particular campaign_id.
//     *
//     *
//     *

//     const insightIdArray = CampaignInsights.find({}).fetch();
//     // const insightIdArray = CampaignInsights.find({'data.initiative': 'Kim Crawford 2017 Q1 Page Post'}).fetch();

//     // if now is after start date, include it, and if now is before the
//     // stop date, include it
//     let idArray;
//     // idArray = _.filter(insightIdArray, (el) => {
//     //   if (moment().isAfter(moment(el.data.date_start, "MM-DD-YYYY hh:mm a"))) {
//     //     return el;
//     //   }
//     // });
//     let cleanArray = [];
//     // idArray = _.filter(insightIdArray, (el) => {
//     //   if (moment(el.data.date_stop, "MM-DD-YYYY").isAfter(moment())) {
//     //     return el;
//     //   }
//     // });

//     // if end is after now AND now is after start date
//     insightIdArray.forEach(el => {
//       console.log("end date:", el.data.date_stop);
//       if (moment(el.data.date_stop, "MM-DD-YYYY").isAfter(moment()) && moment().isAfter(moment(el.data.date_start, "MM-DD-YYYY"))) {
//         cleanArray.push(el.data);
//       }
//     });

//     console.log(cleanArray.length)
//     console.log('cleanArray', cleanArray);


//     idArray = _.map(idArray, (el) => {
//       return el.data.campaign_id;
//     });

//     // at this point we have a clean array of
//     // just campaign ID's


//   } // end of job
// });
