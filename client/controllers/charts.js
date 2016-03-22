let chart = Template.charts;

let deliveryChart = function deliveryChart () {

  $("delivery-chart-container").hightcharts({

    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false
    },

    title: {
      text: "Delivery Chart",
      x: -20 // center
    },

    xAxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },

    yAxis: {
      title: {
        text: 'Temp (C)'
      },
      plotLines: [{
        value: 0,
        width: 1,
        color: '#808080'
      }]
    },

    tooltip: {
      valueSuffix: "test tooltip"
    },

    legend: {
      layout: 'vertical',
      alignt: 'right',
      verticalAlign: 'middle',
      borderWidth: 0
    },

    series: [{

      name: 'New York',
      data: [
        7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6
      ]

    }]

  })

}

chart.onRendered(func => {
  deliveryChart();
});

chart.events({

});

chart.helpers({

});

chart.onDestroyed(func => {

});
