import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import moment from 'moment-timezone';
import mastFunc from '../masterFunctions';
import CampaignInsights from '/collections/CampaignInsights';
import Initiatives from '/collections/Initiatives';
import Promise from 'bluebird';
import { reportFunctions } from './reportFunctions';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';

Template.report.onCreated(function () {
  this.templateDict = new ReactiveDict();
  this.report = new ReactiveDict();
  this.report.set('report', null);
});

Template.report.onRendered(function () {
  Session.set('checkboxes', true);
  this.choices = new ReactiveDict();
});

Template.report.helpers({
  isReady: (sub1, sub2) => {
    const template = Template.instance();
    if (FlowRouter.subsReady(sub1) && FlowRouter.subsReady(sub2)) {
      const initiative = Initiatives.findOne(
        {"campaign_ids": {$in: [FlowRouter.getParam('campaign_id')]}
      });
      template.templateDict.set('initiative', initiative);
      return true;
    }
  },
  reportReady: () => {
    if (Session.get('checkboxes') === true) {
      return true;
    } else {
      return false;
    }
  },
  initiativeLineItems: () => {
    return Template.instance().templateDict.get('initiative').lineItems;
  },
  showReport: () => {
    var template = Template.instance();
    if (template.report.get('report')) {
      // if report is true (if report exists)
      Session.set('checkboxes', false);
      return true;
    }
  },
  handleData: () => {
    var template = Template.instance();
    const data = template.report.get('report');
    const actions = template.choices.get('actions');
    const performance = template.choices.get('performance');
    const init = template.templateDict.get('initiative');
    const lineItem = template.choices.get('lineItem');

    try {
      if (Array.isArray(data)) {
        template.report.set('data', reportFunctions.handleDaily(data, actions, performance, init, lineItem))
        return reportFunctions.handleDaily(data, actions, performance, init, lineItem);
      } else if (typeof data === "object") {
        return reportFunctions.handleData(data, actions, performance, init, lineItem);
      }

    } catch(e) {
      if (e instanceof TypeError) {
        alert('There was an issue with your request. Make sure you have selected a line item and/or no date or both dates. Click reset and try again.');
      }
      console.log(e);
    }

  },
  money: (num) => {
    return mastFunc.money(num);
  },
  number: (num) => {
    return mastFunc.num(num);
  },
  formatString: (str) => {
    let newStr = '';
    newStr += str[0].toUpperCase();
    for (let i = 1; i < str.length; i++) {
      if (str[i] === "_") {
        newStr += " ";
      } else if (str[i - 1] === "_" || str[i - 1] === " ") {
        newStr += str[i].toUpperCase();
      } else {
        newStr += str[i];
      }
    }
    return newStr;
  },
  campaignName: () => {
    const id = FlowRouter.getParam('campaign_id');
    const camp = CampaignInsights.findOne({'data.campaign_id': id});
    return camp.data.campaign_name;
  },
  daily: () => {
    return Session.get('daily');
  },
  shorten: (num) => {
    if (num) {
      return num.toFixed(3)
    } else {
      return '';
    }
  },
  // headers: () => {
  //   var template = Template.instance();
  //   var headers = template.choices.get('performance').concat(template.choices.get('actions'));
  //   headers.unshift('date_start');
  //   template.headers.set('headers', headers);
  //   console.log('headers', headers);
  // },
  headerTest: (word) => {
    var template = Template.instance();
    var data = template.report.get('data');
    if (data) {
      var headers = template.choices.get('performance').concat(template.choices.get('actions'));
      // word === "CPC" ? headers.unshift("cpc") : '';
      // word === "CPL" ? headers.unshift("cpl") : '';
      var lower = word.toLowerCase().replace(/ /g, "_");
      console.log("headers", headers)
      if (headers.indexOf(lower) >= 0 && (data[0][lower] || data[data.length - 1][lower])) {
        if (/Watched Actions/.test(word)) {
          const num = word.indexOf("Watched Actions") + 8;
          const shorter = word.substring(0, num - 3);
          return "<th style='padding-bottom: 8px; font-size: 16px;'>"+shorter+"</th>";
        }
        return "<th style='padding-bottom: 8px; font-size: 16px;'>"+word+"</th>";
      }
    }
  },
  dataTest: (word, date) => {
    var template = Template.instance();
    var data = template.report.get('data');
    var headers = template.choices.get('performance').concat(template.choices.get('actions'));
    var lower = word.toLowerCase().replace(/ /g, "_");
    if (headers.indexOf(lower) >= 0 && (data[0][lower] || data[data.length - 1][lower])) {
      var found = _.findWhere(data, {date_start: date});
      var newWord = word.toLowerCase().replace(/ /g, "_");
      if (found[newWord]) {
        return "<td style='padding-top: 8px; padding-bottom: 8px; font-size: 12px;'>"+found[newWord]+"</td>"
      }
    }
  }
});

Template.report.events({
  "click #report-button": (event, template) => {
    // document.querySelectorAll('input:checked');
    const start = template.$('#report-start-date').val();
    const end = template.$('#report-end-date').val();
    const daily = template.$('#daily')[0].checked;
    var perform = template.$('.performance input:checked');
    var act = template.$('.actions input:checked');
    const campNum = FlowRouter.getParam('campaign_id');
    const lineItem = template.$('#report-line-item-select').val()

    const performance = [];
    for (let i = 0; i < perform.length; i++) {
      performance.push(perform[i].id);
    }
    const actions = [];
    for (let i = 0; i < act.length; i++) {
      actions.push(act[i].id);
    }
    template.choices.set('performance', performance);
    template.choices.set('actions', actions);
    template.choices.set('lineItem', lineItem);

    var call = Promise.promisify(Meteor.call);
    console.log('daily', daily);
    if (daily) {
      Session.set('daily', true);
    }
    call('createReport', start, end, performance, actions, campNum, lineItem, daily)
    .then(function (result) {
      template.report.set('report', result);
    }).catch(function (error) {
      console.log('Error creating report', error)
    })
  },
  "click #report-reset-button": (event, template) => {
    Session.set('checkboxes', true);
    Session.set('daily', false);
    template.report.set('report', null);
  }
});

Template.report.onDestroyed( function () {
  Session.set('checkboxes', null);
  Session.set('daily', false);
  this.report.set('report', null);
});
