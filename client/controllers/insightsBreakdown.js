if (Meteor.isClient) {

    Template.insightsBreakdown.helpers({
        'getBreakdown': function () {
            console.log('checking for breakdown');
            let campaignNumber = FlowRouter.current().params.campaign_id;
            let camp = CampaignInsightList.findOne({campaign_id: campaignNumber});
            if (camp) {
                console.log('you should be seeing breakdown');
                let name = camp.campaign_name;
                let camp_id = camp._id
                // initiative = NewInitiativeList.findOne({name: name});
                // return CampaignInsightList.find({campaign_id: campaignNumber})
            } else {
                console.log('gotta get the breakdown for this one', campaignNumber);
                Meteor.call('getBreakdown', campaignNumber, name, camp_id)
            }
        }
    })









}
