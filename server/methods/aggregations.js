import Initiatives from '/collections/Initiatives'

Meteor.methods({
  'initiativeAggregation': function (params, afterDate, beforeDate) {
    let matchObj = {};
    const data = Object.keys(params); // data is an array of the params keys

    for (let i = 0; i < data.length; i++) {
      matchObj[data[i]] = params[data[i]];
    }


    if (afterDate && beforeDate) {
      const start = afterDate;
      const end = beforeDate;
      matchObj['startDate'] = {
        '$gte': start
      }
      matchObj['endDate'] = {
        '$lte': end
      }
    } else if (beforeDate) {
      const end = beforeDate;
      matchObj['endDate'] = {
        '$lte': end
      }
    } else if (afterDate) {
      const start = afterDate;
      matchObj['startDate'] = {
        '$gte': start
      }
    }

    const makePipeline = function makePipeline (params, matchObj) {
      return [
        {$match: matchObj},
        {$group: {
          _id: null,
          spend: {$sum: "$aggregateData.spend"},
          clicks: {$sum: "$aggregateData.clicks"},
          reach: {$sum: "$aggregateData.reach"},
          impressions: {$sum: "$aggregateData.impressions"},
          likes: {$sum: "$aggregateData.likes"}
          }
        }
      ];
    }

    const result = Initiatives.aggregate(makePipeline(params, matchObj));

    try {
      if (result && result[0]['spend']) {
        result[0]['cpc'] = result[0].spend / result[0].clicks;
        result[0]['cpm'] = result[0].spend / (result[0].impressions / 1000);
        result[0]['cpl'] = result[0].spend / result[0].likes;

        return result[0];

      } else {
        return "nothing to show";
      }
    } catch (e) {
      console.log('Error aggregating initiatives', e);
      return {error: "nothing to show"};
    }
  }
});
