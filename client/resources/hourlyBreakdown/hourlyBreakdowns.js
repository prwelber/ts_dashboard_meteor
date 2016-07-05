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
});

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
        return true;
      }
    },
    'getHourlyBreakdown': function () {
      const campaignNumber = FlowRouter.current().params.campaign_id;

      if (HourlyBreakdowns.find({'data.campaign_id': campaignNumber}).count() > 1) {
        return HourlyBreakdowns.find({'data.campaign_id': campaignNumber}, {sort: {'data.hourly_stats_aggregated_by_audience_time_zone': 1}});
      }
    },
    'campaignInfo': function () {
      const data = Template.instance().templateDict.get('campData');
      if (data && data.data) {
        return data.data;
      }
    },
    hourlyPieChart: () => {
      const campaign = Template.instance().templateDict.get('camptData');
      return hourlyBreakdownsFunction.pieChart(campaign.data.campaign_id);
    }
});

Template.hourlyBreakdowns.onDestroyed(func => {
    $("#message-box li").remove();
});
