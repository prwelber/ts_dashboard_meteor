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

const defineAction = function defineAction (init, index) {
  let action;
  init.lineItems[index].dealType === "CPC" ? action = "clicks" : '';
  init.lineItems[index].dealType === "CPM" ? action = "impressions" : '';
  init.lineItems[index].dealType === "CPL" ? action = "like" : '';
  init.lineItems[index].dealType === "CPVV" ? action = "video_view" : '';
  return action;
}

const percentTotalSpend = function percentTotalSpend (dealType, quotedPrice, campaignData, init, index) {
  if (dealType === "percent_total") {
    let action = defineAction(init, index);
    let effectiveNum = init.lineItems[index].effectiveNum;
    let percentage = (parseFloat(init.lineItems[index].percentTotalPercent) / 100);
    if (action === "impressions") {
      let cpm = accounting.unformat(campaignData.cpm);
      if (cpm <= effectiveNum) {
        cpm = parseFloat(cpm.toFixed(2));
        effectiveNum = parseFloat((cpm / percentage).toFixed(2));
        return (campaignData[action] / 1000) * effectiveNum;
      } else if ((cpm > effectiveNum && cpm < quotedPrice) || cpm >= quotedPrice) {
        return (campaignData[action] / 1000) * quotedPrice;
      }
    } else if (action === "clicks") {
      let cpc = accounting.unformat(campaignData.cpc);
      if (cpc <= effectiveNum) {
        cpc = parseFloat(cpc.toFixed(2));
        effectiveNum = parseFloat((cpc / percentage).toFixed(2));
        return (campaignData[action]) * effectiveNum;
      } else if ((cpc > effectiveNum && cpc < quotedPrice) || cpc >= quotedPrice) {
        return (campaignData[action]) * quotedPrice;
      }
    } else if (action === "like") {
      let cpl = accounting.unformat(campaignData.cpl);
      if (cpl <= effectiveNum) {
        cpl = parseFloat(cpl.toFixed(2));
        effectiveNum = parseFloat((cpl / percentage).toFixed(2));
        return (campaignData[action]) * effectiveNum;
      } else if ((cpl > effectiveNum && cpl < quotedPrice) || cpl >= quotedPrice) {
        return (campaignData[action]) * quotedPrice;
      }
    } else if (action === "video_view") {
      let cpvv = accounting.unformat(campaignData['cpvv']);
      if (cpvv <= effectiveNum) {
        cpvv = parseFloat(cpvv.toFixed(2));
        effectiveNum = parseFloat((cpvv / percentage).toFixed(2));
        return (campaignData['videoViews']) * effectiveNum;
      } else if ((cpvv > effectiveNum && cpvv < quotedPrice) || cpvv >= quotedPrice) {
        return (campaignData['videoViews']) * quotedPrice;
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
      init.lineItems.forEach((item, index) => {
        const objective = item.objective.split(' ').join('_').toUpperCase();
        const totalBudget = parseFloat(item.budget);
        // if cost plus deal
        if (item.cost_plus) {
          let dataToSet = {};
          try {
            numbs['objective'] = item.objective;
            numbs['deal'] = "costPlus";
            numbs['percentage'] = item.costPlusPercent;
            costPlusPercent = stringToCostPlusPercentage(item.costPlusPercent);
            numbs['client_spend'] = parseFloat((init[objective]['spend'] * costPlusPercent).toFixed(2));
            numbs['budget'] = totalBudget;
            numbs['spendPercent'] = parseFloat((numbs['client_spend'] / numbs['budget']) * 100);
            numbs['client_cpc'] = parseFloat((numbs.client_spend / init[objective]['clicks']).toFixed(2));
            numbs['client_cpl'] = numbs.client_spend / init[objective]['likes'];
            numbs['client_cpm'] = parseFloat((numbs.client_spend / (init[objective]['impressions'] / 1000)).toFixed(2));
            numbs['client_cpvv'] = parseFloat((numbs.client_spend / init[objective]['videoViews']).toFixed(2));
            dataToSet[objective+".net"] = numbs;
          } catch(e) {
            console.log("Error in both/utilityFunctions/calcNet", e);
          }
          try {
            Initiatives.update(
              {_id: init._id},
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
          item.dealType === "CPVV" ? action = "video_view" : '';
          try {
            numbs['deal'] = "percentTotal";

            // grab objective and then get that object from initiative object
            // const objective = item.objective.toUpperCase().replace(/ /g, "_");
            // this makes (for example) "Link Clicks" into "LINK_CLICKS"

            const campaignStats = init[objective];
            const dealType = "percent_total";

            numbs['client_spend'] = percentTotalSpend(dealType, quotedPrice, campaignStats, init, index);
            // - running stringToPercentTotal func may not be necessary - //
            numbs['percentage'] = item.percentTotalPercent;
            numbs['budget'] = totalBudget;
            numbs['spendPercent'] = parseFloat((numbs['client_spend'] / numbs['budget']) * 100);
            numbs['client_cpc'] = parseFloat((numbs.client_spend / init[objective]['clicks']).toFixed(2));
            numbs['client_cpl'] = numbs.client_spend / init[objective]['likes'];
            numbs['client_cpm'] = parseFloat((numbs.client_spend / (init[objective]['impressions'] / 1000)).toFixed(2));
            numbs['client_cpvv'] = parseFloat((numbs.client_spend / init[objective]['videoViews']).toFixed(2));

            dataToSet[objective+".net"] = numbs;
          } catch(e) {
            console.log("Error in calcNet percent total and init.name", e, init.name);
          }
          try {
            Initiatives.update(
              {_id: init._id},
              {$set: dataToSet}
            );
          } catch(e) {
            console.log(e);
          }
        }

        // if no percent total or no cost plus
        // if ((!item.percent_total && !item.cost_plus) && (item.budget && item.quantity)) {
        //   numbs['deal'] = "Contracted Spend";
        //   numbs['percentage'] = null;
        //   numbs['spend'] = parseFloat((init[objective]['spend']).toFixed(2));
        //   numbs['budget'] = parseFloat((totalBudget).toFixed(2));
        //   numbs['spendPercent'] = parseFloat((numbs['spend'] / numbs['budget']) * 100);
        //   numbs['net_cpc'] = numbs.spend / init[objective]['clicks'];
        //   numbs['net_cpl'] = numbs.spend / init[objective]['likes'];
        //   numbs['net_cpm'] = numbs.spend / (init[objective]['impressions'] / 1000);
        //   numbs['net_cpvv'] = numbs.spend / init[objective]['videoViews'];
        //   const dataToSet = {};
        //   dataToSet[objective+".net"] = numbs;
        //   try {
        //     Initiatives.update(
        //       {name: init.name},
        //       {$set: dataToSet}
        //     );
        //   } catch(e) {
        //     console.log(e);
        //   }
        // }
      }); // end of init.lineItems.forEach((item))
    }); // end of inits.forEach((init))
  }
}

