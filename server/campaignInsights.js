if (Meteor.isServer) {

    Meteor.methods({
        'removeInsightCollection': function () {
            console.log('removing CampaignInsightList collection')
            CampaignInsightList.remove( {} )
        }
    });


    Meteor.methods({
        'getInsights': function (accountNumber) {
            let campaignInsightsArray = [];
            let campaignInsights;
            try {
                let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+accountNumber+'/insights?fields=campaign_name,cost_per_unique_click,cost_per_total_action,cost_per_10_sec_video_view,cpm,cpp,ctr,impressions,objective,reach,relevance_score,spend,total_actions,total_unique_actions,video_10_sec_watched_actions,video_15_sec_watched_actions,video_avg_pct_watched_actions,video_30_sec_watched_actions,video_avg_sec_watched_actions,video_p100_watched_actions,video_complete_watched_actions,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p95_watched_actions,unique_impressions,unique_clicks,campaign_id,adset_id,estimated_ad_recall_rate,estimated_ad_recallers,cost_per_estimated_ad_recallers,actions,cost_per_action_type&access_token='+token+'', {});
                campaignInsights = result;
                campaignInsights = EJSON.parse(campaignInsights.content)

                //can just iterate over this as an object
                // console.log(campaignInsights.data[0]);
                campaignInsights = campaignInsights.data[0]


                // running 2 forEach loops to add actions data to the original object
                campaignInsights.actions.forEach(el => {
                    campaignInsights[el.action_type] = el.value
                });
                campaignInsights.cost_per_action_type.forEach(el => {
                    campaignInsights["cost_per_"+el.action_type] = el.value
                });

            } catch(e) {
                console.log("error pulling campaign insights:", e);
            }

            try {
                    CampaignInsightList.insert({
                        inserted: moment().format("MM-DD-YYYY HH:MM"),
                        campaign_name: campaignInsights.campaign_name,
                        cost_per_unique_click: campaignInsights.cost_per_unique_click,
                        cost_per_total_action: campaignInsights.cost_per_total_action,
                        cpm: campaignInsights.cpm,
                        cpp: campaignInsights.cpp,
                        ctr: campaignInsights.ctr,
                        impressions: campaignInsights.impressions,
                        objective: campaignInsights.objective,
                        reach: campaignInsights.reach,
                        spend: campaignInsights.spend,
                        total_actions: campaignInsights.total_actions,
                        total_unique_actions: campaignInsights.total_unique_actions,
                        unique_impressions: campaignInsights.unique_impressions,
                        unique_clicks: campaignInsights.unique_clicks,
                        campaign_id: campaignInsights.campaign_id,
                        estimated_ad_recall_rate: campaignInsights.estimated_ad_recall_rate,
                        estimated_ad_recallers: campaignInsights.estimated_ad_recallers,
                        cost_per_estimated_ad_recallers: campaignInsights.cost_per_estimated_ad_recallers,
                        date_start: campaignInsights.date_start,
                        date_stop: campaignInsights.date_stop,
                        comment: campaignInsights.comment,
                        like: campaignInsights.like,
                        link_click: campaignInsights.link_click,
                        photo_view: campaignInsights.photo_view,
                        post: campaignInsights.post,
                        post_like: campaignInsights.post_like,
                        unlike: campaignInsights.unlike,
                        video_play: campaignInsights.video_play,
                        video_view: campaignInsights.video_view,
                        page_engagement: campaignInsights.page_engagement,
                        post_engagement: campaignInsights.post_engagement,
                        cost_per_comment: campaignInsights.cost_per_comment,
                        cost_per_like: campaignInsights.cost_per_like,
                        cost_per_link_click: campaignInsights.cost_per_link_click,
                        cost_per_photo_view: campaignInsights.cost_per_photo_view,
                        cost_per_post: campaignInsights.cost_per_post,
                        cost_per_post_like: campaignInsights.cost_per_post_like,
                        cost_per_unlike: campaignInsights.cost_per_unlike,
                        cost_per_video_play: campaignInsights.cost_per_video_play,
                        cost_per_video_view: campaignInsights.cost_per_video_view,
                        cost_per_page_engagement: campaignInsights.cost_per_page_engagement,
                        cost_per_post_engagement: campaignInsights.cost_per_post_engagement

                    });
            } catch(e) {
                console.log('error while inserting into collection:', e)
            } finally {
                return campaignInsights;
            }
        }
    });


    Meteor.publish('campaignInsightList', function () {
        return CampaignInsightList.find({}); //publish all insights
    })

};
