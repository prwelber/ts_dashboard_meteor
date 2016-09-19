import CampaignInsights from '/collections/CampaignInsights';
import Initiatives from '/collections/Initiatives';
import CampaignBasics from '/collections/CampaignBasics';
import { TwitterAdsAPI } from 'meteor/fallentech:twitter-ads';
import { Meteor } from 'meteor/meteor';

Meteor.methods({

  'getTwitterInsights': (campId, accountId, start, end, campaignName) => {
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
      let start = moment(prevEnd, moment.ISO_8601).add(1, 'h').toISOString().slice(0,19) + 'Z';
      return start;
    }

    const makeEnd = function makeEnd(start) {
      let end = moment(start, moment.ISO_8601).add({days: 6, hours: 23}).toISOString().slice(0,19) + 'Z';
      return end;
    }

    const checkNull = function checkNull(dataPoint) {
      if (dataPoint instanceof Array) {
        return dataPoint[0];
      } else {
        return 0;
      }
    }

    const diff = moment(end, moment.ISO_8601).diff(moment(start, moment.ISO_8601), 'd');
    const loops = Math.ceil(diff / 7);
    console.log('diff', diff, loops);

    start = fixTime(start)['start'];
    end = fixTime(start)['end'];
    console.log('start and end', start, end)

    let counter = 0;
    campId, accountId, start, end
    let data = {
      impressions: 0,
      spend: 0,
      follows: 0,
      retweets: 0,
      likes: 0,
      engagements: 0,
      clicks: 0,
      media_views: 0,
      card_engagements: 0,
      replies: 0,
      url_clicks: 0,
      billed_engagements: 0,
      carousel_swipes: 0,
      campaign_id: campId,
      account_id: accountId,
      start_date: start,
      end_date: end,
      name: campaignName
      platform: 'twitter'
    }

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
        granularity: 'TOTAL',
        metric_groups: 'ENGAGEMENT,BILLING,MEDIA',
        placement: 'ALL_ON_TWITTER'
      }

      /*
      * maybe i should save this by a total object and also
      * segmented weekly data totals
      * possibly no daily breakdown, just weekly (for now)
      */




      result = T.get(`/stats/accounts/${accountId}`, payload);
      dataResult = result.twitterBody.data[0].id_data[0].metrics;
      console.log(result.twitterBody.data[0].id_data);

      data.impressions        += checkNull(dataResult.impressions);
      data.spend              += checkNull(dataResult.billed_charge_local_micro) / 1000000;
      data.follows            += checkNull(dataResult.follows);
      data.retweets           += checkNull(dataResult.retweets);
      data.likes              += checkNull(dataResult.likes);
      data.engagements        += checkNull(dataResult.engagements);
      data.clicks             += checkNull(dataResult.clicks);
      data.media_views        += checkNull(dataResult.media_views);
      data.card_engagements   += checkNull(dataResult.card_engagements);
      data.replies            += checkNull(dataResult.replies);
      data.url_clicks         += checkNull(dataResult.url_clicks);
      data.billed_engagements += checkNull(dataResult.billed_engagements);
      data.carousel_swipes    += checkNull(dataResult.carousel_swipes);

      // start = end + 1
      start = makeStart(end);

      // end = start + 6
      end = makeEnd(start)

      if (counter >= 5) {
        console.log('CLEARING INTERVAL')
        console.log('DATA', data)
        Meteor.clearInterval(intervalID);
      }
    }, 2000);


      // console.log('result for stats/accounts', result.twitterBody.data[0].id_data[0])
      // // this below log gave me the impression number as an array, ex. [3361]
      // console.log('result for stats/accounts with impressions', result.twitterBody.data[0].id_data[0].metrics.impressions)

    return 'hi'
  }

});
