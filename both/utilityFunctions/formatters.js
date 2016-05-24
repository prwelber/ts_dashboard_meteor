export const formatters = {
  num: (num) => {
    return numeral(num).format("0,0");
  },
  twoDecimals: (num) => {
    return numeral(num).format("0,0.00");
  },
  money: (num) => {
    return accounting.formatMoney(num, "$", 2);
  },
  time: (timeStr) => {
    return moment(timeStr, moment.ISO_8601).format("MM-DD-YYYY hh:mm a");
  }
};
