Meteor.subscribe('fbAccountList');
import {person} from "./newAgency"
console.log("this is person", person)
Template.accounts.events({
    'click .refresh-accounts': function () {
        var target = document.getElementById("spinner-div");
        let spun = Blaze.render(Template.spin, target);
        Meteor.call('refreshAccountList', function (err, result) {
            if (err) {
                console.log(e);
            } else {
                Blaze.remove(spun);
            }
        });
        // let userId = Meteor.userId();
        // if (!userId) {
        //     console.log('no user - can\'t update');
        //     alert('You are not logged in.')
        // } else {
        //     let now = moment().format("MM-DD-YYYY");
        //     let account = FacebookAccountList.findOne();
        //     if (!account) {
        //         Meteor.call('refreshAccountList');
        //     } else {
        //         let inserted = account.inserted;
        //         let timeDelta = moment(now, "MM-DD-YYYY").diff(moment(inserted, "MM-DD-YYYY"), 'hours');
        //         if (timeDelta >= 168) {
        //             alert('accounts have not been updated in over one week and it has been '+timeDelta+' hours since the last update');
        //             Meteor.call('refreshAccountList')
        //         } else {
        //             alert('accounts are less than one week old and it has been '+timeDelta+' hours since the last update')
        //         }
        //     }
        // }
    },
    'click .account-link': function () {
        if (Session.get('id') == Meteor.userId()) {
            console.log('you are propertly authenticated')
        }
    }
});

Template.accounts.helpers({
    'accountList': function () {
        let userId = Meteor.userId();
        if (userId) {
            return Accounts.find({
                "name": { "$in": [
                    "Ruffino",
                    "Tom Gore",
                    "Mouton Cadet",
                    "Robert Mondavi Winery",
                    "Kim Crawford"
                ]}
            })
        }
    },
    'formatSpend': function (num) {
        // place a period two digits from the end
        // find the length and use substring?
        num = num.toString().split('');
        num.splice(num.length - 2, 0, '.');
        num = num.join('')
        return "$" + num
    },
    'sessionSetter': function () {
        let userId = Meteor.userId();
        Session.set('id', userId);
    }
})

Template.index.events({

});


Template.index.helpers({
    'getDate': function () {
        let date = new Date();
        date = date.toDateString();
        return date;
    },
    'getCurrentUser': function () {
        let user = Meteor.userId();
        return user;
    }
});

Accounts.ui.config({
    passwordSignupFields: "USERNAME_AND_OPTIONAL_EMAIL"
});
