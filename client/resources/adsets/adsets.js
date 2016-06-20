import CampaignInsights from '/collections/CampaignInsights'
import Initiatives from '/collections/Initiatives'
import AdSets from '/collections/AdSets'
import mastFunc from '../masterFunctions'

var Promise = require('bluebird');

Template.adsets.onRendered(() => {
  $('.tooltipped').tooltip({delay: 50});
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
      let adsets = AdSets.find({'data.campaign_id': campaignNumber}, {sort: {'data.end_time': -1}}).fetch();
      adsets.forEach(el => {
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

        if (el.data.post_like) {
          el.data.like = el.data.post_like;
          el.data.cpl = mastFunc.money(el.data.spend / el.data.post_like);
        } else if (el.data.page_like) {
          el.data.like = el.data.page_like;
          el.data.cpl = mastFunc.money(el.data.spend / el.data.page_like);
        }

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
  },
  money: (num) => {
    return mastFunc.money(num);
  },
  number: (num) => {
    return mastFunc.num(num);
  },
  twoDecimals: (num) => {
    return mastFunc.twoDecimals(num);
  },
  timezone: (time) => {
    return moment(time, "MM-DD-YYYY hh:mm a").tz("America/New_York").format("MM-DD-YYYY hh:mm a z");
  },
  timing: (time) => {
    if (Meteor.isProduction) {
      return moment(time, "MM-DD-YYYY hh:mm a").subtract(4, 'hours').format("MM-DD-YYYY hh:mm a");
    } else {
      return moment(time, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
    }
  }
});

Template.adsets.events({
  'click #refresh-adsets': (event, template) => {
    const campId = event.target.dataset.id
    Meteor.call('refreshAdsets', campId);
  }
})

Template.adsets.onDestroyed(func => {
  $('.tooltipped').tooltip('remove');
});
