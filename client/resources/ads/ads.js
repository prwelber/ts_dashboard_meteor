import CampaignInsights from '/collections/CampaignInsights'
import Initiatives from '/collections/Initiatives'
import Ads from '/collections/Ads'
const Promise = require('bluebird');
import mastFunc from '../masterFunctions'


// -------------- FUNCTIONS -------------- //
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

// ------------ END FUNCTIONS -------------- //


Template.ads.onCreated(function () {
  this.templateDict = new ReactiveDict();
  const campaign = CampaignInsights.findOne({'data.campaign_id': FlowRouter.getParam('campaign_id')});
  const init = Initiatives.findOne({name: campaign.data.initiative});
  this.templateDict.set('init', init);
});

Template.ads.onRendered(() => {
  $('.tooltipped').tooltip({delay: 50});
});

Template.ads.helpers({
  isReady: (sub) => {
    const campaignNumber = FlowRouter.current().params.campaign_id;

    if (FlowRouter.subsReady(sub) && Ads.find({'data.campaign_id': campaignNumber}).count() === 0) {

      var target = document.getElementById("spinner-div");
      let spun = Blaze.render(Template.spin, target);

      var call = Promise.promisify(Meteor.call);
      call('getAds', campaignNumber)
      .then(function (result) {
        Blaze.remove(spun);
      }).catch(function (err) {
        console.log('uh no error', err)
      });
    } else {
      return true;
    }
  },
  'getAds': function () {
    const campaignNumber = FlowRouter.current().params.campaign_id;
    const init = Template.instance().templateDict.get('init');

    if (Ads.find({'data.campaign_id': campaignNumber}).count() >= 1) {
      let ads = Ads.find({'data.campaign_id': campaignNumber}, {sort: {'data.name': 1}}).fetch();

      try {
        // TODO control flow to handle single ad, set of ads, carousel
        // maybe do by length or mongo Array or by property / key name
        if (ads.length === 1) {

          ads[0].data.cost_per_link_click = mastFunc.money(ads[0].data.cost_per_link_click);
          if (ads[0].data.video_view > 1) {
            ads[0].data.cost_per_video_view = mastFunc.money(ads[0].data.cost_per_video_view);
            ads[0].data.cost_per_video_play = mastFunc.money(ads[0].data.cost_per_video_play);
          }
        } else if (ads.length > 1) {
          ads.forEach(el => {

            el.data.cost_per_link_click = mastFunc.money(el.data.cost_per_link_click);
              if (el.data.video_view) {
                el.data.cost_per_video_view = mastFunc.money(el.data.cost_per_video_view);
              }
          });
        }

        if (init.lineItems[0].cost_plus === true) {
          const costPlusPercent = stringToCostPlusPercentage(init.lineItems[0].costPlusPercent);
          let adSpend = 0;
          ads.forEach((ad) => {
            adSpend = accounting.unformat(ad.data.spend) * costPlusPercent;
            ad.data.spend = adSpend;
            ad.data.cpm = adSpend / (ad.data.impressions / 1000);
            ad.data.cpc = adSpend / ad.data.clicks;
            ad.data.cpl = adSpend / ad.data.like;
            ad.data['cost_per_total_action'] = adSpend / ad.data.total_actions;
            ad.data.cost_per_video_view = adSpend / ad.data.video_view;
            ad.data.cost_per_post_engagement = adSpend / ad.data.post_engagement;
            ad.data.cost_per_post_like = adSpend / ad.data.post_like;
            ad.data.cost_per_link_click = adSpend / ad.data.link_click;
            ad.data.cost_per_website_clicks = adSpend / ad.data.website_clicks;
          });
          return ads;
        } else if (init.lineItems[0].percent_total === true) {
          let adSpend = 0;
          let quotedPrice = init.lineItems[0].price;
          let action = defineAction(init);

          ads.forEach((ad) => {
            if (action === "impressions") {
              adSpend = (ad.data.impressions / 1000) * quotedPrice;
            } else {
              adSpend = ad.data[action] * quotedPrice;
            }
            ad.data.spend = adSpend;
            ad.data.cpm = adSpend / (ad.data.impressions / 1000);
            ad.data.cpc = adSpend / ad.data.clicks;
            ad.data.cpl = adSpend / ad.data.like;
            ad.data['cost_per_total_action'] = adSpend / ad.data.total_actions;
            ad.data.cost_per_video_view = adSpend / ad.data.video_view;
            ad.data.cost_per_post_engagement = adSpend / ad.data.post_engagement;
            ad.data.cost_per_post_like = adSpend / ad.data.post_like;
            ad.data.cost_per_link_click = adSpend / ad.data.link_click;
            ad.data.cost_per_website_clicks = adSpend / ad.data.website_clicks;
          });
          return ads;
        } else {
          return '';
        }
      } catch (e) {
        console.log("Error in ads controller", e);
      }
    }
  },
  money: (num) => {
    return mastFunc.money(num);
  },
  'getCampaignNumber': function () {
      let campaignNumber = FlowRouter.current().params.campaign_id;
      return campaignNumber;
  },
  number: (num) => {
    return mastFunc.num(num);
  },
});

Template.ads.events({
  'click #refresh-ads': (event, template) => {
    const campId = event.target.dataset.id;
    Meteor.call('refreshAds', campId);
  }
});

Template.ads.onDestroyed(func => {
  $('.tooltipped').tooltip('remove');
});
