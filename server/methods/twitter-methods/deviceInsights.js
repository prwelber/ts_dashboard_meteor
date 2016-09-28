// import CampaignInsights from '/collections/CampaignInsights';
// import Initiatives from '/collections/Initiatives';
// import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays'
import { TwitterAdsAPI } from 'meteor/fallentech:twitter-ads';
import { Meteor } from 'meteor/meteor';
// import MasterAccounts from '/collections/MasterAccounts';
import tz from 'moment-timezone';
import { HTTP } from 'meteor/http';

const makeNewStart = function makeNewStart (date) {
  let newStart;
  newStart = moment(date).startOf('day');
  newStart = newStart.toISOString().slice(0,19) + 'Z';
  return newStart;
}

Meteor.methods({
  getTwitterDeviceInsights: (accountId, campaignId, start, stop, name, deviceId) => {

    let newStart;
    let newStop;

    if (moment(stop).diff(moment(start), 'd') > 45) {
      if (moment(stop).diff(moment(), 'd') >= 1) {
        // if end is beyond today's date, get last 45 days
        newStop = moment().startOf('day').toISOString().slice(0,19) + 'Z';
        // stop date is today
        newStart = moment().startOf('day').subtract(45, 'd').toISOString().slice(0,19) + 'Z';
      } else {
        newStop = moment(start).add(45, 'd');
        newStop = moment(newStop).startOf('day');
        newStop = newStop.toISOString().slice(0,19) + 'Z';
        newStart = makeNewStart(start);
      }
    } else {
      newStart = makeNewStart(start);
      newStop = moment(stop).startOf('day');
      newStop = newStop.toISOString().slice(0,19) + 'Z';
    }


    console.log('times - start, stop', newStart, newStop)

    var T = TwitterAdsAPI({
      consumer_key: Meteor.settings.consumer_key,
      consumer_secret: Meteor.settings.consumer_secret,
      access_token: Meteor.settings.access_token,
      access_token_secret: Meteor.settings.access_token_secret,
      sandbox: false
    });

    const payload = {
      account_id: accountId,
      entity: 'CAMPAIGN',
      entity_ids: campaignId,
      start_time: newStart,
      end_time: newStop,
      granularity: 'TOTAL',
      metric_groups: 'ENGAGEMENT',
      segmentation_type: 'DEVICES',
      placement: 'ALL_ON_TWITTER',
      platform: deviceId
      // platform is required for device segmentation 0 is iOS
      // 1 is Android 3 is Mobile other 4 = desktop
    }
    let result;

    try {
      result = T.post(`/stats/jobs/accounts/${accountId}`, payload);
    } catch (e) {
      console.log('Err with TW request', e);
    }
    console.log('RESULT.TWITTERBODY', result.twitterBody);
    let pollResult;
    let counter = 0;
    let pollURL;

    const intervalID = Meteor.setInterval(() => {
      if (counter >= 15) { Meteor.clearInterval(intervalID); }

      const pollPayload = {
        account_id: accountId,
      }

      let poll = T.get(`/stats/jobs/accounts/${accountId}`, pollPayload);

      console.log('POLLING AGAIN w/ counter', counter);
      pollResult = poll.twitterBody.data[0];

      if (pollResult.url) {
        console.log('URL FOUND!', pollResult.url);
        pollURL = pollResult.url;

        let getGZIP;

        if (pollURL) {
          console.log('pollURL true, getGZIP running')

          const zlib = require('./node-zlib.js');
          // this is a patch I found on SO site below
          // http://stackoverflow.com/questions/35483400/zlib-gunzipsync-is-not-in-node-js-used-in-meteorhacksnpm

          var request = require('request');
          // had major issues with unzipping the response.
          // key here was to include encoding: null as a parameter

          request(
            { method: 'GET', uri: pollURL, gzip: true, encoding: null },
            function (err, response, body) {
              // console.log('the response is', response)
              zlib.gunzip(body, function(err, unzipped) {
                console.log('UNZIPPED', JSON.parse(unzipped))
                var deviceData = JSON.parse(unzipped);
                console.log('DEVICE DATA ID_DATA', deviceData.data[0].id_data);
                deviceData.data[0].id_data.forEach(el => {
                  console.log(el.segment.segment_name)
                  console.log('impressions', el.metrics.impressions)
                  console.log('clicks', el.metrics.clicks)
                });
              });
            }
          ) // end of request

        } // -------- END OF if (pollURL) -------- //

        Meteor.clearInterval(intervalID);
      }
      counter++;
    }, 1000 * 7);
  }
})
