const later = require('later');
import { Meteor } from 'meteor/meteor'


SyncedCron.config({
    collectionName: 'cronCollection'
});

SyncedCron.add({
  name: "Clean null values from Insights",
  schedule: function (parser) {
    return parser.text('every 59 mins');
  },
  job: function (time) {

    CampaignInsights.remove({'data.campaign_id': null});
    console.log('Insight successfully removed');
  }
});

SyncedCron.add({
  name: "Campaign Insights Background Getter",

  schedule: function (parser) {
    return parser.text('at 10:07 am');
  },

  job: function (time) {

    let idArray = Accounts.find(
      {name:
        {$in:
          ["Ruffino", "Tom Gore", "Robert Mondavi Winery", "Luchese", "Kim Crawford"]
          // ["Kim Crawford", "Luchese"]
          // ["Tom Gore"]
          // ["Robert Mondavi Winery"]
        }
      }).fetch();

    // pull out account_id from the documents
    idArray = _.map(idArray, function (el) { return el.account_id})

    const campaignBasicsArray = CampaignBasics.find(
      {account_id:
        {$in: idArray}
      }).fetch()
    console.log('length of basicsArray', campaignBasicsArray.length)
    let campIdArray = _.filter(campaignBasicsArray, function (el) {

      if (moment().isAfter(moment(el.start_time, "MM-DD-YYYY hh:mm a"))) {
        return el.campaign_id
      }
    });

    // needed to use map here because filter returns the whole object
    // map allows us to have an array of only campaign_id's
    campIdArray = _.map(campIdArray, function (el) {
      return el['campaign_id'];
    });


    // campIdArray is an array of all the campaign ID's that are associated
    // with the accounts we originally searched for
    console.log(campIdArray);
    console.log('length of campIdArray', campIdArray.length);

    if (campIdArray && campaignBasicsArray) {
      let counter = 0;

      const setIntervalId = Meteor.setInterval(function () {

        CampaignInsights.remove({'data.campaign_id': null});

        let campaignData = CampaignInsights.findOne({'data.campaign_id': campIdArray[counter]});

        if (counter >= campIdArray.length) {
          console.log('nothing to do in cronCampaignInsights');
          counter++;
          Meteor.clearInterval(setIntervalId);
        } else if ((campaignData && campaignData.data.inserted) && (moment(campaignData.data.inserted, "MM-DD-YYYY").isAfter(moment(campaignData.data.date_stop, "MM-DD-YYYY")))) {
          console.log('counter', counter);
          console.log('no need to update data');
          counter++;

        } else {

          console.log('getInsights background job running');
          console.log("counter", counter)
          CampaignInsights.remove({'data.campaign_id': campIdArray[counter]});
          let insightsArray = [];
          let masterArray = [];
          let insights;
          let data = {};
          try {
            let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+campIdArray[counter]+'/insights?fields=account_id, campaign_name, cost_per_unique_click,cost_per_total_action,cost_per_10_sec_video_view,cpm,cpp,ctr,impressions,objective,reach,frequency,relevance_score,spend,total_actions,total_unique_actions,video_10_sec_watched_actions,video_15_sec_watched_actions,video_avg_pct_watched_actions,video_30_sec_watched_actions,video_avg_sec_watched_actions,video_p100_watched_actions,video_complete_watched_actions,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p95_watched_actions,unique_impressions,unique_clicks,campaign_id,adset_id,estimated_ad_recall_rate,estimated_ad_recallers,cost_per_estimated_ad_recallers,actions, website_ctr, website_clicks,cost_per_action_type&access_token='+token+'', {});
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
                      data["cost_per_"+el.action_type] = mastFunc.makeMoney(el.value);
                    } else {
                      data["cost_per_"+el.action_type] = mastFunc.makeMoney(el.value);
                    }
                  });
                } else if (key == "website_ctr") {
                  el[key].forEach(el => {
                    data[el.action_type+"_ctr"] = el.value;
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
            // overwrites data already in object with formatted values
            // unformat for aggregating data reasons. needed it to be integer
            data['cpl'] = accounting.unformat(data.cost_per_like);
            data['impressions'] = parseInt(data.impressions);
            data['cpm'] = data.cpm;
            data['cpp'] = accounting.formatMoney(data.cpp, "$", 2);
            data['inserted'] = moment().format("MM-DD-YYYY hh:mm a");
            data['cost_per_unique_click'] = mastFunc.makeMoney(data.cost_per_unique_click);
            data['cost_per_total_action'] = mastFunc.makeMoney(data.cost_per_total_action);
            data['clicks'] = Math.round((data['ctr'] / 100) * data['impressions']);
            data['cpc'] = data.spend / data.clicks;
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

            // add check for when campaign_name is null
            if (data && data.campaign_name) {
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

              Initiatives.update(   // assign campaign id and name to matching initiative
                {name: inits.name},
                {$addToSet: {
                  campaign_names: data.campaign_name,
                  campaign_ids: data.campaign_id
                }
              });
            }

          } catch(e) {
            console.log(e);
          }
          // end of initiative matching

          // put the data object into Mongo
          try {
            CampaignInsights.insert({
              data: data
            });
            console.log('Insight successfully inserted!');
          } catch(e) {
            console.log('error while inserting into collection:', e);
          }
        counter++;
        } // end of if (counter >= arr.length)
      }, 4000) // end of setInterval
    } // end of if
  } //end of job
}); // end of SyncedCron.add


