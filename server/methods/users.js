import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

const assignUserRoles = function assignUserRoles (id, stuff) {
  if (stuff.agency.length >= 1) {

    // if (stuff.agency.indexOf('Constellation') >= 0) {
    //   console.log('adding user to agency AND constellation groups')
    //   Roles.addUsersToRoles(id, stuff.agency,'agency');
    //   return;
    // }

    // adds the array of agencies to the roles, and the group is 'agency'
    Roles.addUsersToRoles(id, stuff.agency, 'agency');
  }
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
          updatedOn: moment().toISOString()
        }
      }
    ) //end of update
    if (data.admin === false) {
      Meteor.users.update(
        { _id: _id },
        {$unset:
          {roles: ""}
        }
      )
    }
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
      email: options.email
      // profile: options
    });
    return 'success!';
  }
});

Accounts.onCreateUser((options, user) => {
  if (options.profile) {
    user.profile = options.profile
  }
  user['firstName'] = options.firstName;
  user['lastName'] = options.lastName;
  user['email'] = options.email;
  user['agency'] = options.agency;
  user['initiatives'] = options.initiatives;
  user['admin'] = options.admin;
  user['createdOn'] = moment().toISOString();
  user['lastLogin'] = "None";
  // user.password = options.password;
  return user;
});


Accounts.onLogin(() => {
  const user = Meteor.user()
  const now = moment().toISOString();
  let services;
  user.services.facebook ? services = true : services = false;

  // if user has logged in with facebook, set first, last and email to info
  // in facebook object

  if (services) {
    Meteor.users.update(
      {_id: user._id},
      {$set: {
        lastLogin: now,
        firstName: user.services.facebook.first_name,
        lastName: user.services.facebook.last_name,
        email: user.services.facebook.email,
        agency: ['Constellation'],
        admin: false
        // roles: {agency: ['Constellation']}
      }
    });
    Roles.addUsersToRoles(user._id, ['Constellation'], 'agency');
  } else {
    Meteor.users.update(
      {_id: user._id},
      {$set: {
        lastLogin: now
      }
    });
  }
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
