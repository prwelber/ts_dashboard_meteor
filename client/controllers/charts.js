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
  var ctx  = document.getElementById("myChart").getContext("2d");

  // Set the options
  var options = {
    ///Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines: true,
    //String - Colour of the grid lines
    scaleGridLineColor: "rgba(0,0,0,.05)",
    //Number - Width of the grid lines
    scaleGridLineWidth: 1,
    //Boolean - Whether to show horizontal lines (except X axis)
    scaleShowHorizontalLines: true,
    //Boolean - Whether to show vertical lines (except Y axis)
    scaleShowVerticalLines: true,
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
    // legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
  };

  // Get data from collections
  let dailyBreakdown = InsightsBreakdownsByDays.find({'data.campaign_id': FlowRouter.current().params.campaign_id}).fetch();
  let labels = [];
  dailyBreakdown.forEach(el => {
    labels.push(moment(el.data.date_start, "MM-DD").format("MM-DD"));
  });






  // Set the data
  var data = {
    labels: labels,
    datasets: [{
      label: "Evenly Distributed Output",
      fillColor: "rgba(220,220,220,0)",
      strokeColor: "rgba(220,220,220,1)",
      pointColor: "rgba(220,220,220,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(220,220,220,1)",
      data: [random(), random(), random(), random(), random(), random(), random()]
    }, {
      label: "Real Output",
      fillColor: "rgba(151,187,205,0)",
      strokeColor: "rgba(151,187,205,1)",
      pointColor: "rgba(151,187,205,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(151,187,205,1)",
      data: [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75]
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
