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
  name: "Calculate Net Numbers",

  schedule: (parser) => {
    // return parser.text('at 10:47am')
    return parser.text('every 10 minutes');
  },

  job: () => {
    console.log('running netCalc job')
    const inits = Initiatives.find({userActive: true}).fetch();

    let deal,
        percent,
        spend,
        budget,
        costPlusPercent,
        percentTotalPercent;

    inits.forEach((init) => {
      let netNumbs = {};
      netNumbs['name'] = init.name;
      // get total budget
      let totalBudget = 0;
      init.lineItems.forEach((item) => {
        if (item.budget !== "" || parseFloat(item.budget) > 0) {
          totalBudget += parseFloat(item.budget);
        }
      });

      init.lineItems.forEach((item, index) => {
        const objective = item.objective.split(' ').join('_').toUpperCase();
        // if cost plus deal
        if (item.cost_plus) {
          netNumbs['objective'] = item.objective;
          netNumbs['deal'] = "costPlus";
          netNumbs['percentage'] = item.costPlusPercent;
          costPlusPercent = stringToCostPlusPercentage(item.costPlusPercent);
          netNumbs['spend'] = parseFloat((init[objective]['spend'] / costPlusPercent).toFixed(2));
          netNumbs['budget'] = parseFloat((totalBudget / costPlusPercent).toFixed(2));
          netNumbs['spendPercent'] = parseFloat((netNumbs['spend'] / netNumbs['budget']) * 100);
          netNumbs['net_cpc'] = netNumbs.spend / init[objective]['clicks'];
          netNumbs['net_cpl'] = netNumbs.spend / init[objective]['likes'];
          netNumbs['net_cpm'] = netNumbs.spend / (init[objective]['impressions'] / 1000);
          netNumbs['net_cpvv'] = netNumbs.spend / init[objective]['videoViews'];
          const dataToSet = {};
          dataToSet[objective+".net"] = netNumbs;
          try {
            Initiatives.update(
              {name: init.name},
              {$set: dataToSet}
            );
          } catch(e) {
            console.log(e);
          }
        }

        // if percent total deal
        if (item.percent_total) {
          netNumbs['deal'] = "percentTotal";
          netNumbs['percentage'] = item.percentTotalPercent;
          percentTotalPercent = parseFloat(item.percentTotalPercent) / 100;
          netNumbs['spend'] = parseFloat((init[objective]['spend'] * percentTotalPercent).toFixed(2));
          netNumbs['budget'] = parseFloat((totalBudget * percentTotalPercent).toFixed(2));
          netNumbs['spendPercent'] = parseFloat((netNumbs['spend'] / netNumbs['budget']) * 100);
          netNumbs['net_cpc'] = netNumbs.spend / init[objective]['clicks'];
          netNumbs['net_cpl'] = netNumbs.spend / init[objective]['likes'];
          netNumbs['net_cpm'] = netNumbs.spend / (init[objective]['impressions'] / 1000);
          netNumbs['net_cpvv'] = netNumbs.spend / init[objective]['videoViews'];
          const dataToSet = {};
          dataToSet[objective+".net"] = netNumbs;
          try {
            Initiatives.update(
              {name: init.name},
              {$set: dataToSet}
            );
          } catch(e) {
            console.log(e);
          }
        }
      }); // end of init.lineItems.forEach((item))
    }); // end of inits.forEach((init))
  } // end of job
});
