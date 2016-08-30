import Initiatives from '/collections/Initiatives'

Meteor.methods({
  'initiativeAggregation': function (params, afterDate, beforeDate) {
    console.log(params, afterDate, beforeDate)
    let matchObj = {};
    const data = Object.keys(params); // data is an array of the params keys
    console.log('data', data)
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
      // matchObj['lineItems.0.endDate'] = {
      //   '$lte': end
      // }
      matchObj['$or'] = [
        {'lineItems.0.endDate': {'$lte': end}},
        {'lineItems.1.endDate': {'$lte': end}},
        {'lineItems.2.endDate': {'$lte': end}},
        {'lineItems.3.endDate': {'$lte': end}},
        {'lineItems.4.endDate': {'$lte': end}},
      ]
    } else if (afterDate) {
      const start = afterDate;
      // matchObj['lineItems.0.startDate'] = {
      //   '$gte': start
      // }
      matchObj['$or'] = [
        {'lineItems.0.startDate': {'$gte': start}},
        {'lineItems.1.startDate': {'$gte': start}},
        {'lineItems.2.startDate': {'$gte': start}},
        {'lineItems.3.startDate': {'$gte': start}},
        {'lineItems.4.startDate': {'$gte': start}},
      ]
    }



    // $or: [ {'lineItems.0.objective': 'Video Views'}, {'lineItems.1.objective': 'Video Views'} ]

    console.log('matchObj', matchObj)

    const makePipeline = function makePipeline (params, matchObj) {
      return [
        {$match: matchObj},
        {$group: {
          _id: '$product', count: {$sum: 1},
          spend: {$sum: "$aggregateData.spend"},
          clicks: {$sum: "$aggregateData.clicks"},
          reach: {$sum: "$aggregateData.reach"},
          impressions: {$sum: "$aggregateData.impressions"},
          likes: {$sum: "$aggregateData.likes"},
          totalBudget: {$sum: "$aggregateData.totalBudget"},
          videoViews: {$sum: "$aggregateData.videoViews"}
          }
        }
      ];
    }

    const result = Initiatives.aggregate(makePipeline(params, matchObj));
    const agData = Initiatives.aggregate(makePipeline(params, matchObj))[0];
    console.log('agData', agData)
    console.log('result', result)

    try {
      if (agData && agData['spend']) {
        agData['cpc'] = agData.spend / agData.clicks;
        agData['cpm'] = agData.spend / (agData.impressions / 1000);
        agData['cpl'] = agData.spend / agData.likes;

        return agData;

      } else {
        return "nothing to show";
      }
    } catch (e) {
      console.log('Error aggregating initiatives', e);
      return {error: "nothing to show"};
    }
  }
});
