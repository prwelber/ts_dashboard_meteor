import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

const assignUserRoles = function assignUserRoles (id, stuff) {
  console.log('id', id);
  console.log('checking for agency user');
  if (stuff.agency.length >= 1) {
    // adds the array of agencies to the roles, and the group is 'agency'
    Roles.addUsersToRoles(id, stuff.agency, 'agency');
  }
  console.log('checking for admin user');
  if (stuff.admin === true) {
    Roles.addUsersToRoles(id, 'admin', Roles.GLOBAL_GROUP)
  }
}

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
          username: data.username,
          agency: data.agency,
          initiatives: data.initiatives,
          updatedOn: moment().format("MM-DD-YYYY hh:mm a")
        }
      }
    ) //end of update
    // console.log(data.agency, data.admin)
    // console.log('id', _id);
    // if (data.agency.length >= 1) {
    //   Roles.addUsersToRoles(_id, ['agency']);
    // }
    // if (data.admin === true) {
    //   Roles.addUsersToRoles(_id, 'admin', Roles.GLOBAL_GROUP)
    // }
    assignUserRoles(_id, data);
    return "success!";
  },
  'deleteUser': function (userId) {
    Meteor.users.remove(userId);
  },
  createNewUser: (options) => {
    Accounts.createUser({
      username: options.username,
      password: options.password,
      email: options.email,
      profile: options
    });
    return 'success!';
  }
});

Accounts.onCreateUser((options, user) => {
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


Accounts.onLogin(() => {
  const user = Meteor.user()
  const now = moment().toISOString();
  Meteor.users.update(
    {_id: user._id},
    {$set: {
      lastLogin: now
    }
  });
});


Meteor.startup(function () {
  if (Meteor.users.find({username: "targetedadmin"}).count() === 0) {
    const user = [{firstName: "Targeted", lastName: "Admin", username: "targetedadmin", email: "", admin: true}];

    _.each(user, (user) => {
      var id;

      id = Accounts.createUser({
        email: user.email,
        password: "targeted1",
        username: user.username,
        profile: {admin: user.admin, firstname: user.firstName, lastName: user.lastName}
      });
      if (user.admin === true) {
        Roles.addUsersToRoles(id, 'admin', Roles.GLOBAL_GROUP);
      }
    });
  }
});


Meteor.publish('usersList', function () {
    return Meteor.users.find( {} );
});
