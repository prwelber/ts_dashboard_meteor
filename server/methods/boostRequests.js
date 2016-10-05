import { Meteor } from 'meteor/meteor';
import BoostRequests from '/collections/BoostRequests';
import moment from 'moment-timezone';
import BoostTargeting from '/collections/BoostTargeting';

Meteor.methods({
  createBoostRequest: (payload) => {
    const created = moment().toISOString();
    BoostRequests.insert({
      created: created,
      owner: payload.owner,
      initiative: payload.initiative,
      creativeLink: payload.creativeLink,
      optimization: payload.optimization,
      creatives: payload.creatives,
      notes: payload.notes
    });
    return 'success';
  },
  deleteBoostRequest: (id) => {
    BoostRequests.remove({_id: id});
  },
  updateBoostRequest: (payload) => {
    BoostRequests.update({_id: payload._id}, {
      $set: {
        owner: payload.owner,
        initiative: payload.initiative,
        creativeLink: payload.creativeLink,
        optimization: payload.optimization,
        creatives: payload.creatives,
        notes: payload.notes,
        updated: moment().toISOString()
      }
    });
    return 'updated successfully';
  },
  getByMonth: (month) => {
    console.log('running getByMonth')
    // var result = BoostRequests.aggregate([
    //   {$match:
    //     {"data.initiative": name}
    //   }

    //   {"$project": {
    //     "budget": 1,
    //     "start": 1,
    //     "targeting": 1,
    //     "month": { "$month": "$start" }  // Extra field for "month"
    //   }},

    // // Sort by your month value
    // {"$sort": { "month": 1 }},

    // // Then just clean the extra part from your projection
    // // ( if you need to )
    // {"$project": {
    //     "Name": 1,
    //     "BirthDate": 1,
    //     "Address": 1,
    // }},
    // ])
    console.log('result', result)
  }
});

Meteor.publish('BoostRequests', function (opts) {
  return BoostRequests.find();
});
