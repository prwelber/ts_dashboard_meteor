Template.aggregations.helpers({
  getBrands: function () {
    return MasterAccounts.find();
  },
  getAgData: function () {
    return Session.get("aggregateData");
  }
});

Template.aggregations.events({
  'submit .aggregations-form': function (event, template) {
    event.preventDefault();

    const et = event.target;
    let params = {};

    et.agency.value ? params['agency'] = et.agency.value : '';
    et.products.value ? params['product'] = et.products.value : '';
    et.objective.value ? params['objective'] = et.objective.value : '';
    et.brand.value ? params['brand'] = et.brand.value : '';

    console.log(params);
    console.log(Object.keys(params).length); // this works, returns #
    Meteor.call('initiativeAggregation', params, function (err, res) {
      if (res) {
        Session.set("aggregateData", res);
      }
    });
  }
});
