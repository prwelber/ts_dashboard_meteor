import { Meteor } from 'meteor/meteor'
import { SyncedCron } from 'meteor/percolate:synced-cron';
import { Moment } from 'meteor/momentjs:moment'
import { insightUpdate } from './initCampaignInsightsUpdaterFunc'
import Initiatives from '/collections/Initiatives'
const later = require('later');


SyncedCron.config({
  collectionName: 'cronCollection'
});

SyncedCron.add({
  name: "Insight Updater",

  schedule: (parser) => {
    return parser.text('every 2 hours')
    // return parser.text('at 12:29pm');

    // REMEMBER to change interval length
  },

  job: (time) => {
    const inits = Initiatives.find({userActive: true}).fetch();

    let onlyIds = _.map(inits, (el) => {
      return el.campaign_ids;
    });

    // now i'm sitting with all the campaign ID's of the active initiatives

    let flat = _.flatten(onlyIds);

    insightUpdate(flat);

  }
}) // end of SyncedCron.add
