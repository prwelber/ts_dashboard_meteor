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
  // num = 1 / num;
  return num;
}

export const calcNet = {
  calculateNetNumbers: (name) => {
    const inits = Initiatives.find({name: name}).fetch();
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
            numbs['client_spend'] = parseFloat((init[objective]['spend'] * costPlusPercent).toFixed(2));
            numbs['budget'] = parseFloat(totalBudget.toFixed(2));
            numbs['spendPercent'] = parseFloat((numbs['client_spend'] / numbs['budget']) * 100);
            numbs['client_cpc'] = numbs.client_spend / init[objective]['clicks'];
            numbs['client_cpl'] = numbs.client_spend / init[objective]['likes'];
            numbs['client_cpm'] = numbs.client_spend / (init[objective]['impressions'] / 1000);
            numbs['client_cpvv'] = numbs.client_spend / init[objective]['videoViews'];
            dataToSet[objective+".net"] = numbs;
          } catch(e) {
            console.log("Error in both/utilityFunctions/calcNet", e);
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
          // const dealType = item.dealType;
          let quotedPrice = item.price;
          let action;
          item.dealType === "CPC" ? action = "clicks" : '';
          item.dealType === "CPM" ? action = "impressions" : '';
          item.dealType === "CPL" ? action = "likes" : '';
          try {
            numbs['deal'] = "percentTotal";
            // - running stringToPercentTotal func may not be necessary - //
            numbs['percentage'] = item.percentTotalPercent;
            percentTotalPercent = stringToPercentTotal(item.percentTotalPercent)
            numbs['budget'] = parseFloat(totalBudget.toFixed(2));
            if (action === "impressions") {
              numbs['client_spend'] = (init[objective]['impressions'] / 1000) * quotedPrice;
            } else {
              numbs['client_spend'] = init[objective][action] * quotedPrice;
            }
            numbs['spendPercent'] = parseFloat((numbs['client_spend'] / numbs['budget']) * 100);
            numbs['client_cpc'] = numbs.client_spend / init[objective]['clicks'];
            numbs['client_cpl'] = numbs.client_spend / init[objective]['likes'];
            numbs['client_cpm'] = numbs.client_spend / (init[objective]['impressions'] / 1000);
            numbs['client_cpvv'] = numbs.client_spend / init[objective]['videoViews'];

            dataToSet[objective+".net"] = numbs;
          } catch(e) {
            console.log("Error in calcNet percent total and init.name", e, init.name);
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
          numbs['deal'] = "Contracted Spend";
          numbs['percentage'] = null;
          numbs['spend'] = parseFloat((init[objective]['spend']).toFixed(2));
          numbs['budget'] = parseFloat((totalBudget).toFixed(2));
          numbs['spendPercent'] = parseFloat((numbs['spend'] / numbs['budget']) * 100);
          numbs['net_cpc'] = numbs.spend / init[objective]['clicks'];
          numbs['net_cpl'] = numbs.spend / init[objective]['likes'];
          numbs['net_cpm'] = numbs.spend / (init[objective]['impressions'] / 1000);
          numbs['net_cpvv'] = numbs.spend / init[objective]['videoViews'];
          const dataToSet = {};
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
  }
}

