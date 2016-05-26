import { dealTypeFuncs } from './dealTypeFunctions';




export const initiativesFunctionObject = {
  calculateSpendPercent: (initiative) => {
    const netStats = initiativesFunctionObject.calcNet(0, initiative);
    return netStats.net_spendPercent;
  },
  calculateDeliveryPercent: (initiative) => {
    let type;
    if (initiative.lineItems[0].dealType === "CPC") {
      type = "clicks";
    } else if (initiative.lineItems[0].dealType === "CPL") {
      type = "likes";
    } else if (initiative.lineItems[0].dealType === "CPM") {
      type = "impressions";
    }
    let totalQuantity = 0;
    // get total quantity contracted
    initiative.lineItems.forEach(el => {
      if (el.quantity === "" || el.quantity === null) {
        el.quantity = 0;
      } else if (typeof el.quantity === "string") {
        el.quantity = parseFloat(el.quantity);
      }
      totalQuantity = totalQuantity + el.quantity;
    });
    if (! initiative.aggregateData) {
      return "N/A";
    } else {
      return (100 * initiative.aggregateData[type]) / totalQuantity;
    }
  },
  calculateFlightPercentage: (initiative) => {
    const start = moment(initiative.lineItems[0].startDate, moment.ISO_8601);
    const end = moment(initiative.lineItems[0].endDate, moment.ISO_8601);
    const initLength = end.diff(start, 'days');
    const todayDiff = moment().diff(start, 'days');
    return ((100 * todayDiff) / initLength);
  },
  calcNet: (num, init) => {
    if (! init.lineItems[num].budget) {
      return '';
    } else {
      const objective = init.lineItems[num].objective.split(' ').join('_').toUpperCase();
      const stringToCostPlusPercentage = function stringToCostPlusPercentage (num) {
        num = num.toString().split('');
        num.unshift(".");
        num = 1 + parseFloat(num.join(''));
        return num;
      }

      let deal,
          percent,
          spend,
          budget,
          costPlusPercent,
          percentTotalPercent;
      // figure out deal type
      if (init.lineItems[num].costPlusPercent) {
        deal = "costPlus";
        percent = init.lineItems[num].costPlusPercent;
        costPlusPercent = stringToCostPlusPercentage(init.lineItems[num].costPlusPercent);
        spend = init[objective]['spend'] / costPlusPercent;
        budget = init.lineItems[num].budget / costPlusPercent;
      } else if (init.lineItems[num].percent_total) {
        deal = "percentTotal";
        percent = init.lineItems[num].percentTotalPercent;
        percentTotalPercent = parseInt(init.lineItems[num].percentTotalPercent) / 100;
        spend = init[objective]['spend'] * percentTotalPercent;
        budget = init.lineItems[num].budget * percentTotalPercent;
      }

      // now I want to take each objective aggregate and do the math to calculate
      // net stats with the new spend that we just got.
      let returnObj = {};
      const objectiveAg = init[objective];
      returnObj['net_budget'] = budget;
      returnObj['net_spend'] = spend;
      returnObj['net_spendPercent'] = ((spend / budget) * 100);
      returnObj['net_cpc'] = spend / objectiveAg['clicks'];
      returnObj['net_cpl'] = spend / objectiveAg['likes'];
      returnObj['net_cpm'] = spend / (objectiveAg['impressions'] / 1000);
      returnObj['net_cpvv'] = spend / objectiveAg['videoViews'];
      return returnObj;
    }
  }
};
