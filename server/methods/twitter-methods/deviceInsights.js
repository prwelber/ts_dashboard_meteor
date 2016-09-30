import DeviceAndPlacement from '/collections/DeviceAndPlacement';
import { TwitterAdsAPI } from 'meteor/fallentech:twitter-ads';
import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import tz from 'moment-timezone';

const makeNewStart = function makeNewStart (date) {
  let newStart;
  newStart = moment(date).startOf('day');
  newStart = newStart.toISOString().slice(0,19) + 'Z';
  return newStart;
}

const checkNull = function checkNull(dataPoint) {
  if (dataPoint instanceof Array) {
    return dataPoint[0];
  } else {
    return 0;
  }
}

Meteor.methods({
  getTwitterDeviceInsights: (accountId, campaignId, start, stop, name, deviceId) => {
    let device;
    switch (deviceId) {
      case '0':
        device = 'iOS';
        break;
      case '1':
        device = 'Android';
        break;
      case '3':
        device = 'Mobile Other';
        break;
      case '4':
        device = 'Desktop';
        break;
      default:
        device = 'N/A';
        break;
    }

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
      if (counter >= 30) { Meteor.clearInterval(intervalID); }

      const pollPayload = {
        account_id: accountId,
      }

      let poll = T.get(`/stats/jobs/accounts/${accountId}`, pollPayload);

      console.log('POLLING AGAIN w/ counter', counter);
      pollResult = poll.twitterBody.data[0];

      if (pollResult.url) {
        console.log('URL FOUND!', pollResult.url);
        pollURL = pollResult.url;

        if (pollURL) {

          DeviceAndPlacement.remove({'data.campaign_id': campaignId, 'data.device': device});
          // remove any earlier version

          console.log('pollURL true')

          const zlib = require('./node-zlib.js');
          // this is a patch I found on SO site below
          // http://stackoverflow.com/questions/35483400/zlib-gunzipsync-is-not-in-node-js-used-in-meteorhacksnpm

          var request = require('request');
          // had major issues with unzipping the response.
          // key here was to include encoding: null as a parameter

          request(
            { method: 'GET', uri: pollURL, gzip: true, encoding: null },
            Meteor.bindEnvironment(function (err, response, body) {
              // console.log('the response is', response)
              zlib.gunzip(body, Meteor.bindEnvironment(function(err, unzipped) {
                console.log('UNZIPPED', JSON.parse(unzipped))
                var deviceData = JSON.parse(unzipped);
                console.log('DEVICE DATA ID_DATA', deviceData.data[0].id_data);

                let dataObject = {
                  placement: 'mobile',
                  platform: 'twitter',
                  device: device,
                  campaign_id: campaignId,
                  name: name,
                  deviceVersions: [],
                  impressions: 0,
                  clicks: 0,
                  engagements: 0,
                  insightsStart: newStart,
                  insightsEnd: newStop,
                  created: moment().toISOString()
                }

                if (device === 'Desktop') {
                  dataObject.placement = 'desktop/laptop';
                }

                deviceData.data[0].id_data.forEach(el => {
                  console.log('impressions', el.metrics.impressions)
                  dataObject.deviceVersions.push(el.segment.segment_name);
                  dataObject.impressions += checkNull(el.metrics.impressions);
                  dataObject.clicks += checkNull(el.metrics.clicks);
                  dataObject.engagements += checkNull(el.metrics.engagements);
                });

                console.log('FINISHED DATAOBJECT', dataObject);

                DeviceAndPlacement.insert({data: dataObject});

                return 'finished successfully';

              })); // end of zlib.gunzip callback including Meteor.bindEnvironment
            }) // end of request cb including Meteor.bindEnvironment
          ) // end of request
        } // -------- END OF if (pollURL) -------- //

        Meteor.clearInterval(intervalID);
      }
      counter++;
    }, 1000 * 10); // end of Meteor.setInterval

    return 'finished without insight';

  }
})
