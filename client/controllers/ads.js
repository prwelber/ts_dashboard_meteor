// Meteor.subscribe('AdsList');

Tracker.autorun(function () {
    if (FlowRouter.subsReady('AdsList')) {
        console.log('AdsList subs ready!');
    }
});

Template.ads.helpers({
    'getAds': function () {
      console.log('checking for ads');
      let campaignNumber = FlowRouter.current().params.campaign_id;
      let ad = Ads.findOne({'data.campaign_id': campaignNumber});
      if (!ad) {
        console.log('need to fetch ads')
        Meteor.call('getAds', campaignNumber)
      } else {
        console.log("you should be seeing ads");
        ads = Ads.find({'data.campaign_id': campaignNumber});
        try {
          // TODO control flow to handle single ad, set of ads, carousel
          ads.data.cpc = mastFunc.money(ads.data.cpc);
          ads.data.cpm = mastFunc.money(ads.data.cpm);
          ads.data.cpp = mastFunc.money(ads.data.cpp);
          ads.data.cost_per_page_engagement = mastFunc.money(ads.data.cost_per_page_engagement
          );
          ads.data.cost_per_post_engagement = mastFunc.money(ads.data.cost_per_post_engagement);
        } catch (e) {
          console.log(e)
        } finally {
          return ads
        }
      }
    },
    'getCampaignNumber': function () {
        let campaignNumber = FlowRouter.current().params.campaign_id;
        return campaignNumber;
    }
});
