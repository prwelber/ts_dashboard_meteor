Meteor.subscribe('insightsBreakdownByDaysList')

Template.insightsBreakdownDaily.helpers({
    'getDailyBreakdown': function () {
        console.log('checking for daily breakdown');
        let campaignNumber = FlowRouter.current().params.campaign_id;
        let camp = CampaignInsights.findOne({campaign_id: campaignNumber});
        if(InsightsBreakdownsByDays.findOne({campaign_name: camp.campaign_name})) {
            console.log('you should be seeing daily breakdown');
            let dailyBreakdown = InsightsBreakdownsByDays.find({campaign_mongo_reference: camp._id});
            return dailyBreakdown;
        } else {
            console.log('gotta get the daily breakdown for this one', campaignNumber);
            Meteor.call('getDailyBreakdown', campaignNumber, camp.campaign_name, camp._id);
        }
    },
    'campaignInfo': function () {
        return CampaignInsights.findOne({campaign_id: FlowRouter.current().params.campaign_id});
    }
});
