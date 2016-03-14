// Meteor.subscribe('AdsList');

Tracker.autorun(function () {
    if (FlowRouter.subsReady('AdsList')) {
        console.log('AdsList subs ready!');
    }
});

Template.ads.helpers({
  'getAds': function () {
    let campaignNumber = FlowRouter.current().params.campaign_id;
    let ad = Ads.findOne({'data.campaign_id': campaignNumber});
    if (!ad) {
      console.log('need to fetch ads');
      var target = document.getElementById("spinner-div");
      let spun = Blaze.render(Template.spin, target);
      Meteor.call('getAds', campaignNumber, function (error, result) {
        if (result) {
          Blaze.remove(spun);
        }
      });
    } else {
      console.log("you should be seeing ads");
      ads = Ads.find({'data.campaign_id': campaignNumber}).fetch();
      try {
        // TODO control flow to handle single ad, set of ads, carousel
        // maybe do by length or mongo Array or by property / key name
        if (ads.length === 1) {
          ads[0].data.cpc = mastFunc.money(ads[0].data.cpc);
          ads[0].data.cpm = mastFunc.money(ads[0].data.cpm);
          ads[0].data.cpp = mastFunc.money(ads[0].data.cpp);
          ads[0].data.cost_per_page_engagement = mastFunc.money(ads[0].data.cost_per_page_engagement);
          ads[0].data.cost_per_post_engagement = mastFunc.money(ads[0].data.cost_per_post_engagement);
          ads[0].data.cost_per_link_click = mastFunc.money(ads[0].data.cost_per_link_click);
          if (ads[0].data.video_view > 1) {
            ads[0].data.cost_per_video_view = mastFunc.money(ads[0].data.cost_per_video_view);
            ads[0].data.cost_per_video_play = mastFunc.money(ads[0].data.cost_per_video_play);
          }
        } else if (ads.length > 1) {
          ads.forEach(el => {
            el.data.cpc = mastFunc.money(el.data.cpc);
            el.data.cpm = mastFunc.money(el.data.cpm);
            el.data.cpp = mastFunc.money(el.data.cpp);
            el.data.cost_per_page_engagement = mastFunc.money(el.data.cost_per_page_engagement);
            el.data.cost_per_post_engagement = mastFunc.money(el.data.cost_per_post_engagement);
            el.data.cost_per_link_click = mastFunc.money(el.data.cost_per_link_click);
              if (el.data.video_view) {
                el.data.cost_per_video_view = mastFunc.money(el.data.cost_per_video_view);
              }
          });
        }
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
