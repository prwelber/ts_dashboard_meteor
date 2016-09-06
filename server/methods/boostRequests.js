import { Meteor } from 'meteor/meteor';
import BoostRequests from '/collections/BoostRequests';
import moment from 'moment-timezone';
import BoostTargeting from '/collections/BoostTargeting';

Meteor.methods({
  createBoostRequest: (payload) => {
    const created = moment().toISOString();
    payload['created'] = created;
    BoostRequests.insert({
      created: created,
      owner: payload.owner,
      initiative: payload.initiative,
      creativeLink: payload.creativeLink,
      creatives: payload.creatives
    });
  },
  deleteBoostRequest: () => {

  },
  updateBoostRequest: () => {

  }
});

Meteor.publish('BoostRequests', function (opts) {
  return BoostRequests.find();
});
