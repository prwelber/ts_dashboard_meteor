// Meteor.subscribe('insightsBreakdownByDaysList')

Tracker.autorun(function () {
    if (FlowRouter.subsReady('insightsBreakdownByDaysList')) {
        console.log('insightsBreakdownByDays subs ready!');
    }
});

Template.insightsBreakdownDaily.helpers({
    'getDailyBreakdown': function () {
        let campaignNumber = FlowRouter.current().params.campaign_id;
        // let camp = CampaignInsights.findOne({'data.campaign_id': campaignNumber});
        let dailyBreakdown = InsightsBreakdownsByDays.findOne({'data.campaign_id': campaignNumber});
        if(dailyBreakdown) {
            if (dailyBreakdown.data.inserted > dailyBreakdown.data.date_stop) {
                addToBox("This dailyBreakdown has been updated after it ended, no need to refresh.");
            } else {
                addToBox("last refresh: "+dailyBreakdown.data.inserted+", refreshing will give you live stats");
            }

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
