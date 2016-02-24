Meteor.subscribe('insightsBreakdownByDaysList')

Template.insightsBreakdownDaily.helpers({
    'getDailyBreakdown': function () {
        console.log('checking for daily breakdown');
        let campaignNumber = FlowRouter.current().params.campaign_id;
        let camp = CampaignInsights.findOne({'data.campaign_id': campaignNumber});
        if(InsightsBreakdownsByDays.findOne({campaign_name: camp.data.campaign_name})) {
            console.log('you should be seeing daily breakdown');
            let dailyBreakdown = InsightsBreakdownsByDays.find({campaign_mongo_reference: camp._id});
            return dailyBreakdown;
        } else {
            console.log('gotta get the daily breakdown for this one', campaignNumber);
            var target = document.getElementById("spinner-div");
            let spun = Blaze.render(Template.spin, target);
            Meteor.call('getDailyBreakdown', campaignNumber, camp.data.campaign_name, camp._id, function (err, result) {
                if (err) {
                    console.log(err);
                } else if (result) {
                    console.log('here is the result:', result)
                    Blaze.remove(spun);
                }
            });
        }
    },
    'campaignInfo': function () {
        return CampaignInsights.findOne({'data.campaign_id': FlowRouter.current().params.campaign_id}).data;
    }
});
