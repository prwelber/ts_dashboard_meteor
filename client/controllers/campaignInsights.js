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
            var target = document.getElementById("spinner-div");
            let spun = Blaze.render(Template.spin, target);
            console.log('gotta get insights for this one', campaignNumber);
            Meteor.call('getInsights', campaignNumber, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    Blaze.remove(spun);
                }
            });
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
        return FlowRouter.current().params.campaign_id;
    },
    'getAccountNumber': function () {
        let num = CampaignInsights.findOne({'data.campaign_id': FlowRouter.current().params.campaign_id});
        return num.data.account_id;
    },
    'showInitiative': function () {
        // return initiative
    }

});
