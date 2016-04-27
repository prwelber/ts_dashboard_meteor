import { Meteor } from 'meteor/meteor'
import { FlowRouter } from 'meteor/kadira:flow-router'
import Initiatives from '/collections/Initiatives'
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays'
import Promise from 'bluebird'

Template.projections.onCreated( function () {
  this.templateDict = new ReactiveDict();
  const initiative = Initiatives.findOne(
    {"campaign_ids": {$in: [FlowRouter.getParam("campaign_id")]}
  });
  this.templateDict.set('initiative', initiative);
});

Template.projections.onRendered(() => {
  Session.set('dayNumber', 0);
});

Template.projections.events({
  'click #project-up': function () {
    Session.set("dayNumber", Session.get("dayNumber") + 1);
  },
  'click #project-down': function () {
    Session.set("dayNumber", Session.get("dayNumber") - 1);
  },
  'change #projection-select': function(event, template) {
    console.log(event.target.value);






  }
});

Template.projections.helpers({
  isReady: (sub) => {
    if (FlowRouter.subsReady(sub)) {
      return true;
    };
  },
  'averages': function () {
    const initiative = Template.instance().templateDict.get('initiative');
    const ended = moment(initiative.lineItems[0].endDate, moment.ISO_8601);
    const started = moment(initiative.lineItems[0].startDate, moment.ISO_8601);
    const now = moment(new Date);
    let timeDiff = ended.diff(started, 'days');

    now.isAfter(ended) ? '' : timeDiff = now.diff(started, 'days');
    console.log(timeDiff)
    console.log(numeral(initiative.aggregateData.clicks / timeDiff).format("0,0"))
    console.log(initiative.aggregateData.spend / timeDiff)

    return {
      avgClicks: numeral(initiative.aggregateData.clicks / timeDiff).format("0,0"),
      avgImpressions: numeral(initiative.aggregateData.impressions / timeDiff).format("0,0"),
      avgLikes: numeral(initiative.aggregateData.likes / timeDiff).format("0,0"),
      avgSpend: numeral(initiative.aggregateData.spend / timeDiff).format("$0,0.00")
    }
  },
  'dataProjection': function () {
    // TODO create a master function to handle this???
    const initiative = Template.instance().templateDict.get('initiative');

    const agData = initiative.aggregateData // for brevity
    const sesh = Session.get('dayNumber') // for brevity

    const ended = moment(initiative.endDate, moment.ISO_8601);
    const started = moment(initiative.startDate, moment.ISO_8601);
    const now = moment(new Date);
    // ternary to figure out time difference
    let timeDiff = now.isAfter(ended) ?
      ended.diff(started, 'days') :
      now.diff(started, 'days');

    let projections = function projections(action, session, timeDiff) {
      let avg = action / timeDiff
      let result =  action + (session * avg);
      return numeral(result).format("0,0");
    }

    const clicks = projections(agData.clicks, sesh, timeDiff);
    const impressions = projections(agData.impressions, sesh, timeDiff);
    const likes = projections(agData.likes, sesh, timeDiff);

    return {
      clicks: clicks,
      impressions: impressions,
      likes: likes
    }
  },
  'getSessionDay': function () {
    return Session.get('dayNumber');
  }
});
