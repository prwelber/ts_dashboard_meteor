if (Meteor.isServer) {

    Meteor.methods({
        'insertNewInitiative': function (dataObj) {
            console.log(dataObj)
        }
    });

}
