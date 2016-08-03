import { Meteor } from 'meteor/meteor'
import CampaignInsights from '/collections/CampaignInsights'
import Initiatives from '/collections/Initiatives'
import AdSets from '/collections/AdSets'
import mastFunc from '../masterFunctions'
import { FlowRouter } from 'meteor/kadira:flow-router';
import { calcFactorSpend } from '/both/utilityFunctions/factorSpendFunction';
var Promise = require('bluebird');

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

const lower = function lower (objective) {
  let word = objective[0]
  for (let i = 1; i < objective.length; i++) {
    if (objective[i - 1] === " ") {
      word += objective[i].toUpperCase();
    } else {
      word += objective[i].toLowerCase();
    }
  }
  return word;
}

// ------------ END FUNCTIONS -------------- //

Template.adsets.onCreated(function () {
  this.templateDict = new ReactiveDict();
  const campaign = CampaignInsights.findOne({'data.campaign_id': FlowRouter.getParam('campaign_id')});
  const init = Initiatives.findOne({name: campaign.data.initiative});
  this.templateDict.set('init', init);
});

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
    const init = Template.instance().templateDict.get('init');
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

      if (init.lineItems[0].cost_plus === true) {
        const costPlusPercent = stringToCostPlusPercentage(init.lineItems[0].costPlusPercent);
        let adSetSpend = 0;
        adsets.forEach((adset) => {
          adSetSpend = accounting.unformat(adset.data.spend) * costPlusPercent;
          adset.data.spend = adSetSpend;
          adset.data.cpm = adSetSpend / (adset.data.impressions / 1000);
          adset.data.cpc = adSetSpend / adset.data.clicks;
          adset.data.cpl = adSetSpend / adset.data.like;
          adset.data['cost_per_total_action'] = adSetSpend / adset.data.total_actions;
          adset.data.cost_per_video_view = adSetSpend / adset.data.video_view;
          adset.data.cost_per_post_engagement = adSetSpend / adset.data.post_engagement;
          adset.data.cost_per_post_like = adSetSpend / adset.data.post_like;
          adset.data.cost_per_link_click = adSetSpend / adset.data.link_click;
          adset.data.cost_per_website_clicks = adSetSpend / adset.data.website_clicks;
        });
        return adsets;
      } else if (init.lineItems[0].percent_total === true) {

        const campData = CampaignInsights.findOne({'data.campaign_id': campaignNumber});
        const objective = campData.data.objective.replace(/_/g, " ");
        const word = lower(objective); // convert all caps objective to lowercase
        let realItem = _.where(init.lineItems, {objective: word}); // returns an array
        let index;
        if (realItem[0] === undefined) {
          index = 0;
          realItem = init.lineItems;
        }
        index = parseInt(realItem[0].name.substring(realItem[0].name.length, realItem[0].name.length - 1)) - 1; // minus 1 to account for zero indexing of lineItems array
        const quotedPrice = realItem[0].price;
        let dealType;
        realItem[0].cost_plus ? dealType = "cost_plus" : '';
        realItem[0].percent_total ? dealType = "percent_total" : '';

        let action = defineAction(init);
        let adSetSpend = 0;


        console.log(quotedPrice, index)
        adsets.forEach((adset) => {
          adSetSpend = calcFactorSpend.calcFactorSpend(quotedPrice, adset.data, init, index);
          console.log(adSetSpend, adset.data.name)
          adset.data.spend = adSetSpend;
          adset.data.cpm = adSetSpend / (adset.data.impressions / 1000);
          adset.data.cpc = adSetSpend / adset.data.clicks;
          adset.data.cpl = adSetSpend / adset.data.like;
          adset.data['cost_per_total_action'] = adSetSpend / adset.data.total_actions;
          adset.data.cost_per_video_view = adSetSpend / adset.data.video_view;
          adset.data.cost_per_post_engagement = adSetSpend / adset.data.post_engagement;
          adset.data.cost_per_post_like = adSetSpend / adset.data.post_like;
          adset.data.cost_per_link_click = adSetSpend / adset.data.link_click;
          adset.data.cost_per_website_clicks = adSetSpend / adset.data.website_clicks;
        });
        return adsets;
      } else {
        return '';
      }


      // return adsets;
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
    } else if (pathname === "report") {
      pathNameRegEx = /report/;
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
  },
  threeDigits: (number) => {
    if (number) {
      return number.toFixed(3);
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
