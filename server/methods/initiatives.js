Meteor.methods({
  'insertNewInitiative': function (data) {
    const campArray = [];
    const campNameArray = [];
    let active = false;
    let recentlyEnded = false;
    let lastThreeMonths = false;
    const now = moment();
    // if now is after startDate AND now isBefore endDate active = true
    if (now.isAfter(moment(data.startDate, "MM-DD-YYYY")) && now.isBefore(moment(data.endDate, "MM-DD-YYYY"))) {
      active = true;
    }

    if (now.diff(moment(data.endDate, "MM-DD-YYYY"), "days") <= 31) {
      recentlyEnded = true;
    }

    if (now.diff(moment(data.endDate, "MM-DD-YYYY"), "days") <= 90) {
      lastThreeMonths = true;
    }

    Initiatives.insert({
      inserted_date: moment().format("MM-DD-YYYY hh:mm a"),
      name: data.name,
      search_text: data.search_text,
      brand: data.brand,
      agency: data.agency,
      notes: data.notes,
      platform: data.platform,
      objective: data.objective,
      dealType: data.dealType,
      budget: data.budget,
      startDate: data.startDate,
      endDate: data.endDate,
      quantity: data.quantity,
      price: data.price,
      costPlus: data.cost_plus,
      costPlusPercent: data.costPlusPercent,
      platform2: data.platform2,
      objective2: data.objective2,
      dealType2: data.dealType2,
      budget2: data.budget2,
      startDate2: data.startDate2,
      endDate2: data.endDate2,
      quantity2: data.quantity2,
      price2: data.price2,
      costPlus2: data.cost_plus2,
      costPlusPercent2: data.costPlusPercent2,
      platform3: data.platform3,
      objective3: data.objective3,
      dealType3: data.dealType3,
      budget3: data.budget3,
      startDate3: data.startDate3,
      endDate3: data.endDate3,
      quantity3: data.quantity3,
      price3: data.price3,
      costPlus3: data.cost_plus3,
      costPlusPercent3: data.costPlusPercent3,
      platform4: data.platform4,
      objective4: data.objective4,
      dealType4: data.dealType4,
      budget4: data.budget4,
      startDate4: data.startDate4,
      endDate4: data.endDate4,
      quantity4: data.quantity4,
      price4: data.price4,
      costPlus4: data.cost_plus4,
      costPlusPercent4: data.costPlusPercent4,
      platform5: data.platform5,
      objective5: data.objective5,
      dealType5: data.dealType5,
      budget5: data.budget5,
      startDate5: data.startDate5,
      endDate5: data.endDate5,
      quantity5: data.quantity5,
      price5: data.price5,
      costPlus5: data.cost_plus5,
      costPlusPercent5: data.costPlusPercent5,
      platform6: data.platform6,
      objective6: data.objective6,
      dealType6: data.dealType6,
      budget6: data.budget6,
      startDate6: data.startDate6,
      endDate6: data.endDate6,
      quantity6: data.quantity6,
      price6: data.price6,
      costPlus6: data.cost_plus6,
      costPlusPercent6: data.costPlusPercent6,
      platform7: data.platform7,
      objective7: data.objective7,
      dealType7: data.dealType7,
      budget7: data.budget7,
      startDate7: data.startDate7,
      endDate7: data.endDate7,
      quantity7: data.quantity7,
      price7: data.price7,
      costPlus7: data.cost_plus7,
      costPlusPercent7: data.costPlusPercent7,
      platform8: data.platform8,
      objective8: data.objective8,
      dealType8: data.dealType8,
      budget8: data.budget8,
      startDate8: data.startDate8,
      endDate8: data.endDate8,
      quantity8: data.quantity8,
      price8: data.price8,
      costPlus8: data.cost_plus8,
      costPlusPercent8: data.costPlusPercent8,
      campaign_ids: campArray,
      campaign_names: campNameArray,
      active: active,
      recentlyEnded: recentlyEnded,
      lastThreeMonths: lastThreeMonths
    });
    console.log("new initiative inserted into DB:", data)
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
    let active = false;
    let recentlyEnded = false;
    let lastThreeMonths = false;
    const now = moment();
    // if now is after startDate AND now isBefore endDate active = true
    if (now.isAfter(moment(data.startDate, "MM-DD-YYYY")) && now.isBefore(moment(data.endDate, "MM-DD-YYYY"))) {
      active = true;
    }
    if (now.diff(moment(data.endDate, "MM-DD-YYYY"), "days") <= 31) {
      recentlyEnded = true;
    }
    if (now.diff(moment(data.endDate, "MM-DD-YYYY"), "days") <= 90) {
      lastThreeMonths = true;
    }

    Initiatives.update(
      {name: data.name},
      {$set: {
        search_text: data.search_text,
        brand: data.brand,
        agency: data.agency,
        notes: data.notes,
        product: data.product,
        platform: data.platform,
        objective: data.objective,
        dealType: data.dealType,
        budget: data.budget,
        startDate: data.startDate,
        endDate: data.endDate,
        quantity: data.quantity,
        price: data.price,
        costPlus: data.cost_plus,
        costPlusPercent: data.costPlusPercent,
        platform2: data.platform2,
        objective2: data.objective2,
        dealType2: data.dealType2,
        budget2: data.budget2,
        startDate2: data.startDate2,
        endDate2: data.endDate2,
        quantity2: data.quantity2,
        price2: data.price2,
        costPlus2: data.cost_plus2,
        costPlusPercent2: data.costPlusPercent2,
        platform3: data.platform3,
        objective3: data.objective3,
        dealType3: data.dealType3,
        budget3: data.budget3,
        startDate3: data.startDate3,
        endDate3: data.endDate3,
        quantity3: data.quantity3,
        price3: data.price3,
        costPlus3: data.cost_plus3,
        costPlusPercent3: data.costPlusPercent3,
        platform4: data.platform4,
        objective4: data.objective4,
        dealType4: data.dealType4,
        budget4: data.budget4,
        startDate4: data.startDate4,
        endDate4: data.endDate4,
        quantity4: data.quantity4,
        price4: data.price4,
        costPlus4: data.cost_plus4,
        costPlusPercent4: data.costPlusPercent4,
        platform5: data.platform5,
        objective5: data.objective5,
        dealType5: data.dealType5,
        budget5: data.budget5,
        startDate5: data.startDate5,
        endDate5: data.endDate5,
        quantity5: data.quantity5,
        price5: data.price5,
        costPlus5: data.cost_plus5,
        costPlusPercent5: data.costPlusPercent5,
        platform6: data.platform6,
        objective6: data.objective6,
        dealType6: data.dealType6,
        budget6: data.budget6,
        startDate6: data.startDate6,
        endDate6: data.endDate6,
        quantity6: data.quantity6,
        price6: data.price6,
        costPlus6: data.cost_plus6,
        costPlusPercent6: data.costPlusPercent6,
        platform7: data.platform7,
        objective7: data.objective7,
        dealType7: data.dealType7,
        budget7: data.budget7,
        startDate7: data.startDate7,
        endDate7: data.endDate7,
        quantity7: data.quantity7,
        price7: data.price7,
        costPlus7: data.cost_plus7,
        costPlusPercent7: data.costPlusPercent7,
        platform8: data.platform8,
        objective8: data.objective8,
        dealType8: data.dealType8,
        budget8: data.budget8,
        startDate8: data.startDate8,
        endDate8: data.endDate8,
        quantity8: data.quantity8,
        price8: data.price8,
        costPlus8: data.cost_plus8,
        costPlusPercent8: data.costPlusPercent8,
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
          aggregateData: result
      }
    });
    // console.log("result of getAggregate", result)
    return result;
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
    const objectiveArr = [initiative.objective, initiative.objective2, initiative.objective3, initiative.objective4, initiative.objective5, initiative.objective6, initiative.objective7, initiative.objective8];
    const cleanedArr = _.without(objectiveArr, null); // removes any null values
    // console.log(cleanedArr);
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
      // console.log(cleanedArr[i]);
      let result = CampaignInsights.aggregate(makePipeline(name, cleanedArr[i]));
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
    let setObject = {};
    for (let i = 0; i < objectiveAggregateArray.length; i++) {
      setObject = {[objectiveAggregateArray[i][0]['_id']]: objectiveAggregateArray[i]};
      console.log(setObject);
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
