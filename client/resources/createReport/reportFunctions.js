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


const flattenData = function flattenData (array) {
  let data = {};
  array.forEach(el => {
    for (let key in el) {
      if (key == "actions") {
        el[key].forEach(el => {
          // this check looks for a period in the key name and
          // replaces it with an underscore if found
          // this check is used two more times below
          if (/\W/g.test(el.action_type)) {
            el.action_type = el.action_type.replace(/\W/g, "_");

            data[el.action_type] = el.value;
          }
          data[el.action_type] = el.value;
        });
      } else if (key == "cost_per_action_type") {
        el[key].forEach(el => {
          if (/\W/g.test(el.action_type)) {
            el.action_type = el.action_type.replace(/\W/g, "_");
            data["cost_per_"+el.action_type] = el.value;
          } else {
            data["cost_per_"+el.action_type] = el.value;
          }
        });
      } else {
        // this check looks for a period in the key name and
        // replaces it with an underscore
        if (/\W/g.test(key)) {
          key = key.replace(/\W/g, "_");
          data[key] = el[key];
        } else {
          data[key] = el[key];
        }
      }
    }
  });
  return data;
};

const num = function num (number) {
  return numeral(number).format("0,0");
}
const money = function money (num) {
  return accounting.formatMoney(num, "$", 2);
}

const makeSpend = function makeSpend (data, init, itemNumber) {
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
  return spend;
}





// ---------------- END OF FUNCTIONS ----------------- //




export const reportFunctions = {
  handleData: (data, actions, performance, init, lineItemName) => {
    console.log(actions, performance, init.name, lineItemName)
    const numbers = flattenData([data]); // numbers will be an object

    // get line item number
    const itemNumber = lineItemName.substring(lineItemName.length - 1, lineItemName.length);

    // determine dealType and adjust spend
    const clientSpend = makeSpend(data, init, itemNumber);

    console.log('spend', clientSpend)

    // go through actions and performance and pull out from api response
    // what user wants
    // and adjust cost per numbers for the client

    let clientData = {};
    clientData['spend'] = clientSpend;


    for (let i = 0; i < actions.length; i++) {
      if (numbers[actions[i]]) {
        clientData[actions[i]] = numbers[actions[i]]
      }
    }
    for (let i = 0; i < performance.length; i++) {
      if (numbers[performance[i]]) {
        if (performance[i] === "spend") {
          continue;
        }
        clientData[performance[i]] = numbers[performance[i]]
      }
    }

    console.log('old client data', clientData)

    // format numbers and create client numbers
    for (let i in clientData) {
      if (i === "clicks") {
        clientData.cpc = money(clientSpend / clientData.clicks);
        clientData['clicks'] = num(clientData.clicks);
      } else if (i === "reach" || i === "total_actions") {
        clientData[i] = num(clientData[i])
      } else if (i === "impressions") {
        clientData.cpm = money(clientSpend / (parseFloat(clientData.impressions) / 1000));
        clientData['impressions'] = num(clientData.impressions);
      } else if (i === "reach" || i === "frequency" || i === "clientSpend" || i === "cpm" || i === "cpc" || i === "ctr") {
        continue;
      } else if (i === "total_actions") {
        clientData["cost_per_"+i] = money(clientSpend / clientData[i]);
        clientData[i] = num(clientData[i])
      } else {
        if (actions.indexOf(i) >= 0) {
          clientData["cost_per_"+i] = money(clientSpend / clientData[i]);
          clientData[i] = num(clientData[i]);
        }
      }
    }

    clientData.spend = money(clientData.spend);
    console.log('new clientData', clientData)

    // arrange headings in one array and values in another array for rendering
    const returnArray = [];
    for (let i in clientData) {
      returnArray.push({'name': i, 'amount': clientData[i]})
    }
    return returnArray;
  }
}
