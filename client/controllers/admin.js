Template.admin.helpers({
    'getCurrentUser': function () {
        let user = Meteor.userId();
        return user;
    }
});
