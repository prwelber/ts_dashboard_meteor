import { email } from '../../sendgrid/email';
import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import Initiatives from '/collections/Initiatives';
import { initiativesFunctionObject } from '/both/utilityFunctions/calculateInitiativePercentages';
import { formatters } from '/both/utilityFunctions/formatters';

SyncedCron.config({
  collectionName: 'cronCollection'
});

SyncedCron.add({
  name: "Initiative Digest Emailer",

  schedule: (parser) => {
    return parser.text('at 2:00pm');
  },
  job: () => {
    // loop through and run initiativesFunctions

    const inits = Initiatives.find({userActive: true}, {fields: {name: 1, lineItems: 1, aggregateData: 1, _id: 0}}).fetch();

    const percentages = [];
    inits.forEach((init) => {
      let data = {};
      data['name'] = init.name;
      data['spendPercent'] = formatters.twoDecimals(initiativesFunctionObject.calculateSpendPercent(init));
      data['deliveryPercent'] = formatters.twoDecimals(initiativesFunctionObject.calculateDeliveryPercent(init));
      data['flightPercent'] = formatters.twoDecimals(initiativesFunctionObject.calculateFlightPercentage(init));
      percentages.push(data);
    });

    let htmlString = '<h3>As of '+moment().format("MM/DD/YYYY hh:mm a")+'</h3>';
    percentages.forEach((el) => {
      htmlString += "<br /><h4>"+el.name+"</h4><p>Spend: "+el.spendPercent+"%</p><p>Delivery: "+el.deliveryPercent+"%</p><p>Flight: "+el.flightPercent+"%</p><br />";
    });

    email.sendEmail("prwelber@gmail.com", "Initiatives Digest", htmlString);

  } // end of job
}); // end of SyncedCron.add





