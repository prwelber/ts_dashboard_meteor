mastFunc = {};

mastFunc.addToBox = function addToBox(message) {
  return $("#message-box").append("<li>"+message+"</li>");
}

mastFunc.money = function makeMoney(num) {
  return accounting.formatMoney(num, "$", 2);
}
