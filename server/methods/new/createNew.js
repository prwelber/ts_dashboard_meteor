
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
            startDate: dataObj.startDate,
            quantity: dataObj.quantity,
            price: dataObj.price,
            campaign_id: dataObj.campaign_id,
            campaign_mongo_id: dataObj.campaign_mongo_id
        });
        console.log("new initiative inserted into DB:", dataObj)
        return "success";
    },
    'removeInitiatives': function () {
        Initiatives.remove( {} );
        return "initiatives removed!";
    },
    
    'insertNewBrand': function (data) {
        Brands.insert({
            agency: data.agency,
            facebook_id: data.facebook_id,
            facebook_page: data.facebook_page,
            google_id: data.google_id,
            google_page: data.google_page,
            initiatives: data.initiatives,
            inserted: data.inserted,
            instagram_id: data.instagram_id,
            instagram_page: data.instagram_page,
            name: data.name,
            pinterest_id: data.pinterest_id,
            pinterest_page: data.pinterest_page,
            product: data.product,
            twitter_id: data.twitter_id,
            twitter_page: data.twitter_page,
            website: data.website,
            youtube_id: data.youtube_id,
            youtube_page: data.youtube_page
        });
        return data.name;
    }
});

Meteor.publish('InitiativesList', function () {
    return Initiatives.find( {} );
});
Meteor.publish('BrandsList', function () {
    return Brands.find( {} );
});
