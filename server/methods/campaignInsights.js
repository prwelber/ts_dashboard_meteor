Meteor.methods({
    'removeInsights': function () {
        console.log('removing CampaignInsightList collection')
        CampaignInsights.remove( {} );
        return "CampaignInsights removed!";
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
            // at this point we just have one array with
            // an object in it, with a few nested arrays
            // of objects
            insightsArray.forEach(el => {
                for (let key in el) {
                    if (key == "actions") {
                        el[key].forEach(el => {
                            // this check looks for a period in the key name and
                            // replaces it with an underscore if found
                            // this check is used two more times below
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
                        if (/\W/g.test(key)) {
                            key = key.replace(/\W/g, "_");
                            data[key] = el[key];
                        } else {
                            data[key] = el[key]
                        }
                    }
                }
            });
            //overwrites data already in object with formatted values
            data['cpm'] = accounting.formatMoney(data.cpm, "$", 2);
            data['cpp'] = accounting.formatMoney(data.cpp, "$", 2);
            data['inserted'] = moment().format("MM-DD-YYYY hh:mm a");
            data['cost_per_unique_click'] = accounting.formatMoney(data.cost_per_unique_click, "$", 2);
            data['cost_per_total_action'] = accounting.formatMoney(data.cost_per_total_action, "$", 2);
            data['clicks'] = Math.round((data['ctr'] / 100) * data['impressions']);
            data['cpc'] = accounting.formatMoney((data.spend / data.clicks), "$", 2);
            data['spend'] = accounting.formatMoney(data.spend, "$", 2);
            data['date_start'] = moment(data.date_start).format("MM-DD-YYYY hh:mm a");
            data['date_stop'] = moment(data.date_stop).format("MM-DD-YYYY hh:mm a");

            masterArray.push(data);
        } catch(e) {
            console.log("error pulling campaign insights:", e);
        }

        try {
            // put the data object into Mongo
            CampaignInsights.insert({
                data: data
            })
        } catch(e) {
            console.log('error while inserting into collection:', e);
        }
    }
});


Meteor.publish('campaignInsightList', function () {
    return CampaignInsights.find({}); //publish all insights
})
