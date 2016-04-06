const later = require('later');
const Promise = require('bluebird');


SyncedCron.config({
    collectionName: 'cronCollection'
});


SyncedCron.add({
    // this name is how it will show in the logs
    name: 'tester',
    // schedule the function using parser from later.js
    schedule: function (parser) {
        return parser.text('every 30 seconds');
    },
    // the meat of the function, what will actually happen
    job: function (thing) {
        console.log('log running from within job on original page');
        console.log(thing); // time when the job is scheduld to be run
    }
});


Meteor.startup(function () {
  // must start the jobs
  SyncedCron.start();
  // will stop jobs after 10 seconds
  Meteor.setTimeout(function() {SyncedCron.stop(); }, 90 * 1000);
});

