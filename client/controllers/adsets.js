var Promise = require('bluebird');

Tracker.autorun(function () {
  if (FlowRouter.subsReady('AdSetsList')) {
    console.log('AdSetsList subs ready!');
  }
});

Template.adsets.helpers({
  isReady: function (sub) {
    const campaignNumber = FlowRouter.current().params.campaign_id;

    if (FlowRouter.subsReady(sub) && AdSets.find({'data.campaign_id': campaignNumber}).count() === 0) {

      var target = document.getElementById("spinner-div");
      let spun = Blaze.render(Template.spin, target);

      var call = Promise.promisify(Meteor.call);
      call('getAdSets', campaignNumber)
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
  'getAdSets': function () {
    const campaignNumber = FlowRouter.current().params.campaign_id;

    if (AdSets.find({'data.campaign_id': campaignNumber}).count() >= 1) {
      let adsets = AdSets.find({'data.campaign_id': campaignNumber}).fetch();
      adsets.forEach(el => {
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
      return adsets;
    }
  },
  'getCampaignNumber': function () {
    let campaignNumber = FlowRouter.current().params.campaign_id;
    return campaignNumber;
  },
    'isActive': function (pathName) {
      let pathNameRegEx;
      if (pathName === "overview") {
        pathNameRegEx = /overview/;
      } else if (pathName === "targeting") {
        pathNameRegEx = /targeting/;
      } else if (pathName === "creative") {
        pathNameRegEx = /creative/;
      } else if (pathName === "breakdowns") {
        pathNameRegEx = /breakdowns/;
      } else if (pathName === "daybreakdowns") {
        pathNameRegEx = /daybreakdowns/;
      } else if (pathName === "hourlybreakdowns") {
        pathNameRegEx = /hourlybreakdowns/;
      } else if (pathName === "charts") {
        pathNameRegEx = /charts/;
      }
      if (pathNameRegEx.test(FlowRouter.current().path) === true) {
        return "active";
      } else {
        return '';
      }
    }
});

Template.adsets.onDestroyed(func => {
});
