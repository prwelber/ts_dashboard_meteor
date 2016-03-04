// Meteor.subscribe('insightsBreakdownList');

Tracker.autorun(function () {
    if (FlowRouter.subsReady('insightsBreakdownList')) {
        console.log("insightsBreakdownList subs ready!");
    }
});

Template.insightsBreakdown.helpers({
    'getBreakdown': function () {
        console.log('checking for breakdown');
        let campaignNumber = FlowRouter.current().params.campaign_id;

        let breakdown = InsightsBreakdowns.findOne({'data.campaign_id': campaignNumber});
        console.log('breakdown', breakdown)
        if (breakdown) {
            if (moment(breakdown.data.inserted, "MM-DD-YYYY hh:mm a").isAfter(moment(breakdown.data.date_stop, "MM-DD-YYYY hh:mm a"))) {
                mastFunc.addToBox("This InsightBreakdown has been updated after it ended, no need to refresh.");
            } else {
                mastFunc.addToBox("last refresh: "+breakdown.data.inserted+", refreshing will give you live stats");
            }
            console.log('you should be seeing breakdown');
            // initiative = NewInitiativeList.findOne({name: name});
            return InsightsBreakdowns.find({'data.campaign_id': campaignNumber}, {sort: {'data.age': 1}});
            //return array so that #each works in template
        } else {
            var target = document.getElementById("spinner-div");
            let spun = Blaze.render(Template.spin, target);
            console.log('gotta get the breakdown for this one', campaignNumber);
            Meteor.call('getBreakdown', campaignNumber, Session.get("campaign_name"), Session.get("end_date"), function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    Blaze.remove(spun);
                }

            });
        }
    },
    'campaignInfo': function () {
        return CampaignInsights.findOne({'data.campaign_id': FlowRouter.current().params.campaign_id}).data;
    }
});


Template.insightsBreakdown.onDestroyed(function () {
    $("#message-box li").remove();
})
