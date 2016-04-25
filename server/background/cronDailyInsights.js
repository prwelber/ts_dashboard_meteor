// const later = require('later');
// import { Meteor } from 'meteor/meteor'
// import CampaignInsights from '/collections/CampaignInsights'
// import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays'

// SyncedCron.config({
//   collectionName: 'cronCollection'
// });

// SyncedCron.add({
//   name: "Daily Insights Background Getter",

//   schedule: function (parser) {
//     return parser.text('at 10:51am');
//   },

//   job: function (time) {

//     /**
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
//     **/

//     // let insightIdArray = CampaignInsights.find(
//     // {'data.campaign_name': {$regex: /Lucchese/i}},
//     // {'data.campaign_id': 1, _id: 0}
//     // ).fetch();

//     const insightIdArray = CampaignInsights.find({}).fetch();
//     // const insightIdArray = CampaignInsights.find({'data.initiative': 'Kim Crawford 2017 Q1 Page Post'}).fetch();


//     idArray = _.filter(insightIdArray, (el) => {
//       if (moment().isAfter(moment(el.data.date_start, "MM-DD-YYYY hh:mm a"))) {
//         return el
//       }
//     });

//     idArray = _.map(idArray, (el) => {
//       return el.data.campaign_id;
//     });
//     // at this point we have a clean array of
//     // just campaign ID's

//     if (idArray.length >= 1) {

//       let counter = 0;

//       console.log('idArray length', idArray.length);
//       const setIntervalId = Meteor.setInterval(function () {
//         console.log('start of interval');
//         const dayBreakdown = InsightsBreakdownsByDays.findOne({
//           'data.campaign_id': idArray[counter]
//         });

//         /*
//         * These if / else if statements say the following:
//         * if the counter is greater than or equal to the array length, quit
//         * if inserted date is after end date of campaign, do nothing
//         * else, run the download job
//         */
//         if (counter >= idArray.length) {
//           console.log('nothing to do in cronDailyInsights');
//           counter++;
//           Meteor.clearInterval(setIntervalId);
//         } else if ((dayBreakdown && dayBreakdown.data.inserted) && (moment(dayBreakdown.data.inserted, "MM-DD-YYYY").isAfter(moment(dayBreakdown.data.date_stop, "MM-DD-YYYY")))) {
//           console.log('no need to update old data')
//           console.log('counter', counter);
//           counter++;

//         } else {

//           console.log('getDailyBreakdown background job running');
//           console.log('counter', counter);
//           // remove any old versions
//           InsightsBreakdownsByDays.remove({'data.campaign_id': idArray[counter]});

//           // this begins the portion of the code taken from
//           // the server method

//           let dailyBreakdownArray = [];
//           const masterArray = [];
//           let breakdown;

//           let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+idArray[counter]+'/insights?fields=date_start,date_stop,campaign_id,campaign_name,total_actions,impressions,spend,reach,ctr,cpm,cpp,actions,cost_per_action_type&time_increment=1&access_token='+token+'', {});
//           breakdown = result;
//           //breakdown is an array of objects
//           dailyBreakdownArray.push(breakdown.data.data);
//           while (true) {
//               try {
//                   breakdown = HTTP.call('GET', breakdown.data.paging['next'], {});
//                   dailyBreakdownArray.push(breakdown.data.data);
//               } catch(e) {
//                   console.log('no more pages or error in while true loop', e);
//                   break;
//               }
//           }
//             // flattens the array so I can loop over the whole thing at once
//           dailyBreakdownArray = _.flatten(dailyBreakdownArray);

//           dailyBreakdownArray.forEach(el => {
//               let data = {};
//               for (let key in el) {
//                   if (key == "actions") {
//                       el[key].forEach(el => {
//                           // this check looks for a period in the key name and
//                           // replaces it with an underscore if found
//                           // this check is used two more times below
//                           if (/\W/g.test(el.action_type)) {
//                               // console.log("before key", el.action_type)
//                               el.action_type = el.action_type.replace(/\W/g, "_");
//                               // console.log("after key", el.action_type)
//                               data[el.action_type] = el.value;
//                           }
//                           data[el.action_type] = el.value;
//                       });
//                   } else if (key == "cost_per_action_type") {
//                        el[key].forEach(el => {
//                           if (/\W/g.test(el.action_type)) {
//                               el.action_type = el.action_type.replace(/\W/g, "_");
//                               data["cost_per_"+el.action_type] = accounting.formatMoney(el.value, "$", 2);
//                           } else {
//                               data["cost_per_"+el.action_type] = accounting.formatMoney(el.value, "$", 2);
//                           }
//                       });
//                   } else {
//                       // this check looks for a period in the key name and
//                       // replaces it with an underscore
//                       if (/\W/g.test(key)) {
//                           key = key.replace(/\W/g, "_");
//                           data[key] = el[key];
//                       } else {
//                           data[key] = el[key]
//                       }
//                   }
//               }
//               data['cpm'] = mastFunc.makeMoney(data.cpm);
//               data['cpp'] = mastFunc.makeMoney(data.cpp);
//               data['inserted'] = moment().format("MM-DD-YYYY hh:mm a");
//               data['campaign_name'] = data.campaign_name;
//               data['clicks'] = Math.round((data['ctr'] / 100) * data['impressions']);
//               data['cpc'] = mastFunc.makeMoney((data.spend / data.clicks));
//               data['spend'] = mastFunc.makeMoney(data.spend);
//               data['date_start'] = moment(data['date_start']).format("MM-DD-YYYY");
//               masterArray.push(data);
//           }); // end of dailyBreakdownArray.forEach

//           try {
//             masterArray.forEach(el => {
//               InsightsBreakdownsByDays.insert({
//                 data: el
//               });
//             });
//           } catch(e) {
//             console.log('Error inserting data into DB', e);
//           }
//           counter++;
//         } // end of else block in if (counter >= idArray.length)
//       }, 4000); // end of Meteor.setInterval
//     } // end if if(idArray)
//   } // end of job
// });
