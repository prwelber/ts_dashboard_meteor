var Promise = require('bluebird');

Tracker.autorun(function () {
    if (FlowRouter.subsReady('hourlyBreakdownsList')) {
        console.log('hourlyBreakdownsList subs ready!');
    }
});

Template.hourlyBreakdowns.onCreated(function () {
  this.templateDict = new ReactiveDict();
  const camp = CampaignInsights.findOne({'data.campaign_id': FlowRouter.current().params.campaign_id});
  this.templateDict.set('campData', camp.data);
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
          console.log("result from promise", result)
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
        return Template.instance().templateDict.get('campData');
    }
});

Template.hourlyBreakdowns.onDestroyed(func => {
    $("#message-box li").remove();
});
