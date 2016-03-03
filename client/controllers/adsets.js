Meteor.subscribe('AdSetsList');

Template.adsets.helpers({
    'getAdSets': function () {
        console.log('checking for adSets');
        let campaignNumber = FlowRouter.current().params.campaign_id;
        let adSet = AdSets.findOne({'data.campaign_id': campaignNumber});
        let camp = CampaignInsights.findOne({'data.campaign_id': campaignNumber});
        if (adSet) {
            console.log('you should be seeing adSets');
            return AdSets.find({'data.campaign_id': campaignNumber})
        } else {
            var target = document.getElementById("spinner-div");
            let spun = Blaze.render(Template.spin, target);
            console.log('gotta get adSets for this one', campaignNumber);
            Meteor.call('getAdSets', campaignNumber, camp._id, camp.data.campaign_name, function (error, result) {
                if (error) {
                    console.log(error);
                } else {
                    Blaze.remove(spun);
                }
            });
        }
    },
    'getCampaignNumber': function () {
        let campaignNumber = FlowRouter.current().params.campaign_id;
        return campaignNumber;
    }
});
