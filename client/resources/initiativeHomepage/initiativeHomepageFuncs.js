import { Meteor } from 'meteor/meteor'
import CampaignInsights from '/collections/CampaignInsights'
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays'
import range from 'moment-range';
import moment from 'moment';
const Promise = require('bluebird');

const deliveryTypeChecker = function deliveryTypeChecker (init, index) {
  if (init.lineItems[index].dealType === "CPM") {
    return "impressions";
  } else if (init.lineItems[index].dealType === "CPC") {
    return "clicks";
  } else if (init.lineItems[index].dealType === "CPL") {
    return "like";
  } else if (init.lineItems[index].dealType === "CPVV") {
    return "video_view"
  }
}


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
      const daysDiff = moment(init.lineItems[index]['endDate'], moment.ISO_8601).diff(moment(init.lineItems[index]['startDate'], moment.ISO_8601), 'days');
      let insights;
      const type = deliveryTypeChecker(init, index);

      if (objective) {
        // loop over the campaign names in the initiative
        init.campaign_names.forEach(el => {
          // check each campaignInsight for the objective
          let camp = CampaignInsights.findOne({'data.campaign_name': el});
          if (camp) {
            if (camp.data.objective === objective && camp) {
              // once I have the campaign, pull all the daily insights for that
              insights = InsightsBreakdownsByDays.find({'data.campaign_name': camp.data.campaign_name}, {sort: {'data.date_start': 1}}).fetch();
            } else {
              null;
            }
          }
        });

        // make array of x axis dates, delivery numbers and spending
        const xAxisArray = [];
        const typeArray = [];
        const spendArray = [];
        let spendCount = 0;
        let typeCount = parseFloat(insights[0].data[type]);
        insights.forEach(el => {
          xAxisArray.push(moment(el.data.date_start, moment.ISO_8601).format("MM-DD"));
          typeArray.push(parseFloat(typeCount.toFixed(2)));
          typeCount += parseFloat(el.data[type]);
          spendArray.push(parseFloat(spendCount.toFixed(2)));
          spendCount += accounting.unformat(el.data.spend);
        });

        // make ideal spend and delivery
        const avg = parseFloat(init.lineItems[index].quantity) / daysDiff;
        const spendAvg = parseFloat(init.lineItems[index].budget) / daysDiff;
        const avgDeliveryArray = [];
        const avgSpendArray = [];

        let total = 0,
            idealSpendTotal = 0;
        for (let i = 0; i < daysDiff + 1; i++) {
          total = total + avg;
          idealSpendTotal = idealSpendTotal + spendAvg;
          avgDeliveryArray.push(parseFloat(total.toFixed(2)));
          avgSpendArray.push(parseFloat(idealSpendTotal.toFixed(2)));
        }

        return {
          chart: {
            zoomType: 'x'
          },
          // TODO FIX THIS
          title: {
            text: "Delivery for " + objective
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
          series: [{
            name: 'Ideal Distribution',
            data: avgDeliveryArray,
            color: '#90caf9'
          }, {
            name: 'Real Distribution',
            data: typeArray,
            color: '#0d47a1'
          }, {
            name: 'Spend',
            data: spendArray,
            color: '#b71c1c',
            tooltip: {
              valueSuffix: ' USD',
              valuePrefix: '$'
            }
          }, {
            name: 'Ideal Spend',
            data: avgSpendArray,
            color: '#ef9a9a',
            tooltip: {
              valueSuffix: ' USD',
              valuePrefix: '$'
            }
          }]
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
      if (objective) {
        // loop over the campaign names in the initiative
        init.campaign_names.forEach(el => {
          // check each campaignInsight for the objective
          let camp = CampaignInsights.findOne({'data.campaign_name': el});
          if (camp) {
            if (camp.data.objective === objective && camp) {
              // once I have the campaign, pull all the daily insights for that
              insights = InsightsBreakdownsByDays.find({'data.campaign_name': camp.data.campaign_name}, {sort: {'data.date_start': 1}}).fetch();
            } else {
              null;
            }
          }
        });

        // make array of x axis dates
        const xAxisArray = [];
        const typeArray = [];
        insights.forEach(el => {
          xAxisArray.push(moment(el.data.date_start, moment.ISO_8601).format("MM-DD"));
          typeArray.push(accounting.unformat(el.data[type]));
        });

        return {
          chart: {
            zoomType: 'x'
          },
          // TODO FIX THIS
          title: {
            text: "Cost Per for " + objective
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

    const spendArray = [];
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
    const avgSpendArray = [];

    let total = 0,
        idealSpendTotal = 0;
    for (let i = 0; i < daysDiff + 1; i++) {
      total = total + avg;
      idealSpendTotal = idealSpendTotal + spendAvg;
      avgDeliveryArray.push(total);
      avgSpendArray.push(idealSpendTotal);
    }
    // ----------- end of ideal spend and delivery ---------- //

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
        text: "Delivery for " + objective
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

      legend: {
        borderWidth: 0,
        layout: 'horizontal',
        backgroundColor: '#FFFFFF',
        align: 'left',
        verticalAlign: 'top',
        floating: true,
        x: 25,
        y: 50
      },

      series: [{
        name: 'Ideal Distribution',
        data: avgDeliveryArray,
        color: '#90caf9'
      }, {
        name: 'Real Distribution',
        data: typeArray,
        color: '#0d47a1'
      }, {
        name: 'Spend',
        data: spendArray,
        color: '#b71c1c',
        tooltip: {
          valueSuffix: ' USD',
          valuePrefix: '$'
        }
      }, {
        name: 'Ideal Spend',
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
        text: "Cost Per for " + objective
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

      legend: {
        borderWidth: 0,
        layout: 'horizontal',
        backgroundColor: '#FFFFFF',
        align: 'left',
        verticalAlign: 'top',
        floating: true,
        x: 25,
        y: 50
      },

      series: [{
        name: type,
        data: typeArray,
        color: '#0d47a1'
      }]
    } // end of return
  }
};
