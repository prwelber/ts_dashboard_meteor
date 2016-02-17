// FutureTasks = new Meteor.Collection('futureTasks');

// function logSomething(details) {
//     console.log(details.text)
// }

// function addTask(id, details) {
//     SyncedCron.add({
//         name: id,
//         schedule: function (parser) {
//             return parser.text('every 2 minutes')
//             // return parser.recur().on(details.date).fullDate();
//         },
//         job: function () {
//             logSomething(details);
//             FutureTasks.remove(id);
//             SyncedCron.remove(id);
//             return id;
//         }
//     });
// }

// function scheduleLog(details) {
//     if (details.date < new Date()) {
//         logSomething(details);
//     } else {
//         let thisId = FutureTasks.insert(details);
//         addTask(thisId, details);
//     }
//     return true;
// }

// Meteor.startup(function () {
//     FutureTasks.find().forEach(function (thing) {
//         if (thing.date < new Date()) {
//             logSomething(thing)
//         } else {
//             addTask(thing._id, thing);
//         }
//     });
//     SyncedCron.start();
// });
