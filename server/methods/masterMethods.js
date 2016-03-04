Meteor.methods({
  "removeAll": function () {
    Meteor.call("removeInsights");
    Meteor.call("removeCampaigns");
    Meteor.call("removeHourly");
    Meteor.call("removeBreakdowns");
    Meteor.call("removeDaily");
    Meteor.call("removeAdSets");
    Meteor.call("removeAds");
  }
});
