if (Meteor.isServer) {

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
        }
    });


//need a meteor.publish


}
