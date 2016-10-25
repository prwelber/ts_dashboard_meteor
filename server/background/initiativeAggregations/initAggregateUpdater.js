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
    return parser.text('every 10 minutes every weekday after 7th hour and before 20th hour');
    // every 10 minutes on Mon-Fri starting at 7am and ending at 10pm
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
    // return parser.text('every 11 minutes every weekday after 7th hour and before 20th hour');
    // every 11 minutes on Mon-Fri starting at 7am and ending at 10pm
    // return parser.text('at 1:39pm')

    return parser.text('every 8 minutes')
    // return parser.text(' at 4:26pm')
  },
  job: () => {
    const inits = Initiatives.find({userActive: true}).fetch(); // find all active initiatives

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
