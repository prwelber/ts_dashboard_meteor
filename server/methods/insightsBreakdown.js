Meteor.methods({
    'removeBreakdownCollection': function () {
        console.log('removing InsightsBreakdown collection')
        InsightsBreakdowns.remove( {} )
    }
});

Meteor.methods({
    'getBreakdown': function (accountNumber, campaignName, campaignMongoId) {
        let breakdownArray = [];
        let breakdown;
        try {
            let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+accountNumber+'/insights?breakdowns=age,gender&access_token='+token+'', {});
            breakdown = result.data.data;
            // breakdown is now an array of objects


            // in the below forEach we are creating an array of objects
            // we instantiate an empty object at the beginning of each loop
            // and we push that object into the array at the end of the loop
            breakdown.forEach(el => {
                dataObj = {};
                dataObj['age'] = el.age;
                dataObj['gender'] = el.gender;
                dataObj['total_actions'] = el.total_actions;
                dataObj['impressions'] = el.impressions;
                dataObj['reach'] = el.reach;
                dataObj['ctr'] = el.ctr;
                dataObj['cpm'] = el.cpm;
                dataObj['cpp'] = el.cpp;
                try {
                    el.actions.forEach(el => {
                        dataObj[el.action_type] = el.value;
                    })
                } catch(e) {
                    console.log(e);
                }
                try {
                    el.cost_per_action_type.forEach(el => {
                        dataObj["cost_per_"+el.action_type] = el.value;
                    })
                } catch(e) {
                    console.log(e)
                }
                dataObj['campaign_name'] = campaignName;
                dataObj['campaign_mongo_reference'] = campaignMongoId;
                breakdownArray.push(dataObj)
            });
        } catch(e) {
            console.log("Here's the error:", e);
        } finally {
            // console.log(breakdownArray);
            breakdownArray.forEach(el => {
                    InsightsBreakdowns.insert({
                        age: el.age,
                        gender: el.gender,
                        total_actions: el.total_actions,
                        impressions: el.impressions,
                        reach: el.reach,
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
                    })
            })
        }
    }
});

Meteor.publish('insightsBreakdownList', function () {
    return InsightsBreakdowns.find({}); //publish all breakdowns
})
