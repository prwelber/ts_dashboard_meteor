import { dealTypeFuncs } from './dealTypeFunctions';




export const initiativesFunctionObject = {
  calculateDeliveryPercent: (initiative, index) => {
    let type;
    if (initiative.lineItems[index].dealType === "CPC") {
      type = "clicks";
    } else if (initiative.lineItems[index].dealType === "CPL") {
      type = "likes";
    } else if (initiative.lineItems[index].dealType === "CPM") {
      type = "impressions";
    } else if (initiative.lineItems[index].dealType === "CPVV") {
      type = "videoViews";
    }

    let totalQuantity = parseFloat(initiative.lineItems[index]['quantity']);

    if (! initiative.aggregateData) {
      return "N/A";
    } else {
      return (100 * initiative.aggregateData[type]) / totalQuantity;
    }
  },
  calculateFlightPercentage: (initiative, index) => {
    const start = moment(initiative.lineItems[index].startDate, moment.ISO_8601);
    const end = moment(initiative.lineItems[index].endDate, moment.ISO_8601);
    const initLength = end.diff(start, 'days');
    const todayDiff = moment().diff(start, 'days');
    const flightPercent = (100 * todayDiff) / initLength;
    if (flightPercent < 0) {
      return 0;
    } else {
      return flightPercent;
    }
  }
};
