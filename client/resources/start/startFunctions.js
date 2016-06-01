import { dealTypeFuncs } from '/both/utilityFunctions/dealTypeFunctions';

export const initiativesFunctionObject = {
  calculateSpendPercent: (initiative) => {

  },
  calculateFlightPercentage: (initiative) => {
    const start = moment(initiative.lineItems[0].startDate, moment.ISO_8601);
    const end = moment(initiative.lineItems[0].endDate, moment.ISO_8601);
    const initLength = end.diff(start, 'days');
    const todayDiff = moment().diff(start, 'days');
    return ((100 * todayDiff) / initLength);
  }
};
