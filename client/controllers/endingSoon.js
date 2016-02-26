Template.endingSoon.helpers({
    'getEndingSoonCampaigns': function () {
        return CampaignBasics.find({}, {sort: {sort_time_stop: -1}, limit: 10}).fetch();
    }
});
