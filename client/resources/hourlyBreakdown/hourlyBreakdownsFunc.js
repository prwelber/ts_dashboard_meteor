import HourlyBreakdowns from '/collections/HourlyBreakdowns';
import { Meteor } from 'meteor/meteor'

export const hourlyBreakdownsFunction = {

  lineChart: (data) => {

    const impressionsArray = data.map(hour => {
      return hour.data.impressions;
    });

    const clicksArray = data.map(hour => {
      return hour.data.clicks;
    });

    const videoViewsArr = data.map(hour => {
      return hour.data.video_view;
    });

    const postEngArr = data.map(hour => {
      return hour.data.post_engagement;
    });

    const ctr = data.map(hour => {
      return hour.data.ctr;
    });

    const postLike = data.map(hour => {
      return hour.data.post_like;
    });







    return {
      chart: {
        zoomType: 'x'
      },
      // TODO FIX THIS
      title: {
        text: 'Hourly Breakdown Aggregated by Audience Time Zone',
      },

      subtitle: {
        text: document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
      },

      tooltip: {
        // valueSuffix: " " + type,
        shared: true,
        crosshairs: true
      },
      xAxis: {
        // type: 'datetime',
        categories: ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm', '12pm']
      },

      yAxis: {
        title: {
          // text: type
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
        name: 'Impressions',
        data: impressionsArray,
        color: '#90caf9'
      }, {
        name: 'Clicks',
        data: clicksArray,
        color: '#0d47a1'
      }, {
        name: 'Video Views',
        data: videoViewsArr,
        color: '#b71c1c',
      }, {
        name: 'Post Engagement',
        data: postEngArr,
        color: '#ef9a9a',
        // tooltip: {
        //   valueSuffix: ' USD',
        //   valuePrefix: '$'
        // }
      }, {
        name: 'CTR',
        data: ctr,
        color: '#8142A1'
      }, {
        name: 'Post Like',
        data: postLike,
        color: '#52d46a'
      }]
    } // end of return
  }


};
