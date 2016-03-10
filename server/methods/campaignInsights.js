Meteor.startup(function () {
    CampaignInsights._ensureIndex({campUniqueId: 1});
});

Meteor.methods({
    'removeInsights': function () {
        console.log('removing CampaignInsightList collection')
        CampaignInsights.remove( {} );
        return "CampaignInsights removed!";
    }
});

Meteor.methods({
    'getInsights': function (accountNumber, end_date) {
        console.log('getInsights running');
        let insightsArray = [];
        let masterArray = [];
        let insights;
        let data = {};
        try {
            let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+accountNumber+'/insights?fields=account_id, campaign_name, cost_per_unique_click,cost_per_total_action,cost_per_10_sec_video_view,cpm,cpp,ctr,impressions,objective,reach,frequency,relevance_score,spend,total_actions,total_unique_actions,video_10_sec_watched_actions,video_15_sec_watched_actions,video_avg_pct_watched_actions,video_30_sec_watched_actions,video_avg_sec_watched_actions,video_p100_watched_actions,video_complete_watched_actions,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p95_watched_actions,unique_impressions,unique_clicks,campaign_id,adset_id,estimated_ad_recall_rate,estimated_ad_recallers,cost_per_estimated_ad_recallers,actions, website_ctr, website_clicks,cost_per_action_type&access_token='+token+'', {});
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
                    } else if (key == "website_ctr") {
                        el[key].forEach(el => {
                            data[el.action_type+"_ctr"] = accounting.formatMoney(el.value, "$", 2);
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
            data['cpm'] = data.cpm;
            data['cpp'] = accounting.formatMoney(data.cpp, "$", 2);
            data['inserted'] = moment().format("MM-DD-YYYY hh:mm a");
            data['cost_per_unique_click'] = accounting.formatMoney(data.cost_per_unique_click, "$", 2);
            data['cost_per_total_action'] = accounting.formatMoney(data.cost_per_total_action, "$", 2);
            data['clicks'] = Math.round((data['ctr'] / 100) * data['impressions']);
            data['cpc'] = data.spend / data.clicks;
            data['spend'] = accounting.formatMoney(data.spend, "$", 2);
            data['date_start'] = moment(data.date_start).format("MM-DD-YYYY hh:mm a");
            data['date_stop'] = moment(data.date_stop).format("MM-DD-YYYY hh:mm a");

            masterArray.push(data);

        } catch(e) {
            console.log("error pulling campaign insights:", e);
        }

        // Where we search initiatives looking for the one that matches
        try {
            Initiatives._ensureIndex({
                "search_text": "text"
            });

            let inits = Initiatives.find(
                {$text: { $search: data.campaign_name}},
                {
                    fields: { // giving each document a text score
                        score: {$meta: "textScore"}
                    },
                    sort: { // sorting by highest text score
                        score: {$meta: "textScore"}
                    }
                }
            ).fetch();
            inits = inits[0];  // set "inits" equal to initiative with highest textScore
            data['initiative'] = inits.name; //assign initiative name to data object

            // try and remove initiative id and name to guard against duplicates
            // Initiatives.update(
            //     {name: inits.name},
            //     {$pull: {campaign_ids: data.campaign_id, campaign_names: data.campaign_name}
            // });
            // I might not need this since using addToSet below, which
            // checks for duplicate values

            Initiatives.update(   // assign campaign id and name to matching initiative
                {name: inits.name},
                {$addToSet: {
                    campaign_names: data.campaign_name
                }
            });

        } catch(e) {
            console.log(e);
        }

        // end of initiative matching

        try {
            // put the data object into Mongo
            CampaignInsights.insert({
                data: data
            })
        } catch(e) {
            console.log('error while inserting into collection:', e);
        }
    },
    'refreshInsight': function (campaign_id, campaign_name, initiativeName) {
        console.log('refreshInsight running');

        Initiatives.update(
            {name: initiativeName},
            {$pull: {campaign_names: campaign_name}
        });
        CampaignInsights.remove({'data.campaign_id': campaign_id});
    }
});


Meteor.publish('campaignInsightList', function () {
    return CampaignInsights.find({}); //publish all insights
});
