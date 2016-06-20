import CampaignInsights from '/collections/CampaignInsights';
import Initiatives from '/collections/Initiatives';
import { apiVersion } from '/server/token/token';
import CampaignBasics from '/collections/CampaignBasics';

Meteor.startup(function () {
  CampaignInsights._ensureIndex({campUniqueId: 1});
});

Meteor.methods({
  'removeInsights': function (id) {
    console.log('removing CampaignInsightList collection')
    if (id) {
      CampaignInsights.remove( {'data.campaign_id': id} )
    } else {
      CampaignInsights.remove( {} );
    }
    return "CampaignInsights removed!";
  }
});

//TODO use server session here to look up originalInitiative and pass it to getInsights
// for when user refreshes data --- or maybe we can send init to server with meteor.call

Meteor.methods({
  'getInsights': function (accountNumber, end_date) {
    let insightsArray = [];
    let masterArray = [];
    let insights;
    let data = {};
    try {
        let result = HTTP.call('GET', 'https://graph.facebook.com/'+apiVersion+'/'+accountNumber+'/insights?fields=account_id, campaign_name, cost_per_unique_click,cost_per_total_action,cost_per_10_sec_video_view,cpm,cpp,ctr,impressions,objective,reach,frequency,relevance_score,spend,total_actions,total_unique_actions,video_10_sec_watched_actions,video_15_sec_watched_actions,video_avg_pct_watched_actions,video_30_sec_watched_actions,video_avg_sec_watched_actions,video_p100_watched_actions,video_complete_watched_actions,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p95_watched_actions,unique_impressions,unique_clicks,campaign_id,adset_id,estimated_ad_recall_rate,estimated_ad_recallers,cost_per_estimated_ad_recallers,actions, website_ctr, website_clicks,cost_per_action_type&date_preset=lifetime&access_token='+token+'', {});
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
                            el.action_type = el.action_type.replace(/\W/g, "_");
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
        //overwrites data already in object with formatted values
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
    if (! data.campaign_name) {
      data['campaign_name'] = "NA";
    }

    try {
      Initiatives._ensureIndex({
        "search_text": "text"
      });

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

    } catch(e) {
      console.log(e);
    }

    // end of initiative matching

    try {
      // put the data object into Mongo
      CampaignInsights.insert({
        data: data
      })
    } catch(e) {
      console.log('error while inserting into collection:', e);
    }
  },
  'refreshInsight': function (campaign_id, campaign_name, initiativeName) {
    Initiatives.update(
      {name: initiativeName},
      {$pull: {
        campaign_names: campaign_name,
        campaign_ids: campaign_id
      }
    });
    CampaignInsights.remove({'data.campaign_id': campaign_id});
  },
  'removeInitiativeFromCampaignInsight': (name) => {
    CampaignInsights.update(
      {'data.campaign_name': name},
      {$set: {
        'data.initiative': ""
      }
    });
    return "success!";
  },
  'addInitiativeToCampaignInsight': (name, initiative) => {
    CampaignInsights.update(
      {'data.campaign_name': name},
      {$set: {
        'data.initiative': initiative.name
      }
    });
    return "success!";
  },
  changeCampaignInitiative: (campName, initName) => {
    // get campaign Id (findOne)
    // reassign initiative (update)
    // get init Id (findOne)
    // update init campaign arrays with $pull (update) and $push
    //get campaignBasic and edit that initiative
    const basic = CampaignBasics.findOne({'data.name': campName});
    const camp = CampaignInsights.findOne({'data.campaign_name': campName});
    const oldInitiative = camp.data.initiative;

    CampaignInsights.update(
      {_id: camp._id},
      {$set: {
        'data.initiative': initName
        }
      }
    );

    CampaignBasics.update(
      {_id: basic._id},
      {$set: {
        'data.initiative': initName
        }
      }
    );

    if (initName !== "None") {
      const init = Initiatives.findOne({name: initName});
      //update old initiative
      Initiatives.update(
        {name: oldInitiative},
        {$pull: {
          campaign_names: campName,
          campaign_ids: camp.data.campaign_id
          }
        }
      )
      //update new initiative
      Initiatives.update(
        {name: initName},
        {$addToSet: {
          campaign_names: campName,
          campaign_ids: camp.data.campaign_id
          }
        }
      )
    } else if (initName === "None") {
      // only need to update old initiative
      Initiatives.update(
        {name: oldInitiative},
        {$pull: {
          campaign_names: campName,
          campaign_ids: camp.data.campaign_id
          }
        }
      )
    }
    return "successful implementation";
  }
});


Meteor.publish('campaignInsightList', function (opts, searchValue) {
    CampaignInsights._ensureIndex({ "data.campaign_name": "text"});
    if (! opts || searchValue) {
      if (searchValue) {
        return CampaignInsights.find(
          {$text: {$search: searchValue}},
          {
            // `fields` is where we can add MongoDB projections. Here we're causing
            // each document published to include a property named `score`, which
            // contains the document's search rank, a numerical value, with more
            // relevant documents having a higher score.
            fields: {
              score: { $meta: "textScore" }
            },
             // This indicates that we wish the publication to be sorted by the
            // `score` property specified in the projection fields above.
            sort: {
              score: { $meta: "textScore"}
            }
          }
        )
      } else {
        return CampaignInsights.find({}); //publish all insights
      }

    } else if (opts.spending === "spending") {

      return CampaignInsights.find({});

    } else if (/[a-z0-9]{16,18}/i.test(opts) === true) {

      const init = Initiatives.findOne({_id: opts});
      return CampaignInsights.find({'data.initiative': init.name});

    } else {

      return CampaignInsights.find({'data.campaign_id': opts});

    }
});
