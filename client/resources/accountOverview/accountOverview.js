import CampaignBasics from '/collections/CampaignBasics'
import MasterAccounts from '/collections/MasterAccounts'

Tracker.autorun(function () {
    if (FlowRouter.subsReady('campaignBasicsList')) {
        // console.log('campaignBasics subs ready!');
    }
});

Template.accountOverview.onRendered(function () {
        let accountNumber = this.find(".account-id").textContent
        let campId = this.find(".account-id").textContent
        // console.log('accountNumber and campId:', accountNumber, campId);
        Session.set("limit", 10);
});

// var myFunc = function () {console.log('this is a helper function')}

Template.accountOverview.helpers({
    'getName': function () {
        let mongoId = FlowRouter.current().params.account_id
        let account = MasterAccounts.findOne({account_id: mongoId})
        return account
    },
    'displayCampaignBasics': function (count) {
        accountId = FlowRouter.current().params.account_id;
        //TODO - need to write logic here to check for campaign and if not, then meteor.call to method
        let camp = CampaignBasics.findOne({account_id: accountId});
        if (camp) {
            console.log('you should be seeing campaigns');
            let camps = CampaignBasics.find({account_id: accountId}, {sort: {sort_time_start: -1}, limit: Session.get("limit")}).fetch();
            return camps;
        } else {
            console.log('gotta get campaigns for this account', accountId);
            // Meteor.addcall('getCampaigns', accountId)
        }
    },
    'isUserUpdated': function () {
        let user = Meteor.user();
        if (!user.firstName) {
            $("#message-box").text("")
            $("#message-box").append("Please update your user profile in the admin section before continuing.");
        }
    }
});

Template.accountOverview.events({
    'click #more-campaigns-button': function(event, template) {
        let number = Session.get("limit");
        number += 5
        Session.set("limit", number);
        $("body").animate({"scrollTop": window.scrollY+1800}, 750)
    },
    'click #all-campaigns-button': function (event, template) {
        let count = CampaignBasics.find().count()
        Session.set("limit", count);
    },
    'click .insights-link': function (event, template) {
        Session.set("campaign_id", event.target.dataset.campaign);
        Session.set("end_date", event.target.dataset.stop);
        console.log("dataset:", event.target.dataset)
    },
    'click #refreshCampaigns': function (event, template) {
        const accountNumber = FlowRouter.current().params.account_id;
        const target = document.getElementById("spinner-div");
        let spun = Blaze.render(Template.spin, target);
        Meteor.call('getCampaigns', accountNumber, function (err, result) {
            if (result) {
                Blaze.remove(spun);
            }
        });
    }
});


Template.accountOverview.onCreated(function () {
    //runs when an instance of the template is created

});
