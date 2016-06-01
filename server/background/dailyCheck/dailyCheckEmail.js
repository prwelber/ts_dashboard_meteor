import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import Initiatives from '/collections/Initiatives';
import later from 'later';
import moment from 'moment';
import { email } from '../../sendgrid/email';

SyncedCron.config({
  collectionName: 'cronCollection'
});

SyncedCron.add({
  name: "Daily Check Email Digest",

  schedule: (parser) => {
    return parser.text('at 4:30pm');
    // return parser.text('at 5:05pm');
  },
  job: (time) => {
    const inits = Initiatives.find({userActive: true}).fetch();
    const notChecked = [];
    inits.forEach((init) => {
      if (init.dailyCheck === false) {
        notChecked.push(init.name);
      }
    });
    let htmlString = "<h3>The following Initiatives have not been checked today: </h3><br>" + notChecked.join('<br>') + ""

    email.sendEmail("prwelber@gmail.com", "Daily Check Digest", htmlString)
  }
});
