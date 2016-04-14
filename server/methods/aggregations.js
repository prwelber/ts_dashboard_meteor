Meteor.methods({
  'initiativeAggregation': function (params, afterDate, beforeDate) {
    console.log('aggregate running with params', params);
    let matchObj = {};
    const data = Object.keys(params); // data is an array of the params keys
    console.log(Object.keys(params));

    for (let i = 0; i < data.length; i++) {
      console.log(data[i]);
      console.log(params[data[i]])
      matchObj[data[i]] = params[data[i]];
    }

    console.log("matchObj after loop" + '\n' +  JSON.stringify(matchObj));

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

    console.log('matchObj after date addition:' + '\n' + JSON.stringify(matchObj));


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
    console.log('result before cost per additions', result);

    try {
      if (result && result[0]['spend']) {
        result[0]['cpc'] = result[0].spend / result[0].clicks;
        result[0]['cpm'] = result[0].spend / (result[0].impressions / 1000);
        result[0]['cpl'] = result[0].spend / result[0].likes;

        console.log(result);
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
