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


Template.initiativesHome.onRendered(function () {
  Meteor.typeahead.inject();
  $('.tooltipped').tooltip({ delay: 50 });
});

Template.initiativesHome.onCreated(function () {
  if (!Session.get("initiativeSelect")) {
    Session.set("initiativeSelect", null);
  }
  if (!Session.get("ownerSelect")) {
    Session.set("ownerSelect", null);
  }
})

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
        },
        // {
        //   token: '@',
        //   collection: CampaignInsights,
        //   field: 'data.name',
        //   options: '',
        //   matchAll: true,
        //   template: Template.datapiece
        // }
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


    /*
      messy here, need to REFACTOR. this is a if/else tree that
      uses initiativeSelect and ownerSelect to fetch initiatives from the
      database. the basic logic for owner is that if the owner session does
      not equal "All", search with whatever the ownerSesh is. when the
      template is created, intiativeSelect is set to "Active" and ownerSelect
      is set to "All"
    */

    if (sesh === null && owner === null) {
      inits = Initiatives.find({userActive: true},
        {sort:
          {"lineItems.0.endDate": -1}
        },
        {limit: 100}
      ).fetch();
    }

    if (brand) {
      inits = Initiatives.find({brand: brand},
        {sort:
          {"lineItems.0.endDate": -1}
        },
        {limit: 100}
      ).fetch();

    }

    if (agency) {
      inits = Initiatives.find({agency: agency},
        {sort:
          {"lineItems.0.endDate": -1}
        },
        {limit: 100}
      ).fetch();
    }


    if (sesh === 'Active') {
      if (owner !== null) {
        inits = Initiatives.find({userActive: true, owner: owner},
          {sort: {"lineItems.0.endDate": -1}}).fetch();
      } else {
        inits = Initiatives.find({userActive: true},
        {sort: {"lineItems.0.endDate": -1}}).fetch();
      }

    } else if (sesh === 'Ending Soon') {
      const d = moment().add(30, 'd').toISOString();
      if (owner !== null) {
        inits = Initiatives.find({
          "lineItems.0.endDate": {$lte: d, $gte: n}, owner: owner
        },{sort: {"lineItems.0.endDate": -1}}).fetch();
      } else {
        inits = Initiatives.find({
          "lineItems.0.endDate": {$lte: d, $gte: n}
        },{sort: {"lineItems.0.endDate": -1}}).fetch();
      }
    } else if (sesh === 'Recently Ended') {
      const d = moment().subtract(30, 'd').toISOString();
      if (owner !== null) {
        inits = Initiatives.find({
          "lineItems.0.endDate": {$gte: d, $lte: n}, owner: owner
        }, {sort: {"lineItems.0.endDate": -1}}).fetch();
      } else {
        inits = Initiatives.find({
          "lineItems.0.endDate": {$gte: d, $lte: n}
        }, {sort: {"lineItems.0.endDate": -1}}).fetch();
      }
    } else if (sesh === 'Pending') {
      if (owner !== null) {
        inits = Initiatives.find({
          "lineItems.0.startDate": {$gte: n}, owner: owner
        }, {sort: {"lineItems.0.startDate": 1}}).fetch();
      } else {
        inits = Initiatives.find({
          "lineItems.0.startDate": {$gte: n}
        }, {sort: {"lineItems.0.startDate": 1}}).fetch();
      }
    } else if (sesh === 'All') {
      if (owner !== null) {
        inits = Initiatives.find({owner: owner},
          {sort:
            {"lineItems.0.endDate": -1}
          },
          {limit: 100}
        ).fetch();
      } else {
        inits = Initiatives.find({},
          {sort:
            {"lineItems.0.endDate": -1}
          },
          {limit: 100}
        ).fetch();
      }
    }


    // inits.forEach(el => {
    //   el.startDate = moment(el.startDate, moment.ISO_8601).format("MM-DD-YYYY hh:mm a");
    //   el.endDate = moment(el.endDate, moment.ISO_8601).format("MM-DD-YYYY hh:mm a");
    // });

    return inits;
  },
  'isActiveInitiative': function () {
    const now = moment()
    if (moment(this.lineItems[0].endDate, moment.ISO_8601).isAfter(now)) {
      return "Active"
    } else if (now.diff(moment(this.lineItems[0].endDate, moment.ISO_8601), "days") <= 45) {
      return "Ended Recently"
    } else {
      return "Not Active"
    }
  },
  'isActiveClass': function () {
    const now = moment()
    if (moment(this.lineItems[0].endDate, moment.ISO_8601).isAfter(now)) {
      return "green-text"
    } else if (now.diff(moment(this.lineItems[0].endDate, moment.ISO_8601), "days") <= 45) {
      return "orange-text"
    } else {
      return "red-text"
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
  calcSpend: (objective, _id) => {
    const init = Initiatives.findOne({_id: _id});
    const allCapsObjective = objective.split(' ').join('_').toUpperCase();
    for (let key in init) {
      if (key === allCapsObjective) {
        if (! init[key]['net']) {
          return '';
        } else {
          return numeral(init[key]['net']['spendPercent']).format("00.00");
        }
      }
    }
  },
  calcDelivery: (_id, index) => {
    const init = Initiatives.findOne({_id: _id});
    return numeral(initiativesFunctionObject.calculateDeliveryPercent(init, index)).format("00.00");
  },
  calcFlight: (_id, index) => {
    const init = Initiatives.findOne({_id: _id});
    return numeral(initiativesFunctionObject.calculateFlightPercentage(init, index)).format("00.00");
  },
  activeUpdates: (_id) => {
    const init = Initiatives.findOne({_id: _id});
    if (init.userActive === true) {
      return "checked";
    } else {
      return "";
    }
  },
  dailyCheck: (_id) => {
    const init = Initiatives.findOne({_id: _id});
    if (init.dailyCheck) {
      return "checked";
    }
  },
  getBrands: () => {
    return MasterAccounts.find({});
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
  "click .double-check": (event, instance) => {
    let id = event.target.id.toString().split("double")[1];
    if (event.target.checked === false) {
      const checked = false;
      Meteor.call('toggleDailyCheck', id, checked);
    } else if (event.target.checked === true) {
      const checked = true;
      Meteor.call('toggleDailyCheck', id, checked);
    } else {
      alert("there is a problem with this feature");
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
  }
});

Template.initiativesHome.onDestroyed(() => {
  Session.set("ownerSelect", null);
  Session.set("initiativeSelect", null);
  Session.set("agencySelect", null);
  Session.set("brandSelect", null);
  $('.tooltipped').tooltip('remove');
})
