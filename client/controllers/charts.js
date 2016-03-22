// var range = require('moment-range');


Tracker.autorun(function () {
  if (FlowRouter.subsReady('campaignInsightList')) {
    console.log('campaignInsights subs ready!');
  }
  if (FlowRouter.subsReady('Initiatives')) {
    console.log('Initiatives subs ready!');
  }
});

let chart = Template.charts;

chart.onRendered( function (){
  let dailyBreakdown = InsightsBreakdownsByDays.find(
    {'data.campaign_id': FlowRouter.current().params.campaign_id}
  ).fetch();
  const initiative = Initiatives.findOne(
        {"campaign_names": {$in: [dailyBreakdown[0].data.campaign_name]}
        });
  var ctx  = document.getElementById("myChart").getContext("2d");

  // Set the options
  var options = {
    ///Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines: true,
    //String - Colour of the grid lines
    scaleGridLineColor: "rgba(0,0,0,.05)",
    //Number - Width of the grid lines
    // scaleGridLineWidth: 1,
    //Boolean - Whether to show horizontal lines (except X axis)
    scaleShowHorizontalLines: true,
    //Boolean - Whether to show vertical lines (except Y axis)
    scaleShowVerticalLines: false,
    //Boolean - Whether the line is curved between points
    bezierCurve: false,
    //Number - Tension of the bezier curve between points
    bezierCurveTension: 0.4,
    //Boolean - Whether to show a dot for each point
    pointDot: true,
    //Number - Radius of each point dot in pixels
    pointDotRadius: 4,
    //Number - Pixel width of point dot stroke
    pointDotStrokeWidth: 1,
    //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
    pointHitDetectionRadius: 20,
    //Boolean - Whether to show a stroke for datasets
    datasetStroke: true,
    //Number - Pixel width of dataset stroke
    datasetStrokeWidth: 2,
    //Boolean - Whether to fill the dataset with a colour
    datasetFill: true,
    //String - A legend template
    // showXLabels: 25,
    // scale: true,
    // scaleOverride: true,
    // scaleSteps: 10,
    // scaleStepWidth: 31,
    // scaleStartValue: 0,
    // Boolean - If we want to override with a hard coded x scale
    xScaleOverride: true,
     // ** Required if scaleOverride is true **
     // Number - The number of steps in a hard coded x scale
    xScaleSteps:30,

     // Number - The value jump in the hard coded x scale
    xScaleStepWidth: 48 * 3600000, // 24 is 1 day, 48 is two days

     // Number - The x scale starting value
    xScaleStartValue: Date.parse(initiative.startDate)
    // xScaleStartValue: 0
  };

  // Get data from collections
  let labels = []; // this will be the date range

  let timeFormat = "MM-DD-YYYY";
  let days = moment(initiative.endDate, timeFormat).diff(moment(initiative.startDate, timeFormat), 'days');

  // var start = new Date(initiative.startDate);
  // var end   = new Date(initiative.endDate);
  // var dr    = moment.range(start, end);
  // var arrayOfDays = dr.toArray('days');
  // arrayOfDays.forEach(el => {
  //   labels.push(moment(el).format("MM-DD"))
  // });

  let avg = initiative.quantity / days;
  let data1 = [];
  let total = 0;
  for (let i = 0; i < days; i++) {
    data1.push(total);
    total = total + avg;
  }
  // console.log('data1', data1)




  // Set the data
  var data = {
    // labels: labels,
    // labels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    datasets: [{
      label: "Evenly Distributed Output",
      fillColor: "rgba(220,220,220,0)",
      strokeColor: "rgba(236,13,13,1)",
      pointColor: "rgba(220,220,220,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(220,220,220,1)",
      data: [151,551,156,516,15,517,510,511,514,215,15,591,252,525,105]
    }, {
      label: "Real Output",
      fillColor: "rgba(151,187,205,0)",
      strokeColor: "rgba(13,13,236,1)",
      pointColor: "rgba(151,187,205,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(151,187,205,1)",
      data: [15,110,115,201,215,310,351,401,145,510,551,160,615,701,751]
    }]
  };

  // draw the charts
  var myLineChart = new Chart(ctx).Line(data, options);

});

chart.events({

});

chart.helpers({

});

chart.onDestroyed(func => {

});

function random() {
  return Math.floor((Math.random() * 100) + 1);
}
