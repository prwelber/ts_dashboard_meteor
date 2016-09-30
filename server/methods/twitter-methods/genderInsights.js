import InsightsBreakdowns from '/collections/InsightsBreakdowns';
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
  getTwitterGenderInsights: (accountId, campaignId, start, stop, name) => {


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
      metric_groups: 'ENGAGEMENT,BILLING',
      segmentation_type: 'GENDER',
      placement: 'ALL_ON_TWITTER',
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

      if (counter >= 30) {
        console.log('twitter gender polling setInterval expired');
        Meteor.clearInterval(intervalID);
      }

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

          InsightsBreakdowns.remove({'data.campaign_id': campaignId});
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

              zlib.gunzip(body, Meteor.bindEnvironment(function(err, unzipped) {

                console.log('UNZIPPED', JSON.parse(unzipped))
                var genderData = JSON.parse(unzipped);
                console.log('DATA ID_DATA', genderData.data[0].id_data);

                let dataObject = {
                  platform: 'twitter',
                  campaign_id: campaignId,
                  campaign_name: name,
                  insightsStart: newStart,
                  insightsEnd: newStop,
                  created: moment().toISOString(),
                  genderData: []
                }

                genderData.data[0].id_data.forEach(el => {
                  let data = {
                    gender: el.segment.segment_name,
                    impressions: checkNull(el.metrics.impressions),
                    follows: checkNull(el.metrics.follows),
                    retweets: checkNull(el.metrics.retweets),
                    likes: checkNull(el.metrics.likes),
                    engagements: checkNull(el.metrics.engagements),
                    clicks: checkNull(el.metrics.clicks),
                    replies: checkNull(el.metrics.replies),
                    spend: checkNull(el.metrics.billed_charge_local_micro)
                  }
                  dataObject.genderData.push(data);
                });

                console.log('FINISHED DATAOBJECT', dataObject.genderData);

                InsightsBreakdowns.insert({data: dataObject});

                if (dataObject) {
                  return 'finished successfully';
                } else {
                  return 'finished without data';
                }

              })); // end of zlib.gunzip callback including Meteor.bindEnvironment
            }) // end of request cb including Meteor.bindEnvironment
          ) // end of request
        } // -------- END OF if (pollURL) -------- //

        Meteor.clearInterval(intervalID);
      }
      counter++;
    }, 1000 * 10); // end of Meteor.setInterval
    // return 'finished without insight';
  }
})
