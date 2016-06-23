const stringToPercentTotal = function stringToPercentTotal (num) {
  num = num.split('')
  num.unshift(".");
  num = parseFloat(num.join(''));
  num = 1 / num;
  return num;
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
      let action;
      init.lineItems[0].dealType === "CPC" ? action = "clicks" : '';
      init.lineItems[0].dealType === "CPM" ? action = "impressions" : '';
      init.lineItems[0].dealType === "CPL" ? action = "like" : '';
      spend = init[objective].net.client_spend;
      return init[objective].net;
    }

    // arr with values to recalculate
    // const recalc = ["clicks", "total_actions", "page_engagement", "post_engagement", "video_view", "video_play"];

    // if (camp.data.like) {
    //   recalc.push("like")
    // } else if (camp.data.post_like) {
    //   recalc.push("post_like")
    // }
    // // loop over recalc array and calculate new values according to deal type
    // for (let i = 0; i <= recalc.length - 1; i++) {
    //   var newKey = "netcp_" + recalc[i];
    //   var newValue = spend / camp.data[recalc[i]];
    //   netData[newKey] = newValue;
    // }
    // netData['netcp_impressions'] = spend / (camp.data.impressions / 1000);
    // netData['spend'] = spend;
    // return netData;
  }
};
