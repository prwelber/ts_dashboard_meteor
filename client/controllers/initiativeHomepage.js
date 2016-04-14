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
  'initiative': function () {
    const initiative = Template.instance().templateDict.get('initiative');
    initiative.budget = mastFunc.money(initiative.budget);
    initiative.quantity = numeral(initiative.quantity).format("0,0");
    initiative.price = mastFunc.money(initiative.price);

    return initiative;
  },
  'initiativeStats': function () {
    const init = Template.instance().templateDict.get('initiative');
    const agData = init.aggregateData;
    const spendPercent = numeral((agData.spend / parseFloat(init.budget))).format("0.00%");

    //function for formatting data with numeral
    const niceNum = function niceNum (data) {
      return numeral(data).format("0,0");
    }

    agData['spendPercent'] = spendPercent;
    agData.spend = mastFunc.money(agData.spend);
    agData.clicks = niceNum(agData.clicks);
    agData.impressions = niceNum(agData.impressions);
    agData.reach = niceNum(agData.reach);
    agData.likes = niceNum(agData.likes)
    agData.cpc = mastFunc.money(agData.cpc);
    agData.cpm = mastFunc.money(agData.cpm);

    if (agData.cpl === null || agData.cpl === Infinity) {
      agData['cpl'] = "0";
    } else if (typeof agData.cpl === "number") {
      agData['cpl'] = mastFunc.money(agData.cpl);
    }

    return init.aggregateData;
  },
  'objectiveAggregates': function () {
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
          days       = moment(initiative.endDate, timeFormat).diff(moment(initiative.startDate, timeFormat), 'days'),
          avg        = parseFloat(numeral(initiative.quantity / days).format("0.00")),
          spendAvg   = parseFloat(numeral(initiative.budget / days).format("0.00")),
          avgData    = [],
          idealSpend = [];

    // console.log('days:', days);
    let total           = 0,
        idealSpendTotal = 0;
    // console.log('avg', avg);
    for (let i = 0; i < days; i++) {
        total = total + avg;
        idealSpendTotal = idealSpendTotal + spendAvg;
        avgData.push(total);
        idealSpend.push(idealSpendTotal);
      }

      // for getting x axis labels
      var start       = new Date(initiative.startDate),
          end         = new Date(initiative.endDate),
          dr          = moment.range(start, end),
          arrayOfDays = dr.toArray('days');
      // console.log(arrayOfDays);
      // console.log(dr)
      arrayOfDays.forEach(el => {
        labels.push(moment(el).format("MM-DD"))
      });
      // console.log("labels:", labels)

      //for setting dealType
      let type;
      if (initiative.dealType === "CPM") {
        type = "impressions";
      } else if (initiative.dealType === "CPC") {
        type = "clicks";
      } else if (initiative.dealType === "CPL") {
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
      }).catch(function (err) {
        console.log('uh no error', err)
      });

      Session.get('res').forEach(el => {
        totes += el[type];
        spendTotal += el.spend;
        actionToChart.push(totes);
        spendChart.push(spendTotal);
      });
      // console.log(actionToChart);

      return {
        chart: {
          zoomType: 'x'
        },

        title: {
          text: type.substr(0,1).toUpperCase() + type.substr(1, type.length) + " Delivery for Initiative"
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
