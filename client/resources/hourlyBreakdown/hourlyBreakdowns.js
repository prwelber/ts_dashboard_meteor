import CampaignInsights from '/collections/CampaignInsights';
import HourlyBreakdowns from '/collections/HourlyBreakdowns';
import { hourlyBreakdownsFunction } from './hourlyBreakdownsFunc';
import { Meteor } from 'meteor/meteor'
var Promise = require('bluebird');

// Tracker.autorun(function () {
//     if (FlowRouter.subsReady('hourlyBreakdownsList')) {
//         console.log('hourlyBreakdownsList subs ready!');
//     }
// });

Template.hourlyBreakdowns.onCreated(function () {
  this.templateDict = new ReactiveDict();
  const camp = CampaignInsights.findOne({'data.campaign_id': FlowRouter.getParam('campaign_id')});
  this.templateDict.set('campData', camp);
  this.templateDict.set('hours', null);
});

Template.hourlyBreakdowns.onRendered(function () {
  $('.carousel.carousel-slider').carousel({full_width: true});
})

Template.hourlyBreakdowns.helpers({
    isReady: function (sub) {

      const campaignNumber = FlowRouter.current().params.campaign_id;

      if (FlowRouter.subsReady(sub) && HourlyBreakdowns.find({'data.campaign_id': campaignNumber}).count() === 0) {

        var target = document.getElementById("spinner-div");
        let spun = Blaze.render(Template.spin, target);

        var call = Promise.promisify(Meteor.call);
        call('getHourlyBreakdown', campaignNumber)
        .then(function (result) {
          Blaze.remove(spun);
        }).catch(function (err) {
          console.log('uh no error', err)
        });
      } else {
        const campaignNumber = FlowRouter.current().params.campaign_id;
        const hours = HourlyBreakdowns.find({'data.campaign_id': campaignNumber}, {sort: {'data.hourly_stats_aggregated_by_audience_time_zone': 1}}).fetch();
        Template.instance().templateDict.set('hours', hours);
        return true;
      }
    },
    'clicksChart': () => {
      const hours = Template.instance().templateDict.get('hours');
      return hourlyBreakdownsFunction.lineChart(hours, 'impressions', 'Impressions', '#f44336');
    },
    impressionsChart: () => {
      const hours = Template.instance().templateDict.get('hours');
      return hourlyBreakdownsFunction.lineChart(hours, 'clicks', 'Click', '#3f51b5');
    },
    videoViewChart: () => {
      const hours = Template.instance().templateDict.get('hours');
      return hourlyBreakdownsFunction.lineChart(hours, 'video_view', 'Video View', '#009688');
    },
    postEngagementChart: () => {
      const hours = Template.instance().templateDict.get('hours');
      return hourlyBreakdownsFunction.lineChart(hours, 'post_engagement', 'Post Engagement', '#4caf50');
    },
    ctrChart: () => {
      const hours = Template.instance().templateDict.get('hours');
      return hourlyBreakdownsFunction.lineChart(hours, 'ctr', 'CTR', '#ef6c00');
    },
    postLikeChart: () => {
      const hours = Template.instance().templateDict.get('hours');
      return hourlyBreakdownsFunction.lineChart(hours, 'post_like', 'Post Like', '#795548');
    },
    'campaignInfo': function () {
      const data = Template.instance().templateDict.get('campData');
      if (data && data.data) {
        return data.data;
      }
    },
    updated: () => {
      try {
        return Template.instance().templateDict.get('hours')[0].data.inserted;
      } catch (e) {
        console.log(e);
      }
    }
});


Template.hourlyBreakdowns.events({
  'click #refresh-hourly': (event, instance) => {
    Meteor.call('refreshHourly', FlowRouter.getParam('campaign_id'));
    $('.tooltipped').tooltip('remove');
  }
});

Template.hourlyBreakdowns.onDestroyed(func => {
});
