

Template.hourlyBreakdowns.helpers({
    'getHourlyBreakdown': function () {
        console.log('checking for hourly breakdown');
        let campaignNumber = FlowRouter.current().params.campaign_id;
        let camp = CampaignInsights.findOne({'data.campaign_id': campaignNumber});
        if (HourlyBreakdowns.findOne({'data.campaign_name': camp.data.campaign_name})) {
            console.log('you should be seeing hourly breakdown');
            let name = camp.data.campaign_name;
            // initiative = NewInitiativeList.findOne({name: name});
            let breakdown = HourlyBreakdowns.find({'data.campaign_mongo_reference': camp._id}, {sort: {'data.hourly_stats_aggregated_by_audience_time_zone': 1}});
            //return array so that #each works in template
            return breakdown;
        } else {
            var target = document.getElementById("spinner-div");
            let spun = Blaze.render(Template.spin, target);
            console.log('gotta get the hourly breakdown for this one', campaignNumber);
            Meteor.call('getHourlyBreakdown', campaignNumber, camp.data.campaign_name, camp._id, function (err, result) {
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
