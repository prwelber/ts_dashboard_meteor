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
});

Template.report.onRendered(function () {
  Session.set('checkboxes', true);
  this.report = new ReactiveDict();
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
    return reportFunctions.handleData(data, actions, performance, init, lineItem);
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
      console.log('result', result);
      template.report.set('report', result);
    }).catch(function (error) {
      console.log('Error creating report', error)
    })
  }
});

Template.report.onDestroyed( function () {
  Session.set('checkboxes', null);
  this.report.set('report', null);
});
