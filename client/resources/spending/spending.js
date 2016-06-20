import { Meteor } from 'meteor/meteor';
import CampaignInsights from '/collections/CampaignInsights';
import CampaignBasics from '/collections/CampaignBasics';
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays';
import Initiatives from '/collections/Initiatives';
import { FlowRouter } from 'meteor/kadira:flow-router';
import moment from 'moment-timezone';
import { formatters } from '/both/utilityFunctions/formatters';

Template.spending.onRendered(() => {
  $('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 10 // Creates a dropdown of 15 years to control year
  });
});

Template.spending.helpers({
  isReady: (sub1) => {
    if (FlowRouter.subsReady(sub1)) {
      return true;
    }
  },
  getBasics: () => {
    const opts = {spending: "spending"};
    const start = moment(Session.get('start'), moment.ISO_8601).toISOString();
    const end = moment(Session.get('end'), moment.ISO_8601).toISOString();
    if (start && end) {
      Meteor.subscribe("insightsBreakdownByDaysList", opts, start, end);

      let days = InsightsBreakdownsByDays.find({}, {fields: {'data.campaign_name': 1}}).fetch();
      // ------ Get Set (unique) of Names -------- //
      var campaignSet = new Set();
      days.forEach((name) => {
        campaignSet.add(name.data.campaign_name);
      });
      // console.log(campaignSet);
      const arr = Array.from(campaignSet); // creates Array from Set
      // console.log("arr", arr);



      Meteor.call('spendingAggregate', arr, start, end, (err, res) => {
        if (!err) {
          console.log('res', res);
        }
      });
    }
    // get all the campaign names that were running in the time period
    // do an aggregation on each campaign name for the time period


  },
  time: (time) => {
    return moment(time, moment.ISO_8601).format("MM-DD-YYYY");
  },
  getDaily: () => {



  }
});

Template.spending.events({
  "change #spending-start-date": (event, instance) => {
    console.log(event.target.value);
    Session.set('start', event.target.value);
  },
  "change #spending-end-date": (event, instance) => {
    console.log(event.target.value)
    Session.set('end', event.target.value);
  }
});

Template.spending.onDestroyed(() => {
  Session.set('start', null);
  delete Session.keys.start;
  Session.set('end', null);
  delete Session.keys.end;
})
