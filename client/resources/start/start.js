import { Meteor } from 'meteor/meteor'
import { FlowRouter } from 'meteor/kadira:flow-router'
import CampaignInsights from '/collections/CampaignInsights'
import Initiatives from '/collections/Initiatives'
import dragula from 'dragula'
import { initiativesFunctionObject } from '/both/utilityFunctions/calculateInitiativePercentages'


Template.initiativesHome.onRendered(function () {
  Meteor.typeahead.inject();

});

Template.initiativesHome.onCreated(function () {
  if (!Session.get("initiativeSelect")) {
    Session.set("initiativeSelect", "Active");
  }
  if (!Session.get("ownerSelect")) {
    Session.set("ownerSelect", "All");
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
    const ownerSesh = Session.get('ownerSelect');
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


    if (sesh === 'Active') {
      if (ownerSesh !== "All") {
        inits = Initiatives.find({userActive: true, owner: ownerSesh},
          {sort: {"lineItems.0.endDate": -1}}).fetch();
      } else {
        inits = Initiatives.find({userActive: true},
        {sort: {"lineItems.0.endDate": -1}}).fetch();
      }

    } else if (sesh === 'Ending Soon') {
      const d = moment().add(30, 'd').toISOString();
      if (ownerSesh !== "All") {
        inits = Initiatives.find({
          "lineItems.0.endDate": {$lte: d, $gte: n}, owner: ownerSesh
        },{sort: {"lineItems.0.endDate": -1}}).fetch();
      } else {
        inits = Initiatives.find({
          "lineItems.0.endDate": {$lte: d, $gte: n}
        },{sort: {"lineItems.0.endDate": -1}}).fetch();
      }
    } else if (sesh === 'Recently Ended') {
      const d = moment().subtract(30, 'd').toISOString();
      if (ownerSesh !== "All") {
        inits = Initiatives.find({
          "lineItems.0.endDate": {$gte: d, $lte: n}, owner: ownerSesh
        }, {sort: {"lineItems.0.endDate": -1}}).fetch();
      } else {
        inits = Initiatives.find({
          "lineItems.0.endDate": {$gte: d, $lte: n}
        }, {sort: {"lineItems.0.endDate": -1}}).fetch();
      }
    } else if (sesh === 'Pending') {
      if (ownerSesh !== "All") {
        inits = Initiatives.find({
          "lineItems.0.startDate": {$gte: n}, owner: ownerSesh
        }, {sort: {"lineItems.0.startDate": 1}}).fetch();
      } else {
        inits = Initiatives.find({
          "lineItems.0.startDate": {$gte: n}
        }, {sort: {"lineItems.0.startDate": 1}}).fetch();
      }
    } else if (sesh === 'All') {
      if (ownerSesh !== "All") {
        inits = Initiatives.find({owner: ownerSesh},
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
  calcFlight: (_id) => {
    const init = Initiatives.findOne({_id: _id});
    return numeral(initiativesFunctionObject.calculateFlightPercentage(init)).format("00.00");
  },
  activeUpdates: (_id) => {
    const init = Initiatives.findOne({_id: _id});
    if (init.userActive) {
      return "checked";
    } else {
      return "";
    }
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
    Session.set('initiativeSelect', event.target.value);
  },
  "change #ownerSelect": (event, instance) => {
    console.log(event.target.value)
    Session.set('ownerSelect', event.target.value);
  }
});
