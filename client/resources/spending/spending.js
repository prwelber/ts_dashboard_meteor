import { Meteor } from 'meteor/meteor';
import CampaignInsights from '/collections/CampaignInsights';
import CampaignBasics from '/collections/CampaignBasics';
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays';
import Initiatives from '/collections/Initiatives';
import { FlowRouter } from 'meteor/kadira:flow-router';
import moment from 'moment-timezone';
import { formatters } from '/both/utilityFunctions/formatters';
import Promise from 'bluebird';


Template.spending.onRendered(() => {
  $('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 10 // Creates a dropdown of 15 years to control year
  });
  this.templateDict = new ReactiveDict();
  this.templateDict.set('spending', [{_id: "Click 'Get Report' to run"}]);
});

Template.spending.helpers({
  isReady: (sub1) => {
    if (FlowRouter.subsReady(sub1)) {
      return true;
    }
  },
  datesReady: () => {
    if (Session.get('start') && Session.get('end')) {
      return true;
    }
  },
  getBasics: () => {
    const start = moment(Session.get('start'), moment.ISO_8601).toISOString();
    const end = moment(Session.get('end'), moment.ISO_8601).toISOString();
    const opts = {spending: "spending"};

    if (Session.get('start') && Session.get('end')) {
      Meteor.subscribe("insightsBreakdownByDaysList", opts, start, end);
    }
    return this.templateDict.get('spending');
  },
  money: (num) => {
    return formatters.money(num);
  },
  number: (num) => {
    return formatters.num(num);
  }
});

Template.spending.events({
  "change #spending-start-date": (event, instance) => {
    Session.set('start', event.target.value);
  },
  "change #spending-end-date": (event, instance) => {
    Session.set('end', event.target.value);
  },
  "click #spending-button": (event, instance) => {
    const opts = {spending: "spending"};
    const start = moment(Session.get('start'), moment.ISO_8601).toISOString();
    const end = moment(Session.get('end'), moment.ISO_8601).toISOString();
    let days = InsightsBreakdownsByDays.find({}, {fields: {'data.campaign_name': 1}}).fetch();
      // ------ Get Set (unique) of Names -------- //
      var campaignSet = new Set();
      days.forEach((name) => {
        campaignSet.add(name.data.campaign_name);
      });
      const arr = Array.from(campaignSet); // creates Array from Set

      var call = Promise.promisify(Meteor.call);

      call('spendingAggregate', arr, start, end)
        .then(function (result) {
          this.templateDict.set('spending', result);
          return result;
        }).catch(function (err) {
          console.log('err', err);
        });

  },
  "click #spending-export": (event, instance) => {
    console.log(event.target);
  }
});

Template.spending.onDestroyed(() => {
  Session.set('start', null);
  delete Session.keys.start;
  Session.set('end', null);
  delete Session.keys.end;
})
