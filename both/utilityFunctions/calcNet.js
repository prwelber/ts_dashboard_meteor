import Initiatives from '/collections/Initiatives';


// ---------------------------- FUNCTIONS ---------------------------- //

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

const defineAction = function defineAction (init) {
  let action;
  init.lineItems[0].dealType === "CPC" ? action = "clicks" : '';
  init.lineItems[0].dealType === "CPM" ? action = "impressions" : '';
  init.lineItems[0].dealType === "CPL" ? action = "like" : '';
  return action;
}

const percentTotalSpend = function percentTotalSpend (dealType, quotedPrice, campaignData, init) {
  console.log('from within calcNet percentTotalSpend Function', dealType, quotedPrice, campaignData, init.name);
  if (dealType === "percent_total") {
    let action = defineAction(init);
    let effectiveNum = init.lineItems[0].effectiveNum;
    let percentage = (parseFloat(init.lineItems[0].percentTotalPercent) / 100);
    console.log('line 35 in calcNet', action, effectiveNum, percentage);
    if (action === "impressions") {
      let cpm = accounting.unformat(campaignData.cpm);
      if (cpm / percentage <= effectiveNum) {
        effectiveNum = cpm / percentage;
        return (campaignData[action] / 1000) * effectiveNum;
      } else if ((cpm / percentage) > effectiveNum && (cpm / percentage) < quotedPrice || cpm / percentage >= quotedPrice) {
        return (campaignData[action] / 1000) * quotedPrice;
      }
    } else if (action === "clicks") {
      let cpc = accounting.unformat(campaignData.cpc);
      if (cpc / percentage <= effectiveNum) {
        effectiveNum = cpc / percentage;
        return (campaignData[action]) * effectiveNum;
      } else if ((cpc / percentage) > effectiveNum && (cpc / percentage) < quotedPrice || (cpc / percentage) >= quotedPrice) {
        return (campaignData[action]) * quotedPrice;
      }
    } else if (action === "like") {
      let cpl = accounting.unformat(campaignData.cpl);
      if (cpl / percentage <= effectiveNum) {
        effectiveNum = cpl / percentage;
        return (campaignData[action]) * effectiveNum;
      } else if ((cpl / percentage) > effectiveNum && (cpl / percentage) < quotedPrice || (cpl / percentage) >= quotedPrice) {
        return (campaignData[action]) * quotedPrice;
      }
    }
  }
}

// --------------------------- END FUNCTIONS --------------------------- //

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
          let quotedPrice = item.price;
          let action;
          item.dealType === "CPC" ? action = "clicks" : '';
          item.dealType === "CPM" ? action = "impressions" : '';
          item.dealType === "CPL" ? action = "likes" : '';
          try {
            numbs['deal'] = "percentTotal";


            // grab objective and then get that object from init object
            // const objective = item.objective.toUpperCase().replace(/ /g, "_");
            // this makes (for example) "Link Clicks" into "LINK_CLICKS"

            const campaignStats = init[objective];
            const dealType = "percent_total";

            numbs['client_spend'] = percentTotalSpend(dealType, quotedPrice, campaignStats, init);
            console.log('client spend from calcNet', numbs.client_spend, init.name);

            // - running stringToPercentTotal func may not be necessary - //
            numbs['percentage'] = item.percentTotalPercent;
            // percentTotalPercent = stringToPercentTotal(item.percentTotalPercent)
            numbs['budget'] = parseFloat(totalBudget.toFixed(2));
            // if (action === "impressions") {
            //   numbs['client_spend'] = (init[objective]['impressions'] / 1000) * quotedPrice;
            // } else {
            //   numbs['client_spend'] = init[objective][action] * quotedPrice;
            // }
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

