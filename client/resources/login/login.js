import { Meteor } from 'meteor/meteor';

Template.login.helpers({

});


Template.login.events({

})

if (Meteor.loggingIn()) {
  console.log("Meteor.LoggingIn()")
}
