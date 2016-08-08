import { Meteor } from 'meteor/meteor'
import Brands from '/collections/Brands';
import Agencies from '/collections/Agencies';

Template.newBrand.helpers({
    'getAgencies': function () {
        return Agencies.find( {} ).fetch();
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
        let data = {
            name: e.target.name.value,
            agency: e.target.agency.value,
            // facebook_id: e.target.facebook_id.value,
            // twitter_id: e.target.twitter_id.value,
            // youtube_id: e.target.youtube_id.value,
            // instagram_id: e.target.instagram_id.value,
            // google_id: e.target.google_id.value,
            // pinterest_id: e.target.pinterest_id.value,
            // product: e.target.product.value,
            // website: e.target.website.value,
            // facebook_page: e.target.facebook_page.value,
            // youtube_page: e.target.youtube_page.value,
            // twitter_page: e.target.twitter_page.value,
            // google_page: e.target.google_page.value,
            // instagram_page: e.target.instagram_page.value,
            // pinterest_page: e.target.pinterest_page.value,
            inserted: moment().format("MM-DD-YYYY hh:mm a"),
            // account_id: data.facebook_id
        };

        Meteor.call('insertNewBrand', data, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                alert(result+' has been created. You will be redirected to the Admin page.')
                FlowRouter.go('/admin')
            }
        });
    }
});

Template.brands.helpers({
    'getBrands': function () {
        return Brands.find();
    }
});

Template.brands.events({
    'click .brandLink': function (event) {
        Session.set("account_id", this.account_id);
    },
    'click .delete-brand': (e, instance) => {
        // e.preventDefault();
        console.log(e.target)
        console.log(e.target.dataset)
        const id = e.target.dataset.id;
        Meteor.call('deleteBrand', id, (err, result) => {
            if (err) {
                alert(err)
            } else {
                Materialize.toast('Successfully deleted', 1500)
                FlowRouter.go('/admin')
            }
        });
    }
});

Template.updateBrand.helpers({
    'getBrand': function () {
        let accountId = FlowRouter.current().params.account_id;
        return Brands.findOne({facebook_id: accountId})
    },
    'getAgencies': function () {
        return Agencies.find();
    },
    'getProducts': function () {
        return ["Wine", "Cars", "Food", "Hotels", "Sports", "Technology"]
    }
});

Template.updateBrand.events({
    "submit .update-brand-form": function (e) {
        e.preventDefault();

        let data = {};
        data['account_id'] = Session.get('account_id');
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

        Meteor.call("updateBrand", data, function (error, result) {
            if (result) {
                $("#message-box").append("Brand Update Successful!");
            }
        });

    }
});

Template.updateBrand.onDestroyed(function () {
    $("#message-box").text("");
})
