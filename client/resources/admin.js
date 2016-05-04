import { Meteor } from 'meteor/meteor'
import Initiatives from '/collections/Initiatives'

Template.admin.helpers({
    'getCurrentUser': function () {
        let user = Meteor.userId();
        return user;
    }
});

