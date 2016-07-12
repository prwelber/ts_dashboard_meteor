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
    if (Meteor.isProduction) {
      return parser.text('at 8:00pm');
    } else {
      return parser.text('at 4:00pm');
    }
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

    email.sendEmail(['kyu@targetedsocial.com', 'vguity@targetedsocial.com', 'pwelber@targetedsocial.com', 'cgottlieb@targetedsocial.com', 'selowsky@targetedsocial.com'], "Daily Check Digest", htmlString);
  }
});
