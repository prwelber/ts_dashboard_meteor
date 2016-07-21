// -------------------------- FUNCTIONS -------------------------- //
const stringToPercentTotal = function stringToPercentTotal (num) {
  num = num.split('')
  num.unshift(".");
  num = parseFloat(num.join(''));
  num = 1 / num;
  return num;
}

const stringToCostPlusPercentage = function stringToCostPlusPercentage (num) {
  num = num.toString().split('');
  num.unshift(".");
  num = 1 + parseFloat(num.join(''));
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

/*
* this percentTotalSpend function is invoked if the dealType is percent_total
* it goes gets the action type (impressions, clicks, likes) and checks the real number
* against the effective number. if the real metric / factor percent is <= to
* the effective num,  we return the effective num times the metric amount, etc..
* if cpm / factor amount is greater than effectiveNum && is less than quoted price,
* we return the quotedPrice times the metric amount-------
*/
const percentTotalSpend = function percentTotalSpend (dealType, quotedPrice, campaignData, init, index) {
  if (dealType === "percent_total") {
    let action = defineAction(init, index);
    let effectiveNum = init.lineItems[index].effectiveNum;
    let percentage = (parseFloat(init.lineItems[index].percentTotalPercent) / 100);
    if (action === "impressions") {
      let cpm = accounting.unformat(campaignData.cpm);
      if (cpm <= effectiveNum) {
        effectiveNum = parseFloat((cpm / percentage).toFixed(2));
        return (campaignData[action] / 1000) * effectiveNum;
      } else if ((cpm > effectiveNum && cpm < quotedPrice) || cpm >= quotedPrice) {
        return (campaignData[action] / 1000) * quotedPrice;
      }
    } else if (action === "clicks") {
      let cpc = accounting.unformat(campaignData.cpc);
      if (cpc <= effectiveNum) {
        effectiveNum = parseFloat((cpc / percentage).toFixed(2));
        return (campaignData[action]) * effectiveNum;
      } else if ((cpc > effectiveNum && cpc < quotedPrice) || cpc >= quotedPrice) {
        return (campaignData[action]) * quotedPrice;
      }
    } else if (action === "like") {
      let cpl = accounting.unformat(campaignData.cpl);
      if (cpl <= effectiveNum) {
        effectiveNum = parseFloat((cpl / percentage).toFixed(2));
        return (campaignData[action]) * effectiveNum;
      } else if ((cpl > effectiveNum && cpl < quotedPrice) || cpl >= quotedPrice) {
        return (campaignData[action]) * quotedPrice;
      }
    } else if (action === "video_view") {
      let cpvv = accounting.unformat(campaignData['cost_per_video_view']);
      if (cpvv <= effectiveNum) {
        effectiveNum = parseFloat((cpvv / percentage).toFixed(2));
        return (campaignData[action]) * effectiveNum;
      } else if ((cpvv > effectiveNum && cpvv < quotedPrice) || cpvv >= quotedPrice) {
        return (campaignData[action]) * quotedPrice;
      }
    }
  }
}

// --------------------------- END FUNCTIONS --------------------------- //

export const campaignDashboardFunctionObject = {
  netInsights: (init, camp) => {
    const stringToCostPlusPercentage = function stringToCostPlusPercentage (num) {
      num = num.toString().split('');
      num.unshift(".");
      num = 1 + parseFloat(num.join(''));
      return num;
    }
    let netData = {};
    let deal;
    let percent;
    let costPlusPercent;
    let percentTotalPercent;
    let spend;
    const objective = init.lineItems[0].objective.split(' ').join('_').toUpperCase();
    // figure out deal type
    if (init.lineItems[0].costPlusPercent) {
      deal = "costPlus";
      percent = init.lineItems[0].costPlusPercent;
      costPlusPercent = stringToCostPlusPercentage(init.lineItems[0].costPlusPercent);
      spend = camp.data.spend * costPlusPercent;
      return init[objective].net;
    } else if (init.lineItems[0].percent_total) {
      deal = "percentTotal";
      const quotedPrice = init.lineItems[0].price;
      let action = defineAction(init)
      // init.lineItems[0].dealType === "CPC" ? action = "clicks" : '';
      // init.lineItems[0].dealType === "CPM" ? action = "impressions" : '';
      // init.lineItems[0].dealType === "CPL" ? action = "like" : '';
      spend = init[objective].net.client_spend;
      return init[objective].net;
    }
  },
  clientSpend: (number, typeNumb, dealType, item, quotedPrice, campData, init, index) => {
    if (dealType === "cost_plus") {
      let percent = stringToCostPlusPercentage(item.costPlusPercent);
      if (typeNumb === "spend") {
        return number * percent;
      }
    } else if (dealType === "percent_total") {
      return percentTotalSpend(dealType, quotedPrice, campData, init, index);
    }
  },
  clientNumbers: (clientSpend, campData, init, item, quotedPrice, dealType) => {
    let clientNumbers = {};
    if (dealType === "cost_plus") {
      clientNumbers["cpm"] =  clientSpend / (campData.impressions / 1000);
      clientNumbers["cpc"] = clientSpend / campData.clicks;
      clientNumbers["cpl"] = clientSpend / campData.like;
      clientNumbers["cpvv"] = clientSpend / campData.video_view;
      return clientNumbers;
    } else if (dealType === "percent_total") {
      clientNumbers["cpm"] =  clientSpend / (campData.impressions / 1000);
      clientNumbers["cpc"] = clientSpend / campData.clicks;
      clientNumbers["cpl"] = clientSpend / campData.like;
      clientNumbers["cpvv"] = clientSpend / campData.video_view;
      return clientNumbers;
    }
  }
};
