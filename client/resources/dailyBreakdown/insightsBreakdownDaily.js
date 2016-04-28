import CampaignInsights from '/collections/CampaignInsights'
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays'
import Promise from 'bluebird'
import { Meteor } from 'meteor/meteor'

Tracker.autorun(function () {
  if (FlowRouter.subsReady('insightsBreakdownByDaysList')) {
    console.log('insightsBreakdownByDays subs ready!');
  }
});

Template.insightsBreakdownDaily.helpers({
  isReady: (sub1, sub2) => {
    if ((FlowRouter.subsReady(sub1) && FlowRouter.subsReady(sub2)) && InsightsBreakdownsByDays.find().count() === 0)
    {
      var target = document.getElementById("spinner-div");
      let spun = Blaze.render(Template.spin, target);
      const campaignNumber = FlowRouter.getParam('campaign_id');
      var call = Promise.promisify(Meteor.call);
        call('getDailyBreakdown', campaignNumber)
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
  'getDailyBreakdown': function () {
      const campaignNumber = FlowRouter.getParam('campaign_id');
      let dailyBreakdown = InsightsBreakdownsByDays.findOne({'data.campaign_id': campaignNumber});
      if(dailyBreakdown) {
        return InsightsBreakdownsByDays.find({'data.campaign_id': campaignNumber}, {sort: {'data.date_start': -1}});
      } else {
          console.log('gotta get the daily breakdown for this one', campaignNumber);
          var target = document.getElementById("spinner-div");
          let spun = Blaze.render(Template.spin, target);
          Meteor.call('getDailyBreakdown', campaignNumber, Session.get("campaign_name"), Session.get("end_date"), function (err, result) {
            if (err) {
              console.log(err);
            } else if (result) {
              Blaze.remove(spun);
            }
          });
      }
  },
  'campaignInfo': function () {
      return CampaignInsights.findOne({'data.campaign_id': FlowRouter.current().params.campaign_id}).data;
  }
});

Template.insightsBreakdownDaily.onDestroyed(func => {
    $("#message-box li").remove();
})
