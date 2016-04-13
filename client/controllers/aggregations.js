Template.aggregations.helpers({

});

Template.aggregations.events({
  'submit .aggregations-form': function (event, template) {
    event.preventDefault();

    let params = {
      agency: event.target.agency.value,
      product: event.target.products.value,
      objective: event.target.objective.value
    };

    console.log(params);
    console.log(Object.keys(params).length); // this works, returns #
    Meteor.call('initiativeAggregation', params, function (err, res) {
      if (res) {
        console.log(res);
      }
    });
  }
});
