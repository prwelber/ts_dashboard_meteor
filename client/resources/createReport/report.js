import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import moment from 'moment-timezone';
import mastFunc from '../masterFunctions';
import CampaignInsights from '/collections/CampaignInsights';
import Initiatives from '/collections/Initiatives';
import Promise from 'bluebird';
import { reportFunctions } from './reportFunctions';

Template.report.onCreated(function () {
  this.templateDict = new ReactiveDict();
  this.templateDict.set('campaign_id', FlowRouter.getParam('campaign_id'));
});

Template.report.onRendered(function () {
  Session.set('checkboxes', true);
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
  }
});

Template.report.events({
  "click #report-button": (event, template) => {
    // document.querySelectorAll('input:checked');
    var checked = template.$('input:checked')
    for (let i = 0; i < checked.length; i++) {
      console.log(checked[i].id)
    }
    reportFunctions.buildQuery(checked);
  }
});

Template.report.onDestroyed( function () {

});
