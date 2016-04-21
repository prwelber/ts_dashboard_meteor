const CampaignInsights = new Mongo.Collection('campaignInsightList');

Meteor.startup(function () {
  CampaignInsights._ensureIndex({ "data.campaign_id": 1}, {unique: true});
});

export default CampaignInsights
