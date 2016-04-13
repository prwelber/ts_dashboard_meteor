Meteor.subscribe('fbAccountList');
import {person} from "./agencies"
// console.log("this is person", person);

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
    } else {
        mastFunc.addToBox("You are not authenticated.")
    }
  }
});

Template.accounts.helpers({
  'accountList': function () {
    let userId = Meteor.userId();
    if (userId) {
      return MasterAccounts.find({
        "name": { "$in": [
          "Ruffino",
          "Tom Gore",
          "Luchese",
          "Robert Mondavi Winery",
          "Kim Crawford"
        ]}
      })
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

});

Template.index.onRendered(function () {
  $('.tooltipped').tooltip({delay: 10});
});

Template.index.helpers({
  'getDate': function () {
    let date = new Date();
    date = date.toDateString();
    return date;
  },
  'getCampaignNumber': function () {
    return FlowRouter.current().params.campaign_id;
  }
});

Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_OPTIONAL_EMAIL"
});
