Meteor.subscribe('campaignBasicsList');

Template.accountOverview.onRendered(function () {
        let accountNumber = this.find(".account-id").textContent
        let campId = this.find(".account-id").textContent
        console.log('accountNumber and campId:', accountNumber, campId);
        Session.set("limit", 5);
})

// var myFunc = function () {console.log('this is a helper function')}

Template.accountOverview.helpers({
    'getName': function () {
        let mongoId = FlowRouter.current().params.account_id
        let account = Accounts.findOne({account_id: mongoId})
        console.log('test');
        return account
    },
    'displayCampaignBasics': function (count) {
        accountId = FlowRouter.current().params.account_id;

        // notice how to structure the sort and limit options
        //TODO - need to write logic here to check for campaign and if not, then meteor.call to method
        if (CampaignBasics.findOne({account_id: accountId})) {
            console.log('you should be seeing campaigns');
            let camps = CampaignBasics.find({account_id: accountId}, {sort: {sort_time_start: -1}, limit: Session.get("limit")}).fetch();
            return camps;
        } else {
            console.log('gotta get campaigns for this account', accountId);
            Meteor.call('getCampaigns', accountId)
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
    }
});


Template.accountOverview.onCreated(function () {
    //runs when an instance of the template is created

});

