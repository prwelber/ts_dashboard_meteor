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


  const initiative = Initiatives.findOne({_id: FlowRouter.current().params._id})

  Meteor.call('aggregateObjective', initiative.name);

});

Template.initiativeHomepage.helpers({
  // need to gather all the campaigns associated with this initiative
  'getCampaigns': function () {
    const init = Template.instance().templateDict.get('initiative');
    const camps = CampaignInsights.find(
      {'data.initiative': init.name},
      {sort: {
        'data.date_stop': -1
      }
    }).fetch();

    camps.forEach(el => {
      el.startDate = moment(el.startDate).format("MM-DD-YYYY");
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
    return numeral(num).format("0.000%")
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

    const getLength = function getLength(initiative) {
      let counter = 0
      for (let i = 0; i <= initiative.lineItems.length - 1; i++) {
        if (initiative.lineItems[i].dealType) {
          counter++;
        }
      }
      console.log('counter', counter);
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

        costPlus = costPlus.toString().split('');
        costPlus.unshift(".");
        costPlus = 1 + parseFloat(costPlus.join(''));

        console.log("costPlus = ", costPlus);
        console.log("objective stats", objectiveAg[0]);

        objToReturn['netBudget'] = parseFloat(init.lineItems[i].budget) / costPlus;
        objToReturn['netSpend'] = parseFloat(objectiveAg[0].spend) / costPlus;
        objToReturn['spendPercent'] = ((objToReturn.netBudget - objToReturn.netSpend) / objToReturn.netBudget);
        objToReturn['netCPM'] = objToReturn.netSpend / objectiveAg[0].impressions;
        objToReturn['netCPC'] = objToReturn.netSpend / objectiveAg[0].clicks;


        if (objectiveAg[0].likes === null || objectiveAg[0].likes === '' || objectiveAg[0].likes === 0) {
          objToReturn['netCPL'] = 0;
        } else {
          objToReturn['netCPL'] = objToReturn.netSpend / objectiveAg[0].likes;
        }
      }

      arrToReturn.push(objToReturn);
    }
    console.log(arrToReturn);
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

    init.VIDEO_VIEWS ? returnArray.push(init.VIDEO_VIEWS[0]) : '';
    init.POST_ENGAGEMENT ? returnArray.push(init.POST_ENGAGEMENT[0]) : '';
    init.LINK_CLICKS ? returnArray.push(init.LINK_CLICKS[0]) : '';
    init.PAGE_LIKES ? returnArray.push(init.PAGE_LIKES[0]) : '';
    init.REACH ? returnArray.push(init.REACH[0]) : '';
    init.CONVERSIONS ? returnArray.push(init.CONVERSIONS[0]) : '';
    init.APP_ENGAGEMENT ? returnArray.push(init.APP_ENGAGEMENT[0]) : '';
    init.APP_INSTALLS ? returnArray.push(init.APP_INSTALLS[0]) : '';

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

    // console.log("returnArray:", returnArray);

    return returnArray;
  },
  'modalDeliveryChart': function () {
    const initiative = Template.instance().templateDict.get('initiative');
    // console.log('initiative for chart:', initiative);
    const labels     = [], // this will be the date range
          timeFormat = "MM-DD-YYYY",
          days       = moment(initiative.lineItems[0].endDate).diff(moment(initiative.lineItems[0].startDate), 'days'),
          avg        = parseFloat(initiative.lineItems[0].quantity / days),
          spendAvg   = parseFloat(initiative.lineItems[0].budget / days),
          avgData    = [],
          idealSpend = [];

    let total           = 0,
        idealSpendTotal = 0;
    // console.log('avg', avg);
    for (let i = 0; i < days; i++) {
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
        // console.log("result from promise", res)
        Session.set('res', res);
        totes = res[0][type]
        // console.log('totes', totes);
      }).catch(function (err) {
        console.log('uh no error', err)
      });

      Session.get('res').forEach(el => {
        totes += el[type];
        spendTotal += el.spend;
        actionToChart.push(totes);
        spendChart.push(spendTotal);
      });

      // for getting x axis labels
      let start       = moment(Session.get('res')[0]['date'], "MM-DD"),
          end         = new Date(initiative.lineItems[0].endDate),
          dr          = moment.range(start, end),
          arrayOfDays = dr.toArray('days');

      // console.log(start);

      if (arrayOfDays) {
        arrayOfDays.forEach(el => {
          labels.push(moment(el).format("MM-DD"))
        });
      }

      // console.log(arrayOfDays);
      // console.log(labels);

      return {
        chart: {
          zoomType: 'x'
        },
        // TODO FIX THIS
        title: {
          text: "Some Text Here"
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
          categories: labels
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
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'middle',
          borderWidth: 0
        },

        series: [{
          name: 'Ideal Distribution',
          data: avgData
        }, {
          name: 'Real Distribution',
          data: actionToChart
        }, {
          name: 'Spend',
          data: spendChart
        }, {
          name: 'Ideal Spend',
          data: idealSpend
        }]
      }
  }
});

Template.initiativeHomepage.events({
  'click #view-initiative-stats-modal': function (event, template) {
    const initiative = Template.instance().templateDict.get('initiative');


  }
});

Template.initiativeHomepage.onDestroyed(function () {
  $('#modal1').closeModal();
});
