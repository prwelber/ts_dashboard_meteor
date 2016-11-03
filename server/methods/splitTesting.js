import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
const token = require('/server/token/token.js');

Meteor.methods({
  'createSplitTest': (data) => {
    console.log('from split test function', data)


    var formData = {
      'name': data.name,
      'description': data.description,
      'start_time': data.start,
      'end_time': data.end,
      'type': 'SPLIT_TEST',
      'cells': [{name: 'Group A', treatment_percentage: 50, adsets: [data.a]}, {name: 'Group B', treatment_percentage: 50, adsets: [data.b]}],
      'access_token': token.token
    }


    return 'this is the return statement'
  }
})
