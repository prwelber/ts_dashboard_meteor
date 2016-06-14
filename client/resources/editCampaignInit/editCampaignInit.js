import { Meteor } from 'meteor/meteor';
import CampaignInsights from '/collections/CampaignInsights';
import { FlowRouter } from 'meteor/kadira:flow-router';


Template.editCampaignInit.helpers({
  isReady: (sub) => {
    if (FlowRouter.subsReady(sub)) {
      return true;
    }
  },
  getCampaigns: () => {
    console.log(CampaignInsights.find({}, {fields: {'data.initiative': 1, 'data.campaign_name': 1}, limit: 25}).fetch().length);

    return CampaignInsights.find({},
      {fields: {_id: 0, 'data.initiative': 1, 'data.campaign_name': 1}, limit: 25}
    ).fetch();
  }
});

Template.editCampaignInit.events({

});
