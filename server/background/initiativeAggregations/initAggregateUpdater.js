import { Meteor } from 'meteor/meteor'
import { SyncedCron } from 'meteor/percolate:synced-cron';
// import { Moment } from 'meteor/momentjs:moment'
import { initiativeAggregator } from './initAggregateUpdaterFunc'
import Initiatives from '/collections/Initiatives'
const later = require('later');

SyncedCron.config({
  collectionName: 'cronCollection'
});

SyncedCron.add({
  name: "Initiative Aggregator",

  schedule: (parser) => {
    return parser.text('every 30 minutes');
  },

  job: (time) => {
    const inits = Initiatives.find({userActive: true}).fetch();

    let names = _.map(inits, (el) => {
      return el.name;
    });
    let activeInitiatives = _.flatten(names);
    if (activeInitiatives.length >= 1) {
      let counter = 0;
      const setIntervalId = Meteor.setInterval(() => {
        if (counter >= activeInitiatives.length) {
          Meteor.clearInterval(setIntervalId);
        } else {
          Meteor.call('getAggregate', activeInitiatives[counter]);
          counter++;
          // aggregator(name);
        }
      }, 1000);
    }
  }
});

SyncedCron.add({
  name: "Objective Aggregator",
  schedule: (parser) => {
    return parser.text('every 30 minutes');
  },
  job: () => {
    const inits = Initiatives.find({userActive: true}).fetch();

    let names = _.map(inits, (el) => {
      return el.name;
    });
    let activeInitiatives = _.flatten(names);
    if (activeInitiatives.length >=1) {
      let counter = 0;
      const setIntervalId = Meteor.setInterval(() => {
        if (counter >= activeInitiatives.length) {
          Meteor.clearInterval(setIntervalId);
        } else {
          Meteor.call('aggregateObjective', activeInitiatives[counter]);
          counter++;
        }
      }, 1000);
    }
  }
});
