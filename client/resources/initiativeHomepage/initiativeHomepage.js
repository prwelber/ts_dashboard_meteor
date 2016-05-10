import CampaignInsights from '/collections/CampaignInsights'
import Initiatives from '/collections/Initiatives'
import CampaignBasics from '/collections/CampaignBasics'
import { Meteor } from 'meteor/meteor'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Materialize } from 'meteor/materialize:materialize'

var moment = require('moment');
var range = require('moment-range');
var Promise = require('bluebird');
// import Chart from "chart.js"

Tracker.autorun(function () {
  if (FlowRouter.subsReady('campaignInsightList') && FlowRouter.subsReady('Initiatives')) {
    // console.log('Insights and Initiatives subs are now ready!');
  }
});


Template.initiativeHomepage.onCreated(function () {
  this.templateDict = new ReactiveDict();
  const initiative = Initiatives.findOne({_id: FlowRouter.current().params._id});
  this.templateDict.set('initiative', initiative);

  const campaigns = CampaignInsights.find({'data.initiative': initiative.name}).fetch();
  this.templateDict.set('campaigns', campaigns);
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


  const initiative = Initiatives.findOne({_id: FlowRouter.getParam("_id")});

  Meteor.call('aggregateObjective', initiative.name);

});

Template.initiativeHomepage.helpers({
  isReady: (sub1, sub2) => {
    if (FlowRouter.subsReady(sub1) && FlowRouter.subsReady(sub2)) {
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
  'isTabDisabled': (num) => {
    const init = Template.instance().templateDict.get('initiative');
    // substract 1 because line item number does not perfectly map
    // to array indexes
    if (! init.lineItems[num - 1].dealType) {
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
    return mastFunc.money(num);
  },
  'formatPercent': (num) => {
    return numeral(num).format("00.000") + "%";
  },
  formatNumber: (number) => {
    return numeral(number).format("0,0");
  },
  'initiative': function () {
    const initiative = Template.instance().templateDict.get('initiative');
    initiative.budget = mastFunc.money(initiative.budget);
    initiative.quantity = numeral(initiative.quantity).format("0,0");
    initiative.price = mastFunc.money(initiative.price);
    return initiative;
  },
  'grabLineItem': (num) => {
    const init = Template.instance().templateDict.get('initiative');
    return init.lineItems[num];
  },
  'initiativeStats': function () {
    const init = Template.instance().templateDict.get('initiative');
    let agData = init.aggregateData;
    const spendPercent = numeral((agData.spend / parseFloat(init.lineItems[0].budget))).format("0.00%");

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
    console.log(arrToReturn)
    return arrToReturn;

  },
  'objectiveAggregates': () => {
    const init = Template.instance().templateDict.get('initiative');
    // TODO RIGHT HERE
    const camps = Template.instance().templateDict.get('campaigns');
    // console.log("campaigns", camps);
    // console.log('initiative', init);
    // const campaigns = CampaignInsights.find({""})

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

    });

    return returnArray;
  },
  'modalDeliveryChart': () => {
    const initiative = Template.instance().templateDict.get('initiative');
    const labels     = [], // this will be the date range
          timeFormat = "MM-DD-YYYY",
          days       = moment(initiative.lineItems[0].endDate, moment.ISO_8601).diff(moment(initiative.lineItems[0].startDate, moment.ISO_8601), 'days'),
          avg        = parseFloat(initiative.lineItems[0].quantity / days),
          spendAvg   = parseFloat(initiative.lineItems[0].budget / days),
          avgData    = [],
          idealSpend = [];

    let total           = 0,
        idealSpendTotal = 0;
    for (let i = 0; i < days + 1; i++) {
        total = total + avg;
        idealSpendTotal = idealSpendTotal + spendAvg;
        avgData.push(total);
        idealSpend.push(idealSpendTotal);
      }

      //for setting dealType
      let type;
      if (initiative.lineItems[0].dealType === "CPM") {
        type = "impressions";
      } else if (initiative.lineItems[0].dealType === "CPC") {
        type = "clicks";
      } else if (initiative.lineItems[0].dealType === "CPL") {
        type = "like";
      }

      let actionToChart = [],
          spendChart    = [],
          spendTotal    = 0,
          totes         = 0; // Template.instance().templateDict.get('data')[0].type;

      // seeing if Bluebird will work for promises and meteor.call
      var call = Promise.promisify(Meteor.call);

      call('aggregateForChart', initiative)
      .then(function (res) {
        Session.set('initChartData', res.dataArray);
        Session.set('labelArray', res.labelArray);
        totes = res.dataArray[0][type]
      }).catch(function (err) {
        console.log('Error in modalDeliveryChart Promise call:', err)
      });

      const SESSION_DATA = Session.get('initChartData');

      if (SESSION_DATA) {
        try {
          SESSION_DATA.forEach(el => {
            totes += el[type];
            spendTotal += el.spend;
            actionToChart.push(totes);
            spendChart.push(spendTotal);
          });
        } catch(e) {
          console.log("Error running forEach", e.message);
        }
      }

      // for getting x axis labels
      const LABEL_DATA = Session.get('labelArray');
      if (LABEL_DATA) {
        try {
          let start       = moment(LABEL_DATA[0], "MM-DD"),
              end         = moment(LABEL_DATA[LABEL_DATA.length - 1], "MM-DD"),
              dr          = moment.range(start, end),
              arrayOfDays = dr.toArray('days');

          if (arrayOfDays) {
            arrayOfDays.forEach(el => {
              labels.push(moment(el).format("MM-DD"))
            });
          }
        } catch(e) {
          console.log("Error creating x axis labels:", e);
        }
      }


      return {
        chart: {
          zoomType: 'x'
        },
        // TODO FIX THIS
        title: {
          text: "Delivery"
        },

        subtitle: {
          text: document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
        },

        tooltip: {
          valueSuffix: " " + type,
          shared: true,
          crosshairs: true
        },
        xAxis: {
          // type: 'datetime',
          categories: Session.get('labelArray')
        },

        yAxis: {
          title: {
            text: type
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

        legend: {
          borderWidth: 0,
          layout: 'horizontal',
          backgroundColor: '#FFFFFF',
          align: 'left',
          verticalAlign: 'top',
          floating: true,
          x: 25,
          y: 25
        },

        series: [{
          name: 'Ideal Distribution',
          data: avgData,
          color: '#90caf9'
        }, {
          name: 'Real Distribution',
          data: actionToChart,
          color: '#0d47a1'
        }, {
          name: 'Spend',
          data: spendChart,
          color: '#b71c1c'
        }, {
          name: 'Ideal Spend',
          data: idealSpend,
          color: '#ef9a9a'
        }]
      }
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
        text: "Cost per Type for Initiative"
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
  }
});

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
    console.log($(event.target).data("id"));
    const id = $(event.target).data("id")
    Meteor.call('deleteChange', initiative.name, id);
  }

});

Template.initiativeHomepage.onDestroyed(function () {
  $('#modal1').closeModal();
});
