import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import Initiatives from '/collections/Initiatives';
import later from 'later';
import moment from 'moment';

SyncedCron.config({
  collectionName: 'cronCollection'
});

SyncedCron.add({
  name: "Turn Off Initiative Updating",

  schedule: (parser) => {
    return parser.text('at 2:00am');
  },

  job: (time) => {
    const inits = Initiatives.find({userActive: true}).fetch();

    // loop over lineItems and find latest end date
    // if latest end date is after now, turn off

    for (let i = 0; i < inits.length; i++) {
      const endArray = [];
      for (let j = 0; j < 7; j++) {
        if (inits[i].lineItems[j].endDate !== null) {
          endArray.push(inits[i].lineItems[j].endDate);
        }
      }
      // sort the endArray so we have the latest date at the end
      endArray.sort(function(a, b) {
        return (a < b) ? -1 : ((a > b) ? 1 : 0);
      });
      const latest = moment(endArray[endArray.length - 1], moment.ISO_8601);
      if (moment().isAfter(latest)) {
        Initiatives.update({name: inits[i].name}, {
          $set: {
            userActive: false
          }
        });
      }
    }
  } // end of job
})
