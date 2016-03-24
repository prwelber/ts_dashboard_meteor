var Promise = require('bluebird');

let dash = Template.campaignDashboard;

Tracker.autorun(function () {
  if (FlowRouter.subsReady('campaignInsightList') && FlowRouter.subsReady('Initiatives')) {
    // console.log('Insights and Initiatives subs are now ready!');
  }
});

Template.campaignDashboard.onRendered(function () {
    Session.set('dayNumber', 0);
});

dash.events({
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

dash.helpers({
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
        let initiative = Initiatives.findOne(
          {"campaign_ids": {$in: [FlowRouter.current().params.campaign_id]}
        });
        return initiative;
    },
    'getAggregate': function () {
      let init = Initiatives.findOne(
        {"campaign_ids": {$in: [FlowRouter.current().params.campaign_id]}
      });
      console.log('init in getAggregate', init);
      /*
      Note below use of Meteor.wrapAsync()..this takes an asynchronous function
      From Meteor docs: the environment captured when the original function was called will be restored in the callback
      */
      // let asyncCall = function asyncCall(methodName, initName, cb) {
      //   Meteor.call(methodName, initName, function (err, res) {
      //     if (err) {
      //       throw new Meteor.Error("this is a meteor error");
      //     } else {
      //       cb && cb(null, console.log('logging from within callback'));
      //     }
      //   });
      // }

      // let syncCall = Meteor.wrapAsync(asyncCall);
      // let wrapped = syncCall('getAggregate', init.name);

      var call = Promise.promisify(Meteor.call);
      call('getAggregate', init.name).then(function (result) {
        console.log('result from getAggregate', result);
      }).catch(function (err) {
        console.log('aggghhh error:', err)
      })




      // moment stuff to figure out timeLeft on initiative
      let ends = moment(init.endDate, "MM-DD-YYYY");
      let starts = moment(init.startDate, "MM-DD-YYYY");
      let now = moment(new Date);
      let timeLeft;
      // if now is after the end date, timeleft is zero, else...
      now.isAfter(ends) ? timeLeft = 0 : timeLeft = ends.diff(now, 'days');

      const agData = init.aggregateData[0] // for brevity later on
      let spendPercent = numeral((agData.spend / parseFloat(init.budget))).format("0.00%")
      // format data
      agData.spend = mastFunc.money(agData.spend);
      agData.clicks = numeral(agData.clicks).format("0,0");
      agData.impressions = numeral(agData.impressions).format("0,0");
      agData.reach = numeral(agData.reach).format("0,0");
      agData.likes = numeral(agData.likes).format("0,0");
      agData.cpc = mastFunc.money(agData.cpc);
      agData.cpm = mastFunc.money(agData.cpm);
      agData.cpl >= 0 ?
        agData.cpl = mastFunc.money(agData.cpl) :
        agData.cpl = '0';
      return {
        initiative: agData,
        ends: moment(ends).format("MM-DD-YYYY hh:mm a"),
        timeLeft: timeLeft,
        spendPercent: spendPercent
      };
    },
    'makeProjections': function () {
      let initiative = Initiatives.findOne(
        {"campaign_ids": {$in: [FlowRouter.current().params.campaign_id]}
        });
      Meteor.call('makeProjections', initiative.name, Session.get('dayNumber')); // call with initiative name and dayNumber
    },
    'getSessionDay': function () {
      let day = Session.get('dayNumber');
      return day;
    },
    'averages': () => {
      const initiative = Initiatives.findOne(
        {"campaign_ids": {$in: [FlowRouter.current().params.campaign_id]}
        });
      const ended = moment(initiative.endDate, "MM-DD-YYYY");
      const started = moment(initiative.startDate, "MM-DD-YYYY");
      const now = moment(new Date);
      let timeDiff = ended.diff(started, 'days');
      now.isAfter(ended) ? '' : timeDiff = now.diff(started, 'days');
      return {
        avgClicks: numeral(initiative.aggregateData[0].clicks / timeDiff).format("0,0"),
        avgImpressions: numeral(initiative.aggregateData[0].impressions / timeDiff).format("0,0"),
        avgLikes: numeral(initiative.aggregateData[0].likes / timeDiff).format("0,0"),
        avgSpend: numeral(initiative.aggregateData[0].spend / timeDiff).format("$0,0.00")
      }
    },
    'dataProjection': function () {
      // TODO create a master function to handle this???
      const initiative = Initiatives.findOne(
        {"campaign_ids": {$in: [FlowRouter.current().params.campaign_id]}
        });

      const agData = initiative.aggregateData[0] // for brevity
      const sesh = Session.get('dayNumber') // for brevity

      const ended = moment(initiative.endDate, "MM-DD-YYYY");
      const started = moment(initiative.startDate, "MM-DD-YYYY");
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

      return {
        clicks: projections(agData.clicks, sesh, timeDiff),
        impressions: projections(agData.impressions, sesh, timeDiff),
        likes: projections(agData.likes, sesh, timeDiff)
      }
    }

});

dash.onDestroyed(function () {
    $("#message-box").text("");
});
