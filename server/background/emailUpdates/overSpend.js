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
  name: "Overspend Email Alert",

  schedule: (parser) => {
    if (Meteor.isProduction) {
      return parser.text('at 1:45pm'); // should be 9:45am
    } else {
      return parser.text('at 1:13am');
    }
  },
  job: () => {
    // loop through and run initiativesFunctions

    const inits = Initiatives.find({userActive: true}).fetch();

    const percentages = [];
    const objectives = ["LINK_CLICKS", "POST_ENGAGEMENT", "VIDEO_VIEWS", "PAGE_LIKES", "CONVERSIONS"];

    inits.forEach((init) => {
      init.lineItems.forEach((item, index) => {
        if (item.price) {
          let data = {};
          data['name'] = init.name;
          data['dealType'] = item.dealType;
          data['objective'] = item.objective;
          data['budget'] = formatters.money(item.budget);
          const objective = item.objective.toUpperCase().replace(/ /g, "_");
          try {
            data['spendPercent'] = parseFloat(init[objective]['net']['spendPercent'].toFixed(2));
          } catch(e) {
            console.log("Error in overSpend email background job", e);
          }

          data['actualSpend'] = formatters.money(init[objective]['spend'])
          data['clientSpend'] = formatters.money(init[objective]['net']['client_spend']);
          data['deliveryPercent'] = formatters.twoDecimals(initiativesFunctionObject.calculateDeliveryPercent(init, index));
          data['flightPercent'] = formatters.twoDecimals(initiativesFunctionObject.calculateFlightPercentage(init, index));

          if (data.spendPercent > 100) {
            percentages.push(data);
          }
        }
      });
    });

    if (percentages.length >= 1) {

      let htmlString = '';
      percentages.forEach(el => {
        htmlString += "<br /><h4>"+el.name+"</h4>\
        <p>Deal Type: "+el.dealType+" | Objective: "+el.objective+"</p>\
        <p>Budget: "+ el.budget +"</p>\
        <p>Actual Spend: "+ el.actualSpend +"</p>\
        <p>Client Spend: "+ el.clientSpend +"</p>\
        <p>Spend: "+el.spendPercent+"%</p>\
        <p>Delivery: "+el.deliveryPercent+"%</p>\
        <p>Flight: "+el.flightPercent+"%</p><br />";
      });

      const emailList = ['kyu@targetedsocial.com', 'vguity@targetedsocial.com', 'pwelber@targetedsocial.com', 'cgottlieb@targetedsocial.com', 'selowsky@targetedsocial.com'];

      if (Meteor.isProduction) {
        email.sendEmail(emailList, "Overspend Alert", htmlString);
      } else {
        email.sendEmail("prwelber@gmail.com", "Overspend Alert", htmlString);
      }
    } // end of if (percentages.length)
  } // end of job
}); // end of SyncedCron.add
