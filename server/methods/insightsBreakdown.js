import InsightsBreakdowns from '/collections/InsightsBreakdowns'

Meteor.methods({
    'removeBreakdowns': function () {
        console.log('removing InsightsBreakdown collection')
        InsightsBreakdowns.remove( {} )
    }
});

Meteor.methods({
    'getBreakdown': function (accountNumber, campaignName, end_date) {
        let breakdownArray = [];
        let masterArray = [];
        let breakdown;
        try {
            let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+accountNumber+'/insights?breakdowns=age,gender&access_token='+token+'', {});
            breakdown = result
            breakdownArray.push(breakdown.data.data);
            // flatten to get rid of nested array
            breakdownArray = _.flatten(breakdownArray);
            // console.log(breakdownArray);

            breakdownArray.forEach(el => {
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
                data['date_start'] = moment(data.date_start).format("MM-DD-YYYY hh:mm a");
                data['date_stop'] = moment(end_date).format("MM-DD-YYYY hh:mm a");
                masterArray.push(data);
            });
        } catch(e) {
            console.log("Error pulling Insights Breakdown, here's the error:", e);
        }
        try {
            // loop over array made up of gender/age objects and insert each one
            // as its own document in Mongo - each will hold reference to parent campaign
            masterArray.forEach(el => {
                InsightsBreakdowns.insert({
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

Meteor.publish('insightsBreakdownList', function (opts) {
    if (! opts) {
      return InsightsBreakdowns.find({}); //publish all breakdowns
    } else {
      return InsightsBreakdowns.find({'data.campaign_id': opts});
    }
});
