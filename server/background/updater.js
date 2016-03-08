Meteor.methods({
  'updateInsights': function () {
    let insights = CampaignInsights.find().fetch();

    insights.forEach(el => {
      // if the campaign end date is after the inserted date
      // if true we will run update
      if (moment(el.data.date_stop, "MM-DD-YYYY hh:mm a").isAfter(moment(el.data.inserted, "MM-DD-YYYY hh:mm a"))) {
        let init = Initiatives.findOne({name: el.data.initiative});
        console.log("campaign:", el.data.campaign_name);
        console.log("initiative:", init.name);
        Meteor.call('refreshInsight', el.data.campaign_id, el.data.campaign_name, init.name);
        Meteor.call('getInsights', el.data.account_id, el.data.date_stop);
        } else {
          console.log('else block here');
        }
    });











    // SyncedCron.config({
    //     collectionName: 'cronCollection'
    // });

    // SyncedCron.add({
    //     name: 'log to the server',
    //     schedule: function (parser) {
    //         return parser.text('every 5 seconds');
    //     },
    //     job: function(intendedAt) {
    //         console.log('logging to server from job function');
    //         // console.log('job should be running at:', intendedAt);
    //     }
    // });

    // Meteor.startup(function () {
      // must start the jobs
      // SyncedCron.start();
      // will stop jobs after 15 seconds
      // Meteor.setTimeout(function() {SyncedCron.stop(); }, 15 * 1000);
    // });


  }
});
