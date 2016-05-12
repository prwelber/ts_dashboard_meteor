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
    if (init.lineItems[0].costPlusPercent) {
      deal = "costPlus";
      percent = init.lineItems[0].costPlusPercent;
      costPlusPercent = stringToCostPlusPercentage(init.lineItems[0].costPlusPercent);
      spend = camp.data.spend / costPlusPercent;
    } else if (init.lineItems[0].percent_total) {
      deal = "percentTotal";
      percent = init.lineItems[0].percentTotalPercent;
      percentTotalPercent = parseInt(init.lineItems[0].percentTotalPercent) / 100;
      spend = camp.data.spend * percentTotalPercent;
    }

    // arr with values to recalculate
    const recalc = ["clicks", "total_actions", "page_engagement", "post_engagement", "video_views"];

    if (camp.data.like) {
      recalc.push("like")
    } else if (camp.data.post_like) {
      recalc.push("post_like")
    }

    for (let i = 0; i <= recalc.length - 1; i++) {
      var newKey = "netcp_" + recalc[i];
      var newValue = spend / camp.data[recalc[i]];
      netData[newKey] = newValue;
    }
    netData['netcp_impressions'] = spend / (camp.data.impressions / 1000);
    netData['spend'] = spend;
    return netData;
  }
};
