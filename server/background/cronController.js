import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
const later = require('later');
const Promise = require('bluebird');


SyncedCron.config({
    collectionName: 'cronCollection'
});

SyncedCron.config({
  // Log job run details to console
  // log: false,
});


Meteor.startup(function () {
  // must start the jobs
  SyncedCron.start();
  // will stop jobs after 30 seconds
  // Meteor.setTimeout(function() {SyncedCron.stop(); }, 30 * 1000);
});

