var moment = require('moment');
var range = require('moment-range');
var Promise = require('bluebird');
// import Chart from "chart.js"

Tracker.autorun(function () {
  if (FlowRouter.subsReady('campaignInsightList') && FlowRouter.subsReady('Initiatives')) {
    // console.log('Insights and Initiatives subs are now ready!');
  }
});


Template.charts.onCreated( function () {
  this.templateDict = new ReactiveDict();
  // console.log(this) // this is the same as Template.instance()
  // console.log(Template.instance())
  const initiative = Initiatives.findOne(
    {"campaign_ids": {$in: [FlowRouter.current().params.campaign_id]}
  });
  this.templateDict.set( 'initiative', initiative );
})

Template.charts.onRendered( function (){

});

Template.charts.events({

});

Template.charts.helpers({
  'deliveryChart': function () {
      const initiative = Template.instance().templateDict.get('initiative');
      // for getting evenly distrubuted output
      let labels          = [], // this will be the date range
          timeFormat      = "MM-DD-YYYY",
          days            = moment(initiative.endDate, timeFormat).diff(moment(initiative.startDate, timeFormat), 'days'),
          avg             = Math.round(initiative.quantity / days),
          spendAvg        = parseFloat(initiative.budget) / days,
          avgData         = [],
          idealSpend      = [],
          idealSpendTotal = 0,
          total           = 0;

      for (let i = 0; i < days; i++) {
        total = total + avg;
        idealSpendTotal = idealSpendTotal + spendAvg;
        avgData.push(total);
        idealSpend.push(idealSpendTotal);
      }

      // for getting x axis labels
      var start       = new Date(initiative.startDate),
          end         = new Date(initiative.endDate),
          dr          = moment.range(start, end),
          arrayOfDays = dr.toArray('days');
      
      arrayOfDays.forEach(el => {
        labels.push(moment(el).format("MM-DD"))
      });

      //for setting dealType
      let type;
      if (initiative.dealType === "CPM") {
        type = "impressions";
      } else if (initiative.dealType === "CPC") {
        type = "clicks";
      } else if (initiative.dealType === "CPL") {
        type = "like";
      }

      let actionToChart = [],
          spendChart    = [],
          spendTotal    = 0,
          totes         = 0; // Template.instance().templateDict.get('data')[0].type;
      
      // seeing if Bluebird will work for promises and meteor.call
      var call = Promise.promisify(Meteor.call);

      call('aggregateForChart', initiative)
      .then(function (res) {
        Session.set('res', res);
        totes = res[0][type]
      }).catch(function (err) {
        console.log('uh no error', err)
      });

      Session.get('res').forEach(el => {
        totes += parseInt(el[type]);
        spendTotal += parseFloat(accounting.unformat(el.spend).toFixed(2));
        actionToChart.push(totes);
        spendChart.push(spendTotal);
      });
      
      //  // this works. not sure why...
      // let asyncCall = function asyncCall (methodName, init, callback) {
      //   Meteor.call(methodName, init, function (err, res) {
      //     if (err) {
      //       throw new Meteor.Error('This is a Meteor Error!');
      //     } else {
      //       callback && callback(null, console.log("res:", res));
      //     }
      //   });
      // }

      // Meteor.call('aggregateForChart', initiative, function (err, res) {
      //   if (res) {
      //     console.log(res);
      //     Session.set("res", res);
      //   }
      // });
      // console.log("res:", Session.get("res"));

      // build chart
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
        valueSuffix: type,
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
        data: avgData
      }, {
        name: 'Real Distribution',
        data: actionToChart
      }, {
        name: 'Spend',
        data: spendChart
      }, {
        name: 'Ideal Spend',
        data: idealSpend
      }]
    }

  },
  'costPerChart': function () {
    const initiative = Template.instance().templateDict.get('initiative');

    // for getting x axis labels
    let labels      = [],
        start       = new Date(initiative.startDate),
        end         = new Date(initiative.endDate);
        dr          = moment.range(start, end),
        arrayOfDays = dr.toArray('days');

    arrayOfDays.forEach(el => {
      labels.push(moment(el).format("MM-DD"))
    });

    //for setting dealType
    let type;
    if (initiative.dealType === "CPM") {
      type = "impressions";
    } else if (initiative.dealType === "CPC") {
      type = "clicks";
    } else if (initiative.dealType === "CPL") {
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
    var start = new Date(initiative.startDate);
    var end   = new Date(initiative.endDate);
    var dr    = moment.range(start, end);
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
        if (initiative.dealType === "CPM") {
          actionArray.push(el.impressions);
          costPerArray.push(el.cpm);
          type = "impressions";
          costType = "CPM";
        } else if (initiative.dealType === "CPC") {
          actionArray.push(el.clicks);
          costPerArray.push(el.cpc);
          type = "clicks";
          costType = "CPC";
        } else if (initiative.dealType === "CPL") {
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
    const initiative = Template.instance().templateDict.get('initiative');

    var call = Promise.promisify(Meteor.call);

    call('pieChart', initiative)
    .then(function (resultData) {
      Session.set('resultData', resultData);
      console.log(resultData);
    }).catch(function (err) {
      console.log('boooo error', err)
    });




    // return {
    //   chart: {
    //         type: 'pie'
    //     },
    //     title: {
    //         text: 'Hourly Breakdown With Drilldown'
    //     },
    //     subtitle: {
    //         text: 'Click the slices to view details.'
    //     },
    //     plotOptions: {
    //         series: {
    //             dataLabels: {
    //                 enabled: true,
    //                 format: '{point.name}: {point.y:.1f}%'
    //             }
    //         }
    //     },

    //     tooltip: {
    //         headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
    //         pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
    //     },
    //     series: [{
    //         name: 'Brands',
    //         colorByPoint: true,
    //         data: [{
    //             name: 'Microsoft Internet Explorer',
    //             y: 56.33,
    //             drilldown: 'Microsoft Internet Explorer'
    //         }, {
    //             name: 'Chrome',
    //             y: 24.03,
    //             drilldown: 'Chrome'
    //         }, {
    //             name: 'Firefox',
    //             y: 10.38,
    //             drilldown: 'Firefox'
    //         }, {
    //             name: 'Safari',
    //             y: 4.77,
    //             drilldown: 'Safari'
    //         }, {
    //             name: 'Opera',
    //             y: 0.91,
    //             drilldown: 'Opera'
    //         }, {
    //             name: 'Proprietary or Undetectable',
    //             y: 0.2,
    //             drilldown: null
    //         }]
    //     }],
    //     drilldown: {
    //         series: [{
    //             name: 'Microsoft Internet Explorer',
    //             id: 'Microsoft Internet Explorer',
    //             data: [
    //                 ['v11.0', 24.13],
    //                 ['v8.0', 17.2],
    //                 ['v9.0', 8.11],
    //                 ['v10.0', 5.33],
    //                 ['v6.0', 1.06],
    //                 ['v7.0', 0.5]
    //             ]
    //         }, {
    //             name: 'Chrome',
    //             id: 'Chrome',
    //             data: [
    //                 ['v40.0', 5],
    //                 ['v41.0', 4.32],
    //                 ['v42.0', 3.68],
    //                 ['v39.0', 2.96],
    //                 ['v36.0', 2.53],
    //                 ['v43.0', 1.45],
    //                 ['v31.0', 1.24],
    //                 ['v35.0', 0.85],
    //                 ['v38.0', 0.6],
    //                 ['v32.0', 0.55],
    //                 ['v37.0', 0.38],
    //                 ['v33.0', 0.19],
    //                 ['v34.0', 0.14],
    //                 ['v30.0', 0.14]
    //             ]
    //         }, {
    //             name: 'Firefox',
    //             id: 'Firefox',
    //             data: [
    //                 ['v35', 2.76],
    //                 ['v36', 2.32],
    //                 ['v37', 2.31],
    //                 ['v34', 1.27],
    //                 ['v38', 1.02],
    //                 ['v31', 0.33],
    //                 ['v33', 0.22],
    //                 ['v32', 0.15]
    //             ]
    //         }, {
    //             name: 'Safari',
    //             id: 'Safari',
    //             data: [
    //                 ['v8.0', 2.56],
    //                 ['v7.1', 0.77],
    //                 ['v5.1', 0.42],
    //                 ['v5.0', 0.3],
    //                 ['v6.1', 0.29],
    //                 ['v7.0', 0.26],
    //                 ['v6.2', 0.17]
    //             ]
    //         }, {
    //             name: 'Opera',
    //             id: 'Opera',
    //             data: [
    //                 ['v12.x', 0.34],
    //                 ['v28', 0.24],
    //                 ['v27', 0.17],
    //                 ['v29', 0.16]
    //             ]
    //         }]
    //     }
    // }
  }
});

Template.charts.onDestroyed(func => {

});

function random() {
  return Math.floor((Math.random() * 500) + 1);
}
