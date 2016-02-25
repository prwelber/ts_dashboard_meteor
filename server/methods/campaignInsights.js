Meteor.methods({
    'removeInsightCollection': function () {
        console.log('removing CampaignInsightList collection')
        CampaignInsights.remove( {} )
    }
});

Meteor.methods({
    'getInsights': function (accountNumber) {
        let insightsArray = [];
        let masterArray = [];
        let insights;
        let data = {};
        try {
            let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+accountNumber+'/insights?fields=account_id,campaign_name,cost_per_unique_click,cost_per_total_action,cost_per_10_sec_video_view,cpm,cpp,ctr,impressions,objective,reach,relevance_score,spend,total_actions,total_unique_actions,video_10_sec_watched_actions,video_15_sec_watched_actions,video_avg_pct_watched_actions,video_30_sec_watched_actions,video_avg_sec_watched_actions,video_p100_watched_actions,video_complete_watched_actions,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p95_watched_actions,unique_impressions,unique_clicks,campaign_id,adset_id,estimated_ad_recall_rate,estimated_ad_recallers,cost_per_estimated_ad_recallers,actions, website_clicks,cost_per_action_type&access_token='+token+'', {});
            insights = result;
            insightsArray.push(insights.data.data[0]);
            //can just iterate over this as an object
            // console.log(insightsArray[0]);
            // for (let i in insightsArray[0]) {
            //     console.log(typeof(i), .test(/\W/g))
            // }

            insightsArray.forEach(el => {
                for (let key in el) {
                    if (key == "actions") {
                        el[key].forEach(el => {
                            // need something here that looks for a period in
                            // key name
                            if (/\W/g.test(el.action_type)) {
                                // console.log("before key", el.action_type)
                                el.action_type = el.action_type.replace(/\W/g, "_");
                                // console.log("after key", el.action_type)
                                data[el.action_type] = el.value;
                            }
                            data[el.action_type] = el.value;
                        });
                    } else if (key == "cost_per_action_type") {
                         el[key].forEach(el => {
                            if (/\W/g.test(el.action_type)) {
                                el.action_type = el.action_type.replace(/\W/g, "_");
                                data["cost_per_"+el.action_type] = accounting.formatMoney(el.value, "$", 2);
                            } else {
                                data["cost_per_"+el.action_type] = accounting.formatMoney(el.value, "$", 2);
                            }
                        });
                    } else {
                        // this check looks for a period in the key name and
                        // replaces it with an underscore
                        if (/\W/g.test(key)) {
                            key = key.replace(/\W/g, "_");
                            data[key] = el[key];
                        } else {
                            data[key] = el[key]
                        }
                    }
                }
            });
            data['cpm'] = accounting.formatMoney(data.cpm, "$", 2);
            data['cpp'] = accounting.formatMoney(data.cpp, "$", 2);
            data['spend'] = accounting.formatMoney(data.spend, "$", 2);
            data['inserted'] = moment().format("MM-DD-YYYY hh:mm a");
            data['cost_per_unique_click'] = accounting.formatMoney(data.cost_per_unique_click, "$", 2);
            data['cost_per_total_action'] = accounting.formatMoney(data.cost_per_total_action, "$", 2);

            masterArray.push(data);
        } catch(e) {
            console.log("error pulling campaign insights:", e);
        }

        try {
            CampaignInsights.insert({
                data: data
            });

                // CampaignInsights.insert({
                //     inserted: moment().format("MM-DD-YYYY hh:mm a"),
                //     campaign_id: el.campaign_id,
                //     account_id: el.account_id,
                //     campaign_name: el.campaign_name,
                //     cost_per_unique_click: el.cost_per_unique_click,
                //     cost_per_total_action: el.cost_per_total_action,
                //     cpm: el.cpm,
                //     cpp: el.cpp,
                //     ctr: el.ctr,
                //     impressions: el.impressions,
                //     objective: el.objective,
                //     reach: el.reach,
                //     spend: el.spend,
                //     total_actions: el.total_actions,
                //     total_unique_actions: el.total_unique_actions,
                //     unique_impressions: el.unique_impressions,
                //     unique_clicks: el.unique_clicks,
                //     estimated_ad_recall_rate: el.estimated_ad_recall_rate,
                //     estimated_ad_recallers: el.estimated_ad_recallers,
                //     cost_per_estimated_ad_recallers: el.cost_per_estimated_ad_recallers,
                //     date_start: el.date_start,
                //     date_stop: el.date_stop,
                //     comment: el.comment,
                //     like: el.like,
                //     link_click: el.link_click,
                //     photo_view: el.photo_view,
                //     post: el.post,
                //     post_like: el.post_like,
                //     unlike: el.unlike,
                //     video_play: el.video_play,
                //     video_view: el.video_view,
                //     page_engagement: el.page_engagement,
                //     post_engagement: el.post_engagement,
                //     cost_per_comment: el.cost_per_comment,
                //     cost_per_like: el.cost_per_like,
                //     cost_per_link_click: el.cost_per_link_click,
                //     cost_per_photo_view: el.cost_per_photo_view,
                //     cost_per_post: el.cost_per_post,
                //     cost_per_post_like: el.cost_per_post_like,
                //     cost_per_unlike: el.cost_per_unlike,
                //     cost_per_video_play: el.cost_per_video_play,
                //     cost_per_video_view: el.cost_per_video_view,
                //     cost_per_page_engagement: el.cost_per_page_engagement,
                //     cost_per_post_engagement: el.cost_per_post_engagement
                // });

        } catch(e) {
            console.log('error while inserting into collection:', e);
        }
    }
});


Meteor.publish('campaignInsightList', function () {
    return CampaignInsights.find({}); //publish all insights
})
