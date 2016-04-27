mastFunc = {};

mastFunc.addToBox = function addToBox(message) {
  return $("#message-box").append("<li>"+message+"</li>");
}

mastFunc.money = function makeMoney(num) {
  return accounting.formatMoney(num, "$", 2);
}

mastFunc.num = function num (num) {
  return numeral(num).format("0,0");
}


mastFunc.formatAll = function formatAll(dataObj) {
  dataObj.spend = mastFunc.money(dataObj.spend);
  dataObj.clicks = numeral(dataObj.clicks).format("0,0");
  dataObj.reach = numeral(dataObj.reach).format("0,0");
  dataObj.impressions = numeral(dataObj.impressions).format("0,0");
  dataObj.likes = numeral(dataObj.likes).format("0,0");
  dataObj.cpc = mastFunc.money(dataObj.cpc);
  dataObj.cpm = mastFunc.money(dataObj.cpm);

  if (dataObj.cpl === null || dataObj.cpl === Infinity) {
        dataObj['cpl'] = "0";
      } else if (typeof dataObj.cpl === "number") {
        dataObj['cpl'] = mastFunc.money(dataObj.cpl);
      }

  return dataObj;
}

mastFunc.time = function time(timeStr) {
  return moment(timeStr, moment.ISO_8601).format("MM-DD-YYYY hh:mm a");
}
