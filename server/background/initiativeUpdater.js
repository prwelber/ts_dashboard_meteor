import { Meteor } from 'meteor/meteor'
import { SyncedCron } from 'meteor/percolate:synced-cron';
import { Moment } from 'meteor/momentjs:moment'
import { dailyUpdate } from './initiativeUpdaterFunction'
import CampaignInsights from '/collections/CampaignInsights'
import Initiatives from '/collections/Initiatives'
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays'
const later = require('later');

SyncedCron.config({
  collectionName: 'cronCollection'
});

SyncedCron.add({
  name: "Initiative Updater",

  schedule: (parser) => {
    return parser.text('at 2:12pm');
  },

  job: (time) => {
    const inits = Initiatives.find({}).fetch();

    const active = _.filter(inits, (el) => {
      if (el.userActive) {
        return el
      }
    });

    let onlyIds = _.map(active, (el) => {
      return el.campaign_ids
    });

    let flat = _.flatten(onlyIds);

    console.log(flat)

    dailyUpdate(flat);

  }
});
