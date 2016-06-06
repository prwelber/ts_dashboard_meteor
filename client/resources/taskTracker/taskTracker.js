import { Meteor } from 'meteor/meteor'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Moment } from 'meteor/momentjs:moment'
import CampaignBasics from '/collections/CampaignBasics'
import Initiatives from '/collections/Initiatives'

Template.taskTracker.helpers({
  isReady: function (sub) {
    if (sub) {
      return FlowRouter.subsReady(sub)
    } else {
      return FlowRouter.subsReady();
    }
  },
  getInit: () => {
    return Initiatives.findOne({_id: FlowRouter.getParam('_id')});
  },
  "targetingChecked": function () {
    if (FlowRouter.subsReady()) {
      const init = Initiatives.findOne({_id: FlowRouter.getParam('_id')});
      return init.approved_targeting === true ? "checked" : "";
    }
  },
  "creativeChecked": function () {
    if (FlowRouter.subsReady()) {
      const init = Initiatives.findOne({_id: FlowRouter.getParam('_id')});
      return init.received_creative === true ? "checked" : "";
    }
  },
  "trackingChecked": function () {
    if (FlowRouter.subsReady()) {
      const init = Initiatives.findOne({_id: FlowRouter.getParam('_id')});
      return init.received_tracking === true ? "checked" : "";
    }
  },
  "signedIoChecked": function () {
    if (FlowRouter.subsReady()) {
      const init = Initiatives.findOne({_id: FlowRouter.getParam('_id')});
      return init.signed_IO === true ? "checked" : "";
    }
  },
  dailyCheck: (_id) => {
    const init = Initiatives.findOne({_id: FlowRouter.getParam('_id')});
    if (init.dailyCheck) {
      return "checked";
    }
  },
});

Template.taskTracker.events({
  "click .tracker-checkbox": function (event, template) {
    let init = Initiatives.findOne({_id: FlowRouter.getParam('_id')});
    if (event.target.name === "approvedTargeting") {
      Meteor.call("updateTargeting", init._id, ! init.approved_targeting);
    } else if (event.target.name === "receivedCreative") {
      Meteor.call("updateCreative", init._id, ! init.received_creative);
    } else if (event.target.name === "receivedTracking") {
      Meteor.call("updateTracking", init._id, ! init.received_tracking);
    } else if (event.target.name === "signedIO") {
      Meteor.call("updateSignedIO", init._id, ! init.signed_IO);
    }
  },
  "click .double-check": (event, instance) => {
    let id = event.target.id.toString().split("double")[1];
    if (event.target.checked === false) {
      const checked = false;
      Meteor.call('toggleDailyCheck', id, checked);
    } else if (event.target.checked === true) {
      const checked = true;
      Meteor.call('toggleDailyCheck', id, checked);
    } else {
      alert("there is a problem with this feature");
    }
  },
});

Template.taskTracker.onDestroyed(func => {

});
