import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { campaignDashboardFunctionObject } from './campaignDashboardFuncs';
import moment from 'moment-timezone';
import mastFunc from '../masterFunctions';
import CampaignInsights from '/collections/CampaignInsights';
import Initiatives from '/collections/Initiatives';
import Promise from 'bluebird';
// var Promise = require('bluebird');

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

// get the correct line item if I have the campaignInsight and initiative
const getLineItem = function getLineItem(campaignData, initiative) {
  const objective = campaignData.objective.replace(/_/g, " ");
  const word = lower(objective);
  let lineItem = _.where(initiative.lineItems, {objective: word})[0]; // returns an array
  let index;
  if (lineItem === undefined) {
    index = 0;
    lineItem = initiative.lineItems;
  }
  index = parseInt(lineItem.name.substring(lineItem.name.length, lineItem.name.length - 1)) - 1; // minus 1 to account for zero indexing of lineItems array
  return initiative.lineItems[index];
}


Template.campaignDashboard.onCreated( function () {
  this.templateDict = new ReactiveDict();
  if (FlowRouter.getQueryParam('platform') === 'twitter') {
    Session.set('platform', 'twitter');
  }
});

Template.campaignDashboard.onRendered(function () {
    $(".dropdown-button").dropdown({hover: true});
    $(".button-collapse").sideNav();
    const camp = CampaignInsights.findOne({'data.campaign_id': FlowRouter.getParam('campaign_id')})
    this.templateDict.set('campData', camp.data)
});

Template.campaignDashboard.events({
    'click .report-button': function () {
      let node = document.getElementsByClassName("reporting-div")[0];
      reporter = Blaze.render(Template.reporter, node);
    },
    'click #refresh-insights': function (event, template) {
      Meteor.call('refreshInsight', this.campaign_id, this.campaign_name, this.initiative);
      $("#message-box li").remove();
    },
    'click .setSessionCampName': function () {
      Session.set("campaign_name", this.campaign_name);
    },
    'click #dashboard-insights-button': function (event, template) {
      $("#dashboard-insights-button").popup({
        on: 'click'
      });
    },
    'scroll .campaign-dashboard-wrapper': (event, instance) => {
      console.log('scrolling')
    }
});











Template.campaignDashboard.helpers({
  isReady: (sub1, sub2) => {
    const template = Template.instance();
    if (FlowRouter.subsReady(sub1) && FlowRouter.subsReady(sub2)) {
      const initiative = Initiatives.findOne(
        {"campaign_ids": {$in: [FlowRouter.current().params.campaign_id]}
      });
      template.templateDict.set('initiative', initiative);
      return true;
    }
  },
  'fetchInsights': function () {
    console.log('fetch insights running')
    let sessionPlatform = Session.get('platform');
    let campaignNumber = FlowRouter.getParam('campaign_id');
    let platform = FlowRouter.getQueryParam('platform');

    if (sessionPlatform === 'twitter') {
      console.log('twitter logic for fetch insights')
      let twitterCampaign = CampaignInsights.findOne({'data.campaign_id': campaignNumber});
      if (twitterCampaign) {
        console.log('found twitter insight')
        Template.instance().templateDict.set('campData', twitterCampaign.data)
        return twitterCampaign.data;
      }
      console.log('TWITTER CAMP', twitterCampaign)
      if (!twitterCampaign) {
        const start = FlowRouter.getQueryParam('start_time');
        const stop = FlowRouter.getQueryParam('stop_time');
        const campaignId = FlowRouter.getQueryParam('campaign_id');
        const accountId = FlowRouter.getQueryParam('account_id');
        const name = FlowRouter.getQueryParam('name');
        const initName = FlowRouter.getQueryParam('initiative');
        const diff = moment(stop, moment.ISO_8601).diff(moment(start, moment.ISO_8601), 'd');
          const loops = Math.ceil(diff / 7) * 1.5;
        Materialize.toast('It can take a while to pull Twitter data, please be patient. Your estimated wait time is ' + loops + ' seconds', 8000);
        if (CampaignInsights.find({'data.campaign_id': campaignId}).count() === 0) {
          Meteor.call('getTwitterInsights', campaignId, accountId, start, stop, name, initName, (err, res) => {
            if (res === 'error') {
              alert('There has been an error, please wait a while and try again later.');
            }
          });
          return;
        }
      }
      Template.instance().templateDict.set('campData', twitterCampaign.data)
      return twitterCampaign.data;

    }
    let camp = CampaignInsights.findOne({'data.campaign_id': campaignNumber});
    if (camp) {
      camp.data.cpm = mastFunc.money(camp.data.cpm);
      camp.data.cpc = mastFunc.money(camp.data.cpc);
      if (camp.data.video_view) {
        camp.data['tenSecondView'] = camp.data['video_10_sec_watched_actions'][0]['value'];
        camp.data['costPerTenSecondView'] = mastFunc.money(camp.data['cost_per_10_sec_video_view'][0]['value']);
        camp.data['fifteenSecondView'] = camp.data['video_15_sec_watched_actions'][0]['value'];
        camp.data['avgPctWatched'] = camp.data['video_avg_pct_watched_actions'][0]['value'];
        camp.data['avgSecWatched'] = camp.data['video_avg_sec_watched_actions'][0]['value'];
        camp.data['completeWatched'] = camp.data['video_complete_watched_actions'][0]['value'];
        Template.instance().templateDict.set('campData', camp.data)
        return camp.data;
      } else {
        Template.instance().templateDict.set('campData', camp.data)
        return camp.data;
      }
    } else {
      var target = document.getElementById("spinner-div");
      let spun = Blaze.render(Template.spin, target);
      Meteor.call('getInsights', campaignNumber, Session.get("end_date"), function (err, result) {
        if (err) {
            console.log(err);
        } else {
            Blaze.remove(spun);
        }
      });
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
  getLineItem: () => {
    const init = Template.instance().templateDict.get('initiative');
    const campData = Template.instance().templateDict.get('campData');
    console.log('from getLineItem', init, campData);
    return getLineItem(campData, init);
  },
  'getInitiative': function () {
      const initiative = Template.instance().templateDict.get('initiative');
      if (!initiative) {
        if (FlowRouter.getQueryParam('platform') === 'twitter') {
          const initName = FlowRouter.getQueryParam('initiative');
          const init = Initiatives.findOne({name: initName});
          return init;
        }
      }
      return initiative;
  },
  'getBudgetTotal': function () {
    const init = Template.instance().templateDict.get('initiative');
    const total = accounting.unformat(init.budget) + accounting.unformat(init.budget2) + accounting.unformat(init.budget3) + accounting.unformat(init.budget4) + accounting.unformat(init.budget5);
    return mastFunc.money(total);
  },
  'getAggregate': function () {
    const init = Template.instance().templateDict.get('initiative');
    var call = Promise.promisify(Meteor.call);
    try {
      call('getAggregate', init.name).then(function (result) {
        // console.log('result from getAggregate', result);
      }).catch(function (err) {
        console.log('aggghhh error:', err)
      })
    } catch (e) {
      console.log('Error in dashboard getAggregate', e);
    }

    // moment stuff to figure out timeLeft on initiative
    if (init) {

      let ends = moment(init.lineItems[0].endDate, moment.ISO_8601);
      let starts = moment(init.lineItems[0].startDate, moment.ISO_8601);
      let now = moment(new Date);
      let timeLeft;

      // if now is after the end date, timeleft is zero, else...
      now.isAfter(ends) ? timeLeft = 0 : timeLeft = ends.diff(now, 'days');

      let agData = init.aggregateData // for brevity later on

      const spendPercent = numeral((agData.spend / parseFloat(init.lineItems[0].budget))).format("0.00%")

      // formats numbers
      agData = mastFunc.formatAll(agData);
    }
  },
  'makeProjections': function () {
    const initiative = Template.instance().templateDict.get('initiative');
    Meteor.call('makeProjections', initiative.name, Session.get('dayNumber'));
    // call with initiative name and dayNumber
  },
  'formatDate': (date) => {
    return moment(date, moment.ISO_8601).format("MM-DD-YYYY hh:mm a");
  },
  netInsights: () => {
    const camp = CampaignInsights.findOne({'data.campaign_id': FlowRouter.getParam('campaign_id')});
    const init = Template.instance().templateDict.get('initiative');
    const netData = campaignDashboardFunctionObject.netInsights(init, camp);
    return {netData: netData, camp: camp.data};
  },
  clientStatsSpend: (num, type) => {
    const init = Template.instance().templateDict.get('initiative');
    const campData = Template.instance().templateDict.get('campData');

    const objective = campData.objective.replace(/_/g, " ");
    const word = lower(objective); // convert all caps objective to normal grammar
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

    const clientSpend = campaignDashboardFunctionObject.clientSpend(num, type, dealType, realItem[0], quotedPrice, campData, init, index);
    // make sure client spend does not go over budget
    // if (clientSpend > parseFloat(realItem[0].budget)) {

    //   // make client spend equal budgeted amount and change
    //   Template.instance().templateDict.set('clientSpend', realItem[0].budget);
    //   return mastFunc.money(realItem[0].budget);

    // } else {
      Template.instance().templateDict.set('clientSpend', clientSpend);
      return mastFunc.money(clientSpend);
    // }
  },
  clientStats: () => {
    const clientSpend = Template.instance().templateDict.get('clientSpend');
    const campData = Template.instance().templateDict.get('campData');
    return campaignDashboardFunctionObject.clientNumbers(clientSpend, campData)
  },
  money: (num) => {
    return mastFunc.money(num);
  },
  number: (num) => {
    return mastFunc.num(num);
  },
  twoDecimals: (num) => {
    if (num) {
      return mastFunc.twoDecimals(num);
    }
  },
  timezone: (time) => {

    if (Meteor.isProduction) {
      return moment(time, "MM-DD-YYYY hh:mm a").subtract(4, 'hours').format("MM-DD-YYYY hh:mm a z");
    } else {
      return moment(time, "MM-DD-YYYY hh:mm a").tz("America/New_York").format("MM-DD-YYYY hh:mm a z");
    }
  },
  objectiveText: (text) => {
    text = text.toLowerCase();
    var newText = "";

    for (var i = 0; i < text.length; i++) {
      if (i === 0) {
        newText += text[i].toUpperCase();
      } else if (text[i-1] === "_") {
        newText += text[i].toUpperCase()
      } else {
        newText += text[i]
      }
    }

    newText = newText.split('_').join(' ');
    return newText;
  },
  spendPerc: (num) => {
    return num.toFixed(2);
  },
  getNet: () => {
    const camp = CampaignInsights.findOne({'data.campaign_id': FlowRouter.getParam('campaign_id')});
    const init = Template.instance().templateDict.get('initiative');
    const objective = camp.data.objective;
    // if (!init[objective]['net']) {

    // }
    return init[objective]['net'];
  },
  highlight: (action) => {
    const init = Template.instance().templateDict.get('initiative');
    const camp = CampaignInsights.findOne({'data.campaign_id': FlowRouter.getParam('campaign_id')});

    const lineItem = getLineItem(camp.data, init);
    if (lineItem.dealType === action) {
      return "amber lighten-5";
    } else {
      return "grey lighten-5";
    }
  },
  platformIsTwitter: () => {
    if (Session.get('platform') === 'twitter') {
      return true;
    }
  },
  twoDigits: (num) => {
    return num.toFixed(2)
  }
});

Template.campaignDashboard.onDestroyed(function () {
    $("#message-box").text("");
    Session.set('platform', null);
});
