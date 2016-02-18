// if (Meteor.isServer) {

//     let myJobs = JobCollection('myJobQueue');
//     myJobs.allow({
//         // Grant full permission to any authenticated user
//         admin: function (userId, method, params) {
//             return (userId ? true : false);
//         }
//     });

//     Meteor.startup(function () {
//         // Normal Meteor publish call, the server always
//         // controls what each client can see
//         Meteor.publish('allJobs', function () {
//             return myJobs.find({});
//         });
//         // Start the myJobs queue running
//         return myJobs.startJobServer();

//     });




//     // Create a worker to get sendMail jobs from 'myJobQueue'
//     // This will keep running indefinitely, obtaining new work
//     // from the server whenever it is available.
//     // Note: If this worker was running within the Meteor environment,
//     // Then only the call below is necessary to setup a worker!
//     // However in that case processJobs is a method on the JobCollection
//     // object, and not Job.

//     let workers = Job.processJobs('myJobQueue', 'sendEmail',
//         function (job, callback) {
//             // This will only be called if a
//             // 'sendEmail' job is obtained
//             let email = job.data; // only one email per job
//             sendEmail(email.address, email.subject, email.message,
//                 function (err) {
//                     if (err) {
//                         job.log("Sending failed with err" + err,
//                             {level: 'warning'});
//                         job.fail("" + err);
//                     } else {
//                         job.done();
//                     }
//                     cb();
//                     }
//                 );
//             }
//         );



// };
