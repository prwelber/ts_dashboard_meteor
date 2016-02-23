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
        let campaignInsights;
        try {
            let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+accountNumber+'/insights?fields=account_id,campaign_name,cost_per_unique_click,cost_per_total_action,cost_per_10_sec_video_view,cpm,cpp,ctr,impressions,objective,reach,relevance_score,spend,total_actions,total_unique_actions,video_10_sec_watched_actions,video_15_sec_watched_actions,video_avg_pct_watched_actions,video_30_sec_watched_actions,video_avg_sec_watched_actions,video_p100_watched_actions,video_complete_watched_actions,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p95_watched_actions,unique_impressions,unique_clicks,campaign_id,adset_id,estimated_ad_recall_rate,estimated_ad_recallers,cost_per_estimated_ad_recallers,actions, website_clicks,cost_per_action_type&access_token='+token+'', {});
            insights = result;
            insightsArray.push(insights.data.data[0]);
            //can just iterate over this as an object
            console.log(insightsArray);
            insightsArray.forEach(el => {
                let data = {};
                data['account_id'] = el.account_id;
                data['campaign_name'] = el.campaign_name;
                data['cost_per_unique_click'] = el.cost_per_unique_click;
                data['cost_per_total_action'] = el.cost_per_total_action;
                data['cpm'] = el.cpm;
                data['ctr'] = el.ctr;
                data['impressions'] = el.impressions;
                data['objective'] = el.objective;
                data['reach'] = el.reach;
                data['spend'] = el.spend;
                data['total_actions'] = el.total_actions;
                data['total_unique_actions'] = el.total_unique_actions;
                data['unique_impressions'] = el.unique_impressions;
                data['unique_clicks'] = el.unique_clicks;
                data['campaign_id'] = el.campaign_id;
                data['estimated_ad_recall_rate'] = el.estimated_ad_recall_rate;
                data['cost_per_estimated_ad_recallers'] = el.cost_per_estimated_ad_recallers;
                data['website_clicks'] = el.website_clicks;
                data['date_start'] = el.date_start;
                data['date_stop'] = el.date_stop;
                data.actions.forEach(el => {
                    data[el.action_type] = el.value;
                });
                data.cost_per_action_type.forEach(el => {
                    data['cost_per_'+el.action_type] = accounting.formatMoney(el.value, "$", 2);
                });

            });

        } catch(e) {
            console.log("error pulling campaign insights:", e);
        }

        try {
            masterArray.forEach(el => {
                CampaignInsights.insert({
                    inserted: moment().format("MM-DD-YYYY hh:mm a"),
                    campaign_id: el.campaign_id,
                    account_id: el.account_id,
                    campaign_name: el.campaign_name,
                    cost_per_unique_click: el.cost_per_unique_click,
                    cost_per_total_action: el.cost_per_total_action,
                    cpm: el.cpm,
                    cpp: el.cpp,
                    ctr: el.ctr,
                    impressions: el.impressions,
                    objective: el.objective,
                    reach: el.reach,
                    spend: el.spend,
                    total_actions: el.total_actions,
                    total_unique_actions: el.total_unique_actions,
                    unique_impressions: el.unique_impressions,
                    unique_clicks: el.unique_clicks,
                    estimated_ad_recall_rate: el.estimated_ad_recall_rate,
                    estimated_ad_recallers: el.estimated_ad_recallers,
                    cost_per_estimated_ad_recallers: el.cost_per_estimated_ad_recallers,
                    date_start: el.date_start,
                    date_stop: el.date_stop,
                    comment: el.comment,
                    like: el.like,
                    link_click: el.link_click,
                    photo_view: el.photo_view,
                    post: el.post,
                    post_like: el.post_like,
                    unlike: el.unlike,
                    video_play: el.video_play,
                    video_view: el.video_view,
                    page_engagement: el.page_engagement,
                    post_engagement: el.post_engagement,
                    cost_per_comment: el.cost_per_comment,
                    cost_per_like: el.cost_per_like,
                    cost_per_link_click: el.cost_per_link_click,
                    cost_per_photo_view: el.cost_per_photo_view,
                    cost_per_post: el.cost_per_post,
                    cost_per_post_like: el.cost_per_post_like,
                    cost_per_unlike: el.cost_per_unlike,
                    cost_per_video_play: el.cost_per_video_play,
                    cost_per_video_view: el.cost_per_video_view,
                    cost_per_page_engagement: el.cost_per_page_engagement,
                    cost_per_post_engagement: el.cost_per_post_engagement
                });
            });
        } catch(e) {
            console.log('error while inserting into collection:', e);
        }
    }
});


Meteor.publish('campaignInsightList', function () {
    return CampaignInsights.find({}); //publish all insights
})
