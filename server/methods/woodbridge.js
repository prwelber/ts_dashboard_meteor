import { Meteor } from 'meteor/meteor'
import WoodbridgeDLX from '/imports/collections/WoodbridgeDLX'

Meteor.methods({
  remove: function () {
    console.log('removing woodbridge collection');
    WoodbridgeDLX.remove({});
  }
});

Meteor.publish('WoodbridgeDLX', function () {
  return WoodbridgeDLX.find();
});
