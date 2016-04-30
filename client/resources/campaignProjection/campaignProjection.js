import { Meteor } from 'meteor/meteor'
import { FlowRouter } from 'meteor/kadira:flow-router'
import Initiatives from '/collections/Initiatives'
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays'
import Promise from 'bluebird'
import mastFunc from '../masterFunctions'

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
    const initiative = Template.instance().templateDict.get('initiative')
    Meteor.call('projectionStats', event.target.value, initiative.name);

    var call = Promise.promisify(Meteor.call);
    call('projectionStats', event.target.value, initiative.name)
    .then(function (result) {
      Session.set('projection', result);
    }).catch(function (err) {
      console.log("Error with projection", err);
    });


  }
});

Template.projections.helpers({
  isReady: (sub) => {
    if (FlowRouter.subsReady(sub)) {
      return true;
    };
  },
  'averages': function () {
    const data = Session.get('projection');
    if (data && data.impressions) {
      return {
        avgClicks: mastFunc.num(data.clicks),
        avgImpressions: mastFunc.num(data.impressions),
        avgLikes: mastFunc.num(data.like),
        avgSpend: mastFunc.money(data.spend),
        avgActions: mastFunc.num(data.total_actions)
      }
    }
  },
  'dataProjection': function () {
    // TODO create a master function to handle this???
    const initiative = Template.instance().templateDict.get('initiative');

    const agData = initiative.aggregateData; // for brevity
    const sesh = Session.get('dayNumber'); // for brevity
    const projection = Session.get('projection');
    let spend,
        likes,
        clicks,
        impressions,
        cpm,
        cpc,
        cpl,
        spendPercent;

    if (projection && projection.spend) {
      let totalSpend = agData.spend + (projection.spend * sesh);
      spend = agData.spend + (projection.spend * sesh);
      likes = agData.likes + (projection.like * sesh);
      clicks = agData.clicks + (projection.clicks * sesh);
      impressions = agData.impressions + (projection.impressions * sesh);
      cpm = totalSpend / ((agData.impressions + (projection.impressions * sesh)) / 1000);
      cpc = totalSpend / (agData.clicks + projection.clicks * sesh);
      cpl = mastFunc.money(totalSpend / (agData.likes + projection.like * sesh));
      cpl === Infinity ? cpl = 0 : '';
      if (totalSpend) {
        spendPercent = numeral(totalSpend / initiative.lineItems[0].budget).format("0.00%")
      } else { spendPercent = 0 }
    }

    return {
      clicks: mastFunc.num(clicks),
      impressions: mastFunc.num(impressions),
      likes: mastFunc.num(likes),
      spend: mastFunc.money(spend),
      cpc: mastFunc.money(cpc),
      cpm: mastFunc.money(cpm),
      cpl: cpl,
      spendPercent: spendPercent
    }
  },
  'getSessionDay': function () {
    return Session.get('dayNumber');
  }
});
