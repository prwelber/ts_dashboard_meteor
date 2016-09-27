import CampaignInsights from '/collections/CampaignInsights'
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays';
import Initiatives from '/collections/Initiatives';
import { Meteor } from 'meteor/meteor'
import { FlowRouter } from 'meteor/kadira:flow-router'
import Promise from 'bluebird'
import moment from 'moment';
import { formatters } from '/both/utilityFunctions/formatters';
import { calcFactorSpend } from '/both/utilityFunctions/factorSpendFunction';

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
  init.lineItems[0].dealType === "CPVV" ? action = "video_view" : '';
  return action;
}

const capitalize = function capitalize (objective) {
  let word = objective[0].toUpperCase();
  for (let i = 1; i < objective.length; i++) {
    if (objective[i - 1] === " ") {
      word += objective[i].toUpperCase();
    } else {
      word += objective[i];
    }
  }
  return word;
}



Template.insightsBreakdownDaily.onCreated(function () {
  this.templateDict = new ReactiveDict();
  const campaignNum = FlowRouter.current().params.campaign_id;
  this.templateDict.set('campNum', campaignNum);
});


Template.insightsBreakdownDaily.onRendered(function () {
  $('.tooltipped').tooltip({delay: 25});
  console.log($('p'))
});

Template.insightsBreakdownDaily.events({
  'click #refresh-daily': (event, template) => {
    Meteor.call('refreshDaily', Template.instance().templateDict.get('campNum'));
    $('.tooltipped').tooltip('remove');
  }
});

Template.insightsBreakdownDaily.helpers({
  isReady: (sub1, sub2) => {
    if ((FlowRouter.subsReady(sub1) && FlowRouter.subsReady(sub2)) && InsightsBreakdownsByDays.find().count() === 0)
    {
      var target = document.getElementById("spinner-div");
      let spun = Blaze.render(Template.spin, target);
      const campaignNumber = FlowRouter.getParam('campaign_id');
      var call = Promise.promisify(Meteor.call);
      if (FlowRouter.getQueryParam('platform') === 'twitter') {
        console.log('twitter campaign logic');


        let twitterCampaign = InsightsBreakdownsByDays.findOne({'data.campaign_id': campaignNumber});

        if (twitterCampaign) {
          console.log('found twitter daily insight')
          return true;
          // return InsightsBreakdownsByDays.find({'data.campaign_id': campaignNumber});
        }
        console.log('TWITTER CAMP', twitterCampaign)
        if (!twitterCampaign) {
          const start = FlowRouter.getQueryParam('start_time');
          const stop = FlowRouter.getQueryParam('stop_time');
          const campaignId = FlowRouter.getQueryParam('campaign_id');
          const accountId = FlowRouter.getQueryParam('account_id');
          const name = FlowRouter.getQueryParam('name');
          const initName = FlowRouter.getQueryParam('initiative');
          console.log('no twitter daily insight found, pulling new')
          const diff = moment(stop, moment.ISO_8601).diff(moment(start, moment.ISO_8601), 'd');
          const loops = Math.ceil(diff / 7) * 1.5;
          Materialize.toast('Retrieving Twitter Day by Day Insights, estimated wait time is ' + loops + ' seconds', 7000);
          if (InsightsBreakdownsByDays.find({'data.campaign_id': campaignId}).count() === 0) {
            call('getDailyTwitterInsights', campaignId, accountId, start, stop, name, initName)
            .then(function (result) {
              Blaze.remove(spun);
              if (result === 'error') {
                alert('There was an error, please wait a while and try again later.');
                return true;
              }
              console.log(result);
            }).catch(function (err) {
              console.log('ERROR!', err);
            });
            return true;
          }
        }
          return true;
        }

      // if facebook campaign
      call('getDailyBreakdown', campaignNumber)
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
  getDailyUpdatedDate: () => {
    const campaignNumber = FlowRouter.getParam('campaign_id');
    let dailyBreakdown = InsightsBreakdownsByDays.findOne({'data.campaign_id': campaignNumber});
    if (dailyBreakdown) {
      let days = InsightsBreakdownsByDays.find({'data.campaign_id': campaignNumber}, {sort: {'data.date_start': -1}}).fetch();
      return days[0].data;
    }
  },
  'getDailyTwitter': () => {
    if(FlowRouter.getQueryParam('platform') === 'twitter') {
      const campaignId = FlowRouter.getQueryParam('campaign_id');
      const allDays = InsightsBreakdownsByDays.find(
        {'data.campaign_id': campaignId},
        {sort: {'data.date_start': -1}}
      ).fetch();
      return allDays;
    }
  },
  'campaignInfo': () => {
      return CampaignInsights.findOne({'data.campaign_id': FlowRouter.current().params.campaign_id}).data;
  },
  'prettyDate': (date) => {
    if (Meteor.isProduction) {
      return moment(date, moment.ISO_8601).add(1, 'd').format("dddd MMMM DD YYYY");
    } else {
      return moment(date, moment.ISO_8601).format("dddd MMMM DD YYYY");
    }
  },
  formatDay: (day) => {
    return moment(day).format('MM.DD.YYYY')
  },
  money: (num) => {
    return formatters.money(num);
  },
  number: (num) => {
    return formatters.num(num);
  },
  reportLink: () => {
    const num = FlowRouter.getParam('campaign_id');
    return `/accounts/${num}/report`;
  },
  platformIsTwitter: () => {
    if (FlowRouter.getQueryParam('platform') === 'twitter') {
      return true;
    }
  },
  engagementRate: (impressions, engagements) => {
    return impressions / engagements;
  }
});

Template.insightsBreakdownDaily.onDestroyed(func => {
    $("#message-box li").remove();
})
