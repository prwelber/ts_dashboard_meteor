Meteor.methods({
  'removeAdSets': function () {
    console.log('removing AdSet collection')
    AdSets.remove( {} )
  }
});

Meteor.methods({
  'getAdSets': function (accountNumber) {
    let adSetsArray = [];
    let masterArray = [];
    let adSets;
    try {
      let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+accountNumber+'/adsets?fields=account_id,campaign_id,start_time,end_time,id,optimization_goal,name,targetingsentencelines,created_time,product_ad_behavior,updated_time,insights,lifetime_budget&access_token='+token+'', {});
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
    } catch(e) {
        console.log("Error pulling AdSet data", e);
    }

    //flatten array
    adSetsArray = _.flatten(adSetsArray);

    /*
    below is is how the data object is iterated over and the data is
    cleaned, organized and sanitized in order for it to be properly put
    into the database.
    upon coming accross certain keys, a new loop is created and regular
    expressions are used to replace periods with underscore so Mongo does
    not throw an error
    */

    try {
      adSetsArray.forEach(el => {
        let data = {};
        let targetingArray = [];
        let targetingObject = {};
        for (let key in el) {
          if (key === "targetingsentencelines") {
            el[key].targetingsentencelines.forEach(el => {
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

            // el[key].targetingsentencelines.forEach(target => {
            //   targetingObject[target.content] = target.children[0];
            // });
            //   targetingArray.push(targetingObject);
          } else if (key === "insights") {
            el[key].data.forEach(el => {
              for (let k in el) {
                if (k === "actions") {
                  el[k].forEach(el => {
                    // this check looks for a period in the key name and
                    // replaces it with an underscore if found
                    if (/\W/g.test(el.action_type)) {
                      el.action_type = el.action_type.replace(/\W/g, "_");
                      data[el.action_type] = el.value;
                    }
                      data[el.action_type] = el.value;
                  });
                } else if (k === "cost_per_action_type") {
                  el[k].forEach(el => {
                   if (/\W/g.test(el.action_type)) {
                     el.action_type = el.action_type.replace(/\W/g, "_");
                     data["cost_per_"+el.action_type] = el.value;
                    } else {
                       data["cost_per_"+el.action_type] = el.value;
                    }
                  });
                } else if (k === "website_ctr") {
                 el[k].forEach(el => {
                   data[el.action_type+"_ctr"] = el.value;
                 });
                } else {
                  if (/\W/g.test(k)) {
                    k = k.replace(/\W/g, "_");
                    data[k] = el[k];
                  } else {
                     data[k] = el[k]
                  }
                }
              }
            });
          } else {
            data[key] = el[key];
          }
        }
        data['inserted'] = moment().format("MM-DD-YYYY hh:mm a");
        data['clicks'] = Math.round((data['ctr'] / 100) * data['impressions']);
        data['cpc'] = data.spend / data.clicks;
        data['targetingData'] = targetingArray[0];
        delete data['unique_actions']; // data set is not needed
        delete data['cost_per_unique_action_type']; // data set is not needed

        masterArray.push(data);
      }); // end of top level forEach
      // console.log(masterArray);
    } catch(e) {
      console.log("error organizing data to put into DB" ,e);
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




          // if (key === "targetingsentencelines") {
          //   console.log
          //
          // } else if (key === "insights") {

          // }
