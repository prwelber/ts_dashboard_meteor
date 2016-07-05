
// import { email } from '../../sendgrid/email';
// import { Meteor } from 'meteor/meteor';
// import { SyncedCron } from 'meteor/percolate:synced-cron';
// const token = require('/server/token/token.js');
// // console.log('access token', token.token);
// const request = require('request');
// const fs = require('fs');
// const path = require('path');

// 'use strict'


// const my_app_id = '182012062193377';
// const my_app_secret = '8bb9975dd10589b9fba46b7c1900f793';

// SyncedCron.config({
//   collectionName: 'cronCollection'
// });

// SyncedCron.add({
//   name: "Get FB Long Live Token",

//   schedule: (parser) => {
//     // return parser.text('every 58 days');
//     return parser.text('at 12:52pm')
//   },

//   job: () => {
//     console.log("The current working directory is " + process.cwd());
//     process.chdir("../");
//     console.log("The new working directory is " + process.cwd());
//     console.log('token', token)
//     // console.log('acces token from job', token.token)
//     const graph_url_string = 'https://graph.facebook.com/oauth/access_token?client_id='+my_app_id+'&client_secret='+my_app_secret+'&grant_type=fb_exchange_token&fb_exchange_token='+token+'';

//     const endpoint = 'posts/2';
//     console.log('dirname', __dirname)
//     console.log('path', path.dirname('/server/token/test_token.js'));
//     console.log('pathRelative', path.relative(__dirname, '/server/token/test_token.js'));

//     let token = request('http://jsonplaceholder.typicode.com/' + endpoint, (err, res, body) => {
//       console.log('here is the body', body)
//       const code = body.title;

//       if (body) {
//         fs.writeFile('../../token/tester_token.js', code, (err) => {
//           if (err) {
//             console.log('there has been an error!', err)
//           } else {
//             console.log("Done writing file ya heard!");
//           }
//         });
//       }
//     });

//     // let token = request(graph_url_string, (err, res, body) => {
//     //   if (!err) {
//     //     console.log("res", res);
//     //     console.log("body", body);
//     //   }
//     // });
//   }
// })
