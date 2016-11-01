import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import { Moment } from 'meteor/momentjs:moment';
import Initiatives from '/collections/Initiatives';
import CampaignInsights from '/collections/CampaignInsights';
const later = require('later');


SyncedCron.config({
  collectionName: 'cronCollection'
});

SyncedCron.add({
  name: "Platform Aggregator",

  schedule: (parser) => {
    // return parser.text('at 1:24pm')
    return parser.text('every 12 hours')
  },

  job: (time) => {

    const makePipeline = function makePipeline (name, platform) {
      return [
        {$match:
          {"data.initiative": name, 'data.platform': platform}
        },
        {$group: {
          _id: `${platform}`,
          clicks: {$sum: "$data.clicks"},
          impressions: {$sum: "$data.impressions"},
          likes: {$sum: "$data.like"},
          videoViews: {$sum: "$data.video_view"},
          engagements: {$sum: "$data.engagements"},
          pageEngagements: {$sum: "$data.page_engagement"},
          }
        }
      ];
    }


    const inits = Initiatives.find({userActive: true}).fetch();
    inits.forEach(init => {

      platformArray = ['twitter', 'facebook'];



      let data = [];
      for (let i = 0; i < platformArray.length; i++) {

        let result = CampaignInsights.aggregate(makePipeline(init.name, platformArray[i]))[0];
        data.push(result);

      }
      // console.log('result', data);
      Initiatives.update(
        {_id: init._id},
        {$set:
          {
            platforms: data
          }
        }
      ) // end of Mongo update
    }); // end of inits.forEach
  } // end of job
}); // end of syncedCron.add({})
