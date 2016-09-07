import { Meteor } from 'meteor/meteor';
import BoostTargeting from '/collections/BoostTargeting';

Meteor.methods({
  createBoostTargeting: (data) => {

    BoostTargeting.insert({
      created: moment().toISOString(),
      name: data.name,
      gender: data.genderBoxes,
      minAge: data.minAge,
      maxAge: data.maxAge,
      location: data.location,
      interests: data.interests,
      connections: data.connections
    });
    return 'success!'
  },
  deleteBoostTargeting: (id) => {
    BoostTargeting.remove({_id: id});
  },
  updateBoostTargeting: () => {

  }
});



Meteor.publish('BoostTargeting', function (opts) {
  return BoostTargeting.find();
});
