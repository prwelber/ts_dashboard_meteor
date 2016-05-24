import { Meteor } from 'meteor/meteor'
import { SyncedCron } from 'meteor/percolate:synced-cron';
const later = require('later');


SyncedCron.config({
  collectionName: 'cronCollection'
});

SyncedCron.add({
  name: "Refresh All Accounts",
  schedule: (parser) => {
    return parser.text('at 10:00pm');
  },
  job: () => {
    Meteor.call('refreshAccountList');
  }
})
