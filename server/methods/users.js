Meteor.methods({
  'insertNewUser': function (data) {
    Meteor.users.update(
      {_id: data._id},
      {
        $set: {
          firstName: data.firstName,
          lastName: data.lastName,
          admin: data.admin,
          email: data.email,
          company: data.company,
          inserted: moment(new Date()).format("MM-DD-YYYY hh:mm a")
        }
      }
    ) //end of update
    return "success!";
  },
  'deleteUser': function (userId) {
    Meteor.users.remove(userId);
  }
});

Accounts.onCreateUser(function (options, user) {
  user['firstName'] = options.firstName;
  user['lastName'] = options.lastName;
  user['email'] = options.email;
  user['agency'] = options.agency;
  user['initiatives'] = options.initiatives;
  user['admin'] = options.admin;
  // user.password = options.password;
  return user;
});




Meteor.publish('usersList', function () {
    return Meteor.users.find( {} );
});
