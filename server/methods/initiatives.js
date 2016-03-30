Meteor.methods({
  'insertNewInitiative': function (data) {
    const campArray = [];
    const campNameArray = [];

    Initiatives.insert({
      inserted_date: moment().format("MM-DD-YYYY hh:mm a"),
      name: data.name,
      search_text: data.search_text,
      brand: data.brand,
      agency: data.agency,
      notes: data.notes,
      platform: data.platform,
      dealType: data.dealType,
      budget: data.budget,
      startDate: data.startDate,
      endDate: data.endDate,
      quantity: data.quantity,
      price: data.price,
      platform2: data.platform2,
      dealType2: data.dealType2,
      budget2: data.budget2,
      startDate2: data.startDate2,
      endDate2: data.endDate2,
      quantity2: data.quantity2,
      price2: data.price2,
      platform3: data.platform3,
      dealType3: data.dealType3,
      budget3: data.budget3,
      startDate3: data.startDate3,
      endDate3: data.endDate3,
      quantity3: data.quantity3,
      price3: data.price3,
      platform4: data.platform4,
      dealType4: data.dealType4,
      budget4: data.budget4,
      startDate4: data.startDate4,
      endDate4: data.endDate4,
      quantity4: data.quantity4,
      price4: data.price4,
      platform5: data.platform5,
      dealType5: data.dealType5,
      budget5: data.budget5,
      startDate5: data.startDate5,
      endDate5: data.endDate5,
      quantity5: data.quantity5,
      price5: data.price5,
      campaign_ids: campArray,
      campaign_names: campNameArray,
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
    Initiatives.update(
      {name: data.name},
      {$set: {
          brand: data.brand,
          agency: data.agency,
          budget: data.budget,
          dealType: data.dealType,
          endDate: data.endDate,
          name: data.name,
          notes: data.notes,
          startDate: data.startDate,
          quantity: data.quantity,
          price: data.price,
          // campaign_id: data.campaign_id,
          // campaign_names: data.campaign_names,
          search_text: data.search_text
      }
    });
    return data.name;
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
    console.log("result of getAggregate", result)
    return result;
  },
  'makeProjections': function (name, days) {
    const init = Initiatives.findOne({name: name});
    const now = moment(new Date);
    const started = moment(init.startDate, "MM-DD-YYYY");
    const timeDiff = now.diff(started, 'days');
    let avgClicks = parseInt(init.aggregateData[0].clicks) / parseInt(timeDiff);
    let avgCPC = parseInt(init.aggregateData[0].cpc) / parseInt(timeDiff);
    let avgCPM = parseInt(init.aggregateData[0].cpm) / parseInt(timeDiff);
    console.log("avg clicks", avgClicks); // 2.14621409921671
    console.log('total clicks', init.aggregateData[0].clicks)
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
      // projection =
    }
    console.log("projection", projectionFunc(avgCPM, days, init.aggregateData[0].cpm));
    return projectionFunc(days);

  }
});

Meteor.publish('Initiatives', function () {
  return Initiatives.find( {} );
});
