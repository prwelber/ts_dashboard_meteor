

Tracker.autorun(function () {
  if (FlowRouter.subsReady('campaignInsightList')) {
    // console.log('campaignInsights subs ready!');
  }
});


Template.campaignInsights.onRendered(function () {
    // console.log(this)
});

Template.campaignInsights.events({
    'click #refresh-insights': function (event, template) {
      console.log(this);
      Meteor.call('refreshInsight', this.campaign_id, this.campaign_name, this.initiative);
      $("#message-box li").remove();
    },
    'click .setSessionCampName': function () {
      Session.set("campaign_name", this.campaign_name);
    }
});

Template.campaignInsights.helpers({
    'fetchInsights': function () {
        console.log('checking for insights');
        const campaignNumber = FlowRouter.current().params.campaign_id;
        let camp = CampaignInsights.findOne({'data.campaign_id': campaignNumber});
        if (camp) {
          // convert currency data types - may want to use underscore here
          camp.data.impressions = numeral(camp.data.impressions).format("0,0");
          camp.data.ctr = camp.data.ctr.toString().substr(0,5);
          camp.data.frequency = numeral(camp.data.frequency).format("0,0.00");
          camp.data.cpl = accounting.formatMoney(camp.data.cpl, "$", 2);
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

Template.campaignInsights.onDestroyed(function () {
    $("#message-box").text("");
});
