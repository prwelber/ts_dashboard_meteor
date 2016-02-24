Meteor.subscribe('insightsBreakdownList');

Template.insightsBreakdown.helpers({
    'getBreakdown': function () {
        console.log('checking for breakdown');
        let campaignNumber = FlowRouter.current().params.campaign_id;
        let camp = CampaignInsights.findOne({'data.campaign_id': campaignNumber});
        if (InsightsBreakdowns.findOne({campaign_name: camp.data.campaign_name})) {
            console.log('you should be seeing breakdown');
            let name = camp.data.campaign_name;
            let camp_id = camp._id
            // initiative = NewInitiativeList.findOne({name: name});
            let breakdown = InsightsBreakdowns.find({campaign_mongo_reference: camp._id});
            return breakdown
        } else {
            var target = document.getElementById("spinner-div");
            let spun = Blaze.render(Template.spin, target);
            console.log('gotta get the breakdown for this one', campaignNumber);
            Meteor.call('getBreakdown', campaignNumber, camp.data.campaign_name, camp._id, function (err, result) {
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


