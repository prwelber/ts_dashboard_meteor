
Meteor.methods({
    'insertNewInitiative': function (dataObj) {
        Initiatives.insert({
            inserted_date: moment().format("MM-DD-YYYY hh:mm a"),
            brand: dataObj.brand,
            agency: dataObj.agency,
            budget: dataObj.budget,
            dealType: dataObj.dealType,
            endDate: dataObj.endDate,
            name: dataObj.name,
            notes: dataObj.notes,
            startDate: dataObj.startDate
        });
        console.log("new initiative inserted into DB:", dataObj)
    },
    'insertNewAgency': function (name, array, location) {
        Agencies.insert({
            inserted_date: moment().format("MM-DD-YYYY hh:mm a"),
            name: name,
            brands: array,
            location: location
        });
        console.log('new agency inserted into DB');
    },
    'insertNewBrand': function () {
        console.log('inserted new Brand into DB');
    }
});

Meteor.publish('agenciesList', function () {
    return Agencies.find( {} );
});
Meteor.publish('InitiativesList', function () {
    return Initiatives.find( {} );
});
