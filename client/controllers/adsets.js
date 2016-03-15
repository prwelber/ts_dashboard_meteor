Tracker.autorun(function () {
  if (FlowRouter.subsReady('AdSetsList')) {
    console.log('AdSetsList subs ready!');
  }
});

Template.adsets.helpers({
  'getAdSets': function () {
    console.log('checking for adSets');
    let campaignNumber = FlowRouter.current().params.campaign_id;
    let adSet = AdSets.findOne({'data.campaign_id': campaignNumber});
    if (adSet) {
      let adSets = AdSets.find({'data.campaign_id': campaignNumber}).fetch();
      // formatting
      adSets.forEach(el => {
        console.log('formatting loop starting')
        for (let key in el.data) {
          if (key.startsWith("cost")) {       // format cost related data
            el.data[key] = mastFunc.money(el.data[key]);
          }
        }
        el.data.cpc = mastFunc.money(el.data.cpc);
        el.data.cpm = mastFunc.money(el.data.cpm);
        el.data.cpp = mastFunc.money(el.data.cpp);
        el.data.start_time = moment(el.data.start_time).format("MM-DD-YYYY hh:mm a");
        el.data.end_time = moment(el.data.end_time).format("MM-DD-YYYY hh:mm a");
      });
      return adSets;
    } else {
      var target = document.getElementById("spinner-div");
      let spun = Blaze.render(Template.spin, target);
      console.log('gotta get adSets for this one', campaignNumber);
      Meteor.call('getAdSets', campaignNumber, function (error, result) {
          if (error) {
            console.log(error);
          } else {
            Blaze.remove(spun);
          }
      });
    }
  },
  'getCampaignNumber': function () {
    let campaignNumber = FlowRouter.current().params.campaign_id;
    return campaignNumber;
  }
});

Template.adsets.onDestroyed(func => {
});
