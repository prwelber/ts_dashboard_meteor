import CampaignInsights from '/collections/CampaignInsights'
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays'
import { Meteor } from 'meteor/meteor'
import { FlowRouter } from 'meteor/kadira:flow-router'
import Promise from 'bluebird'
import moment from 'moment';
import { formatters } from '/both/utilityFunctions/formatters';

// Tracker.autorun(function () {
//   if (FlowRouter.subsReady('insightsBreakdownByDaysList')) {
//     console.log('insightsBreakdownByDays subs ready!');
//   }
// });

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
          console.log("result from promise", result)
          Blaze.remove(spun);
        }).catch(function (err) {
          console.log('uh no error', err)
        });
    } else {
      return true;
    }
  },
  'getDailyBreakdown': () => {
      const campaignNumber = FlowRouter.getParam('campaign_id');
      let dailyBreakdown = InsightsBreakdownsByDays.findOne({'data.campaign_id': campaignNumber});
      if(dailyBreakdown) {
        return InsightsBreakdownsByDays.find({'data.campaign_id': campaignNumber}, {sort: {'data.date_start': -1}});
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
  }
});

Template.insightsBreakdownDaily.onDestroyed(func => {
    $("#message-box li").remove();
})
