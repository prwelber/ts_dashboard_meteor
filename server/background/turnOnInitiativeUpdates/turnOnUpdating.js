import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import Initiatives from '/collections/Initiatives';
import later from 'later';
import moment from 'moment';

SyncedCron.config({
  collectionName: 'cronCollection'
});

/**
* This background function will look at all initiatives and if
* a start date is equal to todays date, we will turn the background
* updating switch to on
**/

SyncedCron.add({
  name: "Turn On Initiative Updating",

  schedule: (parser) => {
    return parser.text('at 9:30am every weekday');
    // return parser.text('at 2:24pm');
  },

  job: (time) => {
    const inits = Initiatives.find(
      {userActive:
        {$ne: true}
      }).fetch();
    // get all the initiatives that are not marked as active

    // loop over each initiatives line items and
    // if startDate === today
    // $set userActive: true

    inits.forEach((init) => {

      init.lineItems.forEach((item) => {

        let start = moment(item.startDate, moment.ISO_8601).format('MM-DD-YYYY');
        let today = moment().format('MM-DD-YYYY')

        if (start === today) {
          // console.log(`turning userActive to true for ${init.name} with startDate of ${start}`)
          Initiatives.update({_id: init._id},
            {$set: {
              userActive: true
            }
          });
          return;
        } // end of if (start === today)

      });
    });

  } // end of job
})
