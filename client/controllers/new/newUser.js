Template.newUser.helpers({

});

Template.newUser.events({
    'submit .new-user-form': function (event, template) {
        event.preventDefault();
        let user = {};
        user['firstName'] = event.target.firstName.value;
        user['lastName'] = event.target.lastName.value;
        user['company'] = event.target.company.value;
        user['email'] = event.target.email.value;
        user['admin'] = event.target.admin.value;

        // if (/@targetedsocial\.com/.test(user.email)) {
        //     console.log('TS employee')
        // } else {
        //     alert('You cannot be an admin');
        // }
        console.log(user);

        // Meteor.call('insertNewUser', user);
    },
    'click #user-form-admin': function (event, template) {
            
            let email = document.getElementById("user-form-email").value

    }
});
