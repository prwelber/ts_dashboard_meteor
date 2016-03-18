let dash = Template.campaignDashboard;

Tracker.autorun(function () {
  if (FlowRouter.subsReady('campaignInsightList')) {
    console.log('campaignInsights subs ready!');
  }
  if (FlowRouter.subsReady('Initiatives')) {
    console.log('Initiatives subs ready!');
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
        let camp = CampaignBasics.findOne({campaign_id: FlowRouter.current().params.campaign_id});
        // get campaign name and then use it to find the initiative
        let initiative = Initiatives.findOne(
          {"campaign_names": {$in: [camp.name]}
        });
        return initiative;
    },
    'getAggregate': function () {
      let camp = CampaignBasics.findOne({campaign_id: FlowRouter.current().params.campaign_id});
      // get campaign name and then use it to find the initiative
      let init = Initiatives.findOne(
        {"campaign_names": {$in: [camp.name]}
      });
      Meteor.call('getAggregate', init.name);
      // moment stuff to figure out timeLeft on initiative
      let ends = moment(init.endDate, "MM-DD-YYYY");
      let starts = moment(init.startDate, "MM-DD-YYYY"); 
      let now = moment(new Date);
      let timeLeft;
      // if now is after the end date, timeleft is zero, else...
      now.isAfter(ends) ? timeLeft = 0 : timeLeft = ends.diff(now, 'days');
      // format currency data
      init.aggregateData[0].cpc = mastFunc.money(init.aggregateData[0].cpc);
      init.aggregateData[0].cpm = mastFunc.money(init.aggregateData[0].cpm);
      return {
        initiative: init.aggregateData[0],
        ends: moment(ends).format("MM-DD-YYYY hh:mm a"),
        timeLeft: timeLeft
      };
    },
    'makeProjections': function () {
      let camp = CampaignBasics.findOne({campaign_id: FlowRouter.current().params.campaign_id});
      let initiative = Initiatives.findOne(
        {"campaign_names": {$in: [camp.name]}
        });
      Meteor.call('makeProjections', initiative.name, Session.get('dayNumber')); // call with initiative name and dayNumber
    },
    'getSessionDay': function () {
      let day = Session.get('dayNumber');
      return day;
    },
    'averages': () => {
      const camp = CampaignBasics.findOne({campaign_id: FlowRouter.current().params.campaign_id});
      const initiative = Initiatives.findOne(
        {"campaign_names": {$in: [camp.name]}
        });
      const ended = moment(initiative.endDate, "MM-DD-YYYY");
      const started = moment(initiative.startDate, "MM-DD-YYYY");
      const timeDiff = ended.diff(started, 'days');
      // console.log(timeDiff)
      return {
        avgClicks: initiative.aggregateData[0].clicks / timeDiff,
        avgImpressions: initiative.aggregateData[0].impressions / timeDiff,
        // TODO incorporate likes
        avgLikes: 10
      }
    },
    'clicksProjection': function () {
      // TODO create a master function to handle this???
      const camp = CampaignBasics.findOne({campaign_id: FlowRouter.current().params.campaign_id});
      const initiative = Initiatives.findOne(
        {"campaign_names": {$in: [camp.name]}
        });
      const ended = moment(initiative.endDate, "MM-DD-YYYY");
      const started = moment(initiative.startDate, "MM-DD-YYYY");
      const now = moment(new Date);
      let timeDiff = ended.diff(started, 'days');
      now.isAfter(ended) ? '' : timeDiff = now.diff(started, 'days');
      let avgClicks = initiative.aggregateData[0].clicks / timeDiff;
      return initiative.aggregateData[0].clicks + (Session.get('dayNumber') * avgClicks);

    }

});

dash.onDestroyed(function () {
    $("#message-box").text("");
});
