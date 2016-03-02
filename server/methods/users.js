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






Meteor.publish('usersList', function () {
    return Meteor.users.find( {} );
});
