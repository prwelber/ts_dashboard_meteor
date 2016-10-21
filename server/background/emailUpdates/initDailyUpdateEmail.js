// import { email } from '../../sendgrid/email';
// import { Meteor } from 'meteor/meteor';
// import { SyncedCron } from 'meteor/percolate:synced-cron';
// import Initiatives from '/collections/Initiatives';
// import { initiativesFunctionObject } from '/both/utilityFunctions/calculateInitiativePercentages';
// import { formatters } from '/both/utilityFunctions/formatters';

// SyncedCron.config({
//   collectionName: 'cronCollection'
// });

// SyncedCron.add({
//   name: "Initiative Summary Emailer",

//   schedule: (parser) => {
//     if (Meteor.isProduction) {
//       return parser.text('at 1:30pm'); // should be 9:30am
//     } else {
//       return parser.text('at 7:00pm');
//     }
//   },
//   job: () => {
//     // loop through and run initiativesFunctions

//     const inits = Initiatives.find({userActive: true}).fetch();

//     const percentages = [];
//     const objectives = ["LINK_CLICKS", "POST_ENGAGEMENT", "VIDEO_VIEWS", "PAGE_LIKES", "CONVERSIONS"];

//     inits.forEach((init) => {
//       init.lineItems.forEach((item, index) => {
//         if (item.price) {
//           let data = {};
//           data['name'] = init.name;
//           data['dealType'] = item.dealType;
//           data['objective'] = item.objective;
//           const objective = item.objective.toUpperCase().replace(/ /g, "_");
//           data['spendPercent'] = parseFloat(init[objective]['net']['spendPercent'].toFixed(2));
//           data['deliveryPercent'] = formatters.twoDecimals(initiativesFunctionObject.calculateDeliveryPercent(init, index));
//           data['flightPercent'] = formatters.twoDecimals(initiativesFunctionObject.calculateFlightPercentage(init, index));
//           percentages.push(data);
//         }
//       });
//     });
//     let htmlString = '';
//     percentages.forEach(el => {
//       htmlString += "<br /><h4>"+el.name+"</h4><p>Deal Type: "+el.dealType+" | Objective: "+el.objective+"</p><p>Spend: "+el.spendPercent+"%</p><p>Delivery: "+el.deliveryPercent+"%</p><p>Flight: "+el.flightPercent+"%</p><br />";
//     });

//     const emailList = ['kyu@targetedsocial.com', 'vguity@targetedsocial.com', 'pwelber@targetedsocial.com', 'cgottlieb@targetedsocial.com', 'selowsky@targetedsocial.com'];

//     if (Meteor.isProduction) {
//       email.sendEmail(emailList, "Initiatives Summary", htmlString);
//     } else {
//       email.sendEmail("prwelber@gmail.com", "Initiatives Summary", htmlString);
//     }

//   } // end of job
// }); // end of SyncedCron.add





