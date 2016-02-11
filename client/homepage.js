if (Meteor.isClient) {

    Meteor.subscribe('fbAccountList');

    Template.accounts.events({

        'click .refresh-accounts': function () {
            let now = moment().format("MM-DD-YYYY");
            let account = FacebookAccountList.findOne();
            if (!account) {
                Meteor.call('refreshAccountList');
            } else {
                let inserted = account.inserted;
                let timeDelta = moment(now, "MM-DD-YYYY").diff(moment(inserted, "MM-DD-YYYY"), 'hours');
                if (timeDelta >= 168) {
                    alert('accounts have not been updated in over one week');
                    Meteor.call('refreshAccountList')
                } else {
                    alert('accounts are less than one week old')
                }
            }
        }
    });

    Template.accounts.helpers({
        'accountList': function () {
            return FacebookAccountList.find({})
        }
    })














};
