import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { email } from '../sendgrid/email';
import CampaignInsights from '/collections/CampaignInsights';
import Initiatives from '/collections/Initiatives';
import CampaignBasics from '/collections/CampaignBasics';

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
      owner: data.owner,
      brand: data.brand,
      agency: data.agency,
      product: data.product,
      userActive: data.userActive,
      dupObjectives: data.dupObjectives,
      notes: data.notes,
      tags: data.tags,
      lineItems: data.lineItems,
      campaign_ids: campArray,
      campaign_names: campNameArray,
      active: active,
      recentlyEnded: recentlyEnded,
      lastThreeMonths: lastThreeMonths
    });

    const startDate = moment(data.lineItems[0].startDate, moment.ISO_8601).format("MM-DD-YYYY");
    const endDate = moment(data.lineItems[0].endDate, moment.ISO_8601).format("MM-DD-YYYY")

    const emailHTML = "<p>Name: "+data.name+"</p><p>Owner: "+data.owner+"</p><p>Brand: "+data.brand+"</p><p>Agency: "+data.agency+"</p><p>Dates: "+startDate+" - "+endDate+"</p>";
    const toList = ["prwelber@gmail.com"]

    email.sendEmail(toList, data.name +" Initiative Created", emailHTML);

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
    check(data.name, String);
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
        owner: data.owner,
        brand: data.brand,
        agency: data.agency,
        notes: data.notes,
        tags: data.tags,
        product: data.product,
        userActive: data.userActive,
        dupObjectives: data.dupObjectives,
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
        likes: {$sum: "$data.like"},
        videoViews: {$sum: "$data.video_view"}
        }
      }
    ];
    let result = CampaignInsights.aggregate(pipeline);
    try {
      result[0]['inserted'] = moment(new Date).format("MM-DD-YYYY hh:mm a");
      result[0]['cpc'] = result[0].spend / result[0].clicks;
      result[0]['cpm'] = result[0].spend / (result[0].impressions / 1000);
      result[0]['cpl'] = result[0].spend / result[0].likes;
      result[0]['cpvv'] = result[0].spend / result[0].videoViews;
    } catch(e) {
      console.log('Error adding date to aggregate in initiatives.js and logging result', e, name, result[0]);

    }

    Initiatives.update(
      {name: name},
      {$set: {
          aggregateData: result[0]
      }
    });
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
    });

    let cleanedArr = _.without(objectiveArr, null, ''); // removes null and empty strings
    let objective; // to be reassigned and used in the pipeline

    // function for making a pipeline
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
          likes: {$sum: "$data.like"},
          videoViews: {$sum: "$data.video_view"}
          }
        }
      ];
    }

    let objectiveAggregateArray = [];

    for (let i = 0; i < cleanedArr.length; i++) {
      cleanedArr[i] = cleanedArr[i].toUpperCase().split(' ').join('_');
      let result = CampaignInsights.aggregate(makePipeline(name, cleanedArr[i]));
      // console.log('result[0] from aggregateObjective', result[0])
      try {
        result[0]['inserted'] = moment().format("MM-DD-YYYY hh:mm a");
        result[0]['cpc'] = result[0].spend / result[0].clicks;
        result[0]['cpm'] = result[0].spend / (result[0].impressions / 1000);
        result[0]['cpl'] = result[0].spend / result[0].likes;
        result[0]['cpvv'] = result[0].spend / result[0].videoViews;
        result[0]['net'] = {
          name: name,
          objective: objective,
          deal: undefined,
          percentage: undefined,
          spend: undefined,
          budget: undefined,
          spendPercent: undefined,
          net_cpc: undefined,
          net_cpl: undefined,
          net_cpm: undefined,
          net_cpvv: undefined
        }
      } catch(e) {
        console.log('Error adding cost per data to aggregate with name', e, name);
      }
        objectiveAggregateArray.push(result);
    }


    let setObject = {};
    objectiveAggregateArray = _.flatten(objectiveAggregateArray);

    for (let i = 0; i < objectiveAggregateArray.length; i++) {
      setObject = {[objectiveAggregateArray[i]['_id']]: objectiveAggregateArray[i]};
      // inserting objectiveAggregate data into the intiative
      Initiatives.update(
        {name: name},
        {$set: setObject}
      );
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
    return projectionFunc(days);

  },
  'removeCampaign': (initiative, campName, id) => {
    console.log('removeCampaign running on server')
    Initiatives.update(
      {_id: initiative._id},
      {$pull: {
        campaign_names: campName,
        campaign_ids: id
      }
    });
    CampaignBasics.update(
      {'data.name': campName},
      {$set: {
        'data.initiative': null
      }
    });
    CampaignInsights.update(
      {'data.name': campName},
      {$set: {
        'data.initiative': null
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
  },
  'insertChangelog': (data, _id) => {
    // this creates a mongo unique ID string
    data['id'] = new Meteor.Collection.ObjectID()._str;
    Initiatives.update(
      {_id: _id},
      {$addToSet: {
        changelog: data
      }
    });
  },
  'deleteChange': (name, id) => {
    Initiatives.update(
      {name: name},
      {$pull: {"changelog": {id: id}}
    });
  },
  changeActiveStatus: (_id, checked) => {
    Initiatives.update(
      {_id: _id},
      {$set: {userActive: checked}
    });
    return "success!";
  },
  toggleDailyCheck: (_id, checked) => {
    Initiatives.update(
      {_id: _id},
      {$set: {dailyCheck: checked}
    });
    return "success";
  },
  removeCampaignName: (_id, name) => {
    Initiatives.update(
      {_id: _id},
      {$pull: {
        campaign_names: name
        }
      }
    )
  }
});

Meteor.publish('Initiatives', function (opts) {
  var user = Meteor.users.findOne({_id: this.userId});

  try {

    if (user.admin === true || user.admin === null) {
      return Initiatives.find( {} );
    } else if (user.agency.length > 0) {
      return Initiatives.find({agency: {$in: user.agency}});
    } else if (user.initiatives.length >= 1) {
      return Initiatives.find({name: {$in: user.initiatives}});
    } else if (opts) {
      return Initiatives.find({_id: opts});
    }
  } catch (e) {
    console.log('Error in Initiatives Server:', e);
  }
});
