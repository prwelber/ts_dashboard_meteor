Meteor.methods({
  'initiativeAggregation': function (params) {
    console.log('aggregate running with params', params);

    const makePipeline = function makePipeline (params) {
      return [
        {$match:
          {agency: params.agency, product: params.product, objective: params.objective}
        },
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

    const result = Initiatives.aggregate(makePipeline(params));

    if (result && result[0]['spend']) {
      result[0]['cpc'] = result[0].spend / result[0].clicks;
      result[0]['cpm'] = result[0].spend / (result[0].impressions / 1000);
      result[0]['cpl'] = result[0].spend / result[0].likes;
    }
    console.log(result);

    return result[0];

  }
});
