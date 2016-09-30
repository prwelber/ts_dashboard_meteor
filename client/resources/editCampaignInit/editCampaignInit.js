import { Meteor } from 'meteor/meteor';
import CampaignInsights from '/collections/CampaignInsights';
import Initiatives from '/collections/Initiatives';
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.editCampaignInit.onCreated( () => {
  Session.set('templateReady', false);
});

Template.editCampaignInit.onRendered(() => {
  Session.set('limit', 25);
  Session.set('search', false);
});

Template.editCampaignInit.helpers({
  isReady: (sub) => {
    const sub2 = Meteor.subscribe('campaignInsightList');
    Tracker.autorun(() => {
      const isReady = sub2.ready();
      if (isReady) {
        if (FlowRouter.subsReady(sub)) {
          Session.set('templateReady', true)
        }
      }
    });

    // return Template.instance().templateDict.get('isItReady');
    return Session.get('templateReady');
  },
  getCampaigns: () => {
    const limit = Session.get('limit');
    const search = Session.get('search');

    const opts = false;
    Meteor.subscribe("campaignInsightList", opts, Session.get('search'));
    if (! search) {
      return CampaignInsights.find({},
        {fields: {'data.initiative': 1, 'data.campaign_name': 1, 'data.campaign_id': 1}, limit: limit, sort: {'data.campaign_name': 1}}
      ).fetch();

    } else {

      return CampaignInsights.find(
        {},
        {fields: {'data.initiative': 1, 'data.campaign_name': 1, 'data.campaign_id': 1}, limit: 25, sort: [["score", "desc"]]}
      ).fetch();
    }
  },
  getInitiatives: () => {
    return Initiatives.find({}, {fields: {name: 1}, sort: {name: 1}});
  }
});

Template.editCampaignInit.events({
  "click .change-maker": (event, instance) => {
    const campName = event.target.attributes.name.value;
    const initName = instance.$("select[name='"+campName+"']").val()
    // this method happens in server/methods/campaignInsights.js
    Meteor.call('changeCampaignInitiative', campName, initName, (err, res) => {
      if (! err) {
        console.log('change made successfully', res)
      }
    });
  },
  "keyup #search-campaigns": (event, instance) => {
    Session.set('search', event.target.value)
  }
});

Template.editCampaignInit.onDestroyed(() => {
  Session.set('templateReady', null)
  delete Session.keys.templateReady;
  Session.set('limit', null)
  delete Session.keys.limit;
  Session.set('search', null)
  delete Session.keys.search;
});
