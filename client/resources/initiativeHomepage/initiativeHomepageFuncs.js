import { Meteor } from 'meteor/meteor'
import CampaignInsights from '/collections/CampaignInsights'
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays'

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
        percentTotalPercent = parseInt(init.lineItems[num].percentTotalPercent) / 100;
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
      let type;
      if (init.lineItems[index].dealType === "CPM") {
        type = "impressions";
      } else if (init.lineItems[index].dealType === "CPC") {
        type = "clicks";
      } else if (init.lineItems[index].dealType === "CPL") {
        type = "like";
      } else if (init.lineItems[index].dealType === "CPVV") {
        type = "video_view"
      }
      if (objective) {
        // loop over the campaign names in the initiative
        init.campaign_names.forEach(el => {
          // check each campaignInsight for the objective
          let camp = CampaignInsights.findOne({'data.campaign_name': el});
          if (camp) {
            if (camp.data.objective === objective && camp) {
              // once I have the campaign, pull all the daily insights for that
              insights = InsightsBreakdownsByDays.find({'data.campaign_name': camp.data.campaign_name}).fetch();
            } else {
            console.log('');
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
          xAxisArray.push(el.data.date_start.substring(0,5));
          typeArray.push(typeCount);
          typeCount += parseFloat(el.data[type]);
          spendArray.push(spendCount);
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
          avgDeliveryArray.push(total);
          avgSpendArray.push(idealSpendTotal);
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
            color: '#b71c1c'
          }, {
            name: 'Ideal Spend',
            data: avgSpendArray,
            color: '#ef9a9a'
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
        type = "cpl";
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
              insights = InsightsBreakdownsByDays.find({'data.campaign_name': camp.data.campaign_name}).fetch();
            } else {
            console.log('');
            }
          }
        });

        // make array of x axis dates
        const xAxisArray = [];
        const typeArray = [];
        insights.forEach(el => {
          xAxisArray.push(el.data.date_start.substring(0,5));
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
      }; // end of if (objective) {
    } // end of if (index < count && index !== undefined)
  }
};
