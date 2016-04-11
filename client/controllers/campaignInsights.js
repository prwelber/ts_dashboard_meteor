

Tracker.autorun(function () {
  if (FlowRouter.subsReady('campaignInsightList')) {
    // console.log('campaignInsights subs ready!');
  }
});


Template.campaignInsights.onRendered(function () {
    $('.tooltipped').tooltip({delay: 25});
});

Template.campaignInsights.events({
    'click #refresh-insights': function (event, template) {
      console.log(this);
      Meteor.call('refreshInsight', this.campaign_id, this.campaign_name, this.initiative);
      $('.tooltipped').tooltip('remove');
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
          camp.data.cpl = mastFunc.money(camp.data.cpl);
          camp.data.cpm = mastFunc.money(camp.data.cpm);
          camp.data.cpc = mastFunc.money(camp.data.cpc);
          camp.data.spend = mastFunc.money(camp.data.spend);
          if (camp.data.video_view) {
            camp.data['tenSecondView'] = camp.data['video_10_sec_watched_actions'][0]['value'];
            camp.data['costPerTenSecondView'] = mastFunc.money(camp.data['cost_per_10_sec_video_view'][0]['value']);
            camp.data['fifteenSecondView'] = camp.data['video_15_sec_watched_actions'][0]['value'];
            camp.data['avgPctWatched'] = camp.data['video_avg_pct_watched_actions'][0]['value'];
            camp.data['avgSecWatched'] = camp.data['video_avg_sec_watched_actions'][0]['value'];
            camp.data['completeWatched'] = camp.data['video_complete_watched_actions'][0]['value'];

            return [camp.data];
          } else {
            return [camp.data];
          }
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
    $('.tooltipped').tooltip('remove');
});
