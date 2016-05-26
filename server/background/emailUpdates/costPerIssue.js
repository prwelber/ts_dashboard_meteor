import { email } from '../../sendgrid/email';
import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import Initiatives from '/collections/Initiatives';

const stringToCostPlusPercentage = function stringToCostPlusPercentage (num) {
  num = num.toString().split('');
  num.unshift(".");
  num = 1 + parseFloat(num.join(''));
  return num;
}

SyncedCron.config({
  collectionName: 'cronCollection'
});

SyncedCron.add({
  name: "Cost Per Action Issue Email Warning",

  schedule: (parser) => {
    // return parser.text('at 9:45am');
    return parser.text('at 6:06pm');
  },

  job: () => {
    const inits = Initiatives.find({userActive: true}).fetch();

    inits.forEach((init) => {

      init.lineItems.forEach((item) => {

        if (item.budget || item.budget !== "") {

          const objective = item.objective.split(' ').join('_').toUpperCase();
          const price = parseFloat(item.price);
          const dealType = item.dealType.toLowerCase();
          let costPlusPercentage;
          const costPer = init[objective]['net']["net_"+dealType];
          const eightyPercent = price * .8;

          // do if cost plus and if not cost plus
          if (item.cost_plus) {
            let percentage = stringToCostPlusPercentage(item.costPlusPercent);
            let ceilingNum = price / percentage

            if (costPer >= ceilingNum) {
              const subject = "Initiative Cost Per Action Warning";
              const htmlString = "<p>In the initiative: " +init.name+ ", the " +dealType+ " is near or has exceeded the estimated IO price of " +price+ ". It is currently " +accounting.formatMoney(costPer)+"</p>";
              email.sendEmail("prwelber@gmail.com", subject, htmlString);
            }
          }

          if (item.percent_total) {
            if (costPer >= eightyPercent) {
              const subject = "Initiative Cost Per Action Warning";
              const htmlString = "<p>In the initiative: " +init.name+ ", the " +dealType+ " is at or above 80% of the IO price of "+price+". It is currently " +accounting.formatMoney(costPer)+"</p>";

              email.sendEmail("prwelber@gmail.com", subject, htmlString);
            }
          }
        }
      });
    }); // end of inits.forEach((init))
  } // end of job
});
