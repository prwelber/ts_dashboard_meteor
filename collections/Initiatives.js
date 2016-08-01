const Initiatives = new Mongo.Collection('Initiatives');

Initiatives.allow({
  update: function (userId, user) {
    return userId;
  }
})

export default Initiatives
