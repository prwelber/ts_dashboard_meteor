import { Meteor } from 'meteor/meteor'
import { SyncedCron } from 'meteor/percolate:synced-cron';
import { Moment } from 'meteor/momentjs:moment'
import { dailyUpdate } from './initiativeDailyBreakdownUpdaterFunc'
import CampaignInsights from '/collections/CampaignInsights'
import Initiatives from '/collections/Initiatives'
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays'
import { apiVersion } from '/server/token/token'
const later = require('later');

SyncedCron.config({
  collectionName: 'cronCollection'
});

SyncedCron.add({
  name: "Initiative Updater",

  schedule: (parser) => {
    return parser.text('at 3:23pm');
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
    // now i'm sitting with all the campaign ID's of the active initiatives

    let flat = _.flatten(onlyIds);

    console.log(flat)

    dailyUpdate(flat);

  }
});
