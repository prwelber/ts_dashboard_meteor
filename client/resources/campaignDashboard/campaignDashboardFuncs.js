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

const defineAction = function defineAction (init) {
  let action;
  init.lineItems[0].dealType === "CPC" ? action = "clicks" : '';
  init.lineItems[0].dealType === "CPM" ? action = "impressions" : '';
  init.lineItems[0].dealType === "CPL" ? action = "like" : '';
  return action;
}

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
  clientSpend: (number, typeNumb, dealType, item, quotedPrice, campData, init) => {
    if (dealType === "cost_plus") {
      let percent = stringToCostPlusPercentage(item.costPlusPercent);
      if (typeNumb === "spend") {
        return number * percent;
      }
    } else if (dealType === "percent_total") {
      let action = defineAction(init);
      if (action === "impressions") {
        return (campData[action] / 1000) * quotedPrice;
      } else {
        return campData[action] * quotedPrice;
      }
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
