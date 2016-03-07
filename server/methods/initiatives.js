


Meteor.methods({
    'insertNewInitiative': function (dataObj) {
        let campArray = [];
        let campNameArray = [];

        Initiatives.insert({
            inserted_date: moment().format("MM-DD-YYYY hh:mm a"),
            brand: dataObj.brand,
            agency: dataObj.agency,
            budget: dataObj.budget,
            dealType: dataObj.dealType,
            endDate: dataObj.endDate,
            name: dataObj.name,
            notes: dataObj.notes,
            startDate: dataObj.startDate,
            quantity: dataObj.quantity,
            price: dataObj.price,
            campaign_ids: campArray,
            campaign_names: campNameArray,
            search_text: dataObj.searchText
        });
        console.log("new initiative inserted into DB:", dataObj)
        return "success";
    },
    'removeInitiatives': function () {
        Initiatives.remove( {} );
        return "initiatives removed!";
    },
    'updateInitiative': function (data) {
        Initiatives.update(
            {name: data.name},
            {$set: {
                brand: data.brand,
                agency: data.agency,
                budget: data.budget,
                dealType: data.dealType,
                endDate: data.endDate,
                name: data.name,
                notes: data.notes,
                startDate: data.startDate,
                quantity: data.quantity,
                price: data.price,
                campaign_id: data.campaign_id,
            }
        });
        return data.name;
    },
    'getInitiativeAggregate': function (name) {
        // This function aggregates campaignInsight data for an initiative
        let pipeline = [
            {$match: {"data.initiative": name}},
            {$group: {
                _id: null,
                clicks: {$sum: "$data.clicks"},
                reach: {$sum: "$data.reach"},
                cpm: {$avg: "$data.cpm"},
                cpc: {$avg: "$data.cpc"}
                }
            }
        ]
        let result = CampaignInsights.aggregate(pipeline);
        console.log(result)
    }
});

Meteor.publish('InitiativesList', function () {
    return Initiatives.find( {} );
});
