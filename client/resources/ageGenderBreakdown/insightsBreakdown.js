import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Promise from 'bluebird';
import { formatters } from '/both/utilityFunctions/formatters';
import CampaignInsights from '/collections/CampaignInsights';
import InsightsBreakdowns from '/collections/InsightsBreakdowns';
import Initiatives from '/collections/Initiatives';

// ---------------------- FUNCTIONS ------------------------ //
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

Template.insightsBreakdown.onCreated(function () {
  this.templateDict = new ReactiveDict();
  const initiative = Initiatives.findOne(
    {"campaign_ids": {$in: [FlowRouter.current().params.campaign_id]}
  });
  this.templateDict.set( 'initiative', initiative );
});

Template.insightsBreakdown.onRendered( function () {
  $('.tooltipped').tooltip({delay: 25});
});

Template.insightsBreakdown.helpers({
  isReady: (sub1, sub2) => {
    const campaignNumber = FlowRouter.getParam("campaign_id");

    if ((FlowRouter.subsReady(sub1) && FlowRouter.subsReady(sub2)) && (FlowRouter.getQueryParam('platform') === 'twitter')) {
        return true;
    }

    if ((FlowRouter.subsReady(sub1) && FlowRouter.subsReady(sub2)) && InsightsBreakdowns.find({'data.campaign_id': campaignNumber}).count() === 0) {

      var target = document.getElementById("spinner-div");
      let spun = Blaze.render(Template.spin, target);

      var call = Promise.promisify(Meteor.call);
      call('getBreakdown', campaignNumber)
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
  isTwitter: () => {
    if (FlowRouter.getQueryParam('platform') === 'twitter') {
      return true;
    }
  },
  'getBreakdown': function () {
    // console.log('getBreakdown running');
    const campaignNumber = FlowRouter.getParam("campaign_id");
    let breakdown = InsightsBreakdowns.findOne({'data.campaign_id': campaignNumber});
    const init = Initiatives.findOne({campaign_ids: {$in: [campaignNumber]}});

    if (breakdown) {
      let ageGenderInsights =  InsightsBreakdowns.find({'data.campaign_id': campaignNumber}, {sort: {'data.age': 1, 'data.gender': 1}}).fetch();

      if (init.lineItems[0].cost_plus === true) {
          // run cost plus calculations
          const costPlusPercent = stringToCostPlusPercentage(init.lineItems[0].costPlusPercent);
          let insightSpend = 0;
          ageGenderInsights.forEach((insight) => {
            insightSpend = accounting.unformat(insight.data.spend) * costPlusPercent;
            insight.data.spend = insightSpend;
            insight.data.cpm = insightSpend / (insight.data.impressions / 1000);
            insight.data.cpc = insightSpend / insight.data.clicks;
            insight.data.cpl = insightSpend / insight.data.like;
            insight.data['cost_per_total_action'] = insightSpend / insight.data.total_actions;
            insight.data.cost_per_video_view = insightSpend / insight.data.video_view;
            insight.data.cost_per_page_engagement = insightSpend / insight.data.page_engagement;
            insight.data.cost_per_post_like = insightSpend / insight.data.post_like;
            insight.data.cost_per_link_click = insightSpend / insight.data.link_click;
          });
          return ageGenderInsights;

        } else if (init.lineItems[0].percent_total === true) {
          // run cost plus calculations
          let insightSpend = 0;
          let quotedPrice = init.lineItems[0].price;
          let action = defineAction(init)

          ageGenderInsights.forEach((insight) => {
            // need to get day spend according to the quotedPrice on IO
            if (action === "impressions") {
              insightSpend = (insight.data.impressions / 1000) * quotedPrice;
            } else {
              insightSpend = insight.data[action] * quotedPrice;
            }
            insight.data.spend = insightSpend;
            insight.data.cpm = insightSpend / (insight.data.impressions / 1000);
            insight.data.cpc = insightSpend / insight.data.clicks;
            insight.data.cpl = insightSpend / insight.data.like;
            insight.data['cost_per_total_action'] = insightSpend / insight.data.total_actions;
            insight.data.cost_per_video_view = insightSpend / insight.data.video_view;
            insight.data.cost_per_page_engagement = insightSpend / insight.data.page_engagement;
            insight.data.cost_per_post_like = insightSpend / insight.data.post_like;
            insight.data.cost_per_link_click = insightSpend / insight.data.link_click
          });
          return ageGenderInsights;

        } else {
          return '';
        }




      return ageGenderInsights;
    }
  },
  'campaignInfo': function () {
    return CampaignInsights.findOne({'data.campaign_id': FlowRouter.current().params.campaign_id}).data;
  },
  getGender: (gender) => {
    if (gender === "female") {
      return "female";
    } else if (gender === "male") {
      return "male";
    } else {
      return "question";
    }
  },
  money: (num) => {
    return formatters.money(num);
  },
  number: (num) => {
    return formatters.num(num);
  },
  ageGenderImpressions: () => {
    const initiative = Template.instance().templateDict.get('initiative');
    var call = Promise.promisify(Meteor.call);
    const dealType = initiative.lineItems[0].dealType;

    call('ageGenderChart', initiative)
    .then(function (ageGenderData) {
      Session.set('maleData', ageGenderData.male);
      Session.set('femaleData', ageGenderData.female);
    })
    .catch(function (err) {
      console.log('boooo error', err)
      throw new Meteor.Error('this is a Meteor Error!!!!');
    });

    let action = "impressions";

    const maleData = [];
    const femaleData = [];
    // set maleData
    if (Session.get('maleData') && Session.get('maleData')[1].spend) {
      for (let i = 0; i < 6; i++ ) {
        maleData.push(Session.get('maleData')[i][action]);
      }
    }

    if (Session.get('femaleData') && Session.get('femaleData')[1].spend) {
      for (let i = 0; i < 6; i++ ) {
        femaleData.push(Session.get('femaleData')[i][action] * -1);
      }
    }

    // Age categories
    var categories = ['18-24', '25-34', '35-44', '45-54',
            '55-64', '65+'];

    return {

      chart: {
          type: 'bar'
      },
      title: {
          text: 'Impressions'
      },
      xAxis: [{
          categories: categories,
          reversed: false,
          labels: {
              step: 1
          }
      }, { // mirror axis on right side
          opposite: true,
          reversed: false,
          categories: categories,
          linkedTo: 0,
          labels: {
              step: 1
          }
      }],
      yAxis: {
          title: {
              text: action
          },
          labels: {
            formatter: function () {
              return formatters.num(Math.abs(this.value));
            }
          }
      },

      plotOptions: {
          series: {
              stacking: 'normal'
          }
      },

      tooltip: {
          formatter: function () {
              return '<b>' + this.series.name + ', age ' + this.point.category + '</b><br/>' +
                  action+ " " + Highcharts.numberFormat(Math.abs(this.point.y), 0);
          }
      },

      series: [{
          name: 'Female',
          data: femaleData
      }, {
          name: 'Male',
          data: maleData
      }]
    }
  },
  'ageGenderClicks': function () {
    const initiative = Template.instance().templateDict.get('initiative');
    var call = Promise.promisify(Meteor.call);
    const dealType = initiative.lineItems[0].dealType;

    // call('ageGenderChart', initiative)
    // .then(function (ageGenderData) {
    //   Session.set('maleData', ageGenderData.male);
    //   Session.set('femaleData', ageGenderData.female);
    // })
    // .catch(function (err) {
    //   console.log('boooo error', err)
    //   throw new Meteor.Error('this is a Meteor Error!!!!');
    // });

    let action = "clicks";

    const maleData = [];
    const femaleData = [];
    // set maleData
    if (Session.get('maleData') && Session.get('maleData')[1].spend) {
      for (let i = 0; i < 6; i++ ) {
        maleData.push(Session.get('maleData')[i][action]);
      }
    }

    if (Session.get('femaleData') && Session.get('femaleData')[1].spend) {
      for (let i = 0; i < 6; i++ ) {
        femaleData.push(Session.get('femaleData')[i][action] * -1);
      }
    }

    // Age categories
    var categories = ['18-24', '25-34', '35-44', '45-54',
            '55-64', '65+'];

    return {

      chart: {
          type: 'bar'
      },
      title: {
          text: 'Clicks'
      },
      xAxis: [{
          categories: categories,
          reversed: false,
          labels: {
              step: 1
          }
      }, { // mirror axis on right side
          opposite: true,
          reversed: false,
          categories: categories,
          linkedTo: 0,
          labels: {
              step: 1
          }
      }],
      yAxis: {
        title: {
            text: action
        },
        labels: {
          formatter: function () {
            return formatters.num(Math.abs(this.value));
          }
        }
      },

      plotOptions: {
          series: {
              stacking: 'normal'
          }
      },

      tooltip: {
          formatter: function () {
              return '<b>' + this.series.name + ', age ' + this.point.category + '</b><br/>' +
                  action+ " " + Highcharts.numberFormat(Math.abs(this.point.y), 0);
          }
      },

      series: [{
          name: 'Female',
          data: femaleData
      }, {
          name: 'Male',
          data: maleData
      }]
    }
  },
  'ageGenderPostEngagement': function () {
    const initiative = Template.instance().templateDict.get('initiative');
    var call = Promise.promisify(Meteor.call);

    let action = "postEng";

    const maleData = [];
    const femaleData = [];
    // set maleData
    if (Session.get('maleData') && Session.get('maleData')[1].spend) {
      for (let i = 0; i < 6; i++ ) {
        maleData.push(Session.get('maleData')[i][action]);
      }
    }

    if (Session.get('femaleData') && Session.get('femaleData')[1].spend) {
      for (let i = 0; i < 6; i++ ) {
        femaleData.push(Session.get('femaleData')[i][action] * -1);
      }
    }

    // Age categories
    var categories = ['18-24', '25-34', '35-44', '45-54',
            '55-64', '65+'];

    return {

      chart: {
          type: 'bar'
      },
      title: {
          text: 'Post Engagement'
      },
      xAxis: [{
          categories: categories,
          reversed: false,
          labels: {
              step: 1
          }
      }, { // mirror axis on right side
          opposite: true,
          reversed: false,
          categories: categories,
          linkedTo: 0,
          labels: {
              step: 1
          }
      }],
      yAxis: {
        title: {
            text: "Post Engagement"
        },
        labels: {
          formatter: function () {
            return formatters.num(Math.abs(this.value));
          }
        }
      },

      plotOptions: {
          series: {
              stacking: 'normal'
          }
      },

      tooltip: {
          formatter: function () {
              return '<b>' + this.series.name + ', age ' + this.point.category + '</b><br/>' +
                  "Post Engagements:"+ " " + Highcharts.numberFormat(Math.abs(this.point.y), 0);
          }
      },

      series: [{
          name: 'Female',
          data: femaleData
      }, {
          name: 'Male',
          data: maleData
      }]
    }
  },
  'ageGenderVideoView': function () {
    const initiative = Template.instance().templateDict.get('initiative');
    var call = Promise.promisify(Meteor.call);

    let action = "videoView";

    const maleData = [];
    const femaleData = [];
    // set maleData
    if (Session.get('maleData') && Session.get('maleData')[1].spend) {
      for (let i = 0; i < 6; i++ ) {
        maleData.push(Session.get('maleData')[i][action]);
      }
    }

    if (Session.get('femaleData') && Session.get('femaleData')[1].spend) {
      for (let i = 0; i < 6; i++ ) {
        femaleData.push(Session.get('femaleData')[i][action] * -1);
      }
    }

    // Age categories
    var categories = ['18-24', '25-34', '35-44', '45-54',
            '55-64', '65+'];

    return {

      chart: {
          type: 'bar'
      },
      title: {
          text: 'Video Views'
      },
      xAxis: [{
          categories: categories,
          reversed: false,
          labels: {
              step: 1
          }
      }, { // mirror axis on right side
          opposite: true,
          reversed: false,
          categories: categories,
          linkedTo: 0,
          labels: {
              step: 1
          }
      }],
      yAxis: {
        title: {
            text: "Video Views"
        },
        labels: {
          formatter: function () {
            return formatters.num(Math.abs(this.value));
          }
        }
      },

      plotOptions: {
          series: {
              stacking: 'normal'
          }
      },

      tooltip: {
          formatter: function () {
              return '<b>' + this.series.name + ', age ' + this.point.category + '</b><br/>' +
                  "Video Views:"+ " " + Highcharts.numberFormat(Math.abs(this.point.y), 0);
          }
      },

      series: [{
          name: 'Female',
          data: femaleData
      }, {
          name: 'Male',
          data: maleData
      }]
    }
  },
  'ageGenderReach': function () {
    const initiative = Template.instance().templateDict.get('initiative');
    var call = Promise.promisify(Meteor.call);

    let action = "reach";

    const maleData = [];
    const femaleData = [];
    // set maleData
    if (Session.get('maleData') && Session.get('maleData')[1].spend) {
      for (let i = 0; i < 6; i++ ) {
        maleData.push(Session.get('maleData')[i][action]);
      }
    }

    if (Session.get('femaleData') && Session.get('femaleData')[1].spend) {
      for (let i = 0; i < 6; i++ ) {
        femaleData.push(Session.get('femaleData')[i][action] * -1);
      }
    }

    // Age categories
    var categories = ['18-24', '25-34', '35-44', '45-54',
            '55-64', '65+'];

    return {

      chart: {
          type: 'bar'
      },
      title: {
          text: 'Reach'
      },
      xAxis: [{
          categories: categories,
          reversed: false,
          labels: {
              step: 1
          }
      }, { // mirror axis on right side
          opposite: true,
          reversed: false,
          categories: categories,
          linkedTo: 0,
          labels: {
              step: 1
          }
      }],
      yAxis: {
        title: {
            text: "Reach"
        },
        labels: {
          formatter: function () {
            return formatters.num(Math.abs(this.value));
          }
        }
      },

      plotOptions: {
          series: {
              stacking: 'normal'
          }
      },

      tooltip: {
          formatter: function () {
              return '<b>' + this.series.name + ', age ' + this.point.category + '</b><br/>' +
                  "Reach:"+ " " + Highcharts.numberFormat(Math.abs(this.point.y), 0);
          }
      },

      series: [{
          name: 'Female',
          data: femaleData
      }, {
          name: 'Male',
          data: maleData
      }]
    }
  },
  'ageGenderTotalActions': function () {
    const initiative = Template.instance().templateDict.get('initiative');
    var call = Promise.promisify(Meteor.call);

    let action = "totalActions";

    const maleData = [];
    const femaleData = [];
    // set maleData
    if (Session.get('maleData') && Session.get('maleData')[1].spend) {
      for (let i = 0; i < 6; i++ ) {
        maleData.push(Session.get('maleData')[i][action]);
      }
    }

    if (Session.get('femaleData') && Session.get('femaleData')[1].spend) {
      for (let i = 0; i < 6; i++ ) {
        femaleData.push(Session.get('femaleData')[i][action] * -1);
      }
    }
    // Age categories
    var categories = ['18-24', '25-34', '35-44', '45-54',
            '55-64', '65+'];

    return {

      chart: {
          type: 'bar'
      },
      title: {
          text: 'Total Actions'
      },
      xAxis: [{
          categories: categories,
          reversed: false,
          labels: {
              step: 1
          }
      }, { // mirror axis on right side
          opposite: true,
          reversed: false,
          categories: categories,
          linkedTo: 0,
          labels: {
              step: 1
          }
      }],
      yAxis: {
        title: {
            text: "Total Actions"
        },
        labels: {
          formatter: function () {
            return formatters.num(Math.abs(this.value));
          }
        }
      },

      plotOptions: {
          series: {
              stacking: 'normal'
          }
      },

      tooltip: {
          formatter: function () {
              return '<b>' + this.series.name + ', age ' + this.point.category + '</b><br/>' +
                  "Total Actions:"+ " " + Highcharts.numberFormat(Math.abs(this.point.y), 0);
          }
      },

      series: [{
          name: 'Female',
          data: femaleData
      }, {
          name: 'Male',
          data: maleData
      }]
    }
  },
  updated: () => {
    if (Session.get('maleData')) {
      return moment(Session.get('maleData')[1].inserted, moment.ISO_8601).format('MM-DD-YYYY');
    }
  }
});

Template.insightsBreakdown.events({
  "click #refresh-age-gender": (event, instance) => {
    Meteor.call('refreshAgeGender', FlowRouter.getParam('campaign_id'));
    $('.tooltipped').tooltip('remove');
  },
  'click .twitter-gender': (event, instance) => {
    const start = FlowRouter.getQueryParam('start_time');
    const stop = FlowRouter.getQueryParam('stop_time');
    const campaignId = FlowRouter.getQueryParam('campaign_id');
    const accountId = FlowRouter.getQueryParam('account_id');
    const name = FlowRouter.getQueryParam('name');
    // const initName = FlowRouter.getQueryParam('initiative');

    Meteor.call('getTwitterGenderInsights', accountId, campaignId, start, stop, name, (err, res) => {
      if (err) { console.log('ERR', err) }
      if (res) {
        console.log('RESULT', res);
      }
    });
  }
});


Template.insightsBreakdown.onDestroyed(function () {
  // Session.set('maleData', null);
  // Session.set('femaleData', null);
});
