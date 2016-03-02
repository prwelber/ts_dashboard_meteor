Meteor.subscribe("BrandsList");

Template.newBrand.helpers({
    'getAgencies': function () {
        return Agencies.find( {} );
    },
    'getInitiatives': function () {
        return Initiatives.find( {} );
    },
    'getProducts': function () {
        return ["Wine", "Cars", "Food", "Hotels", "Sports", "Technology"]
    }
});

Template.newBrand.events({
    'submit .new-brand-form': function (e, template) {
        e.preventDefault();
        console.log('registered');
        let data = {};
        data['name'] = e.target.name.value;
        data['agency'] = e.target.agency.value;
        data['facebook_id'] = e.target.facebook_id.value;
        data['twitter_id'] = e.target.twitter_id.value;
        data['youtube_id'] = e.target.youtube_id.value;
        data['instagram_id'] = e.target.instagram_id.value;
        data['google_id'] = e.target.google_id.value;
        data['pinterest_id'] = e.target.pinterest_id.value;
        data['initiatives'] = ["this is a placeholder", "also a placeholder", "third placeholder"];
        data['product'] = e.target.product.value;
        data['website'] = e.target.website.value;
        data['facebook_page'] = e.target.facebook_page.value;
        data['youtube_page'] = e.target.youtube_page.value;
        data['twitter_page'] = e.target.twitter_page.value;
        data['google_page'] = e.target.google_page.value;
        data['instagram_page'] = e.target.instagram_page.value;
        data['pinterest_page'] = e.target.pinterest_page.value;
        data['inserted'] = moment().format("MM-DD-YYYY hh:mm a");
        Meteor.call('insertNewBrand', data, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                alert(result+' has been inserted into the DB. You will be redirected to home.')
                FlowRouter.go('/')
            }
        });
    }
});
