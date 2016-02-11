if (Meteor.isClient) {

    Meteor.subscribe('campaignBasics');

    Template.accountOverview.helpers({
        'getName': function () {
            let mongoId = FlowRouter.current().params._id
            let account = FacebookAccountList.findOne({_id: mongoId})
            return account
        },
        'displayCampaignBasics': function () {
            if (CampaignBasicsList.findOne() == undefined) {
                return false
            } else {
                return CampaignBasicsList.find({})
            }
        }
    });


    Template.accountOverview.onCreated(function () {
        //runs when an instance of the template is created
        console.log('onCreated testing')
    });

    Template.accountOverview.onRendered(function () {
        console.log('onRendered testing');
        let accountNumber = $(".account-id").text();
        console.log("accountNumber:", accountNumber);

        if (!CampaignBasicsList.findOne()) {
            console.log('no campaign basics to show')
            Meteor.call('getCampaigns', accountNumber);
        } else {
            console.log('hello! you should have campaigns to look at')
        }

    })
















}
