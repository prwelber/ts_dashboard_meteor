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
  init.lineItems[index].dealType === "CPVV" ? action = "video_view" : '';
  return action;
}
const flattenDaily = function flattenDaily (array) {
  let dataArray = [];
  array.forEach(el => {
    let data = {};
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
      } else if (key === "video_10_sec_watched_actions") {
        el[key].forEach(element => {
          if (element.action_type === "video_view") {
            data["video_10_sec_watched_actions"] = element.value;
          }
        });
      } else if (key === "video_30_sec_watched_actions") {
        el[key].forEach(element => {
          if (element.action_type === "video_view") {
            data["video_30_sec_watched_actions"] = element.value;
          }
        });
      } else if (key === "video_avg_pct_watched_actions") {
        el[key].forEach(element => {
          if (element.action_type === "video_view") {
            data["video_avg_pct_watched_actions"] = element.value;
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
    dataArray.push(data);
  });
  return dataArray;
};

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
      } else if (key === "video_10_sec_watched_actions") {
        el[key].forEach(element => {
          if (element.action_type === "video_view") {
            data["video_10_sec_watched_actions"] = element.value;
          }
        });
      } else if (key === "video_30_sec_watched_actions") {
        el[key].forEach(element => {
          if (element.action_type === "video_view") {
            data["video_30_sec_watched_actions"] = element.value;
          }
        });
      } else if (key === "video_avg_pct_watched_actions") {
        el[key].forEach(element => {
          if (element.action_type === "video_view") {
            data["video_avg_pct_watched_actions"] = element.value;
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

const makeSpend = function makeSpend (data, init, itemNumber, lineItemName) {
  let spend = 0;
  if (init.lineItems[0].cost_plus === true) {
    // run cost plus calculations
    const costPlusPercent = stringToCostPlusPercentage(init.lineItems[0].costPlusPercent);
    spend = data.spend * costPlusPercent;
  }
  return spend;
}

const percentTotalSpend = function percentTotalSpend (dealType, quotedPrice, campaignData, init, itemNum) {
  if (dealType === "percent_total") {
    let action = defineAction(init, itemNum);
    let effectiveNum = parseFloat(init.lineItems[itemNum].effectiveNum);
    let percentage = (parseFloat(init.lineItems[itemNum].percentTotalPercent) / 100);
    if (action === "impressions") {
      let cpm = accounting.unformat(campaignData.cpm);
      if (cpm <= effectiveNum) {
        effectiveNum = cpm / percentage;
        return (campaignData[action] / 1000) * effectiveNum;
      } else if ((cpm > effectiveNum && cpm < quotedPrice) || cpm >= quotedPrice) {
        return (campaignData[action] / 1000) * quotedPrice;
      }
    } else if (action === "clicks") {
      let cpc = accounting.unformat(campaignData.cpc);
      if (cpc <= effectiveNum) {
        effectiveNum = cpc / percentage;
        return (campaignData[action]) * effectiveNum;
      } else if ((cpc > effectiveNum && cpc < quotedPrice) || cpc >= quotedPrice) {
        return (campaignData[action]) * quotedPrice;
      }
    } else if (action === "like") {
      let cpl = accounting.unformat(campaignData.cpl);
      if (cpl <= effectiveNum) {
        effectiveNum = cpl / percentage;
        return (campaignData[action]) * effectiveNum;
      } else if ((cpl > effectiveNum && cpl < quotedPrice) || (cpl) >= quotedPrice) {
        return (campaignData[action]) * quotedPrice;
      }
    } else if (action === "video_view") {
      let cpvv = accounting.unformat(campaignData['cost_per_video_view']);
      if (cpvv <= effectiveNum) {
        effectiveNum = parseFloat((cpvv / percentage).toFixed(2));
        return (campaignData['video_view']) * effectiveNum;
      } else if ((cpvv > effectiveNum && cpvv < quotedPrice) || cpvv >= quotedPrice) {
        return (campaignData['video_view']) * quotedPrice;
      }
    }
  }
}





// ---------------- END OF FUNCTIONS ----------------- //




export const reportFunctions = {
  handleData: (data, actions, performance, init, lineItemName) => {
    const numbers = flattenData([data]); // numbers will be an object
    // get line item number
    let itemNumber = parseInt(lineItemName.substring(lineItemName.length - 1, lineItemName.length) - 1);

    // determine dealType and adjust spend
    let clientSpend = 0;
    if (init.lineItems[itemNumber].cost_plus) {
      clientSpend = makeSpend(data, init, itemNumber, lineItemName);
    } else if (init.lineItems[itemNumber].percent_total) {
      const deal = "percent_total";
      const quotedPrice = init.lineItems[itemNumber].price;
      clientSpend = percentTotalSpend (deal, quotedPrice, numbers, init, itemNumber);
    }


    // go through actions and performance and pull out from api response
    // what user wants
    // and adjust cost per numbers for the client
    const dateStart = data.date_start;
    const dateStop = data.date_stop;
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
    // format numbers and create client numbers
    for (let i in clientData) {
      if (i === "clicks") {
        // clientData.cpc = money(clientSpend / clientData.clicks);
        clientData['clicks'] = num(clientData.clicks);
      } else if (i === "video_avg_pct_watched_actions") {
        clientData[i] = clientData[i] + "%";
      } else if (i === "reach" || i === "total_actions") {
        clientData[i] = num(clientData[i])
      } else if (i === "impressions") {
        // clientData.cpm = money(clientSpend / (parseFloat(clientData.impressions) / 1000));
        clientData['impressions'] = num(clientData.impressions);
      } else if (i === "reach" || i === "frequency" || i === "clientSpend" || i === "cpm" || i === "cpc" || i === "ctr") {
        continue;
      } else if (i === "total_actions") {
        // clientData["cost_per_"+i] = money(clientSpend / clientData[i]);
        clientData[i] = num(clientData[i])
      } else {
        if (actions.indexOf(i) >= 0) {
          // clientData["cost_per_"+i] = money(clientSpend / clientData[i]);
          clientData[i] = num(clientData[i]);
        }
      }
    }

    clientData.spend = money(clientData.spend);

    // arrange headings in one array and values in another array for rendering
    const returnArray = [];
    returnArray.push({'name': 'Date Start', 'amount': dateStart});
    returnArray.push({'name': 'Date Stop', 'amount': dateStop});
    for (let i in clientData) {
      returnArray.push({'name': i, 'amount': clientData[i]})
    }
    return returnArray;
  },
  handleDaily: (data, actions, performance, init, lineItemName) => {
    console.log("actions and performance", actions.concat(performance))
    const choices = actions.concat(performance);
    const dateStart = data[0].date_start;
    const dateStop = data[data.length - 1].date_stop;
    const numbers = flattenDaily(data);
    // get line item number
    const itemNumber = lineItemName.substring(lineItemName.length - 1, lineItemName.length);
    // determine dealType and adjust spend

    let action = defineAction(init, itemNumber - 1);

    // grab objective from line item and use it to get client spend number
    // from init



    const objective = init.lineItems[itemNumber - 1].objective.toUpperCase().replace(/ /g, "_");

    // const clientSpend = init[objective].net.client_spend;
    const dealType = init.lineItems[itemNumber - 1].dealType.toLowerCase();

    const costPer = init[objective].net['client_' + dealType];
    console.log('costPer', costPer)
    numbersArray = [];
    numbers.forEach(day => {
      // need to: only keep what user requestd, adjust cost per and spend
      // instantiated at beginning of every loop
      let clientData = {};
      let daySpend = 0;
      for (let i = 0; i < actions.length; i++) {
        if (day[actions[i]]) {
          clientData[actions[i]] = day[actions[i]]
        }
      }
      for (let i = 0; i < performance.length; i++) {
        if (day[performance[i]]) {
          if (performance[i] === "spend") {
            continue;
          }
          clientData[performance[i]] = day[performance[i]]
        }
      }
      for (let i in day) {

        if (action === "impressions") {
          daySpend = (day.impressions / 1000) * costPer;
        } else if (action === "clicks") {
          daySpend = day.clicks * costPer;
        } else if (action === "like") {
          daySpend = day.like * costPer;
        } else if (action === "video_view") {
          daySpend = day.video_view * costPer;
        }
        clientData['spend'] = money(daySpend)


        if (i === "clicks") {
          // clientData.cpc = money(daySpend / day.clicks);
          clientData['clicks'] = num(day.clicks);
        } else if (i === "date_start") {
          clientData['date_start'] = day.date_start;
        } else if (i === "video_avg_pct_watched_actions") {
          clientData[i] = day[i] + "%";
        } else if (i === "reach" || i === "total_actions") {
          clientData[i] = num(day[i])
        } else if (i === "impressions") {
          // clientData.cpm = money(daySpend / (parseFloat(day.impressions) / 1000));
          clientData['impressions'] = num(day.impressions);
        } else if (i === "reach" || i === "frequency" || i === "clientSpend" || i === "cpm" || i === "cpc" || i === "ctr") {
          if (i === "ctr" || i === "frequency") {
            clientData[i] = day[i].toFixed(4);
          } else {
            continue;
          }
        } else if (i === "total_actions") {
          // clientData["cost_per_"+i] = money(daySpend / day[i]);
          clientData[i] = num(day[i])
        } else {
          if (actions.indexOf(i) >= 0) {
            // clientData["cost_per_"+i] = money(daySpend / day[i]);
            clientData[i] = num(day[i]);
          }
        }
      }
      numbersArray.push(clientData);
    });
    console.log('numbersArray', numbersArray);

    // create totals using reduce in a loop

    // ["clicks", "post_like", "post_engagement", "link_click", "website_clicks", "reach", "impressions", "total_actions", "spend"]

    let totals = {
      date_start: "Totals"
    };
    let total;
    for (let i = 0; i < choices.length; i++) {
      if (choices[i] === "spend") {
        totals[choices[i]] = money(numbersArray.reduce((prev, curr) => {
          return prev + accounting.unformat(curr[choices[i]]);
        }, 0));
      } else {
        totals[choices[i]] = num(numbersArray.reduce((prev, curr) => {
          return prev + accounting.unformat(curr[choices[i]]);
        }, 0));
      }
    }

    console.log('totals', totals);
    numbersArray.push(totals)
    return numbersArray;
  } // end of daily function
} // end of exported object
