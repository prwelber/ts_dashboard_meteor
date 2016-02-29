Template.endingSoon.helpers({
    'getEndingSoonCampaigns': function () {
        if (Meteor.userId()) {
            return CampaignBasics.find({},
                {
                    sort: {sort_time_stop: -1},
                    fields: {"name": 1, "start_time": 1, "stop_time": 1, "objective": 1, "campaign_id": 1},
                    limit: 5
                }).fetch();
        }
    }
});


