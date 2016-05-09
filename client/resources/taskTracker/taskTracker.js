import { Meteor } from 'meteor/meteor'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Moment } from 'meteor/momentjs:moment'
import CampaignBasics from '/collections/CampaignBasics'

Template.taskTracker.helpers({
  isReady: function (sub) {
    if (sub) {
      return FlowRouter.subsReady(sub)
    } else {
      return FlowRouter.subsReady();
    }
  },
  "targetingChecked": function () {
    if (FlowRouter.subsReady()) {
      let camp = CampaignBasics.findOne({"data.campaign_id": FlowRouter.current().params.campaign_id});
      return camp.data.approved_targeting === true ? "checked" : "";
    }
  },
  "creativeChecked": function () {
    if (FlowRouter.subsReady()) {
      let camp = CampaignBasics.findOne({"data.campaign_id": FlowRouter.current().params.campaign_id});
      return camp.data.received_creative === true ? "checked" : "";
    }
  },
  "trackingChecked": function () {
    if (FlowRouter.subsReady()) {
      let camp = CampaignBasics.findOne({"data.campaign_id": FlowRouter.current().params.campaign_id});
      return camp.data.received_tracking === true ? "checked" : "";
    }
  },
  "signedIoChecked": function () {
    if (FlowRouter.subsReady()) {
      let camp = CampaignBasics.findOne({"data.campaign_id": FlowRouter.current().params.campaign_id});
      return camp.data.signed_IO === true ? "checked" : "";
    }
  }
});

Template.taskTracker.events({
  "click .tracker-checkbox": function (event, template) {
    let camp = CampaignBasics.findOne({"data.campaign_id": FlowRouter.current().params.campaign_id});
    if (event.target.name === "approvedTargeting") {
      Meteor.call("updateTargeting", camp.data.campaign_id, ! camp.data.approved_targeting);
    } else if (event.target.name === "receivedCreative") {
      Meteor.call("updateCreative", camp.data.campaign_id, ! camp.data.received_creative);
    } else if (event.target.name === "receivedTracking") {
      Meteor.call("updateTracking", camp.data.campaign_id, ! camp.data.received_tracking);
    } else if (event.target.name === "signedIO") {
      Meteor.call("updateSignedIO", camp.data.campaign_id, ! camp.data.signed_IO);
    }
  }
});

Template.taskTracker.onDestroyed(func => {

});
