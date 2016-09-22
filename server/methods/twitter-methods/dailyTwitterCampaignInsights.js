import CampaignInsights from '/collections/CampaignInsights';
import Initiatives from '/collections/Initiatives';
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays'
import { TwitterAdsAPI } from 'meteor/fallentech:twitter-ads';
import { Meteor } from 'meteor/meteor';
import MasterAccounts from '/collections/MasterAccounts';
import tz from 'moment-timezone';


// ------------------ FUNCTIONS ------------------ //
// had to set time to midnight of account timezone
const fixTime = function fixTime(time, timezone) {
  // start.startOf('hour').add(1, 'hour').toString()
  let times = {};
  let newTime = moment(time, moment.ISO_8601).startOf('day').tz(timezone);
  console.log('newTime',newTime.toString())
  times['start'] = newTime.toISOString().slice(0,19) + 'Z';
  // add 7 days
  times['end'] = newTime.add(7, 'days').toISOString().slice(0,19) +'Z';
  return times;
}

const makeStart = function makeStart(prevEnd, timezone) {
  let start = moment(prevEnd, moment.ISO_8601).tz(timezone)

  start = start.toISOString().slice(0,19) + 'Z';
  return start;
}

const makeEnd = function makeEnd(start, timezone) {
  let end = moment(start, moment.ISO_8601).add(7, 'd').tz(timezone)

  end = end.toISOString().slice(0,19) + 'Z';
  return end;
}

const checkNull = function checkNull(dataPoint) {
  if (dataPoint instanceof Array) {
    return dataPoint[0];
  } else {
    return 0;
  }
}




Meteor.methods({

  'getDailyTwitterInsights': (campId, accountId, start, end, campaignName, initName) => {
    if (campId === undefined || start === undefined || end === undefined) {
      return;
    }

    const account = MasterAccounts.findOne({'data.account_id': accountId});
    const timeZone = account.data.timezone;
    const cleanInitName = initName.replace(/_/g, " ");

    const originalStart = fixTime(start, timeZone)['start']
    const originalEnd = fixTime(end, timeZone)['start'];
    console.log('original times', originalStart, originalEnd);

    console.log(campId, accountId, start, end);

    var T = TwitterAdsAPI({
      consumer_key: Meteor.settings.consumer_key,
      consumer_secret: Meteor.settings.consumer_secret,
      access_token: Meteor.settings.access_token,
      access_token_secret: Meteor.settings.access_token_secret,
      sandbox: false
    });


    const diff = moment(end, moment.ISO_8601).diff(moment(start, moment.ISO_8601), 'd');
    const loops = Math.ceil(diff / 7);
    console.log('diff', diff, loops);

    start = fixTime(start, timeZone)['start'];
    end = fixTime(start, timeZone)['end'];
    console.log('start and end', start, end)

    let counter = 0;

    // will hold all the individual days
    const dayArray = [];

    // -------- START OF INTERVAL -------- //
    const intervalID = Meteor.setInterval(function() {
      counter++;
      console.log("START and END", start, end)

      const payload = {
        account_id: accountId,
        entity: 'CAMPAIGN',
        entity_ids: campId,
        start_time: start,
        end_time: end,
        granularity: 'DAY',
        metric_groups: 'ENGAGEMENT,BILLING,MEDIA',
        placement: 'ALL_ON_TWITTER'
      }
      let result;
      let dataResult;
      try {

        result = T.get(`/stats/accounts/${accountId}`, payload);
        dataResult = result.twitterBody.data[0].id_data[0].metrics;
        // console.log(result.twitterBody.data[0].id_data[0].metrics);

      } catch (e) {
        console.log('Error pulling twitter API daily insights - clearing interval', e);
        Meteor.clearInterval(intervalID);
        return "error";
      }


      for (let i = 0; i <= 6; i++) {

        let day = {};
        dataResult.impressions instanceof Array ? day['impressions'] = dataResult.impressions[i] : day['impressions'] = 0;
        // day['impressions'] = dataResult.impressions[i];
        // day['tweets_send'] = dataResult.tweets_send[i];

        dataResult.billed_charge_local_micro instanceof Array ? day['spend'] = dataResult.billed_charge_local_micro[i] / 1000000 : day['spend'] = 0;

        // day['spend'] = dataResult.billed_charge_local_micro[i] / 1000000;
        // day['follows'] = dataResult.follows[i];
        // day['retweets'] = dataResult.retweets[i];
        // day['likes'] = dataResult.likes[i];

        dataResult.engagements instanceof Array ? day['engagements'] = dataResult.engagements[i] : day['engagements'] = 0;

        // day['engagements'] = dataResult.engagements[i];
        dataResult.clicks instanceof Array ? day['clicks'] = dataResult.clicks[i] : day['clicks'] = 0;

        // day['clicks'] = dataResult.clicks[i];
        dataResult.media_views instanceof Array ? day['media_views'] = dataResult.media_views[i] : day['media_views'] = 0;

        // day['media_views'] = dataResult.media_views[i];
        // day['card_engagements'] = dataResult.card_engagements[i];
        // day['replies'] = dataResult.replies[i];
        // day['url_clicks'] = dataResult.url_clicks[i];
        // day['follows'] = dataResult.follows[i];
        day['initiative'] = cleanInitName;
        day['inserted'] = moment().toISOString();
        day['date_start'] = moment(start).add(i, 'd').toISOString();
        day['campaign_name'] = campaignName;
        day['campaign_id'] = campId;
        day['account_id'] = accountId;
        day['platform'] = 'twitter';
        day['cpm'] = day.spend / (day.impressions / 1000);
        day['cpc'] = day.spend / day.clicks;
        day['cpe'] = day.spend / day.engagements;

        dayArray.push(day);

      }


      // start = end + 1
      start = makeStart(end, timeZone);

      // end = start + 6
      end = makeEnd(start, timeZone)


      if (counter >= loops) {
        console.log('CLEARING INTERVAL')

        const lineItem = T.get(`/accounts/${accountId}/line_items`, {campaign_ids: campId});
        // console.log("lineItem", lineItem.twitterBody)
        const objective = lineItem.twitterBody.data[0].objective;
        // CampaignInsights.remove({'data.campaign_id': campId});


        for (let i = 0; i < dayArray.length; i++) {
          if (dayArray[i].impressions === 0 && dayArray[i].clicks === 0 && dayArray[i].spend === 0) {
            delete dayArray[i];
          }
        }



        console.log('DAY ARRAY LENGTH', dayArray.length);
        const cleanedDays = _.without(dayArray, undefined, null, NaN);
        console.log('CLEANED DAYS LENGTH', cleanedDays.length)
        console.log(cleanedDays[0], cleanedDays[1], cleanedDays[cleanedDays.length - 2], cleanedDays[cleanedDays.length - 1]);

        cleanedDays.forEach(el => {
          el['objective'] = objective
        });

        cleanedDays.forEach(el => {
          InsightsBreakdownsByDays.insert({
            data: el
          });
        });


        Meteor.clearInterval(intervalID);
      }
    }, 1500);

      // console.log('result for stats/accounts', result.twitterBody.data[0].id_data[0])
      // // this below log gave me the impression number as an array, ex. [3361]
      // console.log('result for stats/accounts with impressions', result.twitterBody.data[0].id_data[0].metrics.impressions)

    return 'hi'
  }
});
