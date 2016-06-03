// import { Meteor } from 'meteor/meteor'
// import { SyncedCron } from 'meteor/percolate:synced-cron';
// import { Moment } from 'meteor/momentjs:moment'
// import { insightUpdate } from './initCampaignInsightsUpdaterFunc'
// import Initiatives from '/collections/Initiatives'
// const later = require('later');


// SyncedCron.config({
//   collectionName: 'cronCollection'
// });

// SyncedCron.add({
//   name: "Insight Updater",

//   schedule: (parser) => {
//     return parser.text('at 7:00am');
//   },

//   job: (time) => {
//     const inits = Initiatives.find({}).fetch();

//     const active = _.filter(inits, (el) => {
//       if (el.userActive) {
//         return el;
//       }
//     });

//     let onlyIds = _.map(active, (el) => {
//       return el.campaign_ids;
//     });

//     // now i'm sitting with all the campaign ID's of the active initiatives

//     let flat = _.flatten(onlyIds);

//     insightUpdate(flat);

//   }
// }) // end of SyncedCron.add
