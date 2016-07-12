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
      return reportFunctions.handleData(data, actions, performance, init, lineItem);
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
  }
});

Template.report.events({
  "click #report-button": (event, template) => {
    // document.querySelectorAll('input:checked');
    const start = template.$('#report-start-date').val();
    const end = template.$('#report-end-date').val();
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

    call('createReport', start, end, performance, actions, campNum, lineItem)
    .then(function (result) {
      template.report.set('report', result);
    }).catch(function (error) {
      console.log('Error creating report', error)
    })
  },
  "click #report-reset-button": (event, template) => {
    Session.set('checkboxes', true);
    template.report.set('report', null);
  }
});

Template.report.onDestroyed( function () {
  Session.set('checkboxes', null);
  this.report.set('report', null);
});
