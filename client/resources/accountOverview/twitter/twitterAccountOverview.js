import CampaignBasics from '/collections/CampaignBasics';
import MasterAccounts from '/collections/MasterAccounts';
import Initiatives from '/collections/Initiatives';
import { Meteor } from 'meteor/meteor';

Tracker.autorun(function () {
    if (FlowRouter.subsReady('campaignBasicsList')) {
        // console.log('campaignBasics subs ready!');
    }
});

Template.twitterAccountOverview.onRendered(function () {
        Session.set("limit", 10);
});

Template.twitterAccountOverview.helpers({
    isReady: (sub1, sub2) => {
        if (FlowRouter.subsReady(sub1) && FlowRouter.subsReady(sub2)) {
            return true;
        }
    },
    'getName': function () {
        const id = FlowRouter.getParam('account_id');
        const account = MasterAccounts.findOne({'data.account_id': id});
        return account;
    },
    'displayCampaignBasics': function (count) {
        accountId = FlowRouter.current().params.account_id;
        //TODO - need to write logic here to check for campaign and if not, then meteor.call to method
        let camp = CampaignBasics.findOne({"data.account_id": accountId});
        if (camp) {
            let camps = CampaignBasics.find({"data.account_id": accountId}, {sort: {"data.start_time": -1}}).fetch();
            return camps;
        }
    },
    getInits: () => {
        return Initiatives.find({}, {sort: {name: 1}}).fetch();
    },
    buildPath: (data, init) => {
        var params = {
            campaign_id: data.campaign_id
        };
        const initName = init.replace(/ /g, '_');
        var queryParams = {platform: "twitter", initiative: initName, campaign_id: data.campaign_id, account_id: data.account_id, start_time: data.start_time, stop_time: data.stop_time, name: data.name};
        var path = FlowRouter.path('/accounts/:campaign_id/overview', params, queryParams);

        return path;
    }
});

Template.twitterAccountOverview.events({
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
    'click .delete-campaign-basic': (event, instance) => {
        const _id = event.target.dataset.id;
        const campName = event.target.dataset.name;
        const initName = event.target.dataset.initiative;
        const campaignID = event.target.dataset.campid;
        Meteor.call('deleteCampaignBasic', _id, campName, initName, campaignID, (err, result) => {
            if (result) {
                Materialize.toast('Successfully Deleted', 1500)
            }
        });
    },
    'click #refresh-twitter-campaigns': (event, template) => {
        const id = FlowRouter.getParam('account_id');
        const target = document.getElementById('spinner-div');
        let spun = Blaze.render(Template.spin, target);
        Meteor.call('getTwitterCampaigns', id, (err, res) => {
            if (res) Blaze.remove(spun);
        });
    },
    'change .twitter-campaign-select': (event, template) => {
        const init = event.target.value;
        const twitterCamp = event.target.getAttribute('name');
        const twitterID = event.target.dataset.id;
        console.log(event.target.getAttribute('name'), twitterID);
        Meteor.call('assignTwitterCampaignToInitiative', init, twitterCamp, twitterID, (err, res) => {
            if (res) {
                Materialize.toast('Initiative Assigned!', 2000);
            }
        });
    }
});
