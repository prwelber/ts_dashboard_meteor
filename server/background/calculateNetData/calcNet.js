import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import Initiatives from '/collections/Initiatives';

const stringToCostPlusPercentage = function stringToCostPlusPercentage (num) {
  num = num.toString().split('');
  num.unshift(".");
  num = 1 + parseFloat(num.join(''));
  return num;
}

const stringToPercentTotal = function stringToPercentTotal (num) {
  num = num.split('')
  num.unshift(".");
  num = parseFloat(num.join(''));
  num = 1 / num;
  return num;
}

SyncedCron.config({
  collectionName: 'cronCollection'
});


SyncedCron.add({
  name: "Calculate Net Numbers",

  schedule: (parser) => {
    // return parser.text('at 11:24am')
    return parser.text('every 15 minutes')
  },
  job: () => {
    // console.log('running netCalc job')
    const inits = Initiatives.find({userActive: true}).fetch();

    let deal,
        percent,
        spend,
        budget,
        costPlusPercent,
        percentTotalPercent;

    inits.forEach((init) => {
      let numbs = {};
      numbs['name'] = init.name;
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
          let dataToSet = {};
          try {
            numbs['objective'] = item.objective;
            numbs['deal'] = "costPlus";
            numbs['percentage'] = item.costPlusPercent;
            costPlusPercent = stringToCostPlusPercentage(item.costPlusPercent);
            numbs['spend'] = parseFloat((init[objective]['spend'] * costPlusPercent).toFixed(2));
            numbs['budget'] = parseFloat((totalBudget * costPlusPercent).toFixed(2));
            numbs['spendPercent'] = parseFloat((numbs['spend'] / numbs['budget']) * 100);
            numbs['net_cpc'] = numbs.spend / init[objective]['clicks'];
            numbs['net_cpl'] = numbs.spend / init[objective]['likes'];
            numbs['net_cpm'] = numbs.spend / (init[objective]['impressions'] / 1000);
            numbs['net_cpvv'] = numbs.spend / init[objective]['videoViews'];
            dataToSet[objective+".net"] = numbs;
          } catch(e) {
            console.log("Error in server/background/calculateNetData/calcNet.js", e);
          }
          try {
            Initiatives.update(
              {name: init.name},
              {$set: dataToSet}
            );
          } catch(e) {
            console.log("Error in both/utilityFunctions/calcNet Mongo Update", e);
          }
        }

        // if percent total deal
        if (item.percent_total) {
          let dataToSet = {};
          try {
            numbs['deal'] = "percentTotal";
            numbs['percentage'] = item.percentTotalPercent;
            percentTotalPercent = stringToPercentTotal(item.percentTotalPercent);
            numbs['spend'] = parseFloat((init[objective]['spend'] * percentTotalPercent).toFixed(2));
            numbs['budget'] = parseFloat((totalBudget * percentTotalPercent).toFixed(2));
            numbs['spendPercent'] = parseFloat((numbs['spend'] / numbs['budget']) * 100);
            numbs['net_cpc'] = numbs.spend / init[objective]['clicks'];
            numbs['net_cpl'] = numbs.spend / init[objective]['likes'];
            numbs['net_cpm'] = numbs.spend / (init[objective]['impressions'] / 1000);
            numbs['net_cpvv'] = numbs.spend / init[objective]['videoViews'];
            dataToSet[objective+".net"] = numbs;
          } catch(e) {
            console.log("Error in server/background/calculateNetData/calcNet.js", e, init.name);
          }
          try {
            Initiatives.update(
              {name: init.name},
              {$set: dataToSet}
            );
          } catch(e) {
            console.log(e);
          }
        }

        // if no percent total or no cost plus
        if ((!item.percent_total && !item.cost_plus) && (item.budget && item.quantity)) {
          // console.log('running calcNet with no dealType', init.name);
          // console.log("item", item)
          // console.log(item.percent_total, item.cost_plus)
          numbs['deal'] = "Contracted Spend";
          numbs['percentage'] = null;
          // console.log("init[objective]", init[objective])
          numbs['spend'] = parseFloat((init[objective]['spend']).toFixed(2));
          numbs['budget'] = parseFloat((totalBudget).toFixed(2));
          numbs['spendPercent'] = parseFloat((numbs['spend'] / numbs['budget']) * 100);
          numbs['net_cpc'] = numbs.spend / init[objective]['clicks'];
          numbs['net_cpl'] = numbs.spend / init[objective]['likes'];
          numbs['net_cpm'] = numbs.spend / (init[objective]['impressions'] / 1000);
          numbs['net_cpvv'] = numbs.spend / init[objective]['videoViews'];
          let dataToSet = {};
          dataToSet[objective+".net"] = numbs;
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
