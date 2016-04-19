Meteor.methods({
  'insertNewInitiative': function (data) {
    const campArray = [];
    const campNameArray = [];
    let active = false;
    let recentlyEnded = false;
    let lastThreeMonths = false;
    const now = moment();
    // if now is after startDate AND now isBefore endDate active = true
    if (now.isAfter(moment(data.lineItems[0].startDate, moment.ISO_8601)) && now.isBefore(moment(data.lineItems[0].endDate, moment.ISO_8601))) {
      active = true;
    }
    if (now.diff(moment(data.lineItems[0].endDate, moment.ISO_8601), "days") <= 31) {
      recentlyEnded = true;
    }
    if (now.diff(moment(data.lineItems[0].endDate, moment.ISO_8601), "days") <= 90) {
      lastThreeMonths = true;
    }

    Initiatives.insert({
      inserted_date: moment().toISOString(),
      name: data.name,
      search_text: data.search_text,
      brand: data.brand,
      agency: data.agency,
      product: data.product,
      notes: data.notes,
      tags: data.tags,
      lineItems: data.lineItems,
      campaign_ids: campArray,
      campaign_names: campNameArray,
      active: active,
      recentlyEnded: recentlyEnded,
      lastThreeMonths: lastThreeMonths
    });

    return "success";
  },
  'removeInitiatives': function () {
    Initiatives.remove( {} );
    return "initiatives removed!";
  },
  'deleteInitiative': function (_id) {
    Initiatives.remove( {_id: _id} );
    return "initiative deleted";
  },
  'updateInitiative': function (data) {
    console.log('updating initiative');
    let active = false;
    let recentlyEnded = false;
    let lastThreeMonths = false;
    const now = moment();
    // if now is after startDate AND now isBefore endDate active = true
    if (now.isAfter(moment(data.lineItems[0].startDate, moment.ISO_8601)) && now.isBefore(moment(data.lineItems[0].endDate, moment.ISO_8601))) {
      active = true;
    }
    if (now.diff(moment(data.lineItems[0].endDate, moment.ISO_8601), "days") <= 31) {
      recentlyEnded = true;
    }
    if (now.diff(moment(data.lineItems[0].endDate, moment.ISO_8601), "days") <= 90) {
      lastThreeMonths = true;
    }

    Initiatives.update(
      {_id: data.mongoId},
      {$set: {
        updated: moment().toISOString(),
        name: data.name,
        search_text: data.search_text,
        brand: data.brand,
        agency: data.agency,
        notes: data.notes,
        tags: data.tags,
        product: data.product,
        lineItems: data.lineItems,
        active: active,
        recentlyEnded: recentlyEnded,
        lastThreeMonths: lastThreeMonths
      }
    });
    return 'success!';
  },
  'updateInitiativeCampaigns': function (data) {
    Initiatives.update(
      {name: data.name},
      {$set: {
          campaign_names: data.campaign_names
      }
    });
    return data.name;
  },
  'getAggregate': function (name) {
    console.log('getAggregate running')

    // This function aggregates campaignInsight data for an initiative
    let pipeline = [
      {$match:
        {"data.initiative": name}
      },
      {$group: {
        _id: name,
        spend: {$sum: "$data.spend"},
        clicks: {$sum: "$data.clicks"},
        reach: {$sum: "$data.reach"},
        impressions: {$sum: "$data.impressions"},
        likes: {$sum: "$data.like"}
        }
      }
    ];
    let result = CampaignInsights.aggregate(pipeline);
    try {
      result[0]['inserted'] = moment(new Date).format("MM-DD-YYYY hh:mm a");
      result[0]['cpc'] = result[0].spend / result[0].clicks;
      result[0]['cpm'] = result[0].spend / (result[0].impressions / 1000);
      result[0]['cpl'] = result[0].spend / result[0].likes;
    } catch(e) {
      console.log('Error adding date to aggregate', e);
    }

    Initiatives.update(
      {name: name},
      {$set: {
          aggregateData: result[0]
      }
    });
    // console.log("result of getAggregate", result)
    return result[0];
  },
  'aggregateObjective': function (name) {
    /*
    * Here, we aggregate by objective and create different data sets by objective
    * first, find an intiative by the name which is passed in on the client side
    * then create an array of all the objectives in the initiative
    * then remove any null values
    * then we create a function that just returns a prebuilt pipeline
    * then we loop over array of objectives and on each loop we do the
      aggregation according to name of initiative and objective, which we
      split and join to get into proper format
    * then another for loop where we insert the data into the Initiative
    */

    const initiative = Initiatives.findOne({name: name});

    let objectiveArr = _.map(initiative.lineItems, function (el) {
      return el.objective;
    })
    // const objectiveArr = [initiative.objective, initiative.objective2, initiative.objective3, initiative.objective4, initiative.objective5, initiative.objective6, initiative.objective7, initiative.objective8];
    let cleanedArr = _.without(objectiveArr, null, ''); // removes any null values
    console.log(cleanedArr);
    let objective; // to be reassigned and used in the pipeline

    const makePipeline = function makePipeline (name, objective) {
      return [
        {$match:
          {"data.initiative": name, 'data.objective': objective}
        },
        {$group: {
          _id: objective,
          spend: {$sum: "$data.spend"},
          clicks: {$sum: "$data.clicks"},
          reach: {$sum: "$data.reach"},
          impressions: {$sum: "$data.impressions"},
          likes: {$sum: "$data.like"}
          }
        }
      ];
    }

    const objectiveAggregateArray = [];

    for (let i = 0; i < cleanedArr.length; i++) {
      cleanedArr[i] = cleanedArr[i].toUpperCase().split(' ').join('_');
      // console.log("cleanedArr[i]", cleanedArr[i]);
      let result = CampaignInsights.aggregate(makePipeline(name, cleanedArr[i]));
      // console.log("result", result);
      // console.log("result[0]", result[0]);
      try {
        result[0]['inserted'] = moment().format("MM-DD-YYYY hh:mm a");
        result[0]['cpc'] = result[0].spend / result[0].clicks;
        result[0]['cpm'] = result[0].spend / (result[0].impressions / 1000);
        result[0]['cpl'] = result[0].spend / result[0].likes;
      } catch(e) {
        console.log('Error adding cost per data to aggregate', e);
      }
        objectiveAggregateArray.push(result);
    }
    // console.log('objectiveAggregateArray:', objectiveAggregateArray);
    let setObject = {};
    for (let i = 0; i < objectiveAggregateArray.length; i++) {
      setObject = {[objectiveAggregateArray[i][0]['_id']]: objectiveAggregateArray[i]};
      // console.log("setObject:", setObject);
      // inserting objectiveAggregate data into the intiative
      Initiatives.update(
        {name: name},
        {$set: setObject
      });
    }

    return "success!";

  },
  'makeProjections': function (name, days) {
    const init = Initiatives.findOne({name: name});
    const now = moment(new Date);
    const started = moment(init.startDate, "MM-DD-YYYY");
    const timeDiff = now.diff(started, 'days');
    let avgClicks = parseInt(init.aggregateData[0].clicks) / parseInt(timeDiff);
    let avgCPC = parseInt(init.aggregateData[0].cpc) / parseInt(timeDiff);
    let avgCPM = parseInt(init.aggregateData[0].cpm) / parseInt(timeDiff);
    // console.log("avg clicks", avgClicks); // 2.14621409921671
    // console.log('total clicks', init.aggregateData[0].clicks)
    /*
    This function will be called with the avgStat, which is calculated above
    the days, which will be passed in from client
    the total, which will be taken from init.aggregateData[0].<statisticName>
    */
    let projectTotal = function projectTotal (avgStat, days, total) {
      let projection;
      projection = total + (days * avgStat);
      return projection;
    }
    let projectAverage = function projectAverage (avgStat, days, total) {
      let projection;
      // cost per times days it's been running (timeDiff) + single cost per divided (timeDiff plus days)
    }
    // console.log("projection", projectionFunc(avgCPM, days, init.aggregateData[0].cpm));
    return projectionFunc(days);

  },
  'removeCampaign': (initiative, campName, id) => {
    Initiatives.update(
      {_id: initiative._id},
      {$pull: {
        campaign_names: campName,
        campaign_ids: id
      }
    });
    return "success!";
  },
  'addCampaign': (initiative, campName, id) => {
    Initiatives.update(
      {_id: initiative._id},
      {$addToSet: {
        campaign_names: campName,
        campaign_ids: id
      }
    });
    return "success!";
  }
});

Meteor.publish('Initiatives', function () {
  return Initiatives.find( {} );
});
