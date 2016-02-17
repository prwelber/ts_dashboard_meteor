// if (Meteor.isServer) {


//     SyncedCron.config({
//         collectionName: 'cronCollection'
//     });

//     SyncedCron.add({
//         name: 'log to the server',
//         schedule: function (parser) {
//             return parser.text('every 10 seconds');
//         },
//         job: function(intendedAt) {
//             console.log('logging STUFF to server');
//             console.log('job should be running at:', intendedAt);
//         }
//     });



// SyncedCron.add({
//     // this name is how it will show in the logs
//     name: 'send test cron emails',
//     // schedule the function using parser from later.js
//     schedule: function (parser) {
//         return parser.text('every 10 seconds');
//     },
//     // the meat of the function, what will actually happen
//     job: function (intendedAt) {
//         console.log('sending email from cron')
//         details = {
//             to: 'prwelber@gmail.com',
//             from: 'philip.welber@gmail.com',
//             subject: 'CRON TEST EMAIL TESTER!!!!!!',
//             text: 'This is a test email sent by a cron job'
//         }
//         // here, I namespaced an email function and the details
//         // object is above
//         sendSomething(details)
//     }
// })

// Meteor.startup(function () {
//         // must star the jobs
//         SyncedCron.start();
//         // will stop jobs after 15 seconds
//         Meteor.setTimeout(function() {SyncedCron.stop(); }, 15 * 1000);
//     });










// }
