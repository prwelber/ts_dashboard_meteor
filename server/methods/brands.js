Meteor.methods({
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
            youtube_page: data.youtube_page,
            account_id: data.account_id
        });
        return data.name;
    },
    'updateBrand': function (data) {
        Brands.update(
            {account_id: data.account_id},
            {
                $set: {
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
                }
            }
        ); // end of update
        return "success!";
    }
});


Meteor.publish('BrandsList', function () {
    return Brands.find( {} );
});
