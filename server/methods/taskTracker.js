import { Meteor } from 'meteor/meteor'
import Initiatives from '/collections/Initiatives'

Meteor.methods({
  "updateTargeting": function (_id, status) {
    Initiatives.update(
      {"_id": _id},
      {$set: {
        "approved_targeting": status
      }
    });
  },
  "updateCreative": function (_id, status) {
    Initiatives.update(
      {"_id": _id},
      {$set: {
        "received_creative": status
      }
    });
  },
  "updateTracking": function (_id, status) {
    Initiatives.update(
      {"_id": _id},
      {$set: {
        "received_tracking": status
      }
    });
  },
  "updateSignedIO": function (_id, status) {
    Initiatives.update(
      {"_id": _id},
      {$set: {
        "signed_IO": status
      }
    });
  }
});
