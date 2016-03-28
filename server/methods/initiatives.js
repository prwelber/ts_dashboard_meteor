Meteor.methods({
  'insertNewInitiative': function (dataObj) {
    let campArray = [];
    let campNameArray = [];

    Initiatives.insert({
      inserted_date: moment().format("MM-DD-YYYY hh:mm a"),
      brand: dataObj.brand,
      agency: dataObj.agency,
      budget: dataObj.budget,
      dealType: dataObj.dealType,
      endDate: dataObj.endDate,
      name: dataObj.name,
      notes: dataObj.notes,
      startDate: dataObj.startDate,
      quantity: dataObj.quantity,
      price: dataObj.price,
      campaign_ids: campArray,
      campaign_names: campNameArray,
      search_text: dataObj.searchText
    });
    console.log("new initiative inserted into DB:", dataObj)
    return "success";
  },
  'removeInitiatives': function () {
    Initiatives.remove( {} );
    return "initiatives removed!";
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
