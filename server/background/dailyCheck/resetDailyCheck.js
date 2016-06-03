import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import Initiatives from '/collections/Initiatives';
import later from 'later';
import moment from 'moment';

SyncedCron.config({
  collectionName: 'cronCollection'
});

SyncedCron.add({
  name: "Reset Daily Check",

  schedule: (parser) => {
    // return parser.text('at 4:19pm')
    return parser.text('at 1:00am');
  },
  job: (time) => {
    const inits = Initiatives.find({}).fetch();
    inits.forEach((init) => {
      Initiatives.update({_id: init._id},
        {$set: {dailyCheck: false}});
    });
  }
});
