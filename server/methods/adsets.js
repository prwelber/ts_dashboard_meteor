Meteor.methods({
    'removeAdSets': function () {
        console.log('removing AdSet collection')
        AdSets.remove( {} )
    }
});

Meteor.methods({
    'getAdSets': function (accountNumber, campaignName) {
        let adSetsArray = [];
        let masterArray = [];
        let adSets;
        try {
            let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+accountNumber+'/adsets?fields=account_id,campaign_id,start_time,end_time,id,optimization_goal,name,targetingsentencelines,lifetime_budget,bid_info,bid_amount,created_time,daily_budget,product_ad_behavior,updated_time,insights{spend,actions,cost_per_action_type,cpm,cpp,ctr,ad_name,total_actions,impressions,reach}&access_token='+token+'', {});
            adSets = result;
            // adSets variable is now an array of objects
            adSetsArray.push(adSets.data.data);

            while (true) {
                try {
                    adSets = HTTP.call('GET', adSets.data.paging['next'], {});
                    adSetsArray.push(adSets.data.data);
                } catch(e) {
                    console.log('no more pages or error in while true loop', e);
                    break;
                }
            }

            //flatten array
            adSetsArray = _.flatten(adSetsArray);

            // console.log(adSetsArray);

            adSetsArray.forEach(el => {
                let data = {};
                data['account_id'] = el.account_id;
                data['campaign_id'] = el.campaign_id;
                data['start_time'] = moment(el.start_time).format("MM-DD-YYYY hh:mm a");
                data['end_time'] = moment(el.end_time).format("MM-DD-YYYY hh:mm a");
                data['id'] = el.id;
                data['optimization_goal'] = el.optimization_goal;
                data['name'] = el.name;
                data['lifetime_budget'] = accounting.formatMoney(el.lifetime_budget, "$", 2);
                data['created_time'] = moment(el.created_time).format("MM-DD-YYYY hh:mm a");
                data['product_ad_behavior'] = el.product_ad_behavior;
                data['updated_time'] = moment(el.updated_time).format("MM-DD-YYYY hh:mm a");;
                try {
                    el.targetingsentencelines.targetingsentencelines.forEach(el => {
                        if (el.content == "Interests:") {
                            data['interests'] = el.children[0];
                        }
                        if (el.content == "Age:") {
                            data['age_range'] = el.children[0];
                        }
                        if (el.content == "Placements:") {
                            data['placements'] = el.children[0];
                        }
                        if (el.content == "Location - Living In:") {
                            data['location_living_in'] = el.children[0];
                        }
                        if (el.content == "Behaviors:") {
                            data['behaviors'] = el.children[0];
                        }
                        if (el.content == "Connections:") {
                            data['connections'] = el.children[0];
                        }
                        if (el.content == "Location:") {
                            data['location'] = el.children[0];
                        }
                        if (el.content == "People Who Match:") {
                            data['match'] = el.children[0];
                        }
                        if (el.content == "And Must Also Match:") {
                            data['also_match'] = el.children[0];
                        }
                    });
                } catch(e) {
                    console.log("Error while looping over and organizing data", e);
                }
                try {
                    el.insights.data.forEach(el => {
                        data['spend'] = accounting.formatMoney(el.spend, "$", 2);
                        data['cpm'] = accounting.formatMoney(el.cpm, "$", 2);
                        data['cpp'] = accounting.formatMoney(el.cpp, "$", 2);
                        data['ctr'] = el.ctr;
                        data['total_actions'] = el.total_actions;
                        data['impressions'] = el.impressions;
                        data['reach'] = el.reach;
                        data['clicks'] = Math.round((el.ctr / 100) * el.impressions);
                        data['cpc'] = accounting.formatMoney((el.spend / ((el.ctr / 100) * el.impressions)), "$", 2);
                        el.actions.forEach(el => {
                            data[el.action_type] = el.value;
                        });
                        el.cost_per_action_type.forEach(el => {
                            data['cost_per_'+el.action_type] = accounting.formatMoney(el.value, "$", 2);
                        });
                    });
                } catch(e) {
                    console.log("Error while looping over and organizing data", e);
                }
                data['campaign_name'] = campaignName;
                data['inserted'] = moment().format("MM-DD-YYYY hh:mm a");
                masterArray.push(data);
                // console.log(masterArray);
            });
        } catch(e) {
            console.log("Error pulling AdSet data", e);
        }

        try {
            masterArray.forEach(el => {
                AdSets.insert({
                    data: el
                });
            });
        } catch(e) {
            console.log("Error inserting into DB:", e);
        } finally {
            return masterArray;
        }
    }
});

Meteor.publish('AdSetsList', function () {
    return AdSets.find( {} ) // publish all adsets
});
