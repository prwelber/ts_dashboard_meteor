Template.admin.helpers({
    'getCurrentUser': function () {
        let user = Meteor.userId();
        return user;
    }
});

Template.createUser.helpers({
  'getInits': function () {
    return Initiatives.find({});
  }
});

Template.createUser.events({
  "submit #create-user-form": function (event, template) {
    event.preventDefault();
    const firstName = template.find('[name="first-name"]').value;
    console.log(firstName);
  }
});
