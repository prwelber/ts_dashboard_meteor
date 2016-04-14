Template.aggregations.onRendered(function () {
  $('.datepicker').pickadate({
    selectMonths: true,
    selectYears: 10
  });
});

Template.aggregations.helpers({
  getBrands: function () {
    return MasterAccounts.find();
  },
  getAgData: function () {
    let data = Session.get("aggregateData");

    if (data && data.spend) {
      return mastFunc.formatAll(data);
    } else {
      return {error: "There has been an error with this query."}
    }
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

    let afterDate;
    et.date.value ? afterDate = moment(et.date.value, "DD MMMM, YYYY").toISOString() : '';

    console.log(params);
    console.log(Object.keys(params).length); // this works, returns #
    Meteor.call('initiativeAggregation', params, afterDate, function (err, res) {
      if (res) {
        Session.set("aggregateData", res);
      }
    });
  }
});

Template.aggregations.onDestroyed(function () {
  delete Session.keys['aggregateData'];
});