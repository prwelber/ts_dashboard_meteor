if (Meteor.isClient) {
    Meteor.subscribe('campaignBasics');

    Template.accountOverview.onRendered(function () {
            let accountNumber = this.find(".account-id").textContent
            let campId = this.find(".account-id").textContent
            console.log('accountNumber and campId:', accountNumber, campId)
    })


    Template.accountOverview.helpers({
        'getName': function () {
            let mongoId = FlowRouter.current().params.account_id
            let account = FacebookAccountList.findOne({account_id: mongoId})
            return account
        },
        'displayCampaignBasics': function () {
            accountId = FlowRouter.current().params.account_id
            // notice how to structure the sort and limit options

            //TODO - need to write logic here to check for campaign and if not, then meteor.call to method
            if (CampaignBasicsList.findOne({account_id: accountId})) {
                console.log('you should be seeing campaigns');
                return CampaignBasicsList.find({account_id: accountId}, {sort: {sort_time_start: -1}, limit: 10})
            } else {
                Meteor.call('getCampaigns', accountId)
            }
        }
    });




    Template.accountOverview.onCreated(function () {
        //runs when an instance of the template is created

    });


















}
