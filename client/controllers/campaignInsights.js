if (Meteor.isClient){

    Template.campaignInsights.onRendered(function () {
        // console.log(this)
    });

    Template.campaignInsights.helpers({
        'fetchInsights': function () {
            console.log('checking for insights');
            let campaignNumber = FlowRouter.current().params.campaign_id;
            if (CampaignInsightList.findOne()) {
                console.log('you should be seeing insights')
                CampaignInsightList.find({})
            } else {
                console.log('gotta get insights for this one', campaignNumber);
                Meteor.call('getInsights', campaignNumber)
            }
        }
    });


}
