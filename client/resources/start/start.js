import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import CampaignInsights from '/collections/CampaignInsights';
import Initiatives from '/collections/Initiatives';
import MasterAccounts from '/collections/MasterAccounts';
import dragula from 'dragula';
import { initiativesFunctionObject } from '/both/utilityFunctions/calculateInitiativePercentages';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';


Tracker.autorun(function () {
  // if (Session.get("agencySelect")) {
  //   console.log('session agencySelect');
  //   Session.set("brandSelect", null);
  // }
  // if (Session.get("brandSelect")) {
  //   console.log('session brandSelect')
  //   Session.set("agencySelect", null);
  // }
});

Template.initiativesHome.onCreated(function () {
  if (!Session.get("initiativeSelect")) {
    Session.set("initiativeSelect", 'Active');
  }
  if (!Session.get("ownerSelect")) {
    Session.set("ownerSelect", null);
  }
})

Template.initiativesHome.onRendered(function () {
  Meteor.typeahead.inject();
  $('.tooltipped').tooltip({ delay: 50 });
  Session.set('dateSort', {'lineItems.0.endDate': 1});
});


Template.initiativesHome.helpers({
  isReady: (sub1) => {
    if (FlowRouter.subsReady(sub1)) {
      return true;
    }
  },
  settings: function() {
    return {
      position: "top",
      limit: 10,
      rules: [
        {
          token: '',
          collection: Initiatives,
          field: "name",
          options: '',
          matchAll: true,
          // filter: { type: "autocomplete" },
          template: Template.dataPiece
        }
      ]
    };
  },
  'getAllInitiatives': () => {
    const sesh = Session.get('initiativeSelect');
    const owner = Session.get('ownerSelect');
    const brand = Session.get('brandSelect');
    const agency = Session.get('agencySelect');
    const n = moment().toISOString();
    let inits;
    // const endDateSort = Session.get('endDateSort');
    const dateSort = Session.get('dateSort');
    const alphaSort = Session.get('alphaSort');

    if (owner === 'All') { Session.set("ownerSelect", null) };

    /*
      messy here, need to REFACTOR. this is a if/else tree that
      uses initiativeSelect and ownerSelect to fetch initiatives from the
      database. the basic logic for owner is that if the owner session does
      not equal "All", search with whatever the ownerSesh is. when the
      template is created, intiativeSelect is set to "Active" and ownerSelect
      is set to "null"
    */
    let date;
    let now = moment().toISOString();
    let active;
    let status = {};
    let query = {};

    if (sesh === 'Ending Soon') {
      date = moment().add(30, 'd').toISOString();
      status = {$lte: date, $gte: now};

      owner ?
        query = {'lineItems.0.endDate': status, owner: owner} :
        query = {'lineItems.0.endDate': status};


    } else if (sesh === 'Recently Ended') {
      date = moment().subtract(30, 'd').toISOString();
      status = {$gte: date, $lte: now};

      owner ?
        query = {'lineItems.0.endDate': status, owner: owner} :
        query = {'lineItems.0.endDate': status};

    } else if (sesh === 'Pending') {

      status = {$gte: now};
      query = {'lineItems.0.startDate': status};

    } else if (sesh === 'Active') {
      active = true;

      owner ?
        query = {userActive: active, owner: owner} :
        query = {userActive: active};

    } else if (sesh === 'All') {
      owner ?
        query = {owner: owner} :
        query = {};
    }

    if (brand) { query = {brand: brand} };
    if (agency) { query = {agency: agency} };

    return Initiatives.find(query, {sort: dateSort})

  },
  'isActiveInitiative': function () {
    const now = moment()
    if (moment(this.lineItems[0].endDate, moment.ISO_8601).isAfter(now)) {
      return "Active";
    } else if (now.diff(moment(this.lineItems[0].endDate, moment.ISO_8601), 'd') === 0) {
      return "Active";
    } else if (now.diff(moment(this.lineItems[0].endDate, moment.ISO_8601), "days") <= 45) {
      return "Ended Recently";
    } else {
      return "Ended";
    }
  },
  'isActiveClass': function () {
    const now = moment()
    if (moment(this.lineItems[0].endDate, moment.ISO_8601).isAfter(now)) {
      return "green-text";
    } else if (now.diff(moment(this.lineItems[0].endDate, moment.ISO_8601), 'd') === 0) {
      return "green-text";
    } else if (now.diff(moment(this.lineItems[0].endDate, moment.ISO_8601), "days") <= 45) {
      return "orange-text";
    } else {
      return "red-text";
    }
  },
  'formatDate': (date) => {
    return moment(date, moment.ISO_8601).format("MM-DD-YYYY");
  },
  'assignAgency': () => {
    console.log('this', this);
    return this.agency;
  },
  'assignBrand': () => {
    return this.brand;
  },
  userInfo: () => {
    return Meteor.user();
  },
  getOwner: () => {
    return this.owner;
  },
  calcSpend: (objective, _id, state) => {
    console.log(Meteor.user())
    const init = Initiatives.findOne({_id: _id});
    const allCapsObjective = objective.split(' ').join('_').toUpperCase();
    for (let key in init) {
      if (key === allCapsObjective) {
        if (! init[key]['net']) {
          return '';
        } else {
          if (parseFloat(init[key]['net']['spendPercent']) >= 100 && state === "circle") {
            return "100";
          } else if (parseFloat(init[key]['net']['spendPercent']) >= 100 && state === "number") {
            if (Meteor.user().admin === false) {
              return "100"
            }
            // return numeral(init[key]['net']['spendPercent']).format("00");
          } else {
            return numeral(init[key]['net']['spendPercent']).format("00");
          }
        }
      }
    }
  },
  calcDelivery: (_id, index, state) => {
    const init = Initiatives.findOne({_id: _id});
    if (parseFloat(initiativesFunctionObject.calculateDeliveryPercent(init, index)) >= 100 && state === "circle") {
      return "100";
    } else if (parseFloat(initiativesFunctionObject.calculateDeliveryPercent(init, index)) >= 100 && state === "number") {
      return numeral(initiativesFunctionObject.calculateDeliveryPercent(init, index)).format("00");
    } else {
      return numeral(initiativesFunctionObject.calculateDeliveryPercent(init, index)).format("00");
    }
  },
  calcFlight: (_id, index) => {
    const init = Initiatives.findOne({_id: _id});
    if (parseFloat(initiativesFunctionObject.calculateFlightPercentage(init, index)) >= 100) {
      return "100";
    } else {
      return numeral(initiativesFunctionObject.calculateFlightPercentage(init, index)).format("00");
    }
  },
  activeUpdates: (_id) => {
    const init = Initiatives.findOne({_id: _id});
    if (init.userActive === true) {
      return "checked";
    } else {
      return "";
    }
  },
  checkedToday: (_id) => {
    const init = Initiatives.findOne({_id: _id});
    if (init.dailyCheck) {
      return "True";
    } else {
      return "False";
    }
  },
  getBrands: () => {
    return MasterAccounts.find({}, {sort: {name: 1}});
  }
});

Template.initiativesHome.events({
 "click .userLogout": (event, template) => {
    Meteor.logout( () => {
      console.log('user logged out');
    });
 },
 "click .switch": (event, instance) => {
  let _id, checked;
  if (event.target.dataset.id) { _id = event.target.dataset.id };
  checked = event.target.checked;
  if (_id && (checked === true || checked === false)) {
    Meteor.call('changeActiveStatus', _id, checked);
    }
  },
  "change #initiativeSelect": (event, instance) => {
    Session.set("agencySelect", null);
    Session.set("brandSelect", null);
    Session.set('initiativeSelect', event.target.value);
  },
  "change #ownerSelect": (event, instance) => {
    Session.set("agencySelect", null);
    Session.set("brandSelect", null);
    if (event.target.value === "null") {
      Session.set('ownerSelect', null)
    } else {
      Session.set('ownerSelect', event.target.value);
    }
  },
  "change #agencySelect": (event, instance) => {
    Session.set("brandSelect", null);
    Session.set("ownerSelect", null);
    Session.set("initiativeSelect", null);
    Session.set('agencySelect', event.target.value);
  },
  "change #brandSelect": (event, instance) => {
    Session.set("agencySelect", null);
    Session.set("ownerSelect", null);
    Session.set("initiativeSelect", null);
    Session.set('brandSelect', event.target.value);
  },
  "click #alpha-sort": (event, instance) => {
    var date = Session.get('dateSort')

    if (date['lineItems.0.endDate']) {
      delete date['lineItems.0.endDate']
    } else if (date['lineItems.0.startDate']) {
      delete date['lineItems.0.startDate']
    }

    if (!date['name']) {
      date['name'] = 1;
      Session.set('dateSort', date);
    } else if (date['name'] === 1) {
      date['name'] = -1
      Session.set('dateSort', date);
    } else if (date['name'] === -1) {
      date['name'] = 1
      Session.set('dateSort', date);
    }
  },
  "click #end-date-sort": (event, instance) => {
    Session.get('dateSort')['lineItems.0.endDate'] === 1 ?
     Session.set('dateSort', {'lineItems.0.endDate': -1}) :
     Session.set('dateSort', {'lineItems.0.endDate': 1});
  },
  "click #start-date-sort": (event, instance) => {
    Session.get('dateSort')['lineItems.0.startDate'] === 1 ?
     Session.set('dateSort', {'lineItems.0.startDate': -1}) :
     Session.set('dateSort', {'lineItems.0.startDate': 1});
  }
});

Template.initiativesHome.onDestroyed(() => {
  // Session.set("ownerSelect", null);
  // Session.set("initiativeSelect", null);
  Session.set("agencySelect", null);
  Session.set("brandSelect", null);
  $('.tooltipped').tooltip('remove');
})





