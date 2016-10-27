import CampaignInsights from '/collections/CampaignInsights';
import Initiatives from '/collections/Initiatives';
import CampaignBasics from '/collections/CampaignBasics';
import InsightsBreakdownsByDays from '/collections/InsightsBreakdownsByDays';
import Uploads from '/collections/Uploads';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Materialize } from 'meteor/materialize:materialize';
import { initiativeHomepageFunctions } from './initiativeHomepageFuncs';
import { calcFactorSpend } from '/both/utilityFunctions/factorSpendFunction';

var moment = require('moment');
var range = require('moment-range');
var Promise = require('bluebird');
// import Chart from "chart.js"

const stringToCostPlusPercentage = function stringToCostPlusPercentage (num) {
  num = num.toString().split('');
  num.unshift(".");
  num = 1 + parseFloat(num.join(''));
  return num;
}

const defineCampaignObjective = function defineCampaignObjective (objective) {
  let campaignObjective;
  if (objective === 'LINK_CLICKS') {
    campaignObjective = 'Link Clicks';
  } else if (objective === 'VIDEO_VIEWS') {
    campaignObjective = 'Video Views';
  } else if (objective === 'POST_ENGAGEMENT') {
    campaignObjective = 'Post Engagement';
  } else if (objective === 'CONVERSIONS') {
    campaignObjective = 'Conversions';
  } else if (objective === 'PAGE_LIKES') {
    campaignObjective = 'Page Likes';
  } else if (objective === 'WEBSITE_CLICKS') {
    campaignObjective = 'Website Clicks';
  } else if (objective === 'LEAD_GENERATION') {
    campaignObjective = 'Lead Generation';
  } else if (objective === 'TWEET_ENGAGEMENTS') {
    campaignObjective = 'Tweet Engagements';
  }
  return campaignObjective;
}

const whichObjectives = function whichObjectives (initiative) {
  const arr = [];
  initiative.VIDEO_VIEWS ? arr.push(initiative.VIDEO_VIEWS) : '';
  initiative.POST_ENGAGEMENT ? arr.push(initiative.POST_ENGAGEMENT) : '';
  initiative.LINK_CLICKS ? arr.push(initiative.LINK_CLICKS) : '';
  initiative.PAGE_LIKES ? arr.push(initiative.PAGE_LIKES) : '';
  initiative.REACH ? arr.push(initiative.REACH) : '';
  initiative.CONVERSIONS ? arr.push(initiative.CONVERSIONS) : '';
  initiative.APP_ENGAGEMENT ? arr.push(initiative.APP_ENGAGEMENT) : '';
  initiative.APP_INSTALLS ? arr.push(initiative.APP_INSTALLS) : '';
  //  TWITTER
  initiative.LEAD_GENERATION ? arr.push(initiative.LEAD_GENERATION) : '';
  initiative.WEBSITE_CLICKS ? arr.push(initiative.WEBSITE_CLICKS) : '';
  initiative.TWEET_ENGAGEMENTS ? arr.push(initiative.TWEET_ENGAGEMENTS) : '';
  initiative.WEBSITE_CONVERSIONS ? arr.push(initiative.WEBSITE_CONVERSIONS) : '';
  initiative.FOLLOWERS ? arr.push(initiative.FOLLOWERS) : '';
  initiative.AWARENESS ? arr.push(initiative.AWARENESS) : '';
  return arr;
}

const refreshInits = function refreshInits (init, objective) {
  const spendPercent = init[objective]['net']['spendPercent'];
  if (spendPercent === null || spendPercent === 0 || spendPercent === NaN || spendPercent === undefined) {
    // Meteor.call('aggregateObjective', init.name);
    calcNet.calculateNetNumbers(init.name);
  }
}


Template.initiativeHomepage.onCreated(function () {
  this.templateDict = new ReactiveDict();
  const initiative = Initiatives.findOne({_id: FlowRouter.getParam('_id')});
  this.templateDict.set('initiative', initiative);

  const campaigns = CampaignInsights.find({'data.initiative': initiative.name}).fetch();
  this.templateDict.set('campaigns', campaigns);

  this.templateDictionary = new ReactiveDict();
  this.templateDictionary.set('chartData', false);

  this.aggregatedSpend = new ReactiveDict();
  this.aggregatedSpend.set('spend', 0);
});

Template.initiativeHomepage.onRendered(function () {
  $('.modal-trigger').leanModal({
    dismissible: true,
    opacity: .8,
    in_duration: 400,
    out_duration: 300
  });
  $(document).ready(function(){
    $('ul.tabs').tabs();
  });


  // dynamically set client aggregated spend if one of the line item
  // spends should be over budget
  let spends = $('.client-spend-init-homepage');
  let spend = 0;
  for (let i = 0; i < spends.length; i++) {
    spend += accounting.unformat(spends[i].innerText);
  }
  this.aggregatedSpend.set('spend', spend)

  const initiative = Initiatives.findOne({_id: FlowRouter.getParam('_id')});
  Meteor.call('getAggregate', initiative.name);
  // Meteor.call('aggregateObjective', initiative.name);

});

Template.initiativeHomepage.helpers({
  isReady: (sub1, sub2, sub3) => {
    if (FlowRouter.subsReady(sub1) && FlowRouter.subsReady(sub2) && FlowRouter.subsReady(sub3)) {
      return true;
    }
  },
  'getCampaigns': function () {
    const init = Template.instance().templateDict.get('initiative');
    const timeFormat = "MM-DD-YYYY hh:mm a";
    const camps = CampaignBasics.find(
      {'data.initiative': init.name},
      {sort: {
        'data.start_time': -1
      }
    }).fetch();
    camps.forEach(el => {
      el.data.start_time = moment(el.data.start_time).format(timeFormat);
      el.data.stop_time = moment(el.data.stop_time).format(timeFormat);
    })
    return camps;
  },
  getClientNumbers: (action, lineItem) => {
    const init = Template.instance().templateDict.get('initiative');
    // action is the action, item is the lineItem
    let objective;


    const findItem = function findItem(string, lineItems) {
      let objective;
      if (string === 'LINK_CLICKS') {
        objective = 'Link Clicks';
      } else if (string === 'VIDEO_VIEWS') {
        objective = 'Video Views';
      } else if (string === 'POST_ENGAGEMENT') {
        objective = 'Post Engagement';
      } else if (string === 'CONVERSIONS') {
        objective = 'Conversions';
      } else if (string === 'PAGE_LIKES') {
        objective = 'Page Likes';
      }
      return _.where(lineItems, {objective: objective});
    }




    let objArr = whichObjectives(init);
    if (! objArr[0].net.client_spend) {
      refreshInits(init, objective);
    }

    // loop over line items and see if the objective to upper case matches
    // what we have in objArr
    // if match, take that budget and check against client spend

    const fixObjectiveString = function fixObjectiveString (str) {
      let s = '';
      for (let i = 0; i < str.length; i++) {
        if (i === 0) {
          s += str[i].toUpperCase();
        } else if (str[i-1] === '_') {
          s += str[i].toUpperCase();
        } else {
          s += str[i].toLowerCase();
        }
      }
      s = s.replace(/_/, ' ');
      return s;
    }

    objArr.forEach(line => {
      const s = fixObjectiveString(line._id);
      const result = _.where(init.lineItems, {objective: s});
      if (line.net.client_spend > parseFloat(result[0].budget)) {
        line.net.client_spend = parseFloat(result[0].budget);
        line.net.client_cpm = line.net.client_spend / (line.impressions / 1000);
        line.net.client_cpc = line.net.client_spend / line.clicks;
        line.net.client_cpvv = line.net.client_spend / line.videoViews;
      }

    });

    // get total spend and set it to a session var

    const spendTotal = objArr.reduce(function(a,b) {
      return a + b.net.client_spend;
    }, 0)

    Session.set('spendTotal', spendTotal);
    return objArr;
  },
  'isTabDisabled': (num) => {
    const init = Template.instance().templateDict.get('initiative');
    // substract 1 because line item number does not perfectly map
    // to array indexes
    if (! init.lineItems[num].dealType) {
      return "disabled";
    }
  },
  'addOne': function (num) {
    return num + 1;
  },
  'formatDate': (date) => {
    return moment(date, moment.ISO_8601).format("MM-DD-YYYY hh:mm a");
  },
  'formatMoney': (num) => {
    if (num === Infinity) {
      num = 0;
    }
    return mastFunc.money(num);
  },
  'formatPercent': (num) => {
    return numeral(num).format("00.000") + "%";
  },
  twoDecimals: (num) => {
    return parseFloat(num.toFixed(2));
  },
  formatNumber: (number) => {
    return numeral(number).format("0,0");
  },
  'initiative': function () {
    const initiative = Template.instance().templateDict.get('initiative');
    return initiative;
  },
  'grabLineItem': (num) => {
    const init = Template.instance().templateDict.get('initiative');
    return init.lineItems[num];
  },
  'initiativeStats': function () {
    const init = Template.instance().templateDict.get('initiative');
    let agData = init.aggregateData;

    // get all budgets
    let totalBudget = 0;
    init.lineItems.forEach((el) => {
      if (el.budget !== "" && parseFloat(el.budget) > 0) {
        totalBudget = totalBudget + parseFloat(el.budget);
      }
    });

    const spendPercent = numeral((agData.spend / totalBudget)).format("0.00%");

    //function for formatting data with numeral
    const niceNum = function niceNum (data) {
      return numeral(data).format("0,0");
    }

    agData = mastFunc.formatAll(agData); // formats all nums
    agData['spendPercent'] = spendPercent;

    return init.aggregateData;
  },
  'netCostPlusStats': (lineItemNumber) => {
    const init = Template.instance().templateDict.get('initiative');
    let arrToReturn = [];

    const stringToCostPlusPercentage = function stringToCostPlusPercentage (num) {
        num = num.toString().split('');
        num.unshift(".");
        num = 1 + parseFloat(num.join(''));
        return num;
    }

    const getLength = function getLength(initiative) {
      let counter = 0
      for (let i = 0; i <= initiative.lineItems.length - 1; i++) {
        if (initiative.lineItems[i].dealType) {
          counter++;
        }
      }
      return counter;
    }

    const len = getLength(init);

    for (let i = 0; i <= len - 1; i++) {
      let objToReturn = {};
      let objectiveAg;
      const objective = init.lineItems[i].objective.split(' ').join('_').toUpperCase();
      // get the aggregate data according to line item objective aggregate
      for (let key in init) {
        if (key === objective) {
          objectiveAg = init[key];
        }
      }
      if (init.lineItems[i].cost_plus === true) {
        let costPlus = parseInt(init.lineItems[i].costPlusPercent);
        costPlus = stringToCostPlusPercentage(costPlus);
        objToReturn['netSpend'] = parseFloat(objectiveAg.spend) / costPlus;
        objToReturn['netBudget'] = parseFloat(init.lineItems[i].budget) / costPlus;
        objToReturn['spendPercent'] = ((100 * objToReturn.netSpend) / objToReturn.netBudget);
        objToReturn['netCPM'] = objToReturn.netSpend / (objectiveAg.impressions / 1000);
        objToReturn['netCPC'] = objToReturn.netSpend / objectiveAg.clicks;

        if (objectiveAg.likes === null || objectiveAg.likes === '' || objectiveAg.likes === 0) {
          objToReturn['netCPL'] = 0;
        } else {
          objToReturn['netCPL'] = objToReturn.netSpend / objectiveAg.likes;
        }
      } else if (init.lineItems[i].percent_total === true) {
        let percentTotal = parseInt(init.lineItems[i].percentTotalPercent) / 100;

        const budget = parseFloat(init.lineItems[i].budget);
        const spend = parseFloat(objectiveAg.spend)
        const abjAg = objectiveAg;

        objToReturn['netBudget'] = (budget - (budget * percentTotal));
        objToReturn['netSpend'] =  (spend - (spend * percentTotal));
        objToReturn['spendPercent'] = ((100 * objToReturn.netSpend) / objToReturn.netBudget);
        objToReturn['netCPM'] = objToReturn.netSpend / (objectiveAg.impressions / 1000);
        objToReturn['netCPC'] = objToReturn.netSpend / objectiveAg.clicks;

        if (objectiveAg.likes === null || objectiveAg.likes === '' || objectiveAg.likes === 0) {
          objToReturn['netCPL'] = 0;
        } else {
          objToReturn['netCPL'] = objToReturn.netSpend / objectiveAg.likes;
        }

      }

      arrToReturn.push(objToReturn);
    }
    if (lineItemNumber) {
      // return [arrToReturn[lineItemNumber]];
      return arrToReturn[lineItemNumber];
    } else {
      return arrToReturn;
    }

  },
  'objectiveAggregates': () => {
    const init = Template.instance().templateDict.get('initiative');
    const returnArray = [];

    init.VIDEO_VIEWS ? returnArray.push(init.VIDEO_VIEWS) : '';
    init.POST_ENGAGEMENT ? returnArray.push(init.POST_ENGAGEMENT) : '';
    init.LINK_CLICKS ? returnArray.push(init.LINK_CLICKS) : '';
    init.PAGE_LIKES ? returnArray.push(init.PAGE_LIKES) : '';
    init.REACH ? returnArray.push(init.REACH) : '';
    init.CONVERSIONS ? returnArray.push(init.CONVERSIONS) : '';
    init.APP_ENGAGEMENT ? returnArray.push(init.APP_ENGAGEMENT) : '';
    init.APP_INSTALLS ? returnArray.push(init.APP_INSTALLS) : '';

    //function for formatting data with numeral
    const niceNum = function niceNum (data) {
      return numeral(data).format("0,0");
    }
    _.each(returnArray, function (el) {
      el.cpc = mastFunc.money(el.cpc);
      el.cpl = mastFunc.money(el.cpl);
      el.cpm = mastFunc.money(el.cpm);
      el.spend = mastFunc.money(el.spend);
      el.impressions = niceNum(el.impressions);
      el.cpvv = mastFunc.money(el.cpvv);
      el.videoViews = niceNum(el.videoViews);
    });
    return returnArray;
  },
  'costPerChart': () => {
    const initiative = Template.instance().templateDict.get('initiative');

    //for setting dealType
    let type;
    let actionType;
    if (initiative.lineItems[0].dealType === "CPM") {
      type = "impressions";
      actionType = "cpm";
    } else if (initiative.lineItems[0].dealType === "CPC") {
      type = "clicks";
      actionType = "cpc";
    } else if (initiative.lineItems[0].dealType === "CPL") {
      type = "like";
      actionType = "cpl";
    }

    let chart = [],
        start;

    const SESSION_DATA = Session.get('initChartData');

    if (SESSION_DATA) {
      SESSION_DATA.forEach(el => {
        chart.push(el[actionType]);
      });
      start = moment(SESSION_DATA[0].date, "MM-DD")
    }


    // for getting x axis labels
    let labels      = [],
        end         = moment(initiative.lineItems[0].endDate, moment.ISO_8601),
        dr          = moment.range(start, end),
        arrayOfDays = dr.toArray('days');

    arrayOfDays.forEach(el => {
      labels.push(moment(el).format("MM-DD"))
    });



    // build chart
    return {

      chart: {
        zoomType: 'x'
      },

      title: {
        text: "Cost per Result"
      },

      subtitle: {
        text: document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
      },

      tooltip: {
        valueSuffix: '',
        shared: true,
        crosshairs: true
      },
      xAxis: {
        categories: Session.get('labelArray')
      },

      yAxis: {
        title: {
          text: actionType
        },
        plotLines: [{
          value: parseFloat(initiative.lineItems[0].price),
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

      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'bottom',
        floating: true,
        x: 0,
        y: -50
      },

      series: [{
        name: actionType,
        data: chart
      }]
    } // end of chart return
  },
  changelog: () => {
    let log = Initiatives.findOne({_id: FlowRouter.getParam('_id')});
    return log.changelog;
  },
  changelogCampaigns: () => {
    const init = Template.instance().templateDict.get('initiative');
    const campaigns = CampaignBasics.find({'data.initiative': init.name}).fetch().map(el => {
      return el.data.name
    });
    return campaigns
  },
  formatDate: (date) => {
    return moment(date, moment.ISO_8601).format("MM-DD-YYYY");
  },
  calcNet: (num) => {
    const init = Template.instance().templateDict.get('initiative');
    return initiativeHomepageFunctions.calcNet(num, init);
  },
  lineItemDelivery: (number) => {
    const init = Template.instance().templateDict.get('initiative');
    let count = 0;
    init.lineItems.forEach(el => {
      if (el.budget !== "") {
        count += 1;
      }
    });
    const graph = initiativeHomepageFunctions.objectiveChart(init, number, count);
    if (typeof graph === "object" && graph !== undefined) {
      return initiativeHomepageFunctions.objectiveChart(init, number, count);
    } else { return "not available" };
  },
  // add check to objectiveChart0 and costPerChart0 for duplicated objectives
  objectiveChart0: () => {
    const number = 0;
    const init = Template.instance().templateDict.get('initiative');
    let count = 0;
    init.lineItems.forEach(el => {
      if (el.budget !== "") {
        count += 1;
      }
    });
    if (init.dupObjectives) {
      return initiativeHomepageFunctions.dupObjectivesDeliveryChart(init, number, count);
    } else {
      return initiativeHomepageFunctions.objectiveDeliveryChart(init, number, count);
    }

  },
  objectiveChart0Spend: () => {
    const number = 0;
    const init = Template.instance().templateDict.get('initiative');
    let count = 0;
    init.lineItems.forEach(el => {
      if (el.budget !== "") {
        count += 1;
      }
    });
    if (init.dupObjectives) {
      return initiativeHomepageFunctions.dupObjectivesDeliveryChart(init, number, count);
    } else {
      return initiativeHomepageFunctions.objectiveSpendChart(init, number, count);
    }
  },
  objectiveChart1: () => {
    const number = 1;
    const init = Template.instance().templateDict.get('initiative');
    let count = 0;
    init.lineItems.forEach(el => {
      if (el.budget !== "") {
        count += 1;
      }
    });
    return initiativeHomepageFunctions.objectiveDeliveryChart(init, number, count);
  },
  objectiveChart1Spend: () => {
    const number = 1;
    const init = Template.instance().templateDict.get('initiative');
    let count = 0;
    init.lineItems.forEach(el => {
      if (el.budget !== "") {
        count += 1;
      }
    });
    return initiativeHomepageFunctions.objectiveSpendChart(init, number, count);
  },
  objectiveChart2: () => {
    const number = 2;
    const init = Template.instance().templateDict.get('initiative');
    let count = 0;
    init.lineItems.forEach(el => {
      if (el.budget !== "") {
        count += 1;
      }
    });
    return initiativeHomepageFunctions.objectiveDeliveryChart(init, number, count);
  },
  objectiveChart2Spend: () => {
    const number = 2;
    const init = Template.instance().templateDict.get('initiative');
    let count = 0;
    init.lineItems.forEach(el => {
      if (el.budget !== "") {
        count += 1;
      }
    });
    return initiativeHomepageFunctions.objectiveSpendChart(init, number, count);
  },
  objectiveChart3: () => {
    const number = 3;
    const init = Template.instance().templateDict.get('initiative');
    let count = 0;
    init.lineItems.forEach(el => {
      if (el.budget !== "") {
        count += 1;
      }
    });
    return initiativeHomepageFunctions.objectiveDeliveryChart(init, number, count);
  },
  objectiveChart4: () => {
    const number = 4;
    const init = Template.instance().templateDict.get('initiative');
    let count = 0;
    init.lineItems.forEach(el => {
      if (el.budget !== "") {
        count += 1;
      }
    });
    return initiativeHomepageFunctions.objectiveDeliveryChart(init, number, count);
  },
  // add check for duplicate objectives
  objectiveCostPerChart0: () => {
    const number = 0;
    const init = Template.instance().templateDict.get('initiative');
    let count = 0;
    init.lineItems.forEach(el => {
      if (el.budget !== "") {
        count += 1;
      }
    });

    if (init.dupObjectives) {
      return initiativeHomepageFunctions.dupObjectivesCostPerChart(init,number, count);
    } else {
      return initiativeHomepageFunctions.objectiveCostPerChart(init, number, count);
    }
  },
  objectiveCostPerChart1: () => {
    const number = 1;
    const init = Template.instance().templateDict.get('initiative');
    let count = 0;
    init.lineItems.forEach(el => {
      if (el.budget !== "") {
        count += 1;
      }
    });
    return initiativeHomepageFunctions.objectiveCostPerChart(init, number, count);
  },
  objectiveCostPerChart2: () => {
    const number = 2;
    const init = Template.instance().templateDict.get('initiative');
    let count = 0;
    init.lineItems.forEach(el => {
      if (el.budget !== "") {
        count += 1;
      }
    });
    return initiativeHomepageFunctions.objectiveCostPerChart(init, number, count);
  },
  objectiveCostPerChart3: () => {
    const number = 3;
    const init = Template.instance().templateDict.get('initiative');
    let count = 0;
    init.lineItems.forEach(el => {
      if (el.budget !== "") {
        count += 1;
      }
    });
    return initiativeHomepageFunctions.objectiveCostPerChart(init, number, count);
  },
  objectiveCostPerChart4: () => {
    const number = 4;
    const init = Template.instance().templateDict.get('initiative');
    let count = 0;
    init.lineItems.forEach(el => {
      if (el.budget !== "") {
        count += 1;
      }
    });
    return initiativeHomepageFunctions.objectiveCostPerChart(init, number, count);
  },
  aggregateDeliveryChart: () => {
    const init = Template.instance().templateDict.get('initiative');
    const chartData = Template.instance().templateDictionary.get('chartData');
    if (!chartData) {
      return "";
    } else if (chartData) {
      return chartData.deliveryObject;
    }
  },
  aggregateCostPerChart: () => {
    const init = Template.instance().templateDict.get('initiative');
    const chartData = Template.instance().templateDictionary.get('chartData');
    if (!chartData) {
      return "";
    } else if (chartData) {
      return chartData.costPerObject;
    }
  },
  initiativeLineItems: () => {
    return Template.instance().templateDict.get('initiative').lineItems;
  },
  specificFormData: function() {
    const init = Template.instance().templateDict.get('initiative');
    return {
      // id: this._id,
      // other: this.other,
      contentType: 'reports',
      hard: 'Lolcats',
      initiative: init.name,
      // fileTypes: '.jpg, .pdf, .png, .csv'
    }
  },
  uploadCallbacks: () => {
    const init = Template.instance().templateDict.get('initiative');
    const date = moment().toISOString();
    return {
      formData: () => {
        return {
          id: "123456789",
          other: "this is the other key in formData",
          initiative: init.name
        }
      },
      finished: (index, fileInfo, context) => {
        fileInfo['uploaded'] = moment().toISOString();
        fileInfo['initiative'] = init.name;
        Meteor.call('insertUpload', fileInfo, (err, res) => {
          if (!err) {
            Materialize.toast('Upload Successful', 1500);
          }
        })
        return {
          finished: true,
          finishedString: "this is a string"
        }
      }
    }
  },
  getUploads: () => {
    return Uploads.find();
  },
  fileType: (type) => {
    if (/(spreadsheet|sheet)/g.test(type)) {
      return "fa-file-excel-o";
    } else if (/pdf/.test(type)) {
      return "fa-file-pdf-o";
    } else if (/plain/.test(type)) {
      return "fa-file-text-o";
    } else if (/png/.test(type)) {
      return "fa-file-image-o";
    } else if (/(javascript|html)/g.test(type)) {
      return "fa-file-code-o";
    } else if (/(word|processing)/g.test(type)) {
      return "fa-file-word-o";
    } else {
      return "fa-file-o";
    }
  },
  clientAggregate: () => {
    const init = Template.instance().templateDict.get('initiative');
    if (init.lineItems[0].cost_plus) {
      const percent = stringToCostPlusPercentage(init.lineItems[0].costPlusPercent);
      const returnArr = [{
        spend: init.aggregateData.spend * percent,
        cpm: init.aggregateData.cpm * percent,
        cpc: init.aggregateData.cpc * percent,
        cpl: init.aggregateData.cpc * percent,
        cpvv: init.aggregateData.cpvv * percent,
        impressions: init.aggregateData.impressions,
        clicks: init.aggregateData.clicks,
        likes: init.aggregateData.likes,
        videoViews: init.aggregateData.videoViews
      }];
      return returnArr[0];
    } else if (init.lineItems[0].percent_total === true) {
      // get max budget
      let maxBudget = 0;
      init.lineItems.forEach(item => {
        if (item.budget) {
          maxBudget += item.budget;
        }
      });
      const returnObj = {
        spend: 0,
        impressions: 0,
        clicks: 0,
        videoViews: 0,
        likes: 0
      };
      const objArr = whichObjectives(init);
      objArr.forEach(obj => {
        returnObj['spend'] += obj.net.client_spend;
        returnObj['clicks'] += obj.clicks;
        returnObj['impressions'] += obj.impressions;
        returnObj['likes'] += obj.likes;
        returnObj['videoViews'] += obj.videoViews;
      });
      returnObj['cpm'] = returnObj.spend / (returnObj.impressions / 1000);
      returnObj['cpc'] = returnObj.spend / returnObj.clicks;
      returnObj['cpl'] = returnObj.spend / returnObj.likes;
      returnObj['cpvv'] = returnObj.spend / returnObj.videoViews;
      // if (returnObj.spend > maxBudget) {
      //   returnObj.spend = maxBudget;
      // }
      returnObj['spend'] = Session.get('spendTotal');
      return returnObj;
    }
  },
  gaugeChart0Spend: () => {
    const itemNumber = 0;
    const init = Template.instance().templateDict.get('initiative');
    const objective = init.lineItems[itemNumber].objective.toUpperCase().replace(/ /g, '_');
    const dealType = init.lineItems[itemNumber].dealType.toLowerCase();
    const max = parseFloat(init.lineItems[itemNumber].budget);
    const quotedPrice = parseFloat(init.lineItems[itemNumber].price);
    let start = init.lineItems[itemNumber].startDate; // is ISOString format
    if (Meteor.isProduction) {
      start = moment(start, moment.ISO_8601).subtract(1, 'd').toISOString();
    }
    const end = init.lineItems[itemNumber].endDate;
    const days = InsightsBreakdownsByDays.find(
    {
      $and: [
        {'data.date_start': {$gte: start}},
        {'data.date_start': {$lte: end}},
        {'data.initiative': init.name},
        {'data.objective': objective}
      ]
    },
      {
        sort: {'data.date_start': 1},
        fields: {
          'data.date_start': 1,
          // 'data.campaign_id': 1,
          'data.impressions': 1,
          'data.clicks': 1,
          // 'data.like': 1,
          'data.spend': 1,
          'data.video_view': 1,
          'data.cpc': 1,
          'data.cpm': 1,
          'data.cost_per_video_view': 1
        }
      }
    ).fetch();
    // need to map and reduce day data into one single object for factor func

    /*
    need to calc factor spend for each day
    */

    var metrics = ['impressions', 'clicks', 'like', 'video_view'];
    var mapped = {};

    for (let i = 0; i < metrics.length; i++) {
      mapped[metrics[i]] = days.map(a => {
        return a.data;
      }).reduce( (x,y) => {
        return x + y[metrics[i]];
      }, 0);
    }

    // add cpm and add cpc to object
    let cpm = 0;
    let cpc = 0;
    for (let i = 0; i < days.length; i++) {
      cpm += accounting.unformat(days[i].data.cpm);
      cpc += accounting.unformat(days[i].data.cpc);
    }
    mapped['cpm'] = cpm / days.length;
    mapped['cpc'] = cpc / days.length;

    // console.log('MAPPED', mapped, quotedPrice, init,itemNumber)
    let mappedSpend = days.map(day => {
      if (dealType === 'cpm') {
        return (day.data.impressions / 1000) * init[objective]['net'][`client_${dealType}`];
      } else {
        return day.data.clicks * init[objective]['net'][`client_${dealType}`];
      }
    });

    // just take the cost per from the objective object within the initiative
    // and use that to calculate

    let spend = mappedSpend.reduce( (a,b) => {
      return a + b;
    });

    // console.log('SPEND', spend)

    if (spend > max) {
      spend = max;
    }
    spend = parseFloat(spend.toFixed(2));
    Session.set('gauge0Spend', spend);
    return initiativeHomepageFunctions.gaugeChart('Spend', spend, max)
  },
  gaugeChart0Action: () => {
    const itemNumber = 0;
    const init = Template.instance().templateDict.get('initiative');
    const objective = init.lineItems[itemNumber].objective.toUpperCase().replace(/ /g, '_');
    const dealType = init.lineItems[itemNumber].dealType;
    let start = init.lineItems[itemNumber].startDate; // is ISOString format
    if (Meteor.isProduction) {
      start = moment(start, moment.ISO_8601).subtract(1, 'd').toISOString();
    }
    const end = init.lineItems[itemNumber].endDate;
    let title;
    let action;
    if (dealType === 'CPM') {
      title = 'Impressions';
      action = 'impressions';
    } else if (dealType === 'CPC') {
      title = 'Clicks';
      action = 'clicks'
    } else if (dealType === 'CPVV') {
      title = 'Video View';
      action = 'video_view';
    } else if (dealType === 'CPL') {
      title = 'Likes';
      action = 'likes';
    }

    const days = InsightsBreakdownsByDays.find(
    {
      $and: [
        {'data.date_start': {$gte: start}},
        {'data.date_start': {$lte: end}},
        {'data.initiative': init.name},
        {'data.objective': objective}
      ]
    },
      {
        sort: {'data.date_start': 1},
        fields: {
          'data.date_start': 1,
          'data.campaign_id': 1,
          'data.impressions': 1,
          'data.clicks': 1,
          'data.like': 1,
          'data.spend': 1,
          'data.video_view': 1
        }
      }
    ).fetch();
    console.log('0 action days len', days.length, start, end)
    const reducedActions = days.map(day => {
      return parseInt(day.data[action]);
    }).reduce((a,b) => {
      return a + b;
    });
    const max = parseFloat(init.lineItems[itemNumber].quantity);
    Session.set('gauge0Action', reducedActions)
    return initiativeHomepageFunctions.gaugeChart(title, reducedActions, max);
  },
  gaugeChart0CostPerAction: () => {
    const itemNumber = 0;
    const init = Template.instance().templateDict.get('initiative');
    // const objective = init.lineItems[itemNumber].objective.toUpperCase().replace(/ /g, '_');
    const dealType = init.lineItems[itemNumber].dealType.toLowerCase();
    // const actions = init[objective]['net']['client_' + dealType];
    const max = parseFloat(init.lineItems[itemNumber].price);

    let costPer;
    if (dealType === 'cpm') {
      costPer = Session.get('gauge0Spend') / (Session.get('gauge0Action') / 1000);
    } else {
      costPer = Session.get('gauge0Spend') / Session.get('gauge0Action')
    }
    costPer = parseFloat(costPer.toFixed(2));

    return initiativeHomepageFunctions.gaugeChart(dealType, costPer, max);
  },
  gaugeChart1Spend: () => {

    const itemNumber = 1;
    const init = Template.instance().templateDict.get('initiative');
    const objective = init.lineItems[itemNumber].objective.toUpperCase().replace(/ /g, '_');
    const max = parseFloat(init.lineItems[itemNumber].budget);
    const dealType = init.lineItems[itemNumber].dealType.toLowerCase();
    const quotedPrice = parseFloat(init.lineItems[itemNumber].price);
    let start = init.lineItems[itemNumber].startDate; // is ISOString format
    if (Meteor.isProduction) {
      start = moment(start, moment.ISO_8601).subtract(1, 'd').toISOString();
    }
    const end = init.lineItems[itemNumber].endDate;

    let action;
    if (dealType === 'cpm') {
      action = 'impressions';
    } else if (dealType === 'cpc') {
      action = 'clicks'
    } else if (dealType === 'cpvv') {
      action = 'video_view';
    } else if (dealType === 'cpl') {
      action = 'likes';
    }


    const days = InsightsBreakdownsByDays.find(
    {
      $and: [
        {'data.date_start': {$gte: start}},
        {'data.date_start': {$lte: end}},
        {'data.initiative': init.name},
        {'data.objective': objective}
      ]
    },
      {
        sort: {'data.date_start': 1},
        fields: {
          'data.date_start': 1,
          'data.impressions': 1,
          'data.clicks': 1,
          'data.spend': 1,
          'data.video_view': 1,
          'data.cpc': 1,
          'data.cpm': 1,
          'data.cost_per_video_view': 1
        }
      }
    ).fetch();
    var metrics = ['impressions', 'clicks', 'like', 'video_view'];
    var mapped = {};

    for (let i = 0; i < metrics.length; i++) {
      mapped[metrics[i]] = days.map(a => {
        return a.data;
      }).reduce( (x,y) => {
        return x + y[metrics[i]];
      }, 0);
    }

    // add cpm and add cpc to object
    let cpm = 0;
    let cpc = 0;
    for (let i = 0; i < days.length; i++) {
      cpm += accounting.unformat(days[i].data.cpm);
      cpc += accounting.unformat(days[i].data.cpc);
    }
    mapped['cpm'] = cpm / days.length;
    mapped['cpc'] = cpc / days.length;
    let mappedSpend = days.map(day => {
      if (dealType === 'cpm') {
        return (day.data.impressions / 1000) * init[objective]['net'][`client_${dealType}`];
      } else {
        return day.data[action] * init[objective]['net'][`client_${dealType}`];
      }
    });

    // just take the cost per from the objective object within the initiative
    // and use that to calculate

    let spend = mappedSpend.reduce( (a,b) => {
      return a + b;
    });

    if (spend > max) {
      spend = max;
    }
    spend = parseFloat(spend.toFixed(2));
    Session.set('gauge1Spend', spend);
    return initiativeHomepageFunctions.gaugeChart('Spend', spend, max)
  },
  gaugeChart1Action: () => {
    const itemNumber = 1;
    const init = Template.instance().templateDict.get('initiative');
    const dealType = init.lineItems[itemNumber].dealType;
    const objective = init.lineItems[itemNumber].objective.toUpperCase().replace(/ /g, '_');
    let start = init.lineItems[itemNumber].startDate; // is ISOString format
    if (Meteor.isProduction) {
      start = moment(start, moment.ISO_8601).subtract(1, 'd').toISOString();
    }
    const end = init.lineItems[itemNumber].endDate;
    let title;
    let action;
    if (dealType === 'CPM') {
      title = 'Impressions';
      action = 'impressions';
    } else if (dealType === 'CPC') {
      title = 'Clicks';
      action = 'clicks'
    } else if (dealType === 'CPVV') {
      title = 'Video View';
      action = 'video_view';
    } else if (dealType === 'CPL') {
      title = 'Likes';
      action = 'likes';
    }

    const days = InsightsBreakdownsByDays.find(
    {
      $and: [
        {'data.date_start': {$gte: start}},
        {'data.date_start': {$lte: end}},
        {'data.initiative': init.name},
        {'data.objective': objective}
      ]
    },
      {
        sort: {'data.date_start': 1},
        fields: {
          'data.date_start': 1,
          'data.campaign_id': 1,
          'data.impressions': 1,
          'data.clicks': 1,
          'data.like': 1,
          'data.spend': 1,
          'data.video_view': 1
        }
      }
    ).fetch();
    console.log('1 action days len', days.length, start, end)
    let daysTotal = 0;
    const reducedActions = days.map(day => {
      return parseInt(day.data[action]);
      // if (! day.data[action]) {
      //   console.log('returning 0', day.data)
      //   return 0;
      // } else {
      //   daysTotal += day.data[action];

      // }
    }).reduce((a,b) => {
      return a + b;
    });
    Session.set('gauge1Action', reducedActions);
    const max = parseFloat(init.lineItems[itemNumber].quantity);
    return initiativeHomepageFunctions.gaugeChart(title, reducedActions, max);
  },
  gaugeChart1CostPerAction: () => {
    const itemNumber = 1;
    const init = Template.instance().templateDict.get('initiative');
    const dealType = init.lineItems[itemNumber].dealType.toLowerCase();
    const max = parseFloat(init.lineItems[itemNumber].price);

    let costPer;
    if (dealType === 'cpm') {
      costPer = Session.get('gauge1Spend') / (Session.get('gauge1Action') / 1000);
    } else {
      costPer = Session.get('gauge1Spend') / Session.get('gauge1Action')
    }
    // console.log('costPer', costPer)
    costPer = parseFloat(costPer.toFixed(2));

    return initiativeHomepageFunctions.gaugeChart(dealType, costPer, max);
  },
  getPlatform: (platform, objective) => {
    const init = Template.instance().templateDict.get('initiative');
    // check to see if objective matches a line item
    // this is really only for instagram purposes
    // need to do Instagram to lower case()

    var instagramTest = _.where(init.lineItems, {platform: 'Instagram'})[0];

    if (instagramTest) {
      if (instagramTest.objective.toUpperCase().replace(/ /g, '_') === objective) {
        return 'instagram';
      }
    }

    if (!platform) {
      return 'facebook-official';
    }

    if (platform === 'facebook') {
      return 'facebook-official';
    } else if (platform === 'twitter') {
      return 'twitter-square';
    } else {
      return 'facebook-official';
    }
  },
  buildPath: (id, platform, start, stop, accountID, initName, campName) => {

    let startTime = moment(start, 'MM-DD-YYYY hh:mm a').toISOString()
    let stopTime = moment(stop, 'MM-DD-YYYY hh:mm a').toISOString()

    const params = {campaign_id: id};
    let queryParams = {};

    if (platform === 'twitter') {
      queryParams = {platform: "twitter", initiative: initName, campaign_id: id, account_id: accountID, start_time: startTime, stop_time: stopTime, name: campName};
    } else {
      queryParams = {platform: 'facebook'}
    }

    var path = FlowRouter.path('/accounts/:campaign_id/overview', params, queryParams);

    return path;
  },
  overSpend: (spend, objective) => {
    const init = Template.instance().templateDict.get('initiative');
    const raw = accounting.unformat(spend);
    let campaignObjective = defineCampaignObjective(objective);

    const formattedObjective = objective.replace(/_/g, " ").toLowerCase();

    const findIt = _.where(init.lineItems, {objective: campaignObjective})[0];

    if (raw > parseFloat(findIt.budget)) {
      return findIt.budget;
    }

    return spend;
  },
  agClientSpend: () => {
    const spend = Template.instance().aggregatedSpend.get('spend');
    return spend;
  }
});






// -------------------------------- EVENTS -------------------------------- //



Template.initiativeHomepage.events({
  'click #view-initiative-stats-modal': function (event, template) {
    const initiative = Template.instance().templateDict.get('initiative');
  },
  'submit .changelog': (event, template) => {
    event.preventDefault();
    let change = {};
    change['change'] = event.target.name.value;
    change['date'] = moment().toISOString();
    change['campaignTag'] = event.target.changelog_campaigns.value;
      const _id = FlowRouter.getParam('_id');
    Meteor.call('insertChangelog', change, _id, (err, res) => {
      if (err) {
        Materialize.toast("There was an error.", 1500);
      }
    });
    event.target.name.value = "";
  },
  'click .delete-change': (event, template) => {
    const initiative = Template.instance().templateDict.get('initiative');
    const id = $(event.target).data("id")
    Meteor.call('deleteChange', initiative.name, id);
  },
  'submit #campaignAggregateForm': (event, template) => {
    event.preventDefault();
    const checkedInputs = event.target.aggregate;
    const lineItem = event.target.lineItemSelect.value;
    const idArray = [];

    if (checkedInputs.length >= 2) {
      for (let input of checkedInputs) {
        if (input.checked) {
          idArray.push(input.id)
        }
      }
    } else {
      idArray.push(checkedInputs.id);
    }

    const initiative = Template.instance().templateDict.get('initiative');
    var meteorCall = Promise.promisify(Meteor.call);

    meteorCall('campaignAggregatorChart', idArray, initiative, lineItem)
    .then(function (returnedData) {
      template.templateDictionary.set('chartData', returnedData);
    }).catch(function (err) {
      console.log('Error in campaignAggregatorChart promise:', err)
    });
  },
  'submit #file-upload-form': (event, instance) => {
    event.preventDefault();
    var file = event.target['file-upload'].value;

  },
  'click #delete-file': (event, instance) => {
    event.preventDefault();

    const uploadId = event.target.parentElement.getAttribute('href');
    const makeSure = confirm('Are you sure you want to delete this file?')

    if (makeSure) {
      Meteor.call('deleteUpload', uploadId);
    } else {
      return '';
    }
  },
  'click .close-modal-x': (event, instance) => {
    $('#modal1').closeModal();
  }
});




Template.initiativeHomepage.onDestroyed(function () {
  $('#modal1').closeModal();
  $('#modal2').closeModal();
  $('#modal3').closeModal();
  Session.set('gauge0Spend', null);
  Session.set('gauge1Spend', null);
  Session.set('gauge0Action', null);
  Session.set('gauge1Action', null);
  Session.set('spendTotal', null);
});


// -------- GAUGE FUNCTION -------- //



