Tracker.autorun(function () {
    if (FlowRouter.subsReady('AdSetsList')) {
        console.log('AdSetsList subs ready!');
    }
});

Template.adsets.helpers({
    'getAdSets': function () {
        console.log('checking for adSets');
        let campaignNumber = FlowRouter.current().params.campaign_id;
        let adSet = AdSets.findOne({'data.campaign_id': campaignNumber});
        // let camp = CampaignInsights.findOne({'data.campaign_id': campaignNumber});
        if (adSet) {
            // if (adSet.data.inserted > adSet.data.end_time) {
            //     mastFunc.addToBox("This AdSet has been updated after it ended, no need to refresh.");
            // } else {
            //     mastFunc.addToBox("last AdSet refresh: "+adSet.data.inserted+", refreshing will give you live stats");
            // }
            return AdSets.find({'data.campaign_id': campaignNumber})
        } else {
            var target = document.getElementById("spinner-div");
            let spun = Blaze.render(Template.spin, target);
            console.log('gotta get adSets for this one', campaignNumber);
            Meteor.call('getAdSets', campaignNumber, Session.get("campaign_name"), function (error, result) {
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

Template.adsets.onDestroyed(func => {
    $("#message-box li").remove();
});
