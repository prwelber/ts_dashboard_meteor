Meteor.subscribe('insightsBreakdownList');

Template.insightsBreakdown.helpers({
    'getBreakdown': function () {
        console.log('checking for breakdown');
        let campaignNumber = FlowRouter.current().params.campaign_id;
        let camp = CampaignInsights.findOne({campaign_id: campaignNumber});
        if (InsightsBreakdowns.findOne({campaign_name: camp.campaign_name})) {
            console.log('you should be seeing breakdown');
            let name = camp.campaign_name;
            let camp_id = camp._id
            // initiative = NewInitiativeList.findOne({name: name});
            let breakdown = InsightsBreakdowns.find({campaign_mongo_reference: camp._id});
            return breakdown
        } else {
            console.log('gotta get the breakdown for this one', campaignNumber);
            Meteor.call('getBreakdown', campaignNumber, camp.campaign_name, camp._id)
        }
    },
    'campaignInfo': function () {
        return CampaignInsights.findOne({campaign_id: FlowRouter.current().params.campaign_id});
    }
});


