Meteor.methods({
    'insertNewAgency': function (d) {
        Agencies.insert({
            name: d.name,
            location: d.location,
            inserted: d.inserted
        });
        console.log('new agency inserted into DB');
        return "success!";
    },
    'updateAgency': function (d) {
        Agencies.update(
            {_id: d._id},
            {
                $set: {
                    name: d.name,
                    location: d.location
                }
            }
        );
        return "success!";
    },
    'deleteAgency': function (id) {
        Agencies.remove(id);
        return "success!";
    }
})













Meteor.publish('agenciesList', function () {
    return Agencies.find( {} );
});
