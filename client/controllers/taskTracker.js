Tracker.autorun(func => {
  if (FlowRouter.subsReady('campaignBasicsList')) {
    console.log('campaignBasics subs ready!');
  }
});

Template.taskTracker.helpers({
  "targetingChecked": function () {
    let camp = CampaignBasics.findOne({campaign_id: FlowRouter.current().params.campaign_id});
    return camp.approved_targeting === true ? "checked" : "";
  },
  "creativeChecked": function () {
    let camp = CampaignBasics.findOne({campaign_id: FlowRouter.current().params.campaign_id});
    return camp.received_creative === true ? "checked" : "";
  },
  "trackingChecked": function () {
    let camp = CampaignBasics.findOne({campaign_id: FlowRouter.current().params.campaign_id});
    return camp.received_tracking === true ? "checked" : "";
  },
  "signedIoChecked": function () {
    let camp = CampaignBasics.findOne({campaign_id: FlowRouter.current().params.campaign_id});
    return camp.signed_IO === true ? "checked" : "";
  }
});

Template.taskTracker.events({
  "click .tracker-checkbox": function (event, template) {
    let camp = CampaignBasics.findOne({campaign_id: FlowRouter.current().params.campaign_id});
    if (event.target.name === "approvedTargeting") {
      Meteor.call("updateTargeting", camp.campaign_id, ! camp.approved_targeting);
    } else if (event.target.name === "receivedCreative") {
      Meteor.call("updateCreative", camp.campaign_id, ! camp.received_creative);
    } else if (event.target.name === "receivedTracking") {
      Meteor.call("updateTracking", camp.campaign_id, ! camp.received_tracking);
    } else if (event.target.name === "signedIO") {
      Meteor.call("updateSignedIO", camp.campaign_id, ! camp.signed_IO);
    }
  }
});

Template.taskTracker.onDestroyed(func => {

});
