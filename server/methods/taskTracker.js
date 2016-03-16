Meteor.methods({
  "updateTargeting": function (campId, status) {
    CampaignBasics.update(
      {campaign_id: campId},
      {$set: {
        approved_targeting: status
      }
    });
  },
  "updateCreative": function (campId, status) {
    CampaignBasics.update(
      {campaign_id: campId},
      {$set: {
        received_creative: status
      }
    });
  },
  "updateTracking": function (campId, status) {
    CampaignBasics.update(
      {campaign_id: campId},
      {$set: {
        received_tracking: status
      }
    });
  },
  "updateSignedIO": function (campId, status) {
    CampaignBasics.update(
      {campaign_id: campId},
      {$set: {
        signed_IO: status
      }
    });
  }
});
