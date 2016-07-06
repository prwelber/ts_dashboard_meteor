import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
// import { apiVersion } from '/server/token/token';
import Promise from 'bluebird';

// ---------------- FUNCTIONS ------------------ //
const stringToCostPlusPercentage = function stringToCostPlusPercentage (num) {
  num = num.toString().split('');
  num.unshift(".");
  num = 1 + parseFloat(num.join(''));
  return num;
}

const defineAction = function defineAction (init, index) {
  let action;
  init.lineItems[index].dealType === "CPC" ? action = "clicks" : '';
  init.lineItems[index].dealType === "CPM" ? action = "impressions" : '';
  init.lineItems[index].dealType === "CPL" ? action = "like" : '';
  return action;
}

// ---------------- END OF FUNCTIONS ----------------- //




export const reportFunctions = {
  handleData: (data, actions, performance, init, lineItemName) => {
    console.log(data, actions, performance, init.name, lineItemName)


    // if there is action and cost per action type data, we need to
    // get those out of nested structures and make things flat









    // determine dealType and adjust spend
    let spend = 0;
    if (init.lineItems[0].cost_plus === true) {
      // run cost plus calculations
      const costPlusPercent = stringToCostPlusPercentage(init.lineItems[0].costPlusPercent);
      spend = data.spend * costPlusPercent;
    } else if (init.lineItems[0].percent_total === true) {
      // run cost plus calculations
      let quotedPrice;
      let itemNumber;
      init.lineItems.forEach((item, index) => {
        if (item.name === lineItemName) {
          quotedPrice = item.price;
          itemNumber = index;
        }
      });
      let action = defineAction(init, itemNumber);
      if (action === "impressions") {
        spend = (data.impressions / 1000) * quotedPrice;
      } else {
        spend = data[action] * quotedPrice;
      }
    }





    // go through actions and performance and pull out from api response
    // what user wants



    // arrange headings in one array and values in another array for rendering
  }
}
