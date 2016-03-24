var moment = require('moment');
var range = require('moment-range');
var Promise = require('bluebird');
// import Chart from "chart.js"

let chart = Template.charts;
Tracker.autorun(function () {
  if (FlowRouter.subsReady('campaignInsightList') && FlowRouter.subsReady('Initiatives')) {
    // console.log('Insights and Initiatives subs are now ready!');
  }
});


chart.onRendered( function (){

});

chart.events({

});

chart.helpers({
  'topGenresChart': function () {
      const initiative = Initiatives.findOne(
        {"campaign_ids": {$in: [FlowRouter.current().params.campaign_id]}
      });
      // for getting evenly distrubuted output
      let labels = []; // this will be the date range
      let timeFormat = "MM-DD-YYYY";
      let days = moment(initiative.endDate, timeFormat).diff(moment(initiative.startDate, timeFormat), 'days');
      let avg = Math.round(initiative.quantity / days);
      let avgData = []
      let total = 0;
      for (let i = 0; i < days; i++) {
        total = total + avg;
        avgData.push(total);
      }

      // for getting x axis labels
      var start = new Date(initiative.startDate);
      var end   = new Date(initiative.endDate);
      var dr    = moment.range(start, end);
      var arrayOfDays = dr.toArray('days');
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
        type = "likes";
      }
      let actionToChart = [];
      let spendChart = [];
      let spendTotal = 0;
      let totes = 0;

      // seeing if Bluebird will work for promises and meteor.call
      var call = Promise.promisify(Meteor.call);

      call('aggregateForChart', initiative).then(function (res) {
        Session.set('res', res);
        console.log("result from Promise!", res)
        totes = res[0].data[type]
      }).catch(function (err) {
        console.log('uh no error', err)
      });


      for (let i = 0; i < Session.get('res').length; i++) {
        totes = totes + parseInt(Session.get('res')[i].data[type]);
        spendTotal = spendTotal + parseFloat(accounting.unformat(Session.get('res')[i].data.spend).toFixed(2));
        actionToChart.push(totes);
        spendChart.push(spendTotal);
          }
      console.log(actionToChart);


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
        text: type.substr(0,1).toUpperCase() + type.substr(1, type.length) + " Delivery"
      },

      subtitle: {
        text: document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
      },

      tooltip: {
        valueSuffix: type
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

      plotOptions: {
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
        // data: [158, 224, 166, 43, 361, 332, 263, 65, 370, 452]
        data: actionToChart
      }, {
        name: 'Spend',
        data: spendChart
      }]
    }

  }
});

chart.onDestroyed(func => {

});

function random() {
  return Math.floor((Math.random() * 500) + 1);
}
