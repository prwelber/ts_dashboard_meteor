import { Meteor } from 'meteor/meteor'
import { FlowRouter } from 'meteor/kadira:flow-router'
import CampaignInsights from '/collections/CampaignInsights'
import Initiatives from '/collections/Initiatives'
import dragula from 'dragula'
import { initiativesFunctionObject } from '/both/utilityFunctions/calculateInitiativePercentages'

Template.initiativesHome.onRendered(() => {
  Meteor.typeahead.inject();

  $(document).ready(function(){
    $('ul.tabs').tabs();
  });

});

Template.initiativesHome.onCreated(() => {

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
      limit: 5,
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
  }
});

Template.initiativesHome.events({
 "click .userLogout": (event, template) => {
    Meteor.logout( () => {
      console.log('user logged out');
    });
 }
});


Template.tab.helpers({
  'getActiveInitiatives': () => {
    const inits = Initiatives.find({userActive: true},
      {sort: {"lineItems.0.endDate": 1}}
    ).fetch();

    inits.forEach(el => {
      el.startDate = moment(el.startDate, moment.ISO_8601).format("MM-DD-YYYY hh:mm a");
      el.endDate = moment(el.endDate, moment.ISO_8601).format("MM-DD-YYYY hh:mm a");
    });

    return inits;
  },
  'isActiveInitiative': () => {
    console.log(this)
    const now = moment()
    if (moment(this.lineItems[0].endDate, moment.ISO_8601).isAfter(now)) {
      return "Active"
    } else if (now.diff(moment(this.lineItems[0].endDate, moment.ISO_8601), "days") <= 45) {
      return "Ended Recently"
    } else {
      return "Not Active"
    }
  },
  'isActiveClass': () => {
    console.log(this)
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
    // return numeral(init.netNumbers.spendPercent).format("00.00");
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

Template.tab.events({
  "click .switch": (event, instance) => {
    let _id, checked;
    if (event.target.dataset.id) { _id = event.target.dataset.id };
    checked = event.target.checked;
    if (_id && (checked === true || checked === false)) {
      Meteor.call('changeActiveStatus', _id, checked);
    }
  }
})

////////////////////////////////////////////////////////////////


Template.endingSoon.helpers({
  'getEndingSoonInitiatives': () => {
    const d = moment().add(30, 'd').toISOString();
    const n = moment().toISOString();
    const inits = Initiatives.find({
      "lineItems.0.endDate": {$lte: d, $gte: n}
    },
      {sort: {
        "lineItems.0.endDate": 1}
      }
    ).fetch();

    inits.forEach(el => {
      el.startDate = moment(el.startDate, moment.ISO_8601).format("MM-DD-YYYY hh:mm a");
      el.endDate = moment(el.endDate, moment.ISO_8601).format("MM-DD-YYYY hh:mm a");
    });

    console.log("endingSoon inits", inits);
    return inits;
  },
  'isActiveInitiative': () => {
    const now = moment()
    if (moment(this.lineItems[0].endDate, moment.ISO_8601).isAfter(now)) {
      return "Active"
    } else if (now.diff(moment(this.lineItems[0].endDate, moment.ISO_8601), "days") <= 45) {
      return "Ended Recently"
    } else {
      return "Not Active"
    }
  },
  'isActiveClass': () => {
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
    // return numeral(init.netNumbers.spendPercent).format("00.00");
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

Template.endingSoon.events({
  "click .switch": (event, instance) => {
    let _id, checked;
    if (event.target.dataset.id) { _id = event.target.dataset.id };
    checked = event.target.checked;
    if (_id && (checked === true || checked === false)) {
      Meteor.call('changeActiveStatus', _id, checked);
    }
  }
})
