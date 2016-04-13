Meteor.methods({
  'updateUser': function (_id, data) {
    Meteor.users.update(
      {_id: _id},
      {
        $set: {
          firstName: data.firstName,
          lastName: data.lastName,
          admin: data.admin,
          email: data.email,
          agency: data.agency,
          initiatives: data.initiatives,
          updatedOn: moment().format("MM-DD-YYYY hh:mm a")
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
  user['createdOn'] = moment().format('MM-DD-YYYY hh:mm a');
  // user.password = options.password;
  return user;
});




Meteor.publish('usersList', function () {
    return Meteor.users.find( {} );
});
