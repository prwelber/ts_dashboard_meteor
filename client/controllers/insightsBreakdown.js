import { Meteor } from 'meteor/meteor'
import { FlowRouter } from 'meteor/kadira:flow-router'
import Promise from 'bluebird'

import CampaignInsights from '/collections/CampaignInsights'
import InsightsBreakdowns from '/collections/InsightsBreakdowns'

Tracker.autorun(function () {
    if (FlowRouter.subsReady('insightsBreakdownList')) {
        console.log("insightsBreakdownList subs ready!");
    }
});

Template.insightsBreakdown.helpers({
    isReady: (sub) => {
        const campaignNumber = FlowRouter.getParam("campaign_id");

        if (FlowRouter.subsReady(sub) && InsightsBreakdowns.find({'data.campaign_id': campaignNumber}).count() === 0) {

            var target = document.getElementById("spinner-div");
            let spun = Blaze.render(Template.spin, target);

            var call = Promise.promisify(Meteor.call);
              call('getBreakdown', campaignNumber)
              .then(function (result) {
                console.log("result from promise", result)
                Blaze.remove(spun);
              }).catch(function (err) {
                console.log('uh no error', err)
              });
        } else {
            console.log('returning true in isReady')
          return true;
        }
    },
    'getBreakdown': function () {
        console.log('getBreakdown running');
        const campaignNumber = FlowRouter.getParam("campaign_id")
        let breakdown = InsightsBreakdowns.findOne({'data.campaign_id': campaignNumber});

        if (breakdown) {
            return InsightsBreakdowns.find({'data.campaign_id': campaignNumber}, {sort: {'data.age': 1}});
        }
    },
    'campaignInfo': function () {
        return CampaignInsights.findOne({'data.campaign_id': FlowRouter.current().params.campaign_id}).data;
    }
});


Template.insightsBreakdown.onDestroyed(function () {
    $("#message-box li").remove();
})
