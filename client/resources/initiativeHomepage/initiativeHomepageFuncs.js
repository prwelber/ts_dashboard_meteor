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
      return returnObj;
    }
  },
  objectiveChart: (init, index, count) => {
    if (index < count && index !== undefined) {
      // need to grab the objective from the line item
      const objective = init.lineItems[index]['objective'].split(' ').join('_').toUpperCase();
      let insights;
      let type;
      if (init.lineItems[index].dealType === "CPM") {
        type = "impressions";
      } else if (init.lineItems[index].dealType === "CPC") {
        type = "clicks";
      } else if (init.lineItems[index].dealType === "CPL") {
        type = "like";
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
            console.log('no camp');
            }
          }
        });

        // make array of x axis dates
        const xAxisArray = [];
        const typeArray = [];
        const spendArray = [];
        let spendCount = accounting.unformat(insights[0].data.spend);
        let typeCount = parseFloat(insights[0].data[type]);
        insights.forEach(el => {
          xAxisArray.push(el.data.date_start.substring(0,5));
          typeArray.push(typeCount);
          typeCount += parseFloat(el.data[type]);
          spendArray.push(spendCount);
          spendCount += accounting.unformat(el.data.spend);
        });

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
            data: [10,20,30,40,50],
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
            data: [50,60,70,80,90],
            color: '#ef9a9a'
          }]
        }
      };
    }
  }
};
