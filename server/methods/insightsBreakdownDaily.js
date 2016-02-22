Meteor.methods({
    'removeBreakdownDailyCollection': function () {
        console.log('removing InsightsBreakdownByDays collection')
        InsightsBreakdownsByDays.remove( {} )
    }
});

Meteor.methods({
    'getDailyBreakdown': function (accountNumber, campaignName, campaignMongoId) {
        let dailyBreakdownArray = [];
        let dailyBreakdown;
        try {
            let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+accountNumber+'/insights?time_increment=1&access_token='+token+'', {});
            breakdown = result.data.data;
            //breakdown is an array of objects
            console.log(breakdown)
            // in the below forEach we are creating an array of objects
            // we instantiate an empty object at the beginning of each loop
            // and we push that object into the array at the end of the loop
            breakdown.forEach(el => {
                data = {};
                data['date_start'] = el.date_start;
                data['date_stop'] = el.date_stop;
                data['campaign_id'] = el.campaign_id;
                data['total_actions'] = el.total_actions;
                data['impressions'] = el.impressions;
                data['reach'] = el.reach;
                data['ctr'] = el.ctr;
                data['cpm'] = el.cpm;
                data['cpp'] = el.cpp;
                data['spend'] = el.spend;
                try {
                    el.actions.forEach(el => {
                        data[el.action_type] = el.value;
                    });
                } catch(e) {
                    console.log(e)
                }
                try {
                    el.cost_per_action_type.forEach(el => {
                        data['cost_per_'+el.action_type] = el.value;
                    });
                } catch(e) {
                    console.log(e);
                }
                data['campaign_name'] = campaignName;
                data['campaign_mongo_reference'] = campaignMongoId;
                // push each object into the master array
                dailyBreakdownArray.push(data);
            });
        } catch(e) {
            console.log("Error pulling daily insights breakdown:", e)
        }
        // Loop over array of objects and push each into the database
        try {
            dailyBreakdownArray.forEach(el => {
                InsightsBreakdownsByDays.insert({
                    date_start: el.date_start,
                    date_stop: el.date_stop,
                    campaign_id: el.campaign_id,
                    total_actions: el.total_actions,
                    impressions: el.impressions,
                    reach: el.reach,
                    spend: el.spend,
                    ctr: el.ctr,
                    cpm: el.cpm,
                    cpp: el.cpp,
                    comment: el.comment,
                    photo_view: el.photo_view,
                    post: el.post,
                    post_like: el.post_like,
                    page_engagement: el.page_engagement,
                    post_engagement: el.post_engagement,
                    cost_per_comment: el.cost_per_comment,
                    cost_per_photo_view: el.cost_per_photo_view,
                    cost_per_post: el.cost_per_post,
                    cost_per_post_like: el.cost_per_post_like,
                    cost_per_page_engagement: el.cost_per_page_engagement,
                    cost_per_post_engagement: el.cost_per_post_engagement,
                    campaign_name: el.campaign_name,
                    campaign_mongo_reference: el.campaign_mongo_reference
                });
            });
        } catch(e) {
            console.log('error inserting data into database', e);
        }
    }
});

Meteor.publish('insightsBreakdownByDaysList', function () {
    return InsightsBreakdownsByDays.find({}) //publish all daily breakdowns
});
