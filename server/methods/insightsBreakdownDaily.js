import { Meteor } from 'meteor/meteor'
import { HTTP } from 'meteor/http'
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays'
import Initiatives from '/collections/Initiatives'
import CampaignInsights from '/collections/CampaignInsights'
import { apiVersion } from '/server/token/token'

Meteor.methods({
  'removeDaily': function () {
    console.log('removing InsightsBreakdownByDays collection')
    InsightsBreakdownsByDays.remove( {} )
  }
});

Meteor.methods({
  'getDailyBreakdown': function (accountNumber) {
    let dailyBreakdownArray = [];
    let masterArray = [];
    let breakdown;
    try {
        let result = HTTP.call('GET', 'https://graph.facebook.com/'+apiVersion+'/'+accountNumber+'/insights?fields=date_start,date_stop,campaign_id,campaign_name,objective,total_actions,impressions,spend,reach,ctr,cpm,cpp,actions,cost_per_action_type&time_increment=1&date_preset=lifetime&access_token='+token+'', {});
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
          data['impressions'] = parseFloat(data.impressions);
          data['campaign_name'] = data.campaign_name;
          data['cpl'] = accounting.formatMoney(data.spend / data.like, "$", 2);
          data['clicks'] = Math.round((data['ctr'] / 100) * data['impressions']);
          data['cpc'] = accounting.formatMoney((data.spend / data.clicks), "$", 2);
          // data['spend'] = accounting.formatMoney(data.spend, "$", 2);
          data['date_start'] = moment(data['date_start'], "YYYY-MM-DD").toISOString();
          masterArray.push(data);


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
            }
          } catch(e) {
            console.log("Error assigning Initiative to Daily Breakdown", e);
          }
          // end of initiative matching
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
  },
  'refreshDaily': (campNum) => {
    InsightsBreakdownsByDays.remove({'data.campaign_id': campNum});
    return "success!";
  }
});


Meteor.publish('insightsBreakdownByDaysList', function (opts, start, end) {
  if(opts.spending === "spending" && start) {
    return InsightsBreakdownsByDays.find(
      {
        'data.date_start': {$gte: start, $lte: end},
      },
      {fields:
        {'data.date_start': 1, 'data.date_stop': 1, 'data.campaign_name': 1, 'data.campaign_id': 1, 'data.spend': 1, 'data.impressions': 1, 'data.clicks': 1, 'data.like': 1}
      });
  }

  if (opts.toString().length <= 15) {
    // const insight = CampaignInsights.findOne({'data.campaign_id': opts});
    // if (insight && insight.data.initiative) {
      return InsightsBreakdownsByDays.find({'data.campaign_id': opts});
    // }
  } else if (opts.length >= 16) {
      const initiative = Initiatives.findOne({_id: opts});
      if (initiative && initiative.name) {
        return InsightsBreakdownsByDays.find({'data.initiative': initiative.name});
      }
  } else {
    return InsightsBreakdownsByDays.find({});
  }
});
