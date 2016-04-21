const later = require('later');
import { Meteor } from 'meteor/meteor'
import CampaignInsights from '/collections/CampaignInsights'

SyncedCron.config({
  collectionName: 'cronCollection'
});

SyncedCron.add({
  name: "Hourly Breakdown Background Getter",
  schedule: function (parser) {
    return parser.text('at 3:32pm');
  },

  job: function (time) {

    let insightIdArray = CampaignInsights.find(
      {'data.campaign_name': {$regex: /Crawford/i}}
    ).fetch();

    idArray = _.filter(insightIdArray, (el) => {
      if (moment().isAfter(moment(el.data.date_start, "MM-DD-YYYY hh:mm a"))) {
        return el
      }
    });
    idArray = _.map(idArray, (el) => {
      return el.data.campaign_id;
    });

    if (idArray.length >= 1) {

      let counter = 0;

      const setIntervalId = Meteor.setInterval(function () {

        console.log('start of interval');
        const hourlyBreakdown = HourlyBreakdowns.findOne({
          'data.campaign_id': idArray[counter]
        });

        if (counter >= idArray.length) {
          console.log('nothing to do in cronHourlyBreakdowns');
          counter++;
          Meteor.clearInterval(setIntervalId);
        } else if ((hourlyBreakdown && hourlyBreakdown.data.inserted) && (moment(hourlyBreakdown.data.inserted, "MM-DD-YYYY").isAfter(moment(hourlyBreakdown.data.date_stop, "MM-DD-YYYY")))) {
          console.log('counter', counter);
          console.log('no need to update old data');
          counter++;
          // if (moment(hourlyBreakdown.data.inserted, "MM-DD-YYYY").isAfter(moment(hourlyBreakdown.data.date_stop, "MM-DD-YYYY"))) {
          //   console.log('inserted is after date stop');
          //   counter++;
          // }
        } else {

          console.log('hourlyBreakdown background job running');
          console.log('counter', counter);
          // remove old version
          HourlyBreakdowns.remove({'data.campaign_id': idArray[counter]});

          // this begins the portion of code taken from server method

          let hourlyArray = [],
              masterArray = [],
              hourlyBreakdown;

          let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/'+idArray[counter]+'/insights?fields=cpm,cpp,ctr,spend,account_id,campaign_id,campaign_name,date_start,date_stop,impressions,objective,reach,video_10_sec_watched_actions,video_15_sec_watched_actions,video_30_sec_watched_actions,video_avg_sec_watched_actions,video_avg_pct_watched_actions,video_complete_watched_actions,cost_per_action_type,actions&breakdowns=hourly_stats_aggregated_by_audience_time_zone&access_token='+token+'', {});

          hourlyBreakdown = result;
          hourlyArray.push(hourlyBreakdown.data.data);
          hourlyArray = _.flatten(hourlyArray);

          hourlyArray.forEach(el => {
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
                    data["cost_per_"+el.action_type] = mastFunc.makeMoney(el.value);
                  } else {
                    data["cost_per_"+el.action_type] = mastFunc.makeMoney(el.value);
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
            let reResult = data['hourly_stats_aggregated_by_audience_time_zone'].match(/\d\d:\d\d:\d\d/);
            data['hour'] = reResult[0];
            data.hour = moment(data.hour, 'hh:mm:ss').format('hh:mm a');
            data['impressions'] = parseInt(data.impressions);
            data['cpm'] = mastFunc.makeMoney(data.cp);
            data['cpp'] = mastFunc.makeMoney(data.cp);
            data['inserted'] = moment().format("MM-DD-YYYY hh:mm a");
            data['clicks'] = Math.round((data['ctr'] / 100) * data['impressions']);
            data['cpc'] = mastFunc.makeMoney(data.spend / data.clicks);
            data['date_stop'] = moment(data.date_stop, "YYYY-MM-DD").format("MM-DD-YYYY hh:mm a");
            masterArray.push(data);
          });

          try {
            masterArray.forEach(el => {
              HourlyBreakdowns.insert({
                data: el
              });
            });
          } catch(e) {
            console.log("Error inserting into DB:", e);
          }
          counter++;

        } // end of else block in if (counter >= ...)
      }, 5000); // end of Meteor.setInterval
    } // end of if (idArray.length)
  } // end of job
}); // end of SyncedCron.add
