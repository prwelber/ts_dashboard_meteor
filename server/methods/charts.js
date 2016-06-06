import Initiatives from '/collections/Initiatives'
import CampaignInsights from '/collections/CampaignInsights'
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays'
import InsightsBreakdowns from '/collections/InsightsBreakdowns'
import HourlyBreakdowns from '/collections/HourlyBreakdowns'

const moment = require('moment');
const range = require('moment-range');


Meteor.methods({
  'aggregateForChart': function (initiative) {
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

    /*
    In the below forEach, we are simply calculating the total number of
    missing days. We are using that total number in the following loop
    to determine how many times to iterate (we need to iterate over all
    the existing dates plus the ones that have not been created yet)
    */
    const timeForm = "MM-DD-YYYY"
    let total = 0;
    try {
      for (let i = 0; i < arr.length - 1; i++) {
        // changing the above line to arr.length - 1 gets rid of an error
        // but it also cuts off the last day
        // will come back to this
        var diff = moment(arr[i].data.date_start, timeForm).diff(moment(arr[i + 1].data.date_start, timeForm), 'days');
        if (diff < -1) {
          total += Math.abs(diff) - 1;
        }
      }
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
    const LOOP_TOTAL = arr.length + total
    try {
      for (let i = 0; i < LOOP_TOTAL; i++) {

        if (i === LOOP_TOTAL - 1) {
          null
        } else {

          var diff = moment(arr[i].data.date_start, timeForm).diff(moment(arr[i + 1].data.date_start, timeForm), 'days');

          if (diff < -1) {

            for (var j = 1; j < Math.abs(diff); j++) {

              // console.log("generated nums:", moment(arr[i].data.date_start, timeForm).add(j, 'd').format(timeForm));

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
      }
    } catch(e) {
      console.log("Error while accounting for gaps:", e);
    }


    arr = _.sortBy(arr, function (el){ return moment(el.data.date_start, "MM-DD-YYYY").format("MM-DD-YYYY") });


    arr.forEach(el => {
      el.data.date_start = moment(el.data.date_start, "MM-DD-YYYY").format("MM-DD");
    });

    //make labels here...
    const LABEL_ARRAY = [];
    arr.forEach(el => {
      LABEL_ARRAY.push(el.data.date_start);
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
    let otherArray = [];

    try {

      let temp = {}
      let obj = null;

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
    } catch(e) {
      console.log("Error in charts.js, aggregateForChart function:", e);
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

    // const labelArray = [];
    const start = moment(otherArray[0].date, "MM-DD");
    const end = moment(initiative.lineItems[0].endDate, moment.ISO_8601);
    const dr = moment.range(start, end);
    const arrayOfDays = dr.toArray('days');

    // arrayOfDays.forEach(el => {
    //   labelArray.push(moment(el).format("MM-DD"))
    // });

    return {
      dataArray: otherArray,
      labelArray: LABEL_ARRAY
    }
  },
  'hourlyChart': function (initiative) {
    let campaignIds = initiative['campaign_ids'] // array of campaign ids

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
          console.log("Error in hourly chart", e);
          continue;
        }

    }

    return twentyFourHourArray;

  },
  'ageGenderChart': function (initiative) {
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

  },
  campaignAggregatorChart: (idArray, initiative, lineItem) => {

    //  ---------- GRAB LINE ITEM INFORMATION ---------- //

    const line = _.where(initiative.lineItems, {name: lineItem})[0];
    let type;

    // ---------- TIME RANGE AND IDEAL SPEND / IDEAL DELIVERY ---------- //
    const start = moment(line.startDate, moment.ISO_8601);
    const end = moment(line.endDate, moment.ISO_8601);
    const now = moment();
    const totalTimeDiff = end.diff(start, 'd');
    const currentTimeDiff = now.diff(start, 'd');
    const idealDailySpend = parseFloat(line.budget) / totalTimeDiff;
    const idealDailyDelivery = parseFloat(line.quantity) / totalTimeDiff;
    const idealSpendArray = [];
    const idealDeliveryArray = [];

    let idealDeliveryTotal = 0,
        idealSpendTotal    = 0;
    for (let i = 0; i < currentTimeDiff + 1; i++) {
      idealDeliveryTotal = idealDeliveryTotal + idealDailyDelivery;
      idealSpendTotal = idealSpendTotal + idealDailySpend;
      idealDeliveryArray.push(idealDeliveryTotal);
      idealSpendArray.push(idealSpendTotal);
    }

    const days = InsightsBreakdownsByDays.find(
      {'data.campaign_id': {$in: idArray}},
      {fields: {
        'data.date_start': 1,
        'data.impressions': 1,
        'data.spend': 1,
        'data.cpm': 1,
        'data.like': 1,
        'data.video_view': 1,
        'data.cost_per_like': 1,
        'data.cost_per_video_view': 1,
        'data.clicks': 1,
        'data.cpc': 1,
        '_id': 0
      }
    }).fetch();

    // loop over array, assign date_start and data to an empty object key/value, if we hit that again, add to array

    // ------ COMBINE ARRAYS BASED ON DATE_START KEY/VAL PAIR ---- //
    let combinedArray = [];
    let obj = {}
    days.forEach((day) => {
      if (!obj[day.data.date_start]) {
        obj[day.data.date_start] = {
          date_start: day.data.date_start,
          impressions: parseInt(day.data.impressions),
          spend: accounting.unformat(day.data.spend),
          like: day.data.like || 0,
          video_view: day.data.video_view || 0,
          clicks: day.data.clicks || 0
        }
      } else if (obj[day.data.date_start]) {
        obj[day.data.date_start]['impressions'] += parseInt(day.data.impressions);
        obj[day.data.date_start]['spend'] += accounting.unformat(day.data.spend);
        obj[day.data.date_start]['like'] += day.data.like || 0;
        obj[day.data.date_start]['video_view'] += day.data.video_view || 0;
        obj[day.data.date_start]['clicks'] += day.data.clicks;
      }
    });

    for (let key in obj) {
      combinedArray.push(obj[key])
    }

    combinedArray = _.sortBy(combinedArray, 'date_start')
    // array is in order

    // need to make cost per action for each object in array

    combinedArray.forEach((day) => {
      day['cpm'] = day.spend / (day.impressions / 1000);
      day['cpc'] = day.spend / day.clicks;
      day['cpl'] = day.spend / day.like;
      day['cpvv'] = day.spend / day.video_view;
    });

    // need to get data into two formats - one for delivery chart and one for cost per chart
    // delivery chart means arrays of impressions, clicks, likes, video_views and spend (added up each day) over days
    // cost per chart means arrays of cpm, cpc, cpl, cpvv over days

    // ------------------------ DELIVERY CHART ----------------------- //

    const deliveryImpressions = [];
    const deliveryClicks = [];
    const deliveryLikes = [];
    const deliveryVideoViews = [];
    const deliverySpend = [];
    const deliveryDays = [];
    let impressions = 0;
    let clicks = 0;
    let likes = 0;
    let video_views = 0;
    let spend = 0;

    combinedArray.forEach((day) => {
      impressions += day.impressions;
      deliveryImpressions.push(impressions);
      clicks += day.clicks;
      deliveryClicks.push(clicks);
      likes += day.like;
      deliveryLikes.push(likes);
      video_views += day.video_view;
      deliveryVideoViews.push(video_views);
      spend += day.spend;
      deliverySpend.push(spend);
      deliveryDays.push(moment(day.date_start, moment.ISO_8601).format("MM-DD"));
    });

    const impressionsChartObj = {
      name: 'Impressions',
      data: deliveryImpressions,
      color: '#e65100',
      visible: false
    }
    const clicksChartObj = {
      name: 'Clicks',
      data: deliveryClicks,
      color: '#0d47a1',
      visible: false
    }
    const likesChartObj = {
      name: 'Likes',
      data: deliveryLikes,
      color: '#b71c1c',
      visible: false
    }
    const videoViewsChartObj = {
      name: 'Video Views',
      data: deliveryVideoViews,
      color: '#ef9a9a',
      visible: false
    }


    // ------------------- COST PER CHART CALCULATIONS ------------------- //

    const cpmArray = [];
    const cpcArray = [];
    const cplArray = [];
    const cpvvArray = [];

    combinedArray.forEach((day) => {
      cpmArray.push(day.cpm);
      cpcArray.push(day.cpc);
      day.cpl === Infinity ? cplArray.push(null) : cplArray.push(day.cpl);
      day.cpvv === Infinity ? cpvvArray.push(null) : cpvvArray.push(day.cpvv);
    });


    const cpm = {
      name: "cpm",
      data: cpmArray,
      color: '#0d47a1',
      visible: false
    }
    const cpc = {
      name: "cpc",
      data: cpcArray,
      color: '#ff1b6b',
      visible: false
    }
    const cpl = {
      name: "cpl",
      data: cplArray,
      color: '#9600ff',
      visible: false
    }
    const cpvv = {
      name: "cpvv",
      data: cpvvArray,
      color: '#2ddbb3',
      visible: false
    }

    // ----------- DYNAMIC CHANGES TO CHARTING SERIES OBJECTS ----------- //

    if (line.dealType === "CPM") {
      type = "impressions";
      impressionsChartObj.visible = true;
      cpm.visible = true;
    } else if (line.dealType === "CPC") {
      type = "clicks";
      clicksChartObj.visible = true;
      cpc.visible = true;
    } else if (line.dealType === "CPL") {
      type = "like";
      likesChartObj.visible = true;
      cpl.visible = true;
    } else if (line.dealType === "CPVV") {
      type = "video_view",
      videoViewsChartObj.visible = true;
      cpvv.visible = true;
    }

    // -------------------- CREATE CHART OBJECTS ----------------------- //

    const deliveryObject = {
          chart: {
            zoomType: 'x'
          },
          // TODO FIX THIS
          title: {
            text: "Delivery"
          },

          tooltip: {
            shared: true,
            crosshairs: true
          },
          xAxis: {
            // type: 'datetime',
            categories: deliveryDays,
            title: {
                text: 'Days'
            }
          },

          yAxis: {
            title: {
              text: "Amount"
            },
            plotLines: [{
              value: 0,
              width: 1,
              color: '#808080'
            }]
          },

          plotOptions: { // removes the markers along the plot lines
            series: {
              marker: {
                enabled: false
              }
            }
          },

          series: [
            // these are objects defined above
            impressionsChartObj,
            clicksChartObj,
            likesChartObj,
            videoViewsChartObj,
            {
              name: 'Spend',
              data: deliverySpend,
              color: '#388e3c',
              tooltip: {
                valueSuffix: ' USD',
                valuePrefix: '$',
                valueDecimals: 2
              }
            }, {
              name: 'Ideal Spend',
              data: idealSpendArray,
              color: '#a5d6a7',
              tooltip: {
                valueSuffix: ' USD',
                valuePrefix: '$',
                valueDecimals: 2
              }
            }, {
              name: 'Ideal Delivery',
              data: idealDeliveryArray,
              color: '#90caf9'
            }
          ]
        } // end of return




    const costPerObject = {
          chart: {
            zoomType: 'x'
          },
          // TODO FIX THIS
          title: {
            text: "Cost Per"
          },

          tooltip: {
            valueSuffix: "",
            shared: true,
            crosshairs: true
          },
          xAxis: {
            // type: 'datetime',
            categories: deliveryDays,
            title: {
                text: 'Days'
            }
          },

          yAxis: {
            title: {
              text: "Amount"
            },
            plotLines: [{
              value: line.price,
              width: 3,
              color: '#ff0000',
              zIndex: 10,
              label:{text:'Price'}
            }]
          },

          plotOptions: { // removes the markers along the plot lines
            series: {
              marker: {
                enabled: false
              }
            }
          },

          series: [
            cpm,
            cpc,
            cpl,
            cpvv
          ]
        } // end of return

    return {
      deliveryObject: deliveryObject,
      costPerObject: costPerObject
    }
  }
});
