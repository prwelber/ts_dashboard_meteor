import CampaignInsights from '/collections/CampaignInsights';
import Initiatives from '/collections/Initiatives';
import CampaignBasics from '/collections/CampaignBasics';
import { TwitterAdsAPI } from 'meteor/fallentech:twitter-ads';
import { Meteor } from 'meteor/meteor';

Meteor.methods({

  'getTwitterInsights': (campId, accountId, start, end) => {
    if (campId === undefined) { return; }
    console.log(campId, accountId, start, end);

    var T = TwitterAdsAPI({
      consumer_key: Meteor.settings.consumer_key,
      consumer_secret: Meteor.settings.consumer_secret,
      access_token: Meteor.settings.access_token,
      access_token_secret: Meteor.settings.access_token_secret,
      sandbox: false
    });

    const fixTime = function fixTime(time) {
      // start.startOf('hour').add(1, 'hour').toString()
      let times = {};
      let newTime = moment(time, moment.ISO_8601).startOf('day');
      times['start'] = newTime.toISOString().slice(0,19) + 'Z';
      // add 7 days
      times['end'] = newTime.add(7, 'days').toISOString().slice(0,19) +'Z';
      return times;
    }

    const makeStart = function makeStart(prevEnd) {
      let start = moment(prevEnd, moment.ISO_8601).add(1, 'd').toISOString().slice(0,19) + 'Z';
      return start;
    }

    const makeEnd = function makeEnd(start) {
      let end = moment(start, moment.ISO_8601).add(6, 'd').toISOString().slice(0,19) + 'Z';
      return end;
    }

    const diff = moment(end, moment.ISO_8601).diff(moment(start, moment.ISO_8601), 'd');
    console.log('diff', diff);

    start = fixTime(start)['start'];
    end = fixTime(start)['end'];
    console.log('start and end', start, end)

    let counter = 0;

    const intervalID = Meteor.setInterval(function() {
      counter++;
      console.log("START and END", start, end)

      const payload = {
        account_id: accountId,
        entity: 'CAMPAIGN',
        entity_ids: campId,
        start_time: start,
        end_time: end,
        granularity: 'TOTAL',
        metric_groups: 'ENGAGEMENT,BILLING',
        placement: 'ALL_ON_TWITTER'
      }



      result = T.get(`/stats/accounts/${accountId}`, payload);
      console.log(result.twitterBody.data[0].id_data[0]);

      // start = end + 1
      start = makeStart(end);

      // end = start + 6
      end = makeEnd(start)

      if (counter >= 2) {
        console.log('CLEARING INTERVAL')
        Meteor.clearInterval(intervalID);
      }
    }, 2000);


      //

      // for requesting async job


      // console.log('billing results', result.twitterBody)
      // console.log('result for stats/accounts', result.twitterBody.data[0].id_data[0])
      // // this below log gave me the impression number as an array, ex. [3361]
      // console.log('result for stats/accounts with impressions', result.twitterBody.data[0].id_data[0].metrics.impressions)

    return 'hi'
  }

});
