import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import CampaignInsights from '/collections/CampaignInsights'
import Initiatives from '/collections/Initiatives'
import Promise from 'bluebird'


Tracker.autorun(function () {
  if (FlowRouter.subsReady('campaignInsightList')) {
  }
});

Template.campaignInsights.onCreated(function () {
  this.templateDict = new ReactiveDict();
  const campaignNum = FlowRouter.current().params.campaign_id;
  this.templateDict.set('campNum', campaignNum);
});

Template.campaignInsights.onRendered(function () {
  $('.tooltipped').tooltip({delay: 25});
});

Template.campaignInsights.events({
  'click #refresh-insights': function (event, template) {
    if (FlowRouter.getQueryParam('platform') === 'twitter') {
      Meteor.call('getTwitterInsights', this.campaign_id, this.account_id, this.start_date, this.end_date, this.campaign_name, this.initiative);
      Materialize.toast('Pulling Twitter data can be slow. Please be patient.', 8000)
    } else {
      Meteor.call('refreshInsight', this.campaign_id, this.campaign_name, this.initiative);
    }

    $('.tooltipped').tooltip('remove');
  },
  'click .setSessionCampName': function () {
    Session.set("campaign_name", this.campaign_name);
  }
});

Template.campaignInsights.helpers({
  isReady: (sub) => {
    const campaignNumber = Template.instance().templateDict.get('campNum');
    var call = Promise.promisify(Meteor.call);

    if (FlowRouter.subsReady(sub) === true) {
      return true;
    }

    // ------ TWITTER FLOW ------ //
    if (FlowRouter.getQueryParam('platform') === 'twitter') {
      console.log('platform is twitter');
      // const start = FlowRouter.getQueryParam('start_time');
      // const stop = FlowRouter.getQueryParam('stop_time');
      // const campaignId = FlowRouter.getQueryParam('campaign_id');
      // const accountId = FlowRouter.getQueryParam('account_id');
      // const name = FlowRouter.getQueryParam('name');
      // NEED TO PUT THIS IN DASHBOARD.JS FILE
      // if (CampaignInsights.find({'data.campaign_id': campaignId}).count() === 0) {
      //   Meteor.call('getTwitterInsights', campaignId, accountId, start, stop, name, (err, res) => {
      //     if (res) {
      //       console.log('res returned from meteor call')
      //     }
      //   });
      //   return;
      // } else {
      //   return true;
      // }
      return true;
    }


    // ------- END TWITTER FLOW ------- //

    console.log('running FB getInsights')
    if (FlowRouter.subsReady(sub) && CampaignInsights.find({'data.campaign_id': campaignNumber}).count() === 0) {

      var target = document.getElementById("spinner-div");
      let spun = Blaze.render(Template.spin, target);

      call('getInsights', campaignNumber)
      .then(function (result) {
        Blaze.remove(spun);
      }).catch(function (err) {
        console.log('uh no error', err)
      });
    } else {
      return true;
    }
  },
  'fetchInsights': function () {
    const campaignNumber = FlowRouter.current().params.campaign_id;

    let camp = CampaignInsights.findOne({'data.campaign_id': campaignNumber});
    if (camp) {
      return [camp.data];
    }
  },
  'cleanText': function (text) {
    return text.replace("_", " ").toLowerCase();
  },
  'getCampaignNumber': function () {
    return FlowRouter.current().params.campaign_id;
  },
  'getAccountNumber': function () {
    try {
     let num = CampaignInsights.findOne({'data.campaign_id': FlowRouter.current().params.campaign_id});
     return num.data.account_id;
    } catch(e) {
      console.log("this error is not important");
    }
  },
  'findInitiative': function () {
      // console.log(this)
      //Meteor.call('findInitiative');
  }

});

Template.campaignInsights.onDestroyed(function () {
    $("#message-box").text("");
    $('.tooltipped').tooltip('remove');
});
