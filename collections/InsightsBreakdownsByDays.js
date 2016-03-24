InsightsBreakdownsByDays = new Mongo.Collection('insightsBreakdownByDaysList')

Meteor.startup(function () {
  InsightsBreakdownsByDays._ensureIndex({"data.date_start": 1, "data.campaign_name": 1, "data.campaign_id": 1}, {unique: true});
});
