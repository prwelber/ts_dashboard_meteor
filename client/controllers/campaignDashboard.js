

Tracker.autorun(function () {
  if (FlowRouter.subsReady('campaignInsightList')) {
    console.log('campaignInsights subs ready!');
  }
});


Template.campaignDashboard.onRendered(function () {
    // console.log(this)
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
      console.log('clicks button');
      $("#dashboard-insights-button").popup({
        on: 'click'
      });
    }
});

Template.campaignDashboard.helpers({
    'fetchInsights': function () {
        console.log('checking for insights');
        let campaignNumber = FlowRouter.current().params.campaign_id;
        let camp = CampaignInsights.findOne({'data.campaign_id': campaignNumber});
        if (camp) {
          // Needed to included moment and formatting here
          // because of a deprecation warning thrown by moment
          if (moment(camp.data.inserted, "MM-DD-YYYY hh:mm a").isAfter(moment(camp.data.date_stop, "MM-DD-YYYY hh:mm a"))) {
            mastFunc.addToBox("This campaign has been updated after it ended, no need to refresh.");
          } else {
            mastFunc.addToBox("last campaignInsights refresh: "+camp.data.inserted+", refreshing will give you live stats")
          }
          // convert currency data types - may want to use underscore here
          camp.data.cpm = accounting.formatMoney(camp.data.cpm, "$", 2);
          camp.data.cpc = accounting.formatMoney(camp.data.cpc, "$", 2);
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
    'findInitiative': function () {
        // console.log(this)
        //Meteor.call('findInitiative');
    }

});

Template.campaignDashboard.onDestroyed(function () {
    $("#message-box").text("");
});
