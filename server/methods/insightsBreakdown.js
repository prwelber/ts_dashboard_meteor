Meteor.methods({
    'removeBreakdownCollection': function () {
        console.log('removing InsightsBreakdown collection')
        InsightsBreakdowns.remove( {} )
    }
});

Meteor.methods({
    'getBreakdown': function (accountNumber, campaignName, campaignMongoId) {
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
                data['spend'] = accounting.formatMoney(data.spend, "$", 2);
                data['inserted'] = moment().format("MM-DD-YYYY hh:mm a");
                data['campaign_name'] = campaignName;
                data['campaign_mongo_reference'] = campaignMongoId;
                masterArray.push(data);
            });
            // console.log(masterArray);


            // in the below forEach we are creating an array of objects
            // we instantiate an empty object at the beginning of each loop
            // and we push that object into the array at the end of the loop
            // breakdown.forEach(el => {
            //     dataObj = {};
            //     dataObj['age'] = el.age;
            //     dataObj['gender'] = el.gender;
            //     dataObj['total_actions'] = el.total_actions;
            //     dataObj['impressions'] = el.impressions;
            //     dataObj['reach'] = el.reach;
            //     dataObj['ctr'] = el.ctr;
            //     dataObj['cpm'] = el.cpm;
            //     dataObj['cpp'] = el.cpp;
            //     dataObj['spend'] = el.spend;
            //     try {
            //         el.actions.forEach(el => {
            //             dataObj[el.action_type] = el.value;
            //         });
            //     } catch(e) {
            //         console.log(e);
            //     }
            //     try {
            //         el.cost_per_action_type.forEach(el => {
            //             dataObj["cost_per_"+el.action_type] = el.value;
            //         });
            //     } catch(e) {
            //         console.log(e)
            //     }
            //     dataObj['campaign_name'] = campaignName;
            //     dataObj['campaign_mongo_reference'] = campaignMongoId;
            //     breakdownArray.push(dataObj)
            // });
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

        // try {
        //     breakdownArray.forEach(el => {
        //             InsightsBreakdowns.insert({
        //                 age: el.age,
        //                 gender: el.gender,
        //                 total_actions: el.total_actions,
        //                 impressions: el.impressions,
        //                 reach: el.reach,
        //                 spend: el.spend,
        //                 ctr: el.ctr,
        //                 cpm: el.cpm,
        //                 cpp: el.cpp,
        //                 comment: el.comment,
        //                 photo_view: el.photo_view,
        //                 post: el.post,
        //                 post_like: el.post_like,
        //                 page_engagement: el.page_engagement,
        //                 post_engagement: el.post_engagement,
        //                 cost_per_comment: el.cost_per_comment,
        //                 cost_per_photo_view: el.cost_per_photo_view,
        //                 cost_per_post: el.cost_per_post,
        //                 cost_per_post_like: el.cost_per_post_like,
        //                 cost_per_page_engagement: el.cost_per_page_engagement,
        //                 cost_per_post_engagement: el.cost_per_post_engagement,
        //                 campaign_name: el.campaign_name,
        //                 campaign_mongo_reference: el.campaign_mongo_reference
        //             });
        //     });
        // } catch(e) {
        //     console.log('error inserting into database', e);
        // } finally {
        //     return "this is a returned result";
        // }
    }
});

Meteor.publish('insightsBreakdownList', function () {
    return InsightsBreakdowns.find({}); //publish all breakdowns
});
