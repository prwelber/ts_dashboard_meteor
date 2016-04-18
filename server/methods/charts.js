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
          'data.cost_per_like': 1,
          'data.post_engagement': 1,
          'data.cost_per_post_engagement': 1,
          'data.cost_per_page_engagement': 1,
          'data.cost_per_video_view': 1,
          'data.cpc': 1,
          'data.cpm': 1,
          'data.cpp': 1,
          'data.ctr': 1,
          'data.reach': 1,
          'data.total_actions': 1,
          'data.video_view': 1,
          _id: 0
          }
        }).fetch()
      x ? arr.push(x) : '';
    });

    arr = _.flatten(arr);

    // need to sort this array by date_start
    arr = _.sortBy(arr, function (el){ return moment(el.data.date_start, "MM-DD-YYYY").format("MM-DD-YYYY") });
    console.log('sorted arr', arr);

    /*
    In the below forEach, we are simply calculating the total number of
    missing days. We are using that total number in the following loop
    to determine how many times to iterate (we need to iterate over all
    the existing dates plus the ones that have not been created yet)
    */
    let timeForm = "MM-DD-YYYY"
    let total = 0;
    try {

      arr.forEach((el, index) => {
          var diff = moment(arr[index].data.date_start, timeForm).diff(moment(arr[index + 1].data.date_start, timeForm), 'days');

          if (diff < -1) {
            total += Math.abs(diff) - 1;
          }
      });
    } catch(e) {
        console.log("Error Message:", e.message);
    }

    /*
    Below, we are accounting for any gaps in the timeline since not all
    campaigns run on sequential days. within the for loop we are looking for
    difference between days and if that difference is more than 1 day (< -1)
    then we loop the number of times as the difference and we use moment to add
    one on each loop, giving us the missing days
    in the inner for loop, we splice (add to array) in a new object with all
    null values except for the date. We do this so that the graph/chart
    accurately reflects the data, since without this it will look like
    all campaigns ran on consecutive days, when sometimes this is not
    the case.
    */
    try {
      for (var i = 0; i < arr.length + total; i++) {
        var diff = moment(arr[i].data.date_start, timeForm).diff(moment(arr[i + 1].data.date_start, timeForm), 'days');

        if (diff < -1) {

          for (var j = 1; j < Math.abs(diff); j++) {

            console.log("generated nums:", moment(arr[i].data.date_start, timeForm).add(j, 'd').format(timeForm));

            arr.splice(i + j, 0, {
              data: {
                date_start: moment(arr[i].data.date_start, timeForm).add(j, 'd').format(timeForm),
                impressions: null,
                clicks: null,
                like: null,
                spend: null,
                cost_per_like: null,
                cost_per_page_engagement: null,
                cost_per_post_engagement: null,
                cost_per_video_view: null,
                cpm: null,
                cpc: null,
                reach: null,
                total_actions: null,
                video_view: null,
                post_engagement: null
              }
            })
          }
        }
      }

    } catch(e) {
      // statements
      console.log(e);
    }


    arr = _.sortBy(arr, function (el){ return moment(el.data.date_start, "MM-DD-YYYY").format("MM-DD-YYYY") });

    arr.forEach(el => {
      el.data.date_start = moment(el.data.date_start, "MM-DD-YYYY").format("MM-DD");
    });

    // needed to account for likes being undefined so we can add to zero
    // and format data so it can be added or averaged
    arr.forEach(el => {
      el.data.impressions === null ?
      el.data.impressions = null :
      el.data.impressions = parseInt(el.data.impressions);

      el.data.spend = parseFloat(accounting.unformat(el.data.spend).toFixed(2));
      el.data.cpm = parseFloat(accounting.unformat(el.data.cpm).toFixed(2));
      el.data.cpc = parseFloat(accounting.unformat(el.data.cpc).toFixed(2));
      el.data.cost_per_like = parseFloat(accounting.unformat(el.data.cost_per_like).toFixed(2));
      el.data.cost_per_video_view = parseFloat(accounting.unformat(el.data.cost_per_video_view).toFixed(2));
      el.data.cost_per_post_engagement = parseFloat(accounting.unformat(el.data.cost_per_post_engagement).toFixed(2));
      if (el.data.like === undefined || el.data.like === NaN) {
        el.data.like = 0;
      }
    })
    /*
    In the below code block, we are saying that if the temp obj does not have
    a key that is equal to the start date of the object being iterated over,
    set a key equal to start date and then set keys and values for all the
    required values (impressions, clicks, etc..) and if there is already that
    start date key, then just add the required values onto the already existing
    values. The next if statement has it's own explainer below.
    */

    let temp = {}
    let obj = null;
    let otherArray = [];

    for (var i = 0; i < arr.length; i++) {
      obj = arr[i].data;

      if (! temp[obj.date_start]) {
        temp['date'] = obj.date_start;
        temp['impressions'] = obj.impressions;
        temp['clicks'] = obj.clicks;
        temp['spend'] = obj.spend;
        temp['like'] = obj.like || 0;
        temp['cost_per_like'] = obj.cost_per_like;
        temp['cost_per_page_engagement'] = obj.cost_per_page_engagement;
        temp['cost_per_post_engagement'] = obj.cost_per_post_engagement;
        temp['cost_per_video_view'] = obj.cost_per_video_view;
        temp['cpm'] = obj.cpm;
        temp['cpc'] = obj.cpc;
        temp['cost_per_like'] = obj.cost_per_like;
        temp['reach'] = obj.reach;
        temp['total_actions'] = obj.total_actions;
        temp['video_view'] = obj.video_view;
        temp['post_engagement'] = obj.post_engagement;
      } else {
        temp['impressions'] += obj.impressions;
        temp['clicks'] += obj.clicks;
        temp['spend'] += obj.spend;
        temp['like'] += obj.like;
        temp['reach'] += obj.reach;
        temp['total_actions'] += obj.total_actions;
        temp['video_view'] += obj.video_view;
        temp['post_engagement'] += obj.post_engagement;
        temp['cpm'] = temp.spend / (temp.impressions / 1000);
        temp['cpc'] = temp.spend / temp.clicks;
        temp['cost_per_like'] = temp.spend / temp.like;
      }
      /*
      this next if statement says essentially: if the object start date is
      not equal to the start date of the following object --> arr[i + 1], push the temp obj
      into the otherArray and reset the temp object
      */

      /*
      at the end, arr[i+1] will be undefined, so needed to account for that scenario
      */
      if (arr[i+1] === undefined || arr[i].data.date_start !== arr[i+1].data.date_start) {
        otherArray.push(temp);
        temp = {};
      }

    }


    // make sure all values are null so the charts reflect that
    otherArray.forEach(el => {
      if (el.impressions === null) {
        el.spend = null;
        el.like = null;
        el.cost_per_like = null;
        el.cost_per_post_engagement = null;
        el.cost_per_video_view = null;
        el.cpm = null;
        el.cpc = null;
      }
      if (el.cost_per_like === Infinity) {
        el.cost_per_like = 0;
      }
    });
    // console.log()
    return otherArray;

  },
  'hourlyChart': function (initiative) {
    console.log('pieChart running');
    let campaignIds = initiative.campaign_ids // array of campaign ids

    let twentyFourHourArray = [];
    var time = moment('12:00 am', 'hh:mm a');
    /*
    Here, we are aggregating from the hourlybreakdown collection. We are looking to match
    based on hour (which has been set when the hourlybreakdown comes in) and the campaign id, which we are
    matching to the array of campaign ID's from the initiative which is an argument in this function.
    we are summing spend clicks impressions and likes and then adding cost per data in the loop.
    The for loop goes until 23 because it starts at zero, not 1.
    Upon each completion of a loop, the time is incremented by one hour.
     */
    for (var i = 0; i <= 23; i++) {
      var pipeline = [
        {$match:
          {$and: [
              {'data.hour': time.format('hh:mm a')},
              {'data.campaign_id': { $in: campaignIds } }
              // {'data.campaign_id': { $in: campaignIds } }
            ]
          }
        },
        {$group: {
          _id: time.format('hh:mm a'),
          spend: {$sum: "$data.spend"},
          clicks: {$sum: "$data.clicks"},
          impressions: {$sum: "$data.impressions"},
          likes: {$sum: "$data.like"}
          }
        }
      ];
      var result = HourlyBreakdowns.aggregate(pipeline);
        try {
          result[0]['cpc'] = result[0].spend / result[0].clicks;
          result[0]['cpm'] = result[0].spend / (result[0].impressions / 1000);
          if (result[0].likes === 0) {
            result[0]['cpl'] = 0;
          } else {
            result[0]['cpl'] = result[0].spend / result[0].likes;
          }
          twentyFourHourArray.push(result);
          time = time.add(1, 'hour');
        } catch(e) {
          console.log(e);
          continue;
        }

    }

    return twentyFourHourArray;

  },
  'ageGenderChart': function (initiative) {
    console.log('ageGender running')
    const campaignIds = initiative.campaign_ids // array of campaign ids
    const ageGenderArray = [];
    let breakdown;
    campaignIds.forEach(el => {
      breakdown = InsightsBreakdowns.find({'data.campaign_id': el}).fetch();
      ageGenderArray.push(breakdown);
    });
    const flattened = _.flatten(ageGenderArray);
    // cleaned is an array that has the unknown gender values removed
    const cleaned = _.reject(flattened, function (el) {
      return el.data.gender === "unknown";
    });
    const maleArray = _.filter(cleaned, function (el) {
      return el.data.gender === "male";
    });
    const femaleArray = _.filter(cleaned, function (el) {
      return el.data.gender === "female";
    });

    // function pulls certain data out of objects
    const makeClean = function makeClean (array) {
      var cleanedArray = [];
      array.forEach(el => {
        el.data.impressions = parseInt(el.data.impressions);
        el.data.spend = accounting.unformat(el.data.spend);
        el.data.cost_per_post_engagement = accounting.unformat(el.data.cost_per_post_engagement);
        el.data.video_view === undefined ? el.data.video_view = 0 : '';
        el.data.post_like === undefined ? el.data.post_like = 0 : '';
        let newEl = {
          spend: el.data.spend,
          impressions: el.data.impressions,
          cpm: (el.data.impressions / el.data.spend),
          likes: el.data.post_like,
          cpl: (el.data.post_like / el.data.spend),
          clicks: el.data.clicks,
          cpc: (el.data.clicks / el.data.spend),
          reach: el.data.reach,
          postEng: el.data.cost_per_post_engagement,
          videoView: el.data.video_view,
          costVideoView: el.data.cost_per_video_view,
          age: el.data.age,
          gender: el.data.gender
        }

        cleanedArray.push(newEl);
      });
      return cleanedArray;
    }

    var cleanedMaleArray = makeClean(maleArray);
    var cleanedFemaleArray = makeClean(femaleArray);

    const sumAge = function sumAge (array, ageRange) {
      var temp = {
        impressions: 0,
        clicks: 0,
        likes: 0,
        spend: 0,
        postEng: 0,
        reach: 0,
        videoView: 0
      };
      var newArray = [];
      var count = 0;
      array.forEach(el => {
        if (el.age === ageRange) {
          temp['age'] = ageRange;
          temp['gender'] = el.gender;
          temp.impressions += el.impressions;
          temp.clicks += el.clicks;
          temp.likes += el.likes;
          temp.reach += el.reach;
          temp.videoView += el.videoView;
          temp.postEng += el.postEng;
          temp.spend += el.spend;
          count++;
        }
      });

      temp.postEng = temp.postEng / count;
      return temp;
    }

    /*
    what needs to happen here is to loop over an array of the age ranges
    while having an inner loop that always goes over the cleanedArray
    then we can push each returned object into a final array that will be
    suitable for graphing
    */

    const ageRanges = ['18-24', '25-34', '35-44', '45-54','55-64', '65+'];
    const finalFemale = [];
    const finalMale = [];

    for (let i = 0; i < ageRanges.length; i++) {
      var obj;
      obj = sumAge(cleanedFemaleArray, ageRanges[i]);
      finalFemale.push(obj);
    }

    for (let i = 0; i < ageRanges.length; i++) {
      var obj;
      obj = sumAge(cleanedMaleArray, ageRanges[i]);
      finalMale.push(obj);
    }
    return {male: finalMale, female: finalFemale};

  }
});
