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

  console.log(performance, actions)

  let query = '';

  for (let i = 0; i < performance.length; i++) {
    query += performance[i] + ','
  }

  if (actions[0]) {
    query += 'actions,cost_per_action_type,'
  }

  query = query.slice(0, query.length - 1);

  const requestString = createQuery(query, time, campaignNum, token.token);

  var result =  HTTP.call('GET', requestString);
  return result;
}

const createQuery = function createQuery (query, time, campNum, accessToken) {
  let string = `https://graph.facebook.com/v2.6/${campNum}/insights?fields=${query}&${time}&access_token=${accessToken}`;
  console.log('string from createQuery', string);
  return string;
}

// ------------------------ END OF FUNCTIONS ------------------------- //

Meteor.methods({
  createReport: (start, end, performance, actions, campNum) => {
    console.log('createReport is running');
    let data = buildQuery(start, end, performance, actions, campNum);
    console.log("data from createReport", data.data.data[0])
    return data.data.data[0];
  }
});
