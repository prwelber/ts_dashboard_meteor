
Meteor.subscribe('campaignInsightList');

Template.campaignInsights.onRendered(function () {
    // console.log(this)
});

Template.campaignInsights.events({
    'getBreakdowns': function () {

    }
});

Template.campaignInsights.helpers({
    'fetchInsights': function () {
        console.log('checking for insights');
        let campaignNumber = FlowRouter.current().params.campaign_id;
        let camp = CampaignInsights.findOne({'data.campaign_id': campaignNumber});
        if (camp) {
            console.log('you should be seeing insights');
            // initiative = Initiatives.findOne({name: camp.campaign_name});
            return [camp.data];
        } else {
            console.log('gotta get insights for this one', campaignNumber);
            Meteor.call('getInsights', campaignNumber)
        }
    },
    // 'currencyFormat': function (number) {
    //     function roundToTwo(num) {
    //         return +(Math.round(num + "e+2")  + "e-2");
    //     }
    //     if (roundToTwo(number)) {
    //         return "$"+roundToTwo(number)
    //     } else {
    //         return "N/A"
    //     }
    // },
    'cleanText': function (text) {
        return text.replace("_", " ").toLowerCase();
    },
    'getCampaignNumber': function () {
        let campaignNumber = FlowRouter.current().params.campaign_id;
        let camp = CampaignInsights.findOne({campaign_id: campaignNumber})
        return camp.data.account_id;
    },
    'showInitiative': function () {
        // return initiative
    }

});
