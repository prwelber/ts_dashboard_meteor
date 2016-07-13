import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Promise from 'bluebird';
import { formatters } from '/both/utilityFunctions/formatters';
import CampaignInsights from '/collections/CampaignInsights';
import InsightsBreakdowns from '/collections/InsightsBreakdowns';
import Initiatives from '/collections/Initiatives';

// ---------------------- FUNCTIONS ------------------------ //
const stringToCostPlusPercentage = function stringToCostPlusPercentage (num) {
  num = num.toString().split('');
  num.unshift(".");
  num = 1 + parseFloat(num.join(''));
  return num;
}

const defineAction = function defineAction (init) {
  let action;
  init.lineItems[0].dealType === "CPC" ? action = "clicks" : '';
  init.lineItems[0].dealType === "CPM" ? action = "impressions" : '';
  init.lineItems[0].dealType === "CPL" ? action = "like" : '';
  return action;
}


Template.insightsBreakdown.onRendered( function () {
  $('.tooltipped').tooltip({delay: 25});
});

Template.insightsBreakdown.helpers({
  isReady: (sub1, sub2) => {
    const campaignNumber = FlowRouter.getParam("campaign_id");

    if ((FlowRouter.subsReady(sub1) && FlowRouter.subsReady(sub2)) && InsightsBreakdowns.find({'data.campaign_id': campaignNumber}).count() === 0) {

      var target = document.getElementById("spinner-div");
      let spun = Blaze.render(Template.spin, target);

      var call = Promise.promisify(Meteor.call);
      call('getBreakdown', campaignNumber)
      .then(function (result) {
        // console.log("result from promise", result)
        Blaze.remove(spun);
      }).catch(function (err) {
        console.log('uh no error', err)
      });
    } else {
      return true;
    }
  },
  'getBreakdown': function () {
    // console.log('getBreakdown running');
    const campaignNumber = FlowRouter.getParam("campaign_id");
    let breakdown = InsightsBreakdowns.findOne({'data.campaign_id': campaignNumber});
    const init = Initiatives.findOne({campaign_ids: {$in: [campaignNumber]}});

    if (breakdown) {
      let ageGenderInsights =  InsightsBreakdowns.find({'data.campaign_id': campaignNumber}, {sort: {'data.age': 1, 'data.gender': 1}}).fetch();

      if (init.lineItems[0].cost_plus === true) {
          // run cost plus calculations
          const costPlusPercent = stringToCostPlusPercentage(init.lineItems[0].costPlusPercent);
          let insightSpend = 0;
          ageGenderInsights.forEach((insight) => {
            insightSpend = accounting.unformat(insight.data.spend) * costPlusPercent;
            insight.data.spend = insightSpend;
            insight.data.cpm = insightSpend / (insight.data.impressions / 1000);
            insight.data.cpc = insightSpend / insight.data.clicks;
            insight.data.cpl = insightSpend / insight.data.like;
            insight.data['cost_per_total_action'] = insightSpend / insight.data.total_actions;
            insight.data.cost_per_video_view = insightSpend / insight.data.video_view;
            insight.data.cost_per_page_engagement = insightSpend / insight.data.page_engagement;
            insight.data.cost_per_post_like = insightSpend / insight.data.post_like;
            insight.data.cost_per_link_click = insightSpend / insight.data.link_click;
          });
          return ageGenderInsights;

        } else if (init.lineItems[0].percent_total === true) {
          // run cost plus calculations
          let insightSpend = 0;
          let quotedPrice = init.lineItems[0].price;
          let action = defineAction(init)

          ageGenderInsights.forEach((insight) => {
            // need to get day spend according to the quotedPrice on IO
            if (action === "impressions") {
              insightSpend = (insight.data.impressions / 1000) * quotedPrice;
            } else {
              insightSpend = insight.data[action] * quotedPrice;
            }
            insight.data.spend = insightSpend;
            insight.data.cpm = insightSpend / (insight.data.impressions / 1000);
            insight.data.cpc = insightSpend / insight.data.clicks;
            insight.data.cpl = insightSpend / insight.data.like;
            insight.data['cost_per_total_action'] = insightSpend / insight.data.total_actions;
            insight.data.cost_per_video_view = insightSpend / insight.data.video_view;
            insight.data.cost_per_page_engagement = insightSpend / insight.data.page_engagement;
            insight.data.cost_per_post_like = insightSpend / insight.data.post_like;
            insight.data.cost_per_link_click = insightSpend / insight.data.link_click
          });
          return ageGenderInsights;

        } else {
          return '';
        }




      return ageGenderInsights;
    }
  },
  'campaignInfo': function () {
    return CampaignInsights.findOne({'data.campaign_id': FlowRouter.current().params.campaign_id}).data;
  },
  getGender: (gender) => {
    if (gender === "female") {
      return "female";
    } else if (gender === "male") {
      return "male";
    } else {
      return "question";
    }
  },
  money: (num) => {
    return formatters.money(num);
  },
  number: (num) => {
    return formatters.num(num);
  }
});

Template.insightsBreakdown.events({
  "click #refresh-age-gender": (event, instance) => {
    Meteor.call('refreshAgeGender', FlowRouter.getParam('campaign_id'));
    $('.tooltipped').tooltip('remove');
  }
});


Template.insightsBreakdown.onDestroyed(function () {

});
