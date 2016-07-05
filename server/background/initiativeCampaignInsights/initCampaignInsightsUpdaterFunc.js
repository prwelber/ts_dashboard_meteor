import Initiatives from '/collections/Initiatives'
import CampaignBasics from '/collections/CampaignBasics'
import CampaignInsights from '/collections/CampaignInsights'
import { Meteor } from 'meteor/meteor'
import { apiVersion } from '/server/token/token';
const token = require('/server/token/token.js');


// large function ... background checker is below
const filterData = function filterData (array) {
  let data = {};
  array.forEach(el => {
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
  return data;
}



export function insightUpdate(array) {
  if (array.length >= 1) {
    let counter = 0;
    console.log('Running campaign insight background func with length of array', array.length)

    const setIntervalId = Meteor.setInterval(() => {

      if (counter >= array.length) {
        console.log('clearInterval');
        counter++;
        Meteor.clearInterval(setIntervalId);
      }
      else {
        const camp = CampaignInsights.findOne({'data.campaign_id': array[counter]});
        let originalInitiative;
        try {
          if (camp.data.initiative) {
            originalInitiative = camp.data.initiative;
          }
        } catch(e) {
          console.log("Error assigning original Initiative in initCampaignInsightsUpdaterFunc", e);
          console.log("Pushing up counter");
          counter++;
        }


        //remove old version and any null values
        CampaignInsights.remove({'data.campaign_id': array[counter]});
        CampaignInsights.remove({'data.campaign_id': null});

        // this begins the insight download
        let insightsArray = [];
        let masterArray = [];
        let insightData;
        let insights;

        try {
          let result = HTTP.call('GET', 'https://graph.facebook.com/'+apiVersion+'/'+array[counter]+'/insights?fields=account_id, campaign_name, cost_per_unique_click,cost_per_total_action,cost_per_10_sec_video_view,cpm,cpp,ctr,impressions,objective,reach,frequency,relevance_score,spend,total_actions,total_unique_actions,video_10_sec_watched_actions,video_15_sec_watched_actions,video_avg_pct_watched_actions,video_30_sec_watched_actions,video_avg_sec_watched_actions,video_p100_watched_actions,video_complete_watched_actions,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p95_watched_actions,unique_impressions,unique_clicks,campaign_id,adset_id,estimated_ad_recall_rate,estimated_ad_recallers,cost_per_estimated_ad_recallers,actions, website_ctr, website_clicks,cost_per_action_type&date_preset=lifetime&access_token='+token.token+'', {});
            insights = result;
            insightsArray.push(insights.data.data[0]);
            // at this point we just have one array with
            // an object in it, with a few nested arrays
            // of objects

            // push into the masterArray the returned result of filterData
            // filterData is function defined above
            insightData = filterData(insightsArray)
            masterArray.push(insightData);
        } catch(e) {
          console.log("error pulling campaign insight", e);
        }

        // where we search initiatives looking for the one that matches

        /*
        decided to remove this for now because it was assigning unwanted campaigns to
        initiatives, thus causing the data to be inaccurate
        Also, a feature for reassigning campaigns and their initiatives is built,
        so that may be the best way to match campaigns + initiatives
        */

        try {


          if (originalInitiative) {
            insightData['initiative'] = originalInitiative;
          } else {
            Initiatives._ensureIndex({
              "search_text": "text"
            });
              // add check for when campaign_name is null
            if (insightData && insightData.campaign_name) {
              let inits = Initiatives.find(
                {$text: { $search: insightData.campaign_name}},
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
              insightData['initiative'] = inits.name; //assign initiative name to data object

              Initiatives.update(   // assign campaign id and name to matching initiative
                {name: inits.name},
                {$addToSet: {
                  campaign_names: insightData.campaign_name,
                  campaign_ids: insightData.campaign_id
                }
              });
            }
          }

        } catch(e) {
            console.log(e);
        }

        // ends initiative matching

        try {
          CampaignInsights.update(
            {'data.campaign_id': insightData.campaign_id},
            {data: insightData},
            {upsert: true}
          );
        } catch(e) {
          // statements
          console.log("error inserting updated camp insight:", e);
        }
        counter++;
      } // end of else
    }, 30000); // end of Meteor.setInterval
  } // end of if array.length >= 1
} // end of export function
