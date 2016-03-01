Meteor.subscribe('campaignInsightList');

Template.campaignInsights.onRendered(function () {
    // console.log(this)
});

Template.campaignInsights.events({
    'click .report-button': function () {
        console.log('clicked')
        let node = document.getElementsByClassName("reporting-div")[0];
        reporter = Blaze.render(Template.reporter, node);
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
    'cleanText': function (text) {
        return text.replace("_", " ").toLowerCase();
    },
    'getCampaignNumber': function () {
        return FlowRouter.current().params.campaign_id;
    },
    'getAccountNumber': function () {
        try {
           let num = CampaignInsights.findOne({'data.campaign_id': FlowRouter.current().params.campaign_id});
            return num.data.account_id;
        } catch(e) {
            console.log(e);
        }
    },
    'showInitiative': function () {
        // return initiative
    }

});
