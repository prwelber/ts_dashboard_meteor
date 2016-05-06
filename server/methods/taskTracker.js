import CampaignBasics from '/collections/CampaignBasics'

Meteor.methods({
  "updateTargeting": function (campId, status) {
    CampaignBasics.update(
      {"data.campaign_id": campId},
      {$set: {
        "data.approved_targeting": status
      }
    });
  },
  "updateCreative": function (campId, status) {
    CampaignBasics.update(
      {"data.campaign_id": campId},
      {$set: {
        "data.received_creative": status
      }
    });
  },
  "updateTracking": function (campId, status) {
    CampaignBasics.update(
      {"data.campaign_id": campId},
      {$set: {
        "data.received_tracking": status
      }
    });
  },
  "updateSignedIO": function (campId, status) {
    CampaignBasics.update(
      {"data.campaign_id": campId},
      {$set: {
        "data.signed_IO": status
      }
    });
  }
});
