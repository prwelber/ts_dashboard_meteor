CampaignBasics = new Mongo.Collection('campaignBasicsList')

Meteor.startup(function () {
  CampaignBasics._ensureIndex({ "name": 1}, {unique: true});
});
