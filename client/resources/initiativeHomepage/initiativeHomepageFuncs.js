import { Meteor } from 'meteor/meteor'
import CampaignInsights from '/collections/CampaignInsights'
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays'
import range from 'moment-range';
import moment from 'moment';
const Promise = require('bluebird');

// --------------------------- FUNCTIONS ---------------------------- //

const defineAction = function defineAction (init, index) {
  let action;
  init.lineItems[index].dealType === "CPC" ? action = "clicks" : '';
  init.lineItems[index].dealType === "CPM" ? action = "impressions" : '';
  init.lineItems[index].dealType === "CPL" ? action = "like" : '';
  init.lineItems[index].dealType === "CPVV" ? action = "video_view" : '';
  return action;
}

const percentTotalSpend = function percentTotalSpend (campaignData, init, index) {
  let dealType = init.lineItems[index].percent_total;
  let quotedPrice = init.lineItems[index].price;
  if (dealType === true) {
    let action = defineAction(init, index);
    let effectiveNum = init.lineItems[index].effectiveNum;
    let percentage = (parseFloat(init.lineItems[index].percentTotalPercent) / 100);
    if (action === "impressions") {
      let cpm = accounting.unformat(campaignData.cpm);
      if (cpm <= effectiveNum) {
        // cpm = parseFloat(cpm.toFixed(2));
        // effectiveNum = parseFloat((cpm / percentage).toFixed(2));
        effectiveNum = (cpm / percentage);
        return (campaignData[action] / 1000) * effectiveNum;
      } else if ((cpm > effectiveNum && cpm < quotedPrice) || cpm >= quotedPrice) {
        return (campaignData[action] / 1000) * quotedPrice;
      }
    } else if (action === "clicks") {
      let cpc = accounting.unformat(campaignData.cpc);
      if (cpc <= effectiveNum) {
        // cpc = parseFloat(cpc.toFixed(2));
        // effectiveNum = parseFloat((cpc / percentage).toFixed(2));
        effectiveNum = (cpc / percentage);
        return (campaignData[action]) * effectiveNum;
      } else if ((cpc > effectiveNum && cpc < quotedPrice) || cpc >= quotedPrice) {
        return (campaignData[action]) * quotedPrice;
      }
    } else if (action === "like") {
      let cpl = accounting.unformat(campaignData.cpl);
      if (cpl <= effectiveNum) {
        // cpl = parseFloat(cpl.toFixed(2));
        // effectiveNum = parseFloat((cpl / percentage).toFixed(2));
        effectiveNum = (cpl / percentage);
        return (campaignData[action]) * effectiveNum;
      } else if ((cpl > effectiveNum && cpl < quotedPrice) || cpl >= quotedPrice) {
        return (campaignData[action]) * quotedPrice;
      }
    } else if (action === "video_view") {
      let cpvv = accounting.unformat(campaignData['cost_per_video_view']);
      if (cpvv <= effectiveNum) {
        // cpvv = parseFloat(cpvv.toFixed(2));
        // effectiveNum = parseFloat((cpvv / percentage).toFixed(2));
        effectiveNum = (cpvv / percentage);
        return (campaignData[action]) * effectiveNum;
      } else if ((cpvv > effectiveNum && cpvv < quotedPrice) || cpvv >= quotedPrice) {
        return (campaignData[action]) * quotedPrice;
      }
    }
  }
}

const clientNumbers = function clientNumbers (clientSpend, campData, init, dealType) {
  let clientNumbs = {};
  clientNumbs["cpm"] =  parseFloat((clientSpend / (campData.impressions / 1000)).toFixed(2));
  clientNumbs["cpc"] = parseFloat((clientSpend / campData.clicks).toFixed(2));
  clientNumbs["cpl"] = parseFloat((clientSpend / campData.like).toFixed(2));
  clientNumbs["cpvv"] = parseFloat((clientSpend / campData.video_view).toFixed(2));
  return clientNumbs;
}

const deliveryTypeChecker = function deliveryTypeChecker (init, index) {
  if (init.lineItems[index].dealType === "CPM") {
    return "impressions";
  } else if (init.lineItems[index].dealType === "CPC") {
    return "clicks";
  } else if (init.lineItems[index].dealType === "CPL") {
    return "like";
  } else if (init.lineItems[index].dealType === "CPVV") {
    return "video_view";
  }
}
// ------------------------- END FUNCTIONS ------------------------- //

export const initiativeHomepageFunctions = {
  calcNet: (num, init) => {
    if (! init.lineItems[num].budget) {
      return '';
    } else {
      const objective = init.lineItems[num].objective.split(' ').join('_').toUpperCase();
      const stringToCostPlusPercentage = function stringToCostPlusPercentage (num) {
        num = num.toString().split('');
        num.unshift(".");
        num = 1 + parseFloat(num.join(''));
        return num;
      }

      let deal,
          percent,
          spend,
          budget,
          costPlusPercent,
          percentTotalPercent;
      // figure out deal type
      if (init.lineItems[num].costPlusPercent) {
        deal = "costPlus";
        percent = init.lineItems[num].costPlusPercent;
        costPlusPercent = stringToCostPlusPercentage(init.lineItems[num].costPlusPercent);
        spend = init[objective]['spend'] / costPlusPercent;
        budget = init.lineItems[num].budget / costPlusPercent;
      } else if (init.lineItems[num].percent_total) {
        deal = "percentTotal";
        percent = init.lineItems[num].percentTotalPercent;
        percentTotalPercent = parseFloat(init.lineItems[num].percentTotalPercent) / 100;
        spend = init[objective]['spend'] * percentTotalPercent;
        budget = init.lineItems[num].budget * percentTotalPercent;
      }

      // now I want to take each objective aggregate and do the math to calculate
      // net stats with the new spend that we just got.
      let returnObj = {};
      const objectiveAg = init[objective];
      returnObj['net_budget'] = budget;
      returnObj['net_spend'] = spend;
      returnObj['net_spendPercent'] = ((spend / budget) * 100);
      returnObj['net_cpc'] = spend / objectiveAg['clicks'];
      returnObj['net_cpl'] = spend / objectiveAg['likes'];
      returnObj['net_cpm'] = spend / (objectiveAg['impressions'] / 1000);
      returnObj['net_cpvv'] = spend / objectiveAg['videoViews'];
      return returnObj;
    }
  },
  objectiveDeliveryChart: (init, index, count) => {
    if (index < count && index !== undefined) {
      // need to grab the objective from the line item
      const objective = init.lineItems[index]['objective'].split(' ').join('_').toUpperCase();
      const quotedPrice = parseFloat(init.lineItems[index].price);
      const daysDiff = moment(init.lineItems[index]['endDate'], moment.ISO_8601).diff(moment(init.lineItems[index]['startDate'], moment.ISO_8601), 'days') + 1;
      let insights;
      const type = deliveryTypeChecker(init, index);
      let camp;

      // -- get start and end from line item to query days collection -- //
      const start = init.lineItems[index].startDate; // is ISOString format
      const end = init.lineItems[index].endDate;




      // need to match objective with campaign that has that objective, which is in
      // the campaign_names array

      if (objective) {

      const getDaysBreakdown = function getDaysBreakdown (init, index, objective) {
        for (let i = 0; i < init.campaign_names.length; i++) {
          camp = CampaignInsights.findOne({'data.campaign_name': init.campaign_names[i]})
          if (camp.data.objective === objective) {
            return InsightsBreakdownsByDays.find(
              {$and: [
                {'data.date_start': {$gte: start}},
                {'data.date_start': {$lte: end}},
                {'data.campaign_name': camp.data.campaign_name}
              ]},
              {sort: {'data.date_start': 1}}
            ).fetch();
            // return InsightsBreakdownsByDays.find({'data.campaign_name': camp.data.campaign_name}, {sort: {'data.date_start': 1}}).fetch();
          }
        }
      }

      insights = getDaysBreakdown(init, index, objective);
      // console.log('from getDaysBreakdown', insights.length, insights[0], insights[1], insights[2])
      // get campaign factorSpend for use later
      const factorSpend = percentTotalSpend(camp.data, init, index);
      let dealType = init.lineItems[index].percent_total;
      const clientNumbs = clientNumbers(factorSpend, camp.data, init, dealType)

      // make array of x axis dates, delivery numbers and spending
      const xAxisArray = [];
      const typeArray = [];
      let spendArray = [];
      let spendCount = 0;
      let typeCount;
      try {
        typeCount = parseFloat(insights[0].data[type]);
      } catch (e) {
        console.log(e)
      }

      insights.forEach(el => {
        xAxisArray.push(moment(el.data.date_start, moment.ISO_8601).format("MM-DD"));
        typeArray.push(parseFloat(typeCount.toFixed(2)));
        typeCount += parseFloat(el.data[type]);
        spendArray.push(parseFloat(spendCount.toFixed(2)));
        spendCount += accounting.unformat(el.data.spend);
      });

      // -------------- Adjust spend to reflect dealtype ----------- //

      let action;
      if (init.lineItems[index].cost_plus === true) {
        init.lineItems[index].dealType === "CPC" ? action = "clicks" : '';
        init.lineItems[index].dealType === "CPM" ? action = "impressions" : '';
        init.lineItems[index].dealType === "CPL" ? action = "like" : '';
        init.lineItems[index].dealType === "CPVV" ? action = "video_view" : '';
        let percent = init.lineItems[index].costPlusPercent.split('');
        percent.unshift(".");
        percent = 1 + parseFloat(percent.join(''));
        // need to MULTIPLY spend by 'percent' (should be 1.15 or similar)
        spendArray = spendArray.map((num) => {
          return num * percent;
        });
      }

      if (init.lineItems[index].percent_total === true) {

        init.lineItems[index].dealType === "CPC" ? action = "clicks" : '';
        init.lineItems[index].dealType === "CPM" ? action = "impressions" : '';
        init.lineItems[index].dealType === "CPL" ? action = "like" : '';
        init.lineItems[index].dealType === "CPVV" ? action = "video_view" : '';

        const dealType = init.lineItems[index].dealType;
        const quotedPrice = init.lineItems[index].price;

        const deal = init.lineItems[index].dealType.toLowerCase();
        spendCount = 0;
        spendArray = [];
        insights.forEach(day => {
          if (action === "impressions") {
            spendCount = spendCount + ((day['data'][action] / 1000) * clientNumbs[deal]);
          } else {
            spendCount = spendCount + (day['data'][action] * clientNumbs[deal]);
          }
          spendArray.push(parseFloat(spendCount.toFixed(2)));
        });
      }
      // --------------- End spend adjustment -------------------- //


      // make ideal spend and delivery
      const avg = parseFloat(init.lineItems[index].quantity) / daysDiff;
      const spendAvg = parseFloat(init.lineItems[index].budget) / daysDiff;
      const avgDeliveryArray = [];
      const avgSpendArray = [];

      let total = 0,
          idealSpendTotal = 0;
      for (let i = 0; i < daysDiff; i++) {
        total = total + avg;
        idealSpendTotal = idealSpendTotal + spendAvg;
        avgDeliveryArray.push(parseFloat(total.toFixed(2)));
        avgSpendArray.push(parseFloat(idealSpendTotal.toFixed(2)));
      }

      // -------------- REMOVE CERTAIN THINGS FOR CLIENTS -------------- //
      let adminToolTip = function adminToolTip (name, data, color) {
        if (Meteor.user().admin === true) {
          return {
            name: name,
            data: data,
            color: color,
            tooltip: {
              valueSuffix: ' USD',
              valuePrefix: '$'
            }
          }
        }
        else {
          return {
            // name: name,
            // data: data,
            // color: color,
            // tooltip: {
            //   enabled: false
            // }
          }
        }
      }

      // ---------------- END CLIENT SCRUB FUNCTIONS ---------------- //
      let isAdmin = false;
      let adminHeight = 300;
      if (Meteor.user().admin === true) {
        isAdmin = true;
        adminHeight = null;
      }

        return {
          chart: {
            // backgroundColor: '#fafafa',
            zoomType: 'x',
            height: adminHeight,
          },
          // TODO FIX THIS
          title: {
            text: "Delivery",
          },

          subtitle: {
            text: document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
          },

          // tooltip: {
          //   valueSuffix: " " + type,
          //   shared: true,
          //   crosshairs: true
          // },
          tooltip: {
            enabled: isAdmin
          },
          xAxis: {
            // type: 'datetime',
            categories: xAxisArray
          },

          yAxis: {
            title: {
              text: type
            },
            plotLines: [{
              value: 0,
              width: 1,
              color: '#808080'
            }]
          },
          // plotOptionsFunction(),
          plotOptions: { // removes the markers along the plot lines
            series: {
              marker: {
                enabled: false,
                states: {
                  hover: {
                    enabled: isAdmin
                  }
                }
              }
            }
          },
          series: [
          {
            name: 'Pacing Delivery',
            data: avgDeliveryArray,
            color: '#90caf9',
            tooltip: {
              valueSuffix: ' ' + type
            }
          },
          {
            name: 'Actual Delivery',
            data: typeArray,
            color: '#0d47a1',
            tooltip: {
              valueSuffix: ' ' + type
            }
          },
          adminToolTip('Actual Spend', spendArray, '#b71c1c'),
          adminToolTip('Pacing Spend', avgSpendArray, '#ef9a9a')
          // {
          //   name: 'Actual Spend',
          //   data: spendArray,
          //   color: '#b71c1c',
          //   adminToolTip()
          //   tooltip: {
          //       valueSuffix: ' USD',
          //       valuePrefix: '$'
          //     }
          // },
          // {
          //   name: 'Pacing Spend',
          //   data: avgSpendArray,
          //   color: '#ef9a9a',
          //   tooltip: {
          //     valueSuffix: ' USD',
          //     valuePrefix: '$'
          //   }
          // }
          ]
        } // end of return
      }; // end of if (objective) {
    } // end of if (index < count && index !== undefined)
  },

  objectiveSpendChart: (init, index, count) => {
    if (index < count && index !== undefined) {
      // need to grab the objective from the line item
      const objective = init.lineItems[index]['objective'].split(' ').join('_').toUpperCase();
      const quotedPrice = parseFloat(init.lineItems[index].price);
      const daysDiff = moment(init.lineItems[index]['endDate'], moment.ISO_8601).diff(moment(init.lineItems[index]['startDate'], moment.ISO_8601), 'days') + 1;
      let insights;
      const type = deliveryTypeChecker(init, index);
      let camp;

      // need to match objective with campaign that has that objective, which is in
      // the campaign_names array




      if (objective) {

      const getDaysBreakdown = function getDaysBreakdown (init, index, objective) {
        const start = init.lineItems[index].startDate; // is ISOString format
        const end = init.lineItems[index].endDate;
        for (let i = 0; i < init.campaign_names.length; i++) {
          camp = CampaignInsights.findOne({'data.campaign_name': init.campaign_names[i]})
          if (camp.data.objective === objective) {
            return InsightsBreakdownsByDays.find(
              {$and: [
                {'data.date_start': {$gte: start}},
                {'data.date_start': {$lte: end}},
                {'data.campaign_name': camp.data.campaign_name}
              ]},
              {sort: {'data.date_start': 1}}
            ).fetch();
            // return InsightsBreakdownsByDays.find({'data.campaign_name': camp.data.campaign_name}, {sort: {'data.date_start': 1}}).fetch();
          }
        }
      }

      insights = getDaysBreakdown(init, index, objective);

      // get campaign factorSpend for use later
      const factorSpend = percentTotalSpend(camp.data, init, index);
      let dealType = init.lineItems[index].percent_total;
      const clientNumbs = clientNumbers(factorSpend, camp.data, init, dealType)

      // make array of x axis dates, delivery numbers and spending
      const xAxisArray = [];
      const typeArray = [];
      let spendArray = [];
      let spendCount = 0;
      let typeCount;
      try {
        typeCount = parseFloat(insights[0].data[type]);
      } catch (e) {
        console.log('Err in initiativeHomepageFuncs.js', e)
      }

      insights.forEach(el => {
        xAxisArray.push(moment(el.data.date_start, moment.ISO_8601).format("MM-DD"));
        typeArray.push(parseFloat(typeCount.toFixed(2)));
        typeCount += parseFloat(el.data[type]);
        spendArray.push(parseFloat(spendCount.toFixed(2)));
        spendCount += accounting.unformat(el.data.spend);
      });

      // -------------- Adjust spend to reflect dealtype ----------- //

      let action;
      if (init.lineItems[index].cost_plus === true) {
        init.lineItems[index].dealType === "CPC" ? action = "clicks" : '';
        init.lineItems[index].dealType === "CPM" ? action = "impressions" : '';
        init.lineItems[index].dealType === "CPL" ? action = "like" : '';
        init.lineItems[index].dealType === "CPVV" ? action = "video_view" : '';
        let percent = init.lineItems[index].costPlusPercent.split('');
        percent.unshift(".");
        percent = 1 + parseFloat(percent.join(''));
        // need to MULTIPLY spend by 'percent' (should be 1.15 or similar)
        spendArray = spendArray.map((num) => {
          return num * percent;
        });
      }

      if (init.lineItems[index].percent_total === true) {

        init.lineItems[index].dealType === "CPC" ? action = "clicks" : '';
        init.lineItems[index].dealType === "CPM" ? action = "impressions" : '';
        init.lineItems[index].dealType === "CPL" ? action = "like" : '';
        init.lineItems[index].dealType === "CPVV" ? action = "video_view" : '';

        const dealType = init.lineItems[index].dealType;
        const quotedPrice = init.lineItems[index].price;

        const deal = init.lineItems[index].dealType.toLowerCase();
        spendCount = 0;
        spendArray = [];
        insights.forEach(day => {
          if (action === "impressions") {
            spendCount = spendCount + ((day['data'][action] / 1000) * clientNumbs[deal]);
          } else {
            spendCount = spendCount + (day['data'][action] * clientNumbs[deal]);
          }
          spendArray.push(parseFloat(spendCount.toFixed(2)));
        });
      }
      // --------------- End spend adjustment -------------------- //


      // make ideal spend and delivery
      const avg = parseFloat(init.lineItems[index].quantity) / daysDiff;
      const spendAvg = parseFloat(init.lineItems[index].budget) / daysDiff;
      const avgDeliveryArray = [];
      const avgSpendArray = [];

      let total = 0,
          idealSpendTotal = 0;
      for (let i = 0; i < daysDiff ; i++) {
        total = total + avg;
        idealSpendTotal = idealSpendTotal + spendAvg;
        avgDeliveryArray.push(parseFloat(total.toFixed(2)));
        avgSpendArray.push(parseFloat(idealSpendTotal.toFixed(2)));
      }

      // -------------- REMOVE CERTAIN THINGS FOR CLIENTS -------------- //
      let adminToolTip = function adminToolTip (name, data, color) {
        if (Meteor.user().admin === true) {
          return {
            name: name,
            data: data,
            color: color,
            tooltip: {
              valueSuffix: ' USD',
              valuePrefix: '$'
            }
          }
        } else {
          return {
            name: name,
            data: data,
            color: color,
            tooltip: {
              enabled: false
            }
          }
        }
      }

      // ---------------- END CLIENT SCRUB FUNCTIONS ---------------- //
      let isAdmin = false;
      let adminHeight = 300;
      if (Meteor.user().admin === true) {
        isAdmin = true;
        adminHeight = null;
      }

        return {
          chart: {
            zoomType: 'x',
            // backgroundColor: '#fafafa',
            height: adminHeight,
          },
          // TODO FIX THIS
          title: {
            text: "Spend",
          },

          subtitle: {
            text: document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
          },

          // tooltip: {
          //   valueSuffix: " " + type,
          //   shared: true,
          //   crosshairs: true
          // },
          tooltip: {
            enabled: isAdmin
          },
          xAxis: {
            // type: 'datetime',
            categories: xAxisArray
          },

          yAxis: {
            title: {
              text: 'Spend'
            },
            plotLines: [{
              value: 0,
              width: 1,
              color: '#808080'
            }]
          },
          // plotOptionsFunction(),
          plotOptions: { // removes the markers along the plot lines
            series: {
              marker: {
                enabled: false,
                states: {
                  hover: {
                    enabled: isAdmin
                  }
                }
              }
            }
          },
          series: [
          // {
          //   name: 'Pacing Delivery',
          //   data: avgDeliveryArray,
          //   color: '#90caf9',
          //   tooltip: {
          //     valueSuffix: ' ' + type
          //   }
          // },
          // {
          //   name: 'Actual Delivery',
          //   data: typeArray,
          //   color: '#0d47a1',
          //   tooltip: {
          //     valueSuffix: ' ' + type
          //   }
          // },
          adminToolTip('Actual Spend', spendArray, '#b71c1c'),
          adminToolTip('Pacing Spend', avgSpendArray, '#ef9a9a')
          // {
          //   name: 'Actual Spend',
          //   data: spendArray,
          //   color: '#b71c1c',
          //   adminToolTip()
          //   tooltip: {
          //       valueSuffix: ' USD',
          //       valuePrefix: '$'
          //     }
          // },
          // {
          //   name: 'Pacing Spend',
          //   data: avgSpendArray,
          //   color: '#ef9a9a',
          //   tooltip: {
          //     valueSuffix: ' USD',
          //     valuePrefix: '$'
          //   }
          // }
          ]
        } // end of return
      }; // end of if (objective) {
    } // end of if (index < count && index !== undefined)
  },


  objectiveCostPerChart: (init, index, count) => {
    if (index < count && index !== undefined) {
      // need to grab the objective from the line item
      const objective = init.lineItems[index]['objective'].split(' ').join('_').toUpperCase();
      const price = parseFloat(init.lineItems[index]['price']);
      let insights;
      let type;
      if (init.lineItems[index].dealType === "CPM") {
        type = "cpm";
      } else if (init.lineItems[index].dealType === "CPC") {
        type = "cpc";
      } else if (init.lineItems[index].dealType === "CPL") {
        type = "cost_per_like";
      } else if (init.lineItems[index].dealType === "CPVV") {
        type = "cost_per_video_view";
      }

      const start = init.lineItems[index].startDate; // is ISOString format
      const end = init.lineItems[index].endDate;

      if (objective) {
        // loop over the campaign names in the initiative
        init.campaign_names.forEach(el => {
          // check each campaignInsight for the objective
          let camp = CampaignInsights.findOne({'data.campaign_name': el});
          if (camp) {
            if (camp.data.objective === objective && camp) {
              // once I have the campaign, pull all the daily insights for that

              insights = InsightsBreakdownsByDays.find(
                {$and: [
                  {'data.date_start': {$gte: start}},
                  {'data.date_start': {$lte: end}},
                  {'data.campaign_name': camp.data.campaign_name}
                ]},
                {sort: {'data.date_start': 1}}
              ).fetch();

              // insights = InsightsBreakdownsByDays.find({'data.campaign_name': camp.data.campaign_name}, {sort: {'data.date_start': 1}}).fetch();
            } else {
              null;
            }
          }
        });

        // make array of x axis dates
        const xAxisArray = [];
        const typeArray = [];
        try {
          insights.forEach(el => {
            xAxisArray.push(moment(el.data.date_start, moment.ISO_8601).format("MM-DD"));
            typeArray.push(accounting.unformat(el.data[type]));
          });
        } catch (e) {
          console.log('Error at insights.forEach in initiativeHomepageFuncs.js', e);
        }


        return {
          chart: {
            zoomType: 'x'
          },
          // TODO FIX THIS
          title: {
            text: "Cost Per Result"
          },

          subtitle: {
            text: document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
          },

          tooltip: {
            valueSuffix: " " + type,
            shared: true,
            crosshairs: true
          },
          xAxis: {
            // type: 'datetime',
            categories: xAxisArray
          },

          yAxis: {
            title: {
              text: type
            },
            plotLines: [{
              value: price,
              width: 3,
              color: '#ff0000',
              zIndex: 10,
              label:{text:'Price'}
            }]
          },

          plotOptions: { // removes the markers along the plot lines
            series: {
              marker: {
                enabled: false
              }
            }
          },
          series: [{
            name: type,
            data: typeArray,
            color: '#0d47a1'
          }]
        } // end of return
      }; // end of if (objective) {
    } // end of if (index < count && index !== undefined)
  },
  dupObjectivesDeliveryChart: (init, index, count) => {
    const objective = init.lineItems[index]['objective'].split(' ').join('_').toUpperCase();
    const daysDiff = moment(init.lineItems[index]['endDate'], moment.ISO_8601).diff(moment(init.lineItems[index]['startDate'], moment.ISO_8601), 'days');

    const type = deliveryTypeChecker(init, index);

    // grab all daily insights under the initiative
    // filter out the ones without the objective for the line item
    // add up the data for each day from the ones that are left
    let insights;
    let allDays = InsightsBreakdownsByDays.find({'data.initiative': init.name}, {sort: {'data.date_start': 1}}).fetch();
    // remove any dailyInsights with a different objective
    allDays.forEach((day, index) => {
      if (day.data.objective !== objective) {
        allDays.splice(index, 1);
      }
    });


    let obj = {};
    var typeMap = new Map();
    var spendMap = new Map();
    /*
      here we are looping over all days insights and if the date doesn't exist
      we add it to a Map as a key and add the value as the value
      in the else block, we set the value or spend, add it to the existing value
      or spend of the existing key/value pair, and then set the new value in the Map
    */
    allDays.forEach((el) => {
      if (! obj[el.data.date_start]) {
        obj[el.data.date_start] = el.data[type];
        typeMap.set(el.data.date_start, el.data[type]);
        spendMap.set(el.data.date_start, accounting.unformat(el.data.spend));
      } else {
        obj[el.data.date_start] += el.data[type];
        let value = typeMap.get(el.data.date_start);
        value += el.data[type];
        typeMap.set(el.data.date_start, value);
        let spend = spendMap.get(el.data.date_start);
        spend += accounting.unformat(el.data.spend);
        spendMap.set(el.data.date_start, spend);
      }
    });

    let values = typeMap.values();
    let typeCount = values.next().value;
    const typeArray = [];

    for (let [key, value] of typeMap) {
      typeArray.push(typeCount);
      typeCount += value;
    }

    let spendArray = [];
    let spendValues = spendMap.values();
    // let spendCount = spendValues.next().value;
    let spendCount = 0;
    for (let [key, value] of spendMap) {
      spendArray.push(spendCount);
      spendCount += accounting.unformat(value);
    }

    // ----------- make ideal spend and delivery ------------ //
    const avg = parseFloat(init.lineItems[index].quantity) / daysDiff;
    const spendAvg = parseFloat(init.lineItems[index].budget) / daysDiff;
    const avgDeliveryArray = [];
    let avgSpendArray = [];

    let total = 0,
        idealSpendTotal = 0;
    for (let i = 0; i < daysDiff + 1; i++) {
      total = total + avg;
      idealSpendTotal = idealSpendTotal + spendAvg;
      avgDeliveryArray.push(total);
      avgSpendArray.push(idealSpendTotal);
    }
    // ----------- end of ideal spend and delivery ---------- //

    // -------------- Adjust spend to reflect dealtype ----------- //

    let action;
    if (init.lineItems[index].cost_plus === true) {
      init.lineItems[index].dealType === "CPC" ? action = "clicks" : '';
      init.lineItems[index].dealType === "CPM" ? action = "impressions" : '';
      init.lineItems[index].dealType === "CPL" ? action = "like" : '';
      let percent = init.lineItems[index].costPlusPercent.split('');
      percent.unshift(".");
      percent = 1 + parseFloat(percent.join(''));
      // need to MULTIPLY spend by 'percent' (should be 1.15 or similar)
      spendArray = spendArray.map((num) => {
        return num * percent;
      });
    }

    if (init.lineItems[index].percent_total === true) {
      const quotedPrice = parseFloat(init.lineItems[index].price);
      init.lineItems[index].dealType === "CPC" ? action = "clicks" : '';
      init.lineItems[index].dealType === "CPM" ? action = "impressions" : '';
      init.lineItems[index].dealType === "CPL" ? action = "like" : '';
      spendCount = 0;
      spendArray = [];
      for (let [key, value] of typeMap) {
        if (action === "impressions") {
          spendCount = spendCount + ((value / 1000) * quotedPrice)
        } else {
          spendCount = spendCount + (value * quotedPrice);
        }
        spendArray.push(spendCount);
      }
    }

    // --------------- End spend adjustment -------------------- //



    // ----------- functionality for X Axis ----------------- //
    const start = moment(allDays[0]['data']['date_start'], moment.ISO_8601);
    const end = moment(allDays[allDays.length - 1]['data']['date_start'], moment.ISO_8601);
    const range = moment.range(start, end);
    const xAxisRange = range.toArray('days');
    xAxisArray = xAxisRange.map((el) => {
      return moment(el).format("MM-DD");
    });
    // ----------- end X Axis functions ----------------------- //

    return {
      chart: {
        zoomType: 'x'
      },
      // TODO FIX THIS
      title: {
        text: "Results for " + action,
      },

      subtitle: {
        text: document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
      },

      tooltip: {
        valueSuffix: " " + type,
        shared: true,
        crosshairs: true
      },
      xAxis: {
        // type: 'datetime',
        categories: xAxisArray
      },

      yAxis: {
        title: {
          text: type
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },

      plotOptions: { // removes the markers along the plot lines
        series: {
          marker: {
            enabled: false
          }
        }
      },

      // legend: {
      //   borderWidth: 0,
      //   layout: 'horizontal',
      //   backgroundColor: '#FFFFFF',
      //   align: 'left',
      //   verticalAlign: 'top',
      //   floating: true,
      //   x: 25,
      //   y: 50
      // },

      series: [{
        name: 'Pacing Delivery',
        data: avgDeliveryArray,
        color: '#90caf9'
      }, {
        name: 'Actual Delivery',
        data: typeArray,
        color: '#0d47a1'
      }, {
        name: 'Actual Spend',
        data: spendArray,
        color: '#b71c1c',
        tooltip: {
          valueSuffix: ' USD',
          valuePrefix: '$'
        }
      }, {
        name: 'Pacing Spend',
        data: avgSpendArray,
        color: '#ef9a9a',
        tooltip: {
          valueSuffix: ' USD',
          valuePrefix: '$'
        }
      }]
    } // end of return

  },
  dupObjectivesCostPerChart: (init, index, count) => {
    const objective = init.lineItems[index]['objective'].split(' ').join('_').toUpperCase();
    const daysDiff = moment(init.lineItems[index]['endDate'], moment.ISO_8601).diff(moment(init.lineItems[index]['startDate'], moment.ISO_8601), 'days');

    const price = parseFloat(init.lineItems[index]['price']);
    let type;
    if (init.lineItems[index].dealType === "CPM") {
      type = "cpm";
    } else if (init.lineItems[index].dealType === "CPC") {
      type = "cpc";
    } else if (init.lineItems[index].dealType === "CPL") {
      type = "cost_per_like";
    } else if (init.lineItems[index].dealType === "CPVV") {
      type = "cost_per_video_view";
    }

    let insights = InsightsBreakdownsByDays.find({'data.initiative': init.name}, {sort: {'data.date_start': 1}}).fetch();
    // format date and remove any dailyInsights with a different objective

    insights.forEach((insight, index) => {
      if (insight.data.objective !== objective) {
        insights.splice(index, 1);
      }
    });
    // ----------- functionality for X Axis ----------------- //
    // if (insights && insights[0].data.date_start) {
      const start = moment(insights[0]['data']['date_start'], moment.ISO_8601);
      const end = moment(insights[insights.length - 1]['data']['date_start'], moment.ISO_8601);
      const range = moment.range(start, end);
      const xAxisRange = range.toArray('days');
      xAxisArray = xAxisRange.map((el) => {
        return moment(el).format("MM-DD");
      });
    // }
    // ----------- end X Axis functions ----------------------- //


    var costPerMap = new Map();
    let obj = {};

    insights.forEach((el) => {
      if (! obj[el.data.date_start]) {
        obj[el.data.date_start] = 1
        costPerMap.set(el.data.date_start, accounting.unformat(el.data[type]));
      } else if (obj[el.data.date_start]) {
        obj[el.data.date_start] += 1;
        let costPer = costPerMap.get(el.data.date_start);
        costPer += accounting.unformat(el.data[type]);
        costPerMap.set(el.data.date_start, costPer);
      }
    });

    /*
      iterate over the Map, declare newVal
      set newVal = to Map value / by obj holding how many instances of the day
      push newVal into typeArray to be used by highchart
    */
    const typeArray = [];
    for (let [key, value] of costPerMap) {
      let newVal;
      newVal = value / obj[key];
      typeArray.push(parseFloat(newVal.toFixed(2)));
    }


    return {
      chart: {
        zoomType: 'x'
      },
      // TODO FIX THIS
      title: {
        text: "Cost Per Result"
      },

      subtitle: {
        text: document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
      },

      tooltip: {
        valueSuffix: " " + type,
        shared: true,
        crosshairs: true
      },
      xAxis: {
        // type: 'datetime',
        categories: xAxisArray
      },

      yAxis: {
        title: {
          text: type
        },
        plotLines: [{
          value: price,
          width: 3,
          color: '#ff0000',
          zIndex: 10,
          label:{text:'Price'}
        }]
      },

      plotOptions: { // removes the markers along the plot lines
        series: {
          marker: {
            enabled: false
          }
        }
      },

      // legend: {
      //   borderWidth: 0,
      //   layout: 'horizontal',
      //   backgroundColor: '#FFFFFF',
      //   align: 'left',
      //   verticalAlign: 'top',
      //   floating: true,
      //   x: 25,
      //   y: 50
      // },

      series: [{
        name: type,
        data: typeArray,
        color: '#0d47a1'
      }]
    } // end of return
  },
  gaugeChart: (title, actions, max) => {


    return {
      chart: {
        type: 'solidgauge',
        height: 180,
        width: 200
      },
      title: null,
      pane: {
        center: ['50%', '90%'],
        size: '115%',
        startAngle: -90,
        endAngle: 90,
        background: {
            backgroundColor: '#EEE',
            innerRadius: '60%',
            outerRadius: '100%',
            shape: 'arc'
        }
      },
      yAxis: {
        min: 0,
        max: max,
        title: {
          text: title,
          y: -65
        },
        stops: [
          [0.1, '#55BF3B'],
          [0.5, '#DDDF0D'],
          [0.9, '#92d7ff']
        ],
        // tickAmount: 2,
        labels: {
            y: 2
        },
        // lineWidth: 0,
        //   tickAmount: 2,
        //   tickWidth: 0,
      },
      // plotOptions: {
      //   solidgauge: {
      //     dataLabels: {
      //       y: 15,
      //       borderWidth: 0,
      //       useHTML: true
      //     }
      //   }
      // },
      credits: {
        enabled: false
      },

      series: [{
        name: title,
        data: [actions]
      }]

    }
  }
};
