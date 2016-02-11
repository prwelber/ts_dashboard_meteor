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
        },
        'click .account-link': function () {
            if (Session.get('id') == Meteor.userId()) {
                console.log('you are propertly authenticated')
            }
        }
    });

    Template.accounts.helpers({
        'accountList': function () {
            return FacebookAccountList.find({})
        },
        'sessionSetter': function () {
            let user = Meteor.userId();
            Session.set("id", user)
            // console.log("user:", user)
            // console.log(Session.get('id'))
        }
    })

    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
      });

};
