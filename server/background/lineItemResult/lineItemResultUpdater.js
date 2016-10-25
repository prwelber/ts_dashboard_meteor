import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import { Moment } from 'meteor/momentjs:moment';
import Initiatives from '/collections/Initiatives';
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays';
const later = require('later');


// -------- FUNCTIONS --------- //
const makeClientSpend = function makeClientSpend (actions, adjustor, type) {
  if (type === 'cpm') {
    return (actions / 1000) * adjustor;
  } else {
    return actions * adjustor;
  }
}

const setAction = function setAction (lineItem) {
  if (lineItem.dealType === 'CPM') {
    return 'impressions';
  } else if (lineItem.dealType === 'CPC') {
    return 'clicks'
  } else if (lineItem.dealType === 'CPVV') {
    return 'video_view';
  } else if (lineItem.dealType === 'CPL') {
    return 'likes';
  }
}

const setDealtype = function setDealtype (lineItem) {
  if (lineItem.dealType === 'CPM') {
    return 'cpm';
  } else if (lineItem.dealType === 'CPC') {
    return 'cpc';
  } else if (lineItem.dealType === 'CPVV') {
    return 'cpvv';
  } else if (lineItem.dealType === 'CPL') {
    return 'cpl';
  }
}

const lookupDays = function lookupDays (start, end, name, objective) {
  return InsightsBreakdownsByDays.find(
  {
    $and: [
      {'data.date_start': {$gte: start}},
      {'data.date_start': {$lte: end}},
      {'data.initiative': name},
      {'data.objective': objective}
    ]
  },
    {
      sort: {'data.date_start': 1},
      fields: {
        'data.date_start': 1,
        'data.campaign_id': 1,
        'data.campaign_name': 1,
        'data.impressions': 1,
        'data.clicks': 1,
        'data.like': 1,
        'data.spend': 1,
        'data.video_view': 1,
        'data.objective': 1
      }
    }
  ).fetch();
}



// ------- CRON JOB -------- //

SyncedCron.config({
  collectionName: 'cronCollection'
});

SyncedCron.add({
  name: "Line Item Result Updater",

  schedule: (parser) => {
    // return parser.text('at 5:44pm');
    // return parser.text('at 11:49am');
    return parser.text('every 15 minutes');
  },
  job: (time) => {
    const inits = Initiatives.find({userActive: true}).fetch();

    inits.forEach((init, index) => {
      // if (index >= 2) {
      //   return; // for dev and testing purposes
      // }

      let activeLines = _.where(init.lineItems, {'percent_total': true});
      // grab line items that are percentage / factor deals

      activeLines.forEach((line, lineIndex) => {

        let action = setAction(line);

        const objective = line.objective.toUpperCase().replace(/ /, "_");
        const days = lookupDays(line.startDate, line.endDate, init.name, objective);

        // console.log(init.name, objective, days.length, days[0])
        let reducedActions;
        try {
          reducedActions = days.map(day => {
            if (! day.data[action]) {
              return 0;
            } else {
              return parseInt(day.data[action]);
            }
          }).reduce((a,b) => {
            return a + b;
          });
        } catch(e) {
          console.log('Error in map reduce func of line item updater', e, init.name, line.name);
        }


        // ----------- setting client spend ----------- //
        const type = setDealtype(line);
        const adjustor = init[objective]['net'][`client_${type}`];
        const budget = parseFloat(line.budget);

        const actionsPercentage = (reducedActions / parseInt(line.quantity) * 100);
        const clientSpend = makeClientSpend(reducedActions, adjustor, type)
        let spendPercentage = (clientSpend / budget) * 100;

        if (moment().isAfter(moment(line.endDate, moment.ISO_8601))) {
          spendPercentage = 100;
        }

        const results = {
          actions: reducedActions,
          actionsPercentage: actionsPercentage,
          clientSpend: clientSpend,
          clientSpendPercentage: spendPercentage,
        }

        let dataToSet = {};
        dataToSet[`lineItems.${lineIndex}.results`] = results;

        try {
          Initiatives.update(
            {_id: init._id},
            {$set: dataToSet}
          )
        } catch(e) {
          console.log('Error in Line Item Update Function', e);
        }
      });
    }); // end of inits.forEach(init => {})
  }
});


// go through each initiative and through each line item
// if line item is percent total

// once i have the line item, i need augmented: start, end, objective
