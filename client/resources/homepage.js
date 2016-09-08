import { Meteor } from 'meteor/meteor'
Meteor.subscribe('fbAccountList');
import MasterAccounts from '/collections/MasterAccounts';

Template.accounts.events({
  'click .refresh-accounts': function () {
    var target = document.getElementById("spinner-div");
    let spun = Blaze.render(Template.spin, target);
    Meteor.call('refreshAccountList', function (err, result) {
      if (err) {
          console.log(e);
      } else {
          Blaze.remove(spun);
      }
    });
  },
  'click .account-link': function () {
    if (Session.get('id') == Meteor.userId()) {
        console.log('you are propertly authenticated')
    }
  }
});

Template.accounts.helpers({
  'accountList': function () {
    let userId = Meteor.userId();
    if (userId) {
      // return MasterAccounts.find({
      //   "name": { "$in": [
      //     "Ruffino",
      //     "Woodbridge",
      //     // "Robert Mondavi Winery",
      //     "Kim Crawford",
      //     "Turtle Bay Resorts",
      //     "Churchill Downs"
      //   ]}
      // });
      return MasterAccounts.find({});
    }
  },
  'formatSpend': function (num) {
    // place a period two digits from the end
    // find the length and use substring?
    num = num.toString().split('');
    num.splice(num.length - 2, 0, '.');
    num = num.join('')
    return "$" + num
  },
  'sessionSetter': function () {
    let userId = Meteor.userId();
    Session.set('id', userId);
  }
});

Template.index.events({
  "click .userLogout": (event, template) => {
    Meteor.logout( () => {
      console.log('user logged out');
    });
  }
});

Template.index.onRendered(function () {
  this.$(".dropdown-button").dropdown();
  $('.tooltipped').tooltip({delay: 10});
  $(".button-collapse").sideNav();
  Meteor.typeahead.inject();
});

Template.index.helpers({
  'getDate': function () {
    let date = new Date();
    date = date.toDateString();
    return date;
  },
  'getCampaignNumber': function () {
    return FlowRouter.current().params.campaign_id;
  },
  sessionBreadcrumb: (route) => {
    const session = Session.get('route');
    if (session === route) {
      return true;
    }
  },
  loggedInUser: () => {
    if (! Meteor.user()) {
      return false;
    } else {
      return true;
    }
  },
  whatRoute: (route) => {
    if (Session.get("route") === route) {
      return true;
    }
  },
  overviewRoute: (route) => {
    const sesh = Session.get("route")
    if (sesh === "overview" ||
        sesh === "charts" ||
        sesh === "breakdowns" ||
        sesh === "daybreakdowns" ||
        sesh === "hourlyBreakdowns" ||
        sesh === "targeting" ||
        sesh === "creative" ||
        sesh === "report" ||
        sesh === "deviceAndPlacement")
    {
      return true;
    }
  },
  'active': function (route) {
    return Session.get("route") === route ? "active" : '';
  },
  'getUser': () => {
    const user = Meteor.user();
    return user.firstName;
  },
  constellationUser: () => {
    const user = Meteor.user();
    if (user.agency.indexOf('Constellation') >= 0) {
      return true;
    }
  }
});

Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_OPTIONAL_EMAIL"
});
