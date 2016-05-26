import { dealTypeFuncs } from '/both/utilityFunctions/dealTypeFunctions';

export const initiativesFunctionObject = {
  calculateSpendPercent: (initiative) => {

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
  }
};
