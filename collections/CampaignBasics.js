const CampaignBasics = new Mongo.Collection('campaignBasicsList')

Meteor.startup(function () {
  CampaignBasics._ensureIndex({"data.campaign_id": 1}, {unique: 1});
});

export default CampaignBasics
