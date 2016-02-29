Meteor.methods({
    'removeBreakdownDailyCollection': function () {
        console.log('removing InsightsBreakdownByDays collection')
        InsightsBreakdownsByDays.remove( {} )
    }
});

Meteor.methods({
    'getDailyBreakdown': function (accountNumber, campaignName, campaignMongoId) {
        let dailyBreakdownArray = [];
        let masterArray = [];
        let breakdown;
        try {
            let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+accountNumber+'/insights?fields=date_start,date_stop,campaign_id,total_actions,impressions,spend,reach,ctr,cpm,cpp,actions,cost_per_action_type&time_increment=1&access_token='+token+'', {});
            breakdown = result;
            //breakdown is an array of objects
            dailyBreakdownArray.push(breakdown.data.data);
            while (true) {
                try {
                    breakdown = HTTP.call('GET', breakdown.data.paging['next'], {});
                    dailyBreakdownArray.push(breakdown.data.data);
                } catch(e) {
                    console.log('no more pages or error in while true loop', e);
                    break;
                }
            }

            // flattens the array so I can loop over the whole thing at once
            dailyBreakdownArray = _.flatten(dailyBreakdownArray);

            // console.log(dailyBreakdownArray)

            dailyBreakdownArray.forEach(el => {
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
                data['campaign_mongo_reference'] = campaignMongoId;
                data['clicks'] = Math.round((data['ctr'] / 100) * data['impressions']);
                data['cpc'] = accounting.formatMoney((data.spend / data.clicks), "$", 2);
                data['spend'] = accounting.formatMoney(data.spend, "$", 2);
                masterArray.push(data);
            });
            // console.log(masterArray);


        } catch(e) {
            console.log("Error pulling daily insights breakdown:", e)
        }
        // Loop over array of objects and push each into the database
        try {
            masterArray.forEach(el => {
                InsightsBreakdownsByDays.insert({
                    data: el
                });
            });
        } catch(e) {
            console.log('error inserting data into database', e);
        } finally {
            return "this is a returned result";
        }
    }
});

Meteor.publish('insightsBreakdownByDaysList', function () {
    return InsightsBreakdownsByDays.find({}) //publish all daily breakdowns
});
