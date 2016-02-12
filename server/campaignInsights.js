if (Meteor.isServer) {

    Meteor.methods({
        'getInsights': function (accountNumber) {
            let campaignInsightsArray = [];
            let campaignInsights;
            try {
                let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+accountNumber+'/insights?fields=campaign_name,cost_per_unique_click,cost_per_total_action,cost_per_10_sec_video_view,cpm,cpp,ctr,impressions,objective,reach,relevance_score,spend,total_actions,total_unique_actions,video_10_sec_watched_actions,video_15_sec_watched_actions,video_avg_pct_watched_actions,video_30_sec_watched_actions,video_avg_sec_watched_actions,video_p100_watched_actions,video_complete_watched_actions,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p95_watched_actions,unique_impressions,unique_clicks,campaign_id,adset_id,estimated_ad_recall_rate,estimated_ad_recallers,cost_per_estimated_ad_recallers,newsfeed_avg_position&access_token='+token+'', {});
                campaignInsights = result;
                campaignInsights = EJSON.parse(campaignInsights.content)

                //can just iterate over this as an object
                console.log(campaignInsights.data[0]);

                //console.log(campaignInsightsArray)
            } catch(e) {
                // statements
                console.log(e);
            }
        }
    });











};
