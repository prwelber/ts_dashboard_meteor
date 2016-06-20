import { Meteor } from 'meteor/meteor';
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays';
import { check } from 'meteor/check';


Meteor.methods({
  spendingAggregate: (campArray, start, end) => {
    console.log('campSet', campArray);

    const makePipeline = function makePipeline (name) {
      return [
        {$match:
          {"data.campaign_name": name, 'data.date_start': {$gte: start, $lte: end}}
        },
        {$group: {
          _id: name,
          spend: {$sum: "$data.spend"},
          clicks: {$sum: "$data.clicks"},
          impressions: {$sum: "$data.impressions"},
          likes: {$sum: "$data.like"},
          }
        }
      ];
    }

    campArray.forEach((name) => {
      let result = InsightsBreakdownsByDays.aggregate(makePipeline(name));
      console.log(result);
    })


    return "this is a return statement"
  }
});
