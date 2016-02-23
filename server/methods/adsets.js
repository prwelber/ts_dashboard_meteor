Meteor.methods({
    'removeAdSetCollection': function () {
        console.log('removing AdSet collection')
        AdSets.remove( {} )
    }
});

Meteor.methods({
    'getAdSets': function (accountNumber, campaignMongoId, campaignName) {
        let adSetsArray = [];
        let masterArray = [];
        let adSets;
        try {
            let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+accountNumber+'/adsets?fields=account_id,campaign_id,start_time,end_time,id,optimization_goal,name,targetingsentencelines,lifetime_budget,bid_info,bid_amount,created_time,daily_budget,product_ad_behavior,updated_time,insights{spend,actions,cost_per_action_type,cpm,cpp,ctr,ad_name,total_actions,impressions,reach}&access_token='+token+'', {});
            adSets = result;
            // adSets variable is now an array of objects
            adSetsArray.push(adSets.data.data);

            while (true) {
                try {
                    adSets = HTTP.call('GET', adSets.data.paging['next'], {});
                    adSetsArray.push(adSets.data.data);
                } catch(e) {
                    console.log('no more pages or error in while true loop', e);
                    break;
                }
            }

            //flatten array
            adSetsArray = _.flatten(adSetsArray);

            //console.log(adSetsArray);

            adSetsArray.forEach(el => {
                let data = {};
                data['account_id'] = el.account_id;
                data['campaign_id'] = el.campaign_id;
                data['start_time'] = el.start_time;
                data['end_time'] = el.end_time;
                data['id'] = el.id;
                data['optimization_goal'] = el.optimization_goal;
                data['name'] = el.name;
                data['lifetime_budget'] = accounting.formatMoney(el.lifetime_budget, "$", 2);
                data['created_time'] = el.created_time;
                data['product_ad_behavior'] = el.product_ad_behavior;
                data['updated_time'] = el.updated_time;
                try {
                    el.targetingsentencelines.targetingsentencelines.forEach(el => {
                        if (el.content == "Interests:") {
                            data['interests'] = el.children[0];
                        }
                        if (el.content == "Age:") {
                            data['age_range'] = el.children[0];
                        }
                        if (el.content == "Placements:") {
                            data['placements'] = el.children[0]
                        }
                    });
                } catch(e) {
                    console.log("Error while looping over and organizing data", e);
                }
                try {
                    el.insights.data.forEach(el => {
                        data['spend'] = accounting.formatMoney(el.spend, "$", 2);
                        data['cpm'] = accounting.formatMoney(el.cpm, "$", 2);
                        data['cpp'] = accounting.formatMoney(el.cpp, "$", 2);
                        data['ctr'] = el.ctr;
                        data['total_actions'] = el.total_actions;
                        data['impressions'] = el.impressions;
                        data['reach'] = el.reach;
                        el.actions.forEach(el => {
                            data[el.action_type] = el.value;
                        });
                        el.cost_per_action_type.forEach(el => {
                            data['cost_per_'+el.action_type] = accounting.formatMoney(el.value, "$", 2);
                        });
                    });
                } catch(e) {
                    console.log("Error while looping over and organizing data", e);
                }
                data['campaign_mongo_reference'] = campaignMongoId;
                data['campaign_name'] = campaignName;
                masterArray.push(data);

            })
        } catch(e) {
            console.log("Error pulling AdSet data", e);
        }
        try {
            masterArray.forEach(el => {
                AdSets.insert({
                    inserted: moment().format("MM-DD-YYYY hh:mm a"),
                    account_id: el.account_id,
                    campaign_id: el.campaign_id,
                    start_time: moment(el.start_time).format("MM-DD-YYYY hh:mm a"),
                    end_time: moment(el.end_time).format("MM-DD-YYYY hh:mm a"),
                    id: el.id,
                    optimization_goal: el.optimization_goal,
                    name: el.name,
                    lifetime_budget: el.lifetime_budget,
                    created_time: moment(el.created_time).format("MM-DD-YYYY hh:mm a"),
                    product_ad_behavior: el.product_ad_behavior,
                    updated_time: moment(el.updated_time).format("MM-DD-YYYY hh:mm a"),
                    interests: el.interests,
                    age_range: el.age_range,
                    placements: el.placements,
                    spend: el.spend,
                    ctr: el.ctr,
                    cpm: el.cpm,
                    cpp: el.cpp,
                    total_actions: el.total_actions,
                    impressions: el.impressions,
                    reach: el.reach,
                    comment: el.comment,
                    photo_view: el.photo_view,
                    post: el.post,
                    post_like: el.post_like,
                    page_engagement: el.page_engagement,
                    post_engagement: el.post_engagement,
                    like: el.like,
                    link_click: el.link_click,
                    cost_per_comment: el.cost_per_comment,
                    cost_per_photo_view: el.cost_per_photo_view,
                    cost_per_post: el.cost_per_post,
                    cost_per_post_like: el.cost_per_post_like,
                    cost_per_page_engagement: el.cost_per_page_engagement,
                    cost_per_post_engagement: el.cost_per_post_engagement,
                    cost_per_like: el.cost_per_like,
                    cost_per_link_click: el.cost_per_link_click,
                    campaign_name: el.campaign_name,
                    campaign_mongo_reference: el.campaign_mongo_reference
                });
            });
        } catch(e) {
            console.log('Error inserting into DB', e)
        }
    }
});
