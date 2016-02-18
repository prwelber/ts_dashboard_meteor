if (Meteor.isServer) {

    Meteor.methods({
        'removeBreakdownCollection': function () {
            console.log('removing InsightsBreakdown collection')
            InsightsBreakdownList.remove( {} )
        }
    });

    Meteor.methods({
        'getBreakdown': function (accountNumber, campaignName, campaignMongoId) {
            let breakdownArray = [];
            let breakdown;
            try {
                let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+accountNumber+'/insights?breakdowns=age,gender&access_token='+token+'', {});
                breakdown = result.data.data;
                // breakdown is now an array of objects


                // in the below forEach we are creating an array of objects
                // we instantiate an empty object at the beginning of each loop
                // and we push that object into the array at the end of the loop
                breakdown.forEach(el => {
                    dataObj = {};
                    dataObj['age'] = el.age;
                    dataObj['gender'] = el.gender;
                    dataObj['total_actions'] = el.total_actions;
                    dataObj['impressions'] = el.impressions;
                    dataObj['reach'] = el.reach;
                    dataObj['ctr'] = el.ctr;
                    dataObj['cpm'] = el.cpm;
                    dataObj['cpp'] = el.cpp;
                    try {
                        el.actions.forEach(el => {
                            dataObj[el.action_type] = el.value;
                        })
                    } catch(e) {
                        console.log(e);
                    }
                    try {
                        el.cost_per_action_type.forEach(el => {
                            dataObj["cost_per_"+el.action_type] = el.value;
                        })
                    } catch(e) {
                        console.log(e)
                    }
                    dataObj['campaign_name'] = campaignName;
                    dataObj['campaign_mongo_reference'] = campaignMongoId;
                    breakdownArray.push(dataObj)
                });
            } catch(e) {
                console.log("Here's the error:", e);
            } finally {
                // console.log(breakdownArray);
                breakdownArray.forEach(el => {
                    InsightsBreakdownList.insert({
                        el
                    });
                })
                // InsightsBreakdownList.insert({

                // })
            }
        }
    });


}
