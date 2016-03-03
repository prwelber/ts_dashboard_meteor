Meteor.methods({
    'removeHourlyCollection': function () {
        console.log('removing hourly breakdowns collection')
        HourlyBreakdowns.remove( {} )
    }
});

Meteor.methods({
    'getHourlyBreakdown': function (accountNumber, campaignName, end_date) {
        let hourlyArray = [];
        let masterArray = [];
        let hourlyBreakdown;
        try {
            let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+accountNumber+'/insights?fields=cpm,cpp,ctr,spend,account_id,campaign_id,campaign_name,date_start,date_stop,impressions,objective,reach,video_10_sec_watched_actions,video_15_sec_watched_actions,video_30_sec_watched_actions,video_avg_sec_watched_actions,video_avg_pct_watched_actions,video_complete_watched_actions,cost_per_action_type,actions&breakdowns=hourly_stats_aggregated_by_audience_time_zone&access_token='+token+'', {});
            hourlyBreakdown = result;
            hourlyArray.push(hourlyBreakdown.data.data);
            hourlyArray = _.flatten(hourlyArray);
            // console.log(hourlyArray);

            hourlyArray.forEach(el => {
                let data = {};
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
                data['cpm'] = accounting.formatMoney(data.cpm, "$", 2);
                data['cpp'] = accounting.formatMoney(data.cpp, "$", 2);
                data['inserted'] = moment().format("MM-DD-YYYY hh:mm a");
                data['campaign_name'] = campaignName;
                data['clicks'] = Math.round((data['ctr'] / 100) * data['impressions']);
                data['cpc'] = accounting.formatMoney((data.spend / data.clicks), "$", 2);
                data['spend'] = accounting.formatMoney(data.spend, "$", 2);
                data['date_stop'] = moment(end_date).format("MM-DD-YYYY hh:mm a");
                masterArray.push(data);
            });
            // console.log(masterArray);
        } catch(e) {
            console.log("Error pulling Hourly Breakdown, here's the error:", e);
        }
        try {
            masterArray.forEach(el => {
                HourlyBreakdowns.insert({
                    data: el
                });
            });
        } catch(e) {
            console.log('Error inserting into DB:', e);
        } finally {
            return "this is a return statement";
        }
    }
});






