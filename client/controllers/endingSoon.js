Template.endingSoon.helpers({
    'getEndingSoonCampaigns': function () {
        return CampaignBasics.find({
            //"sort_time_stop": {$lte: new Date().toISOString()}
        }, {
            sort: {sort_time_stop: -1},
            fields: {"name": 1, "start_time": 1, "stop_time": 1, "objective": 1, "campaign_id": 1},
            limit: 8
        }).fetch();

    }
});
