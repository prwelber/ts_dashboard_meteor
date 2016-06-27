import { Meteor } from 'meteor/meteor'
import { FlowRouter } from 'meteor/kadira:flow-router'
import Initiatives from '/collections/Initiatives'
import moment from 'moment-timezone';

Meteor.subscribe("usersList");

Template.editUser.helpers({
  'populateFields': function () {
    let user = Meteor.users.findOne({_id: FlowRouter.current().params._id});
    return user;
  },
  'isAdmin': function () {
    const user = Meteor.users.findOne({_id: FlowRouter.current().params._id});
    if (user.admin === true) {
      return "checked"
    } else {
      return ""
    }
  },
  'getInits': function () {
    return Initiatives.find({}, {sort: {name: 1}});
  },
  'initiativeSelected': function (name) {
    const user = Meteor.users.findOne({_id: FlowRouter.current().params._id});
    if (user['initiatives'].indexOf(name) >= 0) {
      return "selected";
    }
  },
  'agencySelected': function (name) {
    const user = Meteor.users.findOne({_id: FlowRouter.current().params._id});
    if (user['agency'].indexOf(name) >= 0) {
      return "selected";
    }
  }
});

Template.editUser.events({
  'submit .edit-user-form': function (event, template) {
    event.preventDefault();

    const select = document.getElementsByName("agency");
    const agencyArray = [];
    for (let i = 0; i < select[0].length; i++) {
      if (select[0][i].selected === true) {
        agencyArray.push(select[0][i].value);
      }
    }

    // get all initiatives
    const initSelect = document.getElementsByName("initiatives");
    const initArray = [];
    for (let i = 0; i < initSelect[0].length; i++) {
      if (initSelect[0][i].selected === true) {
        initArray.push(initSelect[0][i].value);
      }
    }

    let user = {
      firstName: event.target.firstName.value,
      lastName: event.target.lastName.value,
      email: event.target.email.value,
      admin: event.target.admin.checked,
      username: event.target.username.value,
      agency: agencyArray,
      initiatives: initArray
    };

    console.log(user);
    const _id = FlowRouter.current().params._id;
    Meteor.call('updateUser', _id, user, function (err, res) {
      if (res) {
        Materialize.toast('User Updated!', 2000);
      }
    });

  },
  'click #user-form-admin': function (event, template) {
    let email = document.getElementById("user-form-email").value
  }
});

Template.allUsers.events({
    "click .delete-user": function () {
      let userId = this._id;
      Meteor.call('deleteUser', userId);
    }
})

Template.allUsers.helpers({
    'fetchUsers': function () {
      return Meteor.users.find({});
    },
    date: (date) => {
      return moment(date, moment.ISO_8601).tz("America/New_York").format("MM-DD-YYYY hh:mm a z");
    }
});

Template.editUser.onDestroyed(function () {
  $("#message-box").text("");
});

Template.createUser.helpers({
  'getInits': function () {
    return Initiatives.find({}, {sort: {name: 1}});
  }
});

Template.createUser.events({
  "submit #create-user-form": function (event, template) {
    event.preventDefault();
    const firstName = template.find('[name="first-name"]').value;

    // get all agencies
    const select = document.getElementsByName("agency");
    const agencyArray = [];
    for (let i = 0; i < select[0].length; i++) {
      if (select[0][i].selected === true) {
        agencyArray.push(select[0][i].value);
      }
    }

    // get all initiatives
    const initSelect = document.getElementsByName("initiatives");
    const initArray = [];
    for (let i = 0; i < initSelect[0].length; i++) {
      if (initSelect[0][i].selected === true) {
        initArray.push(initSelect[0][i].value);
      }
    }

    const options = {
      firstName: template.find('[name="first-name"]').value,
      lastName: template.find('[name="last-name"]').value,
      username: template.find('[name="username"]').value,
      email: template.find('[name="email"]').value,
      password: template.find('[name="password"]').value,
      agency: agencyArray,
      initiatives: initArray,
      admin: template.find('[name="adminCheckbox"]').checked
    };

    console.log(options);

    Meteor.call('createNewUser', options, (err, res) => {
      if (err) {
        alert(err);
      } else {
        Materialize.toast('User Created!', 1500);
      }
    });

    // Accounts.createUser(options, function (err) {
    //   if (err) {
    //     alert(err);
    //   } else {
    //     Materialize.toast('User Created!', 2000);
    //   }
    // })
  }
});

// redirects logging in user to "/"
Accounts.onLogin(function () {
  const path = FlowRouter.current().path;
  if (path !== "/") {
    FlowRouter.go("/home");
  }
});
