import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Initiatives from '/collections/Initiatives'
import CampaignInsights from '/collections/CampaignInsights'

const moment = require('moment');
const range = require('moment-range');
const Promise = require('bluebird');

// Tracker.autorun(function () {
//   if (FlowRouter.subsReady('Initiatives')) {
//     console.log('Initiatives subs are now ready!');
//   }
// });

Template.charts.onCreated( function () {
  this.templateDict = new ReactiveDict();

  const initiative = Initiatives.findOne(
    {"campaign_ids": {$in: [FlowRouter.current().params.campaign_id]}
  });
  this.templateDict.set( 'initiative', initiative );
})

Template.charts.onRendered( function (){
  $(document).ready(function(){
    $('ul.tabs').tabs();
  });
});

Template.charts.events({

});

Template.charts.helpers({
  isReady: (sub) => {
    return FlowRouter.subsReady(sub);
  },
  'deliveryChart': function () {

    let actionToChart   = [],
        spendChart      = [],
        spendTotal      = 0,
        totes           = 0,
        total           = 0,
        idealSpendTotal = 0,
        labels          = [],
        avgData         = [],
        idealSpend      = [],
        type;

    if (FlowRouter.subsReady()) {
      const initiative = Template.instance().templateDict.get('initiative');
      // for getting evenly distrubuted output

    const days = moment(initiative.lineItems[0].endDate, moment.ISO_8601).diff(moment(initiative.lineItems[0].startDate, moment.ISO_8601), 'days');
    const avg = parseFloat(numeral(initiative.lineItems[0].quantity / days).format("0.00"));
    const spendAvg = parseFloat(numeral(initiative.lineItems[0].budget / days).format("0.00"));

      for (let i = 0; i < days; i++) {
        total = total + avg;
        idealSpendTotal = idealSpendTotal + spendAvg;
        avgData.push(total);
        idealSpend.push(idealSpendTotal);
      }

      //for setting dealType
      if (initiative.lineItems[0].dealType === "CPM") {
        type = "impressions";
      } else if (initiative.lineItems[0].dealType === "CPC") {
        type = "clicks";
      } else if (initiative.lineItems[0].dealType === "CPL") {
        type = "like";
      }

      var call = Promise.promisify(Meteor.call);

      call('aggregateForChart', initiative)
      .then(function (res) {
        Session.set('res', res);
        totes = res[0][type]
      }).catch(function (err) {
        console.log('uh no error', err)
      });

        Session.get('res').forEach(el => {
          totes += el[type];
          spendTotal += el.spend;
          actionToChart.push(totes);
          spendChart.push(spendTotal);
        });

      // for getting x axis labels
      var start       = moment(Session.get('res')[0]['date'], "MM-DD"),
          end         = new Date(initiative.lineItems[0].endDate),
          dr          = moment.range(start, end),
          arrayOfDays = dr.toArray('days');

      arrayOfDays.forEach(el => {
        labels.push(moment(el).format("MM-DD"))
      });
    }



    return {

      chart: {
        zoomType: 'x'
      },

      title: {
        text: type.substr(0,1).toUpperCase() + type.substr(1, type.length) + " Delivery for Initiative"
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
        categories: labels
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
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
      },

      series: [{
        name: 'Ideal Distribution',
        data: avgData,
        color: '#90caf9'
      }, {
        name: 'Real Distribution',
        data: actionToChart,
        color: '#0d47a1'
      }, {
        name: 'Spend',
        data: spendChart,
        color: '#b71c1c'
      }, {
        name: 'Ideal Spend',
        data: idealSpend,
        color: '#ef9a9a'
      }]
    }

  },
  'costPerChart': function () {
    const initiative = Template.instance().templateDict.get('initiative');

    //for setting dealType
    let type;
    if (initiative.lineItems[0].dealType === "CPM") {
      type = "impressions";
    } else if (initiative.lineItems[0].dealType === "CPC") {
      type = "clicks";
    } else if (initiative.lineItems[0].dealType === "CPL") {
      type = "like";
    }

    let cpmChart = [],
        cpcChart = [],
        cplChart = [];

    Session.get('res').forEach(el => {
      cpmChart.push(el.cpm);
      cpcChart.push(el.cpc);
      cplChart.push(el.cost_per_like);
    });

    // for getting x axis labels
    let labels      = [],
        start       = moment(Session.get('res')[0]['date'], "MM-DD"),
        end         = new Date(initiative.lineItems[0].endDate);
        dr          = moment.range(start, end),
        arrayOfDays = dr.toArray('days');

    arrayOfDays.forEach(el => {
      labels.push(moment(el).format("MM-DD"))
    });

    // build chart
    return {

      chart: {
        zoomType: 'x'
      },

      title: {
        text: "Cost per Type for Initiative"
      },

      subtitle: {
        text: document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
      },

      tooltip: {
        valueSuffix: '',
        shared: true,
        crosshairs: true
      },
      xAxis: {
        // type: 'datetime',
        categories: labels
      },

      yAxis: {
        title: {
          text: type
        },
        plotLines: [{
          value: parseFloat(initiative.lineItems[0].price),
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
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
      },

      series: [{
        name: 'CPM',
        data: cpmChart
      }, {
        name: 'CPC',
        data: cpcChart
      }, {
        name: 'CPL',
        data: cplChart
      }]
    } // end of chart return
  },
  'dualAxes': function () {
    const initiative = Template.instance().templateDict.get('initiative');

    // for getting x axis labels
    let labels = [];
    var start  = moment(Session.get('res')[0]['date'], "MM-DD");
    var end    = new Date(initiative.lineItems[0].endDate);
    var dr     = moment.range(start, end);
    var arrayOfDays = dr.toArray('days');

    arrayOfDays.forEach(el => {
      labels.push(moment(el).format("MM-DD"))
    });

    //for setting dealType
    let type;
    let costType;

    let total = 0;
    let actionArray = [];
    let costPerArray = [];

       Session.get('res').forEach(el => {
        if (initiative.lineItems[0].dealType === "CPM") {
          actionArray.push(el.impressions);
          costPerArray.push(el.cpm);
          type = "impressions";
          costType = "CPM";
        } else if (initiative.lineItems[0].dealType === "CPC") {
          actionArray.push(el.clicks);
          costPerArray.push(el.cpc);
          type = "clicks";
          costType = "CPC";
        } else if (initiative.lineItems[0].dealType === "CPL") {
          actionArray.push(el.like);
          costPerArray.push(el.cost_per_like);
          type = "like";
          costType = "CPL";
        }
     });
    // console.log("sesh test", Session.get('dualAxes'))



    return {
      chart: {
        zoomType: 'xy'
      },
      title: {
        text: type + ' & cost per'
      },
      xAxis: [{
        categories: labels,
        crosshair: true
      }],
      yAxis: [{
        // left axis
        labels: {
          format: '{value} ' + costType,
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
        title: {
          text: costType,
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        }
      }, {
      // right axis
      title: {
        text: type,
        style: {
          color: Highcharts.getOptions().colors[0]
        }
      },
      labels: {
        format: '{value} ' + type,
        style: {
          color: Highcharts.getOptions().colors[0]
        }
      },
      opposite: true

      }],
      tooltip: {
        shared: true,
        crosshairs: true
      },
      legend: {
        layout: 'vertical',
        align: 'left',
        x: 120,
        verticalAlign: 'top',
        y: 50,
        floating: true,
        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
      },
      series: [{
        //right axis
        name: type,
        type: 'column',
        yAxis: 1,
        data: actionArray,
        tooltip: {
          valueSuffix: ' ' + type
        }
      }, {
        //left axis
        name: costType,
        type: 'spline',
        data: costPerArray,
        tooltip: {
          valueSuffix: costType
        }
      }]
    } // end of chart return
  },
  'hourlyChart': function () {
    let cpc = { name: "CPC", data: [] }
    let cpl = { name: "CPL", data: [] }
    let cpm = { name: "CPM", data: [] }
    let clicks = { name: "clicks", data: [] }
    let impressions = { name: "impressions", data: [] }
    let likes = { name: "likes", data: [] }
    let spend = { name: "Spend", data: [] }

    if (FlowRouter.subsReady()) {
      const initiative = Template.instance().templateDict.get('initiative');

      var call = Promise.promisify(Meteor.call);

      call('hourlyChart', initiative)
      .then(function (resultData) {
        Session.set('resultData', resultData);
        return resultData
      })
      .catch(function (err) {
        console.log('boooo error', err)
        throw new Meteor.Error('this is a Meteor Error!!!!');
      });

      Session.get('resultData').forEach(el => {
        cpc.data.push(el[0].cpc);
        cpl.data.push(el[0].cpl);
        cpm.data.push(el[0].cpm);
        spend.data.push(el[0].spend);
        impressions.data.push(el[0].impressions);
        clicks.data.push(el[0].clicks);
        likes.data.push(el[0].likes);
      });
    }


    return {
      chart: {
            type: 'column'
        },
        title: {
            text: 'Hourly Breakdown'
        },
        xAxis: {
            categories: ['12am', '1am', '2am', '3am', '4am', '5am',
                         '6am', '7am', '8am', '9am', '10am', '11am',
                         '12pm', '1pm', '2pm', '3pm', '4pm', '5pm',
                         '6pm', '7pm', '8pm', '9pm', '10pm', '11pm',
            ],
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Amount'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.0,
                borderWidth: 0
            }
        },
        series: [cpc, cpm, cpl, spend, impressions, clicks, likes]
    }
  },
  'ageGenderChart': function () {
    const initiative = Template.instance().templateDict.get('initiative');
    var call = Promise.promisify(Meteor.call);
    const dealType = initiative.lineItems[0].dealType;

    call('ageGenderChart', initiative)
    .then(function (ageGenderData) {
      Session.set('maleData', ageGenderData.male);
      Session.set('femaleData', ageGenderData.female);
    })
    .catch(function (err) {
      console.log('boooo error', err)
      throw new Meteor.Error('this is a Meteor Error!!!!');
    });

    let action;

    if (initiative.lineItems[0].dealType === "CPC") {
      action = "clicks"
    } else if (initiative.lineItems[0].dealType === "CPM") {
      action = "impressions"
    } else if (initiative.lineItems[0].dealType === "CPL") {
      action = "likes"
    }


    const maleData = [];
    const femaleData = [];
    // set maleData
    if (Session.get('maleData') && Session.get('maleData')[0].spend) {
      for (let i = 0; i < 6; i++ ) {
        maleData.push(Session.get('maleData')[i][action]);
      }
    }

    if (Session.get('femaleData') && Session.get('femaleData')[0].spend) {
      for (let i = 0; i < 6; i++ ) {
        femaleData.push(Session.get('femaleData')[i][action] * -1);
      }
    }

    // Age categories
    var categories = ['18-24', '25-34', '35-44', '45-54',
            '55-64', '65+'];

    return {

      chart: {
          type: 'bar'
      },
      title: {
          text: 'Age and Gender Chart'
      },
      subtitle: {
          text: 'For Initiative'
      },
      xAxis: [{
          categories: categories,
          reversed: false,
          labels: {
              step: 1
          }
      }, { // mirror axis on right side
          opposite: true,
          reversed: false,
          categories: categories,
          linkedTo: 0,
          labels: {
              step: 1
          }
      }],
      yAxis: {
          title: {
              text: action
          },
          labels: {

            }
      },

      plotOptions: {
          series: {
              stacking: 'normal'
          }
      },

      tooltip: {
          formatter: function () {
              return '<b>' + this.series.name + ', age ' + this.point.category + '</b><br/>' +
                  action+ " " + Highcharts.numberFormat(Math.abs(this.point.y), 0);
          }
      },

      series: [{
          name: 'Female',
          data: femaleData
      }, {
          name: 'Male',
          data: maleData
      }]
    }
  }
});

Template.charts.onDestroyed(func => {

});

function random() {
  return Math.floor((Math.random() * 500) + 1);
}
