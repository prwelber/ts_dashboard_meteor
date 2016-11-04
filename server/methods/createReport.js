import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { apiVersion } from '/server/token/token';
const token = require('/server/token/token.js');

// ------------------------ FUNCTIONS ------------------------- //
const buildQuery = function buildQuery (start, end, performance, actions, campaignNum, lineItem, daily) {
  let time;
  if (start && end) {
    time = `time_range={'since':'${start}','until':'${end}'}`;
  } else {
    time = `date_preset=lifetime`;
  }
  let query = '';

  for (let i = 0; i < performance.length; i++) {
    query += performance[i] + ','
  }

  if (actions[0]) {
    query += 'actions,cost_per_action_type,clicks,cpc,cpm,website_clicks,'
  }

  if (actions.indexOf('video_10_sec_watched_actions') >= 0) {
    query += 'video_10_sec_watched_actions,'
  }
  if (actions.indexOf('video_30_sec_watched_actions') >= 0) {
    query += 'video_30_sec_watched_actions,'
  }
  if (actions.indexOf('video_avg_pct_watched_actions') >= 0) {
    query += 'video_avg_pct_watched_actions,'
  }


  query = query.slice(0, query.length - 1); //remove last comma
  if (daily) {
    query += '&time_increment=1';
  }

  const requestString = createQuery(query, time, campaignNum, token.token);
  var report;
  var reportArray = [];
  try {
    var result =  HTTP.call('GET', requestString);
    report = result;
    report.data.data.forEach(el => {
      reportArray.push(el);
    });
    while (true) {
      try {
        report = HTTP.call('GET', report.data.paging['next'], {});
        report.data.data.forEach(el => {
          reportArray.push(el);
        });
      } catch(e) {
        console.log('no more pages', e);
        break;
      }
    }
  } catch(e) {
    console.log('error in outer try in create report', e);
  }
  return reportArray;
}

const createQuery = function createQuery (query, time, campNum, accessToken) {
  let string = `https://graph.facebook.com/${apiVersion}/${campNum}/insights?fields=${query}&${time}&access_token=${accessToken}`;
  return string;
}

// ------------------------ END OF FUNCTIONS ------------------------- //

Meteor.methods({
  createReport: (start, end, performance, actions, campNum, lineItem, daily) => {
    let data = buildQuery(start, end, performance, actions, campNum, lineItem, daily);

    if (daily) {
      return data;
    } else {
      return data[0];
    }
  }
});
