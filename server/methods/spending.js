import { Meteor } from 'meteor/meteor';
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays';
import { check } from 'meteor/check';
import { EJSON } from 'meteor/ejson';


Meteor.methods({
  spendingAggregate: (campArray, start, end) => {
    console.log('campSet', campArray);
    const resultArray = [];

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
      resultArray.push(result[0]);
    });
    // convert to JSON so I can turn into a CSV
    var test = EJSON.stringify(resultArray);
    console.log('test', test)
    // console.log('array:', resultArray);

    return resultArray;
  }
});
