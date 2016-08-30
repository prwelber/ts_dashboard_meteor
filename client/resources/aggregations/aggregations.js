import { Meteor } from 'meteor/meteor'
import MasterAccounts from '/collections/MasterAccounts';
import Agencies from '/collections/Agencies';
import { formatters as format} from '/both/utilityFunctions/formatters';


Template.aggregations.onRendered(function () {
  // $('.datepicker').pickadate({
  //   selectMonths: true,
  //   selectYears: 10
  // });
});

Template.aggregations.helpers({
  getBrands: function () {
    return MasterAccounts.find({}, {sort: {name: 1}});
  },
  getAgData: function () {
    let data = Session.get("aggregateData");

    if (data && data.spend) {
      return mastFunc.formatAll(data);
    } else {
      return {error: "There has been an error with this query or there is no data."}
    }
  },
  getAgencies: () => {
    return Agencies.find();
  },
  money: (num) => {
    return format.money(num);
  },
  number: (number) => {
    return format.num(number)
  }
});

Template.aggregations.events({
  'submit .aggregations-form': function (event, template) {
    event.preventDefault();
    const et = event.target;
    let params = {};

    et.agency.value ? params['agency'] = et.agency.value : '';
    et.products.value ? params['product'] = et.products.value : '';
    // et.objective.value ? params['objective'] = et.objective.value : '';
    et.brand.value ? params['brand'] = et.brand.value : '';

    let afterDate;
    let beforeDate;
    et.afterDate.value ? afterDate = moment(et.afterDate.value, "YYYY-MM-DD").toISOString() : '';
    et.beforeDate.value ? beforeDate = moment(et.beforeDate.value, "YYYY-MM-DD").toISOString() : '';

    console.log(params);
    console.log(afterDate);
    console.log(beforeDate);
    console.log(Object.keys(params).length); // this works, returns #
    Meteor.call('initiativeAggregation', params, afterDate, beforeDate, function (err, res) {
      if (res) {
        Session.set("aggregateData", res);
      }
    });
  }
});

Template.aggregations.onDestroyed(function () {
  delete Session.keys['aggregateData'];
});
