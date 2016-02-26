Template.endingSoon.helpers({
    'getActiveCampaigns': function () {

        // this is good for campaigns that will start soon
        // this says that time start is greater than current date
        CampaignBasics.find({}, {filter: {gte: {sort_time_start: new Date().toISOString()}, limit: 3}}).fetch();
        CampaignBasics.find({}, {lte: {sort_time_start: new Date().toISOString()}, limit: 3}).fetch();
        //this might work for current campaigns...need to confirm
        CampaignBasics.find({
            "sort_time_start": {$lte: new Date().toISOString()},
            "sort_time_stop": {$gte: new Date().toISOString()}
        }).fetch()
    }
});
