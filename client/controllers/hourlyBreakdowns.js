
Tracker.autorun(function () {
    if (FlowRouter.subsReady('hourlyBreakdownsList')) {
        console.log('hourlyBreakdownsList subs ready!');
    }
});

Template.hourlyBreakdowns.helpers({
    'getHourlyBreakdown': function () {
        console.log('checking for hourly breakdown');
        let campaignNumber = FlowRouter.current().params.campaign_id;
        let hourlyBreakdown = HourlyBreakdowns.findOne({'data.campaign_id': campaignNumber});
        if (hourlyBreakdown) {
            if (hourlyBreakdown.data.inserted > hourlyBreakdown.data.date_stop) {
                addToBox("This hourlyBreakdown has been updated after it ended, no need to refresh.");
            } else {
                addToBox("last refresh: "+dailyBreakdown.data.inserted+", refreshing will give you live stats");
            }
            // initiative = NewInitiativeList.findOne({name: name});
            return HourlyBreakdowns.find({'data.campaign_id': campaignNumber}, {sort: {'data.hourly_stats_aggregated_by_audience_time_zone': 1}});
            //return array so that #each works in template
        } else {
            var target = document.getElementById("spinner-div");
            let spun = Blaze.render(Template.spin, target);
            console.log('gotta get the hourly breakdown for this one', campaignNumber);
            Meteor.call('getHourlyBreakdown', campaignNumber, Session.get("campaign_name"), Session.get("end_date"), function (err, result) {
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

Template.hourlyBreakdowns.onDestroyed(func => {
    $("#message-box li").remove();
});
