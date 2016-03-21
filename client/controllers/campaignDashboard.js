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

      const agData = init.aggregateData[0] // for brevity later on

      // format data
      agData.clicks = numeral(agData.clicks).format("0,0");
      agData.impressions = numeral(agData.impressions).format("0,0");
      agData.reach = numeral(agData.reach).format("0,0");
      agData.likes = numeral(agData.likes).format("0,0");
      agData.cpc = mastFunc.money(agData.cpc);
      agData.cpm = mastFunc.money(agData.cpm);
      agData.cpl = mastFunc.money(agData.cpl);
      return {
        initiative: agData,
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
      const now = moment(new Date);
      let timeDiff = ended.diff(started, 'days');
      now.isAfter(ended) ? '' : timeDiff = now.diff(started, 'days');
      return {
        avgClicks: numeral(initiative.aggregateData[0].clicks / timeDiff).format("0,0"),
        avgImpressions: numeral(initiative.aggregateData[0].impressions / timeDiff).format("0,0"),
        // TODO incorporate likes
        avgLikes: numeral(initiative.aggregateData[0].likes / timeDiff).format("0,0")
      }
    },
    'dataProjection': function () {
      // TODO create a master function to handle this???
      const camp = CampaignBasics.findOne({campaign_id: FlowRouter.current().params.campaign_id});
      const initiative = Initiatives.findOne(
        {"campaign_names": {$in: [camp.name]}
        });

      const agData = initiative.aggregateData[0] // for brevity
      const sesh = Session.get('dayNumber') // for brevity

      const ended = moment(initiative.endDate, "MM-DD-YYYY");
      const started = moment(initiative.startDate, "MM-DD-YYYY");
      const now = moment(new Date);
      let timeDiff = ended.diff(started, 'days');
      now.isAfter(ended) ? '' : timeDiff = now.diff(started, 'days');
      console.log('timeDiff for projections', timeDiff);

      let avgClicks = agData.clicks / timeDiff;
      let avgImpressions = agData.impressions / timeDiff;
      let avgLikes = agData.likes / timeDiff;
      console.log('avgClicks', avgClicks);

      let projectedClicks = agData.clicks + (sesh * avgClicks);
      let projectedImpressions = agData.impressions + (sesh * avgImpressions);
      let projectedLikes = agData.likes + (sesh * avgLikes);

      console.log('projectedClicks', projectedClicks);
      return {
        clicks: numeral(projectedClicks).format("0,0"),
        impressions: numeral(projectedImpressions).format("0,0"),
        likes: numeral(projectedLikes).format("0,0")
      }

    }

});

dash.onDestroyed(function () {
    $("#message-box").text("");
});
