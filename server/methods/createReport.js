import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
const token = require('/server/token/token.js');

// ------------------------ FUNCTIONS ------------------------- //
const buildQuery = function buildQuery (start, end, performance, actions, campaignNum, lineItem) {
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
    query += 'actions,cost_per_action_type,clicks,cpc,website_clicks,'
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

  const requestString = createQuery(query, time, campaignNum, token.token);

  var result =  HTTP.call('GET', requestString);
  return result;
}

const createQuery = function createQuery (query, time, campNum, accessToken) {
  let string = `https://graph.facebook.com/v2.6/${campNum}/insights?fields=${query}&${time}&access_token=${accessToken}`;
  return string;
}

// ------------------------ END OF FUNCTIONS ------------------------- //

Meteor.methods({
  createReport: (start, end, performance, actions, campNum) => {
    let data = buildQuery(start, end, performance, actions, campNum);
    return data.data.data[0];
  }
});
