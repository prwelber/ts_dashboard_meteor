import InsightsBreakdowns from '/collections/InsightsBreakdowns'
import { apiVersion } from '/server/token/token';
const token = require('/server/token/token.js');

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
            let result = HTTP.call('GET', 'https://graph.facebook.com/'+apiVersion+'/'+accountNumber+'/insights?fields=impressions,clicks,cpm,cpc,website_clicks,total_actions,spend,reach,frequency,campaign_name,campaign_id,cost_per_action_type,actions&breakdowns=age,gender&date_preset=lifetime&access_token='+token.token+'', {});
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
                data['inserted'] = moment().toISOString();
                // data['clicks'] = Math.round((data['ctr'] / 100) * data['impressions']);
                // data['cpc'] = accounting.formatMoney((data.spend / data.clicks), "$", 2);
                // data['spend'] = accounting.formatMoney(data.spend, "$", 2);
                data['date_start'] = moment(data.date_start).toISOString();
                data['date_stop'] = moment(data.date_stop).toISOString();
                masterArray.push(data);
            });
        } catch(e) {
            console.log("Error pulling Age & Gender Insights Breakdown", e);
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
        }
    },
    refreshAgeGender: (campaignNumber) => {
      InsightsBreakdowns.remove({'data.campaign_id': campaignNumber});
      return "success!";
    }
});

Meteor.publish('insightsBreakdownList', function (opts) {
    if (! opts) {
      return InsightsBreakdowns.find({}); //publish all breakdowns
    } else {
      return InsightsBreakdowns.find({'data.campaign_id': opts});
    }
});
