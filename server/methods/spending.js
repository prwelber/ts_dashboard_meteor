import { Meteor } from 'meteor/meteor';
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays';
import { check } from 'meteor/check';
import { EJSON } from 'meteor/ejson';
var json2csv = require('json2csv');
var fs = require('fs');



Meteor.methods({
  spendingAggregate: (campArray, start, end) => {
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
      result[0]['campaign_id'] = InsightsBreakdownsByDays.findOne({'data.campaign_name': name}).data.campaign_id;
      resultArray.push(result[0]);
    });
    // convert to JSON so I can turn into a CSV
    var testJSON = EJSON.stringify(resultArray);
    var fields = ['_id', 'spend', 'impressions', 'clicks', 'likes'];

    var makeCSV = json2csv({ data: testJSON, fields: fields}, function (err, csv) {
      if (err) console.log(err);
      return csv;
      // fs.writeFile('test.csv', csv, function (err) {
      //   if (err) throw err;
      //   console.log('file saved');
      // })
    });

    return {result: resultArray, csv: makeCSV, json: testJSON};
  }
});
