CampaignInsights = new Mongo.Collection('campaignInsightList');

Meteor.startup(function () {
  CampaignInsights._ensureIndex({ "data.campaign_name": 1}, {unique: true});
});
