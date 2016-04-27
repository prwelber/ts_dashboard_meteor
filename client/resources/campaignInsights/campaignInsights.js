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
      console.log(this);
      Meteor.call('refreshInsight', this.campaign_id, this.campaign_name, this.initiative);
      $('.tooltipped').tooltip('remove');
    },
    'click .setSessionCampName': function () {
      Session.set("campaign_name", this.campaign_name);
    }
});

Template.campaignInsights.helpers({
  isReady: (sub) => {
    const campaignNumber = Template.instance().templateDict.get('campNum');

    if (FlowRouter.subsReady(sub) && CampaignInsights.find({'data.campaign_id': campaignNumber}).count() === 0) {

      var target = document.getElementById("spinner-div");
      let spun = Blaze.render(Template.spin, target);

      var call = Promise.promisify(Meteor.call);
      call('getInsights', campaignNumber)
      .then(function (result) {
        console.log("result from promise", result)
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
      // convert currency data types - may want to use underscore here
      camp.data.impressions = mastFunc.num(camp.data.impressions);
      camp.data.ctr = camp.data.ctr.toString().substr(0,5);
      camp.data.frequency = numeral(camp.data.frequency).format("0,0.00");
      camp.data.cpl = mastFunc.money(camp.data.cpl);
      camp.data.cpm = mastFunc.money(camp.data.cpm);
      camp.data.cpc = mastFunc.money(camp.data.cpc);
      camp.data.spend = mastFunc.money(camp.data.spend);
      if (camp.data.video_view) {
        camp.data['tenSecondView'] = camp.data['video_10_sec_watched_actions'][0]['value'];
        camp.data['costPerTenSecondView'] = mastFunc.money(camp.data['cost_per_10_sec_video_view'][0]['value']);
        camp.data['fifteenSecondView'] = camp.data['video_15_sec_watched_actions'][0]['value'];
        camp.data['avgPctWatched'] = camp.data['video_avg_pct_watched_actions'][0]['value'];
        camp.data['avgSecWatched'] = camp.data['video_avg_sec_watched_actions'][0]['value'];
        camp.data['completeWatched'] = camp.data['video_complete_watched_actions'][0]['value'];

        return [camp.data];
      } else {
        return [camp.data];
      }
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
