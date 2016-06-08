import { Mongo } from 'meteor/mongo';

const Uploads = new Mongo.Collection('Uploads');

// Meteor.startup(function () {
//   CampaignInsights._ensureIndex({ "data.campaign_id": 1}, {unique: true});
// });

export default Uploads
