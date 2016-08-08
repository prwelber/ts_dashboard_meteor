import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Initiatives from '/collections/Initiatives';
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays';
import Promise from 'bluebird';
import moment from 'moment-timezone';
import mastFunc from '../masterFunctions';
import CampaignInsights from '/collections/CampaignInsights';
import { calcFactorSpend } from '/both/utilityFunctions/factorSpendFunction';
import { formatters } from '/both/utilityFunctions/formatters';

// ------------------------- FUNCTIONS -------------------------- //

const lower = function lower (objective) {
  let word = objective[0]
  for (let i = 1; i < objective.length; i++) {
    if (objective[i - 1] === " ") {
      word += objective[i].toUpperCase();
    } else {
      word += objective[i].toLowerCase();
    }
  }
  return word;
}

const defineAction = function defineAction (lineItem) {
  let action;
  lineItem.dealType === "CPC" ? action = "clicks" : '';
  lineItem.dealType === "CPM" ? action = "impressions" : '';
  lineItem.dealType === "CPL" ? action = "like" : '';
  lineItem.dealType === "CPVV" ? action = "video_view" : '';
  return action;
}

// get the correct line item if I have the campaignInsight and initiative
const getLineItem = function getLineItem(campaignData, initiative) {
  const objective = campaignData.objective.replace(/_/g, " ");
  const word = lower(objective);
  let lineItem = _.where(initiative.lineItems, {objective: word})[0]; // returns an array
  let index;
  if (lineItem === undefined) {
    index = 0;
    lineItem = initiative.lineItems;
  }
  index = parseInt(lineItem.name.substring(lineItem.name.length, lineItem.name.length - 1)) - 1; // minus 1 to account for zero indexing of lineItems array
  return initiative.lineItems[index];
}

// ----------------------- END FUNCTIONS ----------------------- //

Template.projections.onCreated( function () {
  this.templateDict = new ReactiveDict();
  const initiative = Initiatives.findOne(
    {"campaign_ids": {$in: [FlowRouter.getParam("campaign_id")]}
  });
  this.templateDict.set('initiative', initiative);
  const campData = CampaignInsights.findOne({'data.campaign_id': FlowRouter.getParam('campaign_id')});
  this.templateDict.set('campData', campData.data);
  Session.set('newFactor', 0);
  Session.set('projectedDelivery', 0);
  Session.set('effectiveCostPer', 0);
});

Template.projections.onRendered(() => {
  Session.set('dayNumber', 0);
  Session.set('factor', parseFloat(this.$('#factor-projection-percent').val()));
});

// ---------------------- EVENTS ---------------------- //

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
  },
  'keyup #factor-projection-percent': (e, instance) => {
    Session.set('factor', parseFloat(e.target.value));
  }
});

// ----------------------- HELPERS ------------------------ //

Template.projections.helpers({
  isReady: (sub1, sub2) => {
    if (FlowRouter.subsReady(sub1) && FlowRouter.subsReady(sub2)) {
      return true;
    };
  },
  lineItem: () => {
    const init = Template.instance().templateDict.get('initiative');
    const campData = Template.instance().templateDict.get('campData');

    const lineItem = getLineItem(campData, init);
    const daysLeft = moment(lineItem.endDate, moment.ISO_8601).diff(moment(), 'd');
    const quotedPrice = lineItem.price;

    return {
      lineItem: lineItem,
      daysLeft: daysLeft
    };
  },
  projectFactorSpend: () => {
    const init = Template.instance().templateDict.get('initiative');
    const campData = Template.instance().templateDict.get('campData');
    const lineItem = getLineItem(campData, init);
    // gives days left between today and endDate
    const daysLeft = moment(lineItem.endDate, moment.ISO_8601).diff(moment(), 'd');
    if (daysLeft <= 0) {
      console.log('campaign is over');
      return;
    }
    const daysIn = Math.abs(moment(lineItem.startDate, moment.ISO_8601).diff(moment(), 'd'));
    const dealType = lineItem.dealType.toLowerCase(); // CPC --> cpc
    const action = defineAction(lineItem); // CPC --> clicks

    let projectedSpend = 0;
    const factor = parseFloat(lineItem.percentTotalPercent / 100); // 7% --> .07
    const effectiveNum = parseFloat(lineItem.effectiveNum); // .9
    const avgActionsPerDay = campData[action] / daysIn;
    const inputFactor = Session.get('factor');
    let estTotalActions = (avgActionsPerDay * daysLeft) + campData[action];


    if (action === "impressions") {
      projectedSpend = (((campData[dealType] / inputFactor) * (estTotalActions / 1000)) * 100).toFixed(2);
    } else {
      projectedSpend =  (((campData[dealType] / inputFactor) * estTotalActions) * 100).toFixed(2);
    }
    const spendTarget = lineItem.budget * .985;
    console.log('estTotalActs, projectedSpend, spendTarget, inputFactor', estTotalActions, projectedSpend, spendTarget, inputFactor);



    // here, we are calculating the best factor for each campaign
    // this while loop says essentially: if projectedSpend is >= spendTarget,
    // push up the factor and then check again. it does the opposite for <=
    // there are multiple safeguards in here for avoiding getting caught in an
    // infinite loop

    let nf = inputFactor / 100; // new factor
    let count = 1;

    if (projectedSpend) {

      while (projectedSpend <= spendTarget || projectedSpend > lineItem.budget) {

        if (lineItem.cost_plus === true) {
          break;
        }

        if (moment(lineItem.endDate, moment.ISO_8601).diff(moment(), 'd') <= 0) {
          break;
        }

        if (projectedSpend === NaN || projectedSpend === undefined || projectedSpend === null) {
          Materialize.toast('There was an issue with some of the data. Tell an engineer!')
          break;
        }

        if (count >= 500) {
          Materialize.toast('Could not calculate best factor. Adjust factor Percent.', 2000);
          break;
        }

        // if projectedSpend >= spendTarget then adjust new factor (nf) by a little
        // and re run
        if (projectedSpend >= spendTarget) {
          nf = nf + (nf / 100);
          if (action === 'impressions') {
            projectedSpend = ((campData[dealType] / nf) * (estTotalActions / 1000)).toFixed(2);
          } else {
            projectedSpend = ((campData[dealType] / nf) * estTotalActions).toFixed(2);
          }
          // break;
          count++
        }

        if (projectedSpend >= spendTarget && projectedSpend <= lineItem.budget) {
          // this means success
          break;
        }

        if (projectedSpend <= spendTarget) {
          nf = nf - (nf / 100);
          if (action === 'impressions') {
            projectedSpend = ((campData[dealType] / nf) * (estTotalActions / 1000)).toFixed(2);
          } else {
            projectedSpend = ((campData[dealType] / nf) * estTotalActions).toFixed(2);
          }
          count++
        }
        count++
      } // end while loop
    }
    if (action === 'impressions') {
      Session.set('effectiveCostPer', projectedSpend / (estTotalActions / 1000));
    } else {
      Session.set('effectiveCostPer', projectedSpend / estTotalActions);
    }


    Session.set('projectedDelivery', estTotalActions);
    Session.set('newFactor', nf * 100);
    return projectedSpend;

  },
  newFactor: () => {
    return Session.get('newFactor');
  },
  projectedDelivery: () => {
    return Session.get('projectedDelivery');
  },
  effectiveCostPer: () => {
    return Session.get('effectiveCostPer');
  },
  num: (number) => {
    return formatters.num(number);
  },
  money: (number) => {
    return formatters.money(number);
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

Template.projections.onDestroyed(function () {
  Session.keys = {};
});
