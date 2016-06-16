import { Meteor } from 'meteor/meteor'
import { SyncedCron } from 'meteor/percolate:synced-cron';
// import { Moment } from 'meteor/momentjs:moment'
import { initiativeAggregator } from './initAggregateUpdaterFunc';
import { calcNet } from '/both/utilityFunctions/calcNet';
import Initiatives from '/collections/Initiatives'
const later = require('later');

SyncedCron.config({
  collectionName: 'cronCollection'
});

SyncedCron.add({
  name: "Initiative Aggregator",

  schedule: (parser) => {
    // return parser.text('at 5:44pm');
    return parser.text('every 10 minutes');
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
      }, 500);
    }
  }
});

SyncedCron.add({
  name: "Objective Aggregator",
  schedule: (parser) => {
    return parser.text('every 12 minutes');
    // return parser.text('at 2:50pm')
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
          calcNet.calculateNetNumbers(activeInitiatives[counter]);
          counter++;
        }
      }, 500);
    }
  }
});
