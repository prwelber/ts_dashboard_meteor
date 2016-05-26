// on this page: functions dealing with calculating net spend, net budget, etc..

import { Meteor } from 'meteor/meteor';

export const dealTypeFuncs = {
  stringToCostPlusPercentage: (num) => {
    num = num.toString().split('');
    num.unshift(".");
    num = 1 + parseFloat(num.join(''));
    return num;
  },
  percentTotalCalculation: (init, num) => {
    let percent,
        percentTotalPercent,
        spend,
        budget;
    percent = init.lineItems[num].percentTotalPercent;
    percentTotalPercent = parseInt(init.lineItems[num].percentTotalPercent) / 100;
    spend = init[objective]['spend'] * percentTotalPercent;
    budget = init.lineItems[num].budget * percentTotalPercent;
    return {spend: spend, budget: budget}
  }
};
