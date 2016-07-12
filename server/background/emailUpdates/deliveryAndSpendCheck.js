import { email } from '../../sendgrid/email';
import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import Initiatives from '/collections/Initiatives';
import { initiativesFunctionObject } from '/both/utilityFunctions/calculateInitiativePercentages';
import { formatters } from '/both/utilityFunctions/formatters';

/*
for percent total campaigns (name tbd) if delivery and spend is 30% over
flight (in percentages) send an email alert only after 10% of
flight has elapsed
*/

SyncedCron.config({
  collectionName: 'cronCollection'
});

SyncedCron.add({
  name: "Initiative Digest Emailer",

  schedule: (parser) => {
    return parser.text('at 1:00pm');
    // return parser.text('at 2:20pm')
  },
  job: () => {

    const inits = Initiatives.find({'lineItems.0.percent_total': true, userActive: true}, {fields: {name: 1, lineItems: 1, aggregateData: 1, _id: 0}}).fetch();

    // loop over lineItems and if there is a price (if it is filled in)
    // run the calculate delivery percent and calc flight percent functions
    // if delivery is 30 percentage points over or under flight, then send email alert
    let emailBody = '';
    inits.forEach(init => {
      init.lineItems.forEach((item, index) => {
        if (item.price) {
          let deliv = initiativesFunctionObject.calculateDeliveryPercent(init, index);
          let flight = initiativesFunctionObject.calculateFlightPercentage(init, index);
          if ((deliv > (flight * 1.3) || deliv < (flight * 0.7)) && flight >= 10) {
            emailBody += `In Initiative ${init.name}, the Delivery percentage is ${deliv.toFixed(2)}, and the Flight percentage is ${flight.toFixed(2)}.<br><br>`;
            // email.sendEmail("prwelber@gmail.com", "Delivery Out Of Range", emailBody);
          }
        }
      });
    });
    email.sendEmail(['kyu@targetedsocial.com', 'vguity@targetedsocial.com', 'pwelber@targetedsocial.com', 'cgottlieb@targetedsocial.com', 'selowsky@targetedsocial.com'], "Delivery Out Of Range", emailBody);
  }
});
