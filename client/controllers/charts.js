var moment = require('moment');
var range = require('moment-range');
// import Chart from "chart.js"

let chart = Template.charts;
Tracker.autorun(function () {
  if (FlowRouter.subsReady('campaignInsightList') && FlowRouter.subsReady('Initiatives')) {
    console.log('Insights and Initiatives subs are now ready!');
  }
});


// chart.onRendered( function (){

//   const initiative = Initiatives.findOne(
//     {"campaign_ids": {$in: [FlowRouter.current().params.campaign_id]}
//   });
//   console.log("from onRendered:",initiative.name)
//     // Get data from collections
//   let labels = []; // this will be the date range
//   // let timeFormat = "MM-DD-YYYY";
//   // let days = moment(initiative.endDate, timeFormat).diff(moment(initiative.startDate, timeFormat), 'days');
//   // let avg = initiative.quantity / days;
//   // let data1 = [];
//   // let total = 0;
//   // for (let i = 0; i < days; i++) {
//   //   data1.push(total);
//   //   total = total + avg;
//   // }

//   var start = new Date(initiative.startDate);
//   var end   = new Date(initiative.endDate);
//   var dr    = moment.range(start, end);
//   var arrayOfDays = dr.toArray('days');
//   arrayOfDays.forEach(el => {
//     labels.push(moment(el).format("MM-DD"))
//   });
//   console.log(labels)

//   var options = { // options for the chart
//     ///Boolean - Whether grid lines are shown across the chart
//     scaleShowGridLines: true,
//     //String - Colour of the grid lines
//     scaleGridLineColor: "rgba(0,0,0,.05)",
//     //Number - Width of the grid lines
//     // scaleGridLineWidth: 1,
//     //Boolean - Whether to show horizontal lines (except X axis)
//     scaleShowHorizontalLines: true,
//     //Boolean - Whether to show vertical lines (except Y axis)
//     scaleShowVerticalLines: false,
//     //Boolean - Whether the line is curved between points
//     bezierCurve: false,
//     //Number - Tension of the bezier curve between points
//     bezierCurveTension: 0.4,
//     //Boolean - Whether to show a dot for each point
//     pointDot: true,
//     //Number - Radius of each point dot in pixels
//     pointDotRadius: 4,
//     //Number - Pixel width of point dot stroke
//     pointDotStrokeWidth: 1,
//     //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
//     pointHitDetectionRadius: 20,
//     //Boolean - Whether to show a stroke for datasets
//     datasetStroke: true,
//     //Number - Pixel width of dataset stroke
//     datasetStrokeWidth: 2,
//     //Boolean - Whether to fill the dataset with a colour
//     datasetFill: true,
//     //String - A legend template
//     // showXLabels: 10,
//     responsive: true,
//     // showScale: true
//     scaleOverride: true,
//     scaleSteps: 10,
//     scaleStepWidth: 48 * 3600000,
//     scaleStartValue: Date.parse(1451624400000),
//     // Boolean - If we want to override with a hard coded x scale
//     // xScaleOverride: true,
//      // ** Required if scaleOverride is true **
//      // Number - The number of steps in a hard coded x scale
//     // xScaleSteps:20,

//      // Number - The value jump in the hard coded x scale
//     // xScaleStepWidth: 48 * 3600000, // 24 is 1 day, 48 is two days

//      // Number - The x scale starting value
//     // xScaleStartValue: Date.parse(initiative.startDate)
//     // xScaleStartValue: Date.parse(1451624400000)
//   };

//   // Set the data
//   var data = {
//     // labels: labels,
//     labels: labels,
//     datasets: [{
//       label: "Evenly Distributed Output",
//       fillColor: "rgba(220,220,220,0)",
//       strokeColor: "rgba(236,13,13,1)",
//       pointColor: "rgba(220,220,220,1)",
//       pointStrokeColor: "#fff",
//       pointHighlightFill: "#fff",
//       pointHighlightStroke: "rgba(220,220,220,1)",
//       data: [random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),random(), random(), random(), random(), random()]
//     }, {
//       label: "Real Output",
//       fillColor: "rgba(151,187,205,0)",
//       strokeColor: "rgba(13,13,236,1)",
//       pointColor: "rgba(151,187,205,1)",
//       pointStrokeColor: "#fff",
//       pointHighlightFill: "#fff",
//       pointHighlightStroke: "rgba(151,187,205,1)",
//       data: [random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),random(),random(), random(), random(), random(), random()]
//     }]
//   };
//   console.log(Template.instance())
//   var ctx = document.getElementById("myChart").getContext("2d");
//   // draw the charts
//   var myLineChart = new Chart(ctx).Line(data, {
//     responsive: true,
//     scaleOverride: true,
//     scaleSteps: 10,
//     scaleStepWidth: 10,
//     scaleStartValue: 0
//   });

// });

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
        avgData.push(total);
        total = total + avg;
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
      // TODO -- maybe check out wrapAsync call on dashboards.js to use here
      // because the program is moving forward before getting the required data
      // for aggregating daily clicks, impressions, likes
      let actionToChart = [];
      let totes = 0;
      Meteor.call('aggregateForChart', initiative, function (err, res) {
        if (res) {
          console.log(res);
          for (let i = 0; i < res.length; i++) {
            actionToChart.push(totes);
            totes = totes + res[i].data.clicks;
          }
        }
      });
      console.log(actionToChart);

// build chart
    return {

      chart: {
        zoomType: 'x'
      },

      title: {
        text: "Delivery"
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
      }]
    }
  }
});

chart.onDestroyed(func => {

});

function random() {
  return Math.floor((Math.random() * 500) + 1);
}
