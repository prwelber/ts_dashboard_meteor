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
      return days[0].data.inserted;
    }
  },
  'getDailyBreakdown': () => {
      const campaignNumber = FlowRouter.getParam('campaign_id');
      let dailyBreakdown = InsightsBreakdownsByDays.findOne({'data.campaign_id': campaignNumber});
      let init;
      if (dailyBreakdown.data) {
        init = Initiatives.findOne({name: dailyBreakdown.data.initiative});
      }
      // need to get index of line item
      // match objective to lineItem objective
      const objective = dailyBreakdown.data.objective.toLowerCase().replace(/_/g, " ");

      const word = capitalize(objective);
      const item = _.where(init.lineItems, {objective: word});
      const index = parseInt(item[0].name.substring(item[0].name.length, item[0].name.length - 1)) - 1; // minus 1 to adjust for zero index on lineItems array
      Template.instance().templateDict.set('initiative', init);
      if (dailyBreakdown) {
        let days = InsightsBreakdownsByDays.find({'data.campaign_id': campaignNumber}, {sort: {'data.date_start': -1}}).fetch();

        if (init.lineItems[index].cost_plus === true) {
          // run cost plus calculations
          const costPlusPercent = stringToCostPlusPercentage(init.lineItems[0].costPlusPercent);
          let daySpend = 0;
          days.forEach((day) => {
            daySpend = accounting.unformat(day.data.spend) * costPlusPercent;
            day.data.spend = daySpend;
            day.data.cpm = daySpend / (day.data.impressions / 1000);
            day.data.cpc = daySpend / day.data.clicks;
            day.data.cpl = daySpend / day.data.like;
            day.data['cost_per_total_action'] = daySpend / day.data.total_actions;
            day.data.cost_per_video_view = daySpend / day.data.video_view;
            day.data.cost_per_page_engagement = daySpend / day.data.page_engagement;
            day.data.cost_per_post_like = daySpend / day.data.post_like;
            day.data.cost_per_link_click = daySpend / day.data.link_click;
          });
          return days;

        } else if (init.lineItems[index].percent_total === true) {
          // run cost plus calculations
          let daySpend = 0;
          let quotedPrice = init.lineItems[index].price;
          let action = defineAction(init)

          days.forEach((day) => {
            // need to get day spend according to the quotedPrice on IO
            daySpend = calcFactorSpend.calcFactorSpend(quotedPrice, day.data, init, index);
            day.data.spend = daySpend;
            day.data.cpm = daySpend / (day.data.impressions / 1000);
            day.data.cpc = daySpend / day.data.clicks;
            day.data.cpl = daySpend / day.data.like;
            day.data['cost_per_total_action'] = daySpend / day.data.total_actions;
            day.data.cost_per_video_view = daySpend / day.data.video_view;
            day.data.cost_per_page_engagement = daySpend / day.data.page_engagement;
            day.data.cost_per_post_like = daySpend / day.data.post_like;
            day.data.cost_per_link_click = daySpend / day.data.link_click
          });
          return days;

        } else {
          return '';
        }

        // return days;
      } else {
          var target = document.getElementById("spinner-div");
          let spun = Blaze.render(Template.spin, target);
          Meteor.call('getDailyBreakdown', campaignNumber, Session.get("campaign_name"), Session.get("end_date"), function (err, result) {
            if (err) {
              console.log(err);
            } else if (result) {
              Blaze.remove(spun);
            }
          });
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
  money: (num) => {
    return formatters.money(num);
  },
  number: (num) => {
    return formatters.num(num);
  },
  reportLink: () => {
    const route = FlowRouter.current().path;
    return route.substring(0,24) + 'report';

  }
});

Template.insightsBreakdownDaily.onDestroyed(func => {
    $("#message-box li").remove();
})
