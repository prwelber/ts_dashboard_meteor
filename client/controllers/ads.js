Meteor.subscribe('AdsList');

Template.ads.helpers({
    'getAds': function () {
        console.log('checking for ads');
        let campaignNumber = FlowRouter.current().params.campaign_id;
        let ad = Ads.findOne({campaign_id: campaignNumber});
        let camp = CampaignInsights.findOne({'data.campaign_id': campaignNumber});
        if (ad) {
            console.log('you should be seeing ads');
            return Ads.find({campaign_id: campaignNumber});
        } else {
            console.log('gotta get ads for this one');
            Meteor.call('getAds', campaignNumber, camp._id, camp.data.campaign_name);
        }
    },
    'getCampaignNumber': function () {
        let campaignNumber = FlowRouter.current().params.campaign_id;
        return campaignNumber;
    }
});
