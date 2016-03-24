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

    arr.forEach(el => {
      el.data.impressions = parseInt(el.data.impressions);
      el.data.spend = parseFloat(accounting.unformat(el.data.spend).toFixed(2));
      if (el.data.like === undefined || el.data.like === NaN) {
        el.data.like = 0;
      }
    })


    // console.log("arr:", arr[4], arr[5], arr[6], arr[7], arr[8]);
    // 14,090 is total for 11-30 when using Lucchese December 2015 initiative/campaign
    // var temp = {};
    /*
    TODO - write explainer for this section
    */

    let temp = {}
    let obj = null;
    let otherArray = [];

    for (var i = 0; i < arr.length; i++) {
      obj = arr[i].data;

      if (! temp[obj.date_start]) {
        temp[obj.date_start] = obj.date_start;
        temp['impressions'] = obj.impressions;
        temp['clicks'] = obj.clicks;
        temp['spend'] = obj.spend;
        temp['like'] = obj.like || 0;
      } else {
        temp['impressions'] += obj.impressions;
        temp['clicks'] += obj.clicks;
        temp['spend'] += obj.spend;
        temp['like'] += obj.like;
      }
      /*
      this next if statement says essentially: if the object start date is
      not equal to the start date of the following object --> arr[i + 1], push the temp obj
      into the otherArray and reset the temp object
      */

      // TODO this is broken
      console.log(arr[i].data.date_start);
      console.log(arr[i+1].data.date_start ? arr[i+1].data.date_start : '');
      // if (arr[i].data.date_start !== arr[i+1].data.date_start) {
      //   otherArray.push(temp);
      //   temp = {};
      // }

    }
    // console.log(otherArray);

    return otherArray;

  }
});
