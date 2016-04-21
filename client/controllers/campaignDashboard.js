import CampaignInsights from '/collections/CampaignInsights'
import Initiatives from '/collections/Initiatives'

var Promise = require('bluebird');

Tracker.autorun(function () {
  if (FlowRouter.subsReady('campaignInsightList') && FlowRouter.subsReady('Initiatives')) {
    // console.log('Insights and Initiatives subs are now ready!');
  }
});

Template.campaignDashboard.onCreated( function () {
  this.templateDict = new ReactiveDict();
  const initiative = Initiatives.findOne(
    {"campaign_ids": {$in: [FlowRouter.current().params.campaign_id]}
  });
  this.templateDict.set('initiative', initiative);
});

Template.campaignDashboard.onRendered(function () {
    Session.set('dayNumber', 0);
    $(".dropdown-button").dropdown({hover: true});
    $(".button-collapse").sideNav();
});

Template.campaignDashboard.events({
    'click .report-button': function () {
      let node = document.getElementsByClassName("reporting-div")[0];
      reporter = Blaze.render(Template.reporter, node);
    },
    'click #refresh-insights': function (event, template) {
      console.log(this);
      Meteor.call('refreshInsight', this.campaign_id, this.campaign_name, this.initiative);
      $("#message-box li").remove();
    },
    'click .setSessionCampName': function () {
      Session.set("campaign_name", this.campaign_name);
    },
    'click #dashboard-insights-button': function (event, template) {
      $("#dashboard-insights-button").popup({
        on: 'click'
      });
    },
    'click #project-up': function () {
      Session.set("dayNumber", Session.get("dayNumber") + 1);
    },
    'click #project-down': function () {
      Session.set("dayNumber", Session.get("dayNumber") - 1);
    }
});

Template.campaignDashboard.helpers({
  isReady: (sub1, sub2) => {
    if (FlowRouter.subsReady(sub1) && FlowRouter.subsReady(sub2)) {
      return true;
    }
  },
  'fetchInsights': function () {
    console.log('checking for insights');
    let campaignNumber = FlowRouter.current().params.campaign_id;
    let camp = CampaignInsights.findOne({'data.campaign_id': campaignNumber});
    if (camp) {
      camp.data.cpm = mastFunc.money(camp.data.cpm);
      camp.data.cpc = mastFunc.money(camp.data.cpc);
      return [camp.data];
    } else {
      var target = document.getElementById("spinner-div");
      let spun = Blaze.render(Template.spin, target);
      console.log('gotta get insights for this one', campaignNumber);
      Meteor.call('getInsights', campaignNumber, Session.get("end_date"), function (err, result) {
        if (err) {
            console.log(err);
        } else {
            Blaze.remove(spun);
        }
      });
    }
  },
  'cleanText': function (text) {
      return text.replace("_", " ").toLowerCase();
  },
  'getCampaignNumber': function () {
      return FlowRouter.current().params.campaign_id;
  },
  'getAccountNumber': function () {
      try {
         let num = CampaignInsights.findOne({'data.campaign_id': FlowRouter.current().params.campaign_id});
          return num.data.account_id;
      } catch(e) {
          console.log("this error is not important");
      }
  },
  'getInitiative': function () {
      const initiative = Template.instance().templateDict.get('initiative');
      return initiative;
  },
  'getBudgetTotal': function () {
    const init = Template.instance().templateDict.get('initiative');
    const total = accounting.unformat(init.budget) + accounting.unformat(init.budget2) + accounting.unformat(init.budget3) + accounting.unformat(init.budget4) + accounting.unformat(init.budget5);
    return mastFunc.money(total);
  },
  'getAggregate': function () {
    const init = Template.instance().templateDict.get('initiative');
    console.log('init in getAggregate', init);

    var call = Promise.promisify(Meteor.call);
    call('getAggregate', init.name).then(function (result) {
      // console.log('result from getAggregate', result);
    }).catch(function (err) {
      console.log('aggghhh error:', err)
    })

    // moment stuff to figure out timeLeft on initiative
    const ends = moment(init.lineItems[0].endDate, moment.ISO_8601);
    const starts = moment(init.lineItems[0].startDate, moment.ISO_8601);
    const now = moment(new Date);
    let timeLeft;
    // if now is after the end date, timeleft is zero, else...
    now.isAfter(ends) ? timeLeft = 0 : timeLeft = ends.diff(now, 'days');

    let agData = init.aggregateData // for brevity later on

    const spendPercent = numeral((agData.spend / parseFloat(init.lineItems[0].budget))).format("0.00%")

    // formats numbers
    agData = mastFunc.formatAll(agData);

    return {
      initiative: agData,
      ends: moment(ends).format("MM-DD-YYYY hh:mm a"),
      timeLeft: timeLeft,
      spendPercent: spendPercent
    };
  },
  'makeProjections': function () {
    const initiative = Template.instance().templateDict.get('initiative');
    Meteor.call('makeProjections', initiative.name, Session.get('dayNumber')); // call with initiative name and dayNumber
  },
  'getSessionDay': function () {
    let day = Session.get('dayNumber');
    return day;
  },
  'averages': function () {
    const initiative = Template.instance().templateDict.get('initiative');
    const ended = moment(initiative.lineItems[0].endDate, moment.ISO_8601);
    const started = moment(initiative.lineItems[0].startDate, moment.ISO_8601);
    const now = moment(new Date);
    let timeDiff = ended.diff(started, 'days');

    now.isAfter(ended) ? '' : timeDiff = now.diff(started, 'days');

    // console.log(numeral(initiative.aggregateData.clicks / timeDiff).format("0,0"))

    return {
      avgClicks: numeral(initiative.aggregateData.clicks / timeDiff).format("0,0"),
      avgImpressions: numeral(initiative.aggregateData.impressions / timeDiff).format("0,0"),
      avgLikes: numeral(initiative.aggregateData.likes / timeDiff).format("0,0"),
      avgSpend: numeral(initiative.aggregateData.spend / timeDiff).format("$0,0.00")
    }
  },
  'dataProjection': function () {
    // TODO create a master function to handle this???
    const initiative = Template.instance().templateDict.get('initiative');

    const agData = initiative.aggregateData // for brevity
    const sesh = Session.get('dayNumber') // for brevity

    const ended = moment(initiative.endDate, moment.ISO_8601);
    const started = moment(initiative.startDate, moment.ISO_8601);
    const now = moment(new Date);
    // ternary to figure out time difference
    let timeDiff = now.isAfter(ended) ?
      ended.diff(started, 'days') :
      now.diff(started, 'days');

    let projections = function projections(action, session, timeDiff) {
      let avg = action / timeDiff
      let result =  action + (session * avg);
      return numeral(result).format("0,0");
    }

    const clicks = projections(agData.clicks, sesh, timeDiff);
    const impressions = projections(agData.impressions, sesh, timeDiff);
    const likes = projections(agData.likes, sesh, timeDiff);

    return {
      clicks: clicks,
      impressions: impressions,
      likes: likes
    }
  },
  'overviewActive': function () {
    return Session.get("route") === "overview" ? "active" : '';
  },
  'targetingActive': function () {
    return Session.get("route") === "targeting" ? "active": '';
  },
  'creativeActive': function () {
    return Session.get("route") === "creative" ? "active" : '';
  },
  'breakdownsActive': function () {
    return Session.get("route") === "breakdowns" ? "active" : '';
  },
  'daybreakdownsActive': function () {
    return Session.get("route") === "daybreakdowns" ? "active" : '';
  },
  'hourlybreakdownsActive': function () {
    return Session.get("route") === "hourlyBreakdowns" ? "active" : '';
  },
  'chartsActive': function () {
    return Session.get("route") === "charts" ? "active" : '';
  },
  'formatDate': (date) => {
    return moment(date, moment.ISO_8601).format("MM-DD-YYYY hh:mm a");
  }
});

Template.campaignDashboard.onDestroyed(function () {
    $("#message-box").text("");
});
