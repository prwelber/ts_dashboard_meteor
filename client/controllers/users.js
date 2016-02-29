Meteor.subscribe("usersList");

Template.newUser.helpers({
    'populateFields': function () {
        let user = Meteor.user();
        return user;
    }
});

Template.newUser.events({
    'submit .new-user-form': function (event, template) {
        event.preventDefault();
        let user = {};
        user['username'] = event.target.username.value;
        user['firstName'] = event.target.firstName.value;
        user['lastName'] = event.target.lastName.value;
        user['company'] = event.target.company.value;
        user['email'] = event.target.email.value;
        user['admin'] = event.target.admin.value;
        user['_id'] = Meteor.userId();
        if (/@targetedsocial\.com/.test(user.email)) {
            console.log('TS employee');
            Meteor.call('insertNewUser', user);
        } else if (!/@targetedsocial\.com/.test(user.email) && user.admin == "yes") {
            alert('You cannot be an admin');
        } else if (!/@targetedsocial\.com/.test(user.email) && user.admin == "no") {
            console.log('hit the right one!')
            Meteor.call('insertNewUser', user, function (error, result) {
                if (error) {
                    console.log("error");
                } else {
                    alert('Your record has been successfully updated.')
                }
            });
        }
        console.log(user);

        // Meteor.call('insertNewUser', user);
    },
    'click #user-form-admin': function (event, template) {
            let email = document.getElementById("user-form-email").value

    }
});

Template.allUsers.helpers({
    'fetchUsers': function () {
        return Meteor.users.find({});
    }
});
