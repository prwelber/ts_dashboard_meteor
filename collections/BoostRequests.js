const BoostRequests = new Mongo.Collection('BoostRequests')

BoostRequests.allow({
  update: function (userId, user) {
    return userId;
  }
});

export default BoostRequests
