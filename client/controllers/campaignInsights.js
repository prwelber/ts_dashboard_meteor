// Meteor.subscribe('campaignInsightList', {
//     onReady: function () {
//         console.log('campaignInsights are ready!');
//     }
// });
// Doing this in FlowRouter

Tracker.autorun(function () {
  if (FlowRouter.subsReady('campaignInsightList')) {
    console.log('campaignInsights subs ready!')
  }
});


Template.campaignInsights.onRendered(function () {
    // console.log(this)
});

Template.campaignInsights.events({
    'click .report-button': function () {
      let node = document.getElementsByClassName("reporting-div")[0];
      reporter = Blaze.render(Template.reporter, node);
    },
    'click #refresh-insights': function (event, template) {
      console.log(this.campaign_id);
      Meteor.call('refreshInsight', this.campaign_id);
      $("#message-box li").remove();
    },
    'click .setSessionCampName': function () {
      Session.set("campaign_name", this.campaign_name);
    }
});

Template.campaignInsights.helpers({
    'fetchInsights': function () {
        console.log('checking for insights');
        let campaignNumber = FlowRouter.current().params.campaign_id;
        let camp = CampaignInsights.findOne({'data.campaign_id': campaignNumber});
        if (camp) {
          console.log('you should be seeing insights');
          // initiative = Initiatives.findOne({name: camp.campaign_name});
          if (camp.data.inserted > camp.data.date_stop) {
            addToBox("This campaign has been updated after it ended, no need to refresh.");
          } else {
            addToBox("last campaignInsights refresh: "+camp.data.inserted+", refreshing will give you live stats")
          }
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
    'showInitiative': function () {
        // return initiative
    }

});

Template.campaignInsights.onDestroyed(function () {
    $("#message-box").text("");
});
