Meteor.methods({
  'aggregateForChart': function (initiative) {
    console.log('aggregateForChart running');
    let arr = [];
    /*
    below we are querying the daily breakdown collection for all the
    documents that have a campaign ID that is also in the initiative array.
    We are also returning only the fields we need for the charting.
    */
    initiative.campaign_ids.forEach(el => {
      let x = InsightsBreakdownsByDays.find(
        {'data.campaign_id': el},
        { fields: {
          'data.date_start': 1,
          'data.campaign_id': 1,
          'data.impressions': 1,
          'data.clicks': 1,
          'data.like': 1,
          'data.spend': 1,
          'data.campaign_name': 1,
          _id: 0
          }
        }).fetch()
      x ? arr.push(x) : '';
    })

    arr = _.flatten(arr);

    arr = _.sortBy(arr, function (el){ return moment(el.data.date_start, "MM-DD-YYYY").format("MM-DD-YYYY") });

    arr.forEach(el => {
      el.data.date_start = moment(el.data.date_start, "MM-DD-YYYY").format("MM-DD");
    });

    return arr;

  }
});
