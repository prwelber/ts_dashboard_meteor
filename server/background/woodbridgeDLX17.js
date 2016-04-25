import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Email } from 'meteor/email';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import { Moment } from 'meteor/momentjs:moment'
import WoodbridgeDLX from '/imports/collections/WoodbridgeDLX';



SyncedCron.add({
  name: "Check Woodbridge DLX",
  schedule: function (parser) {
    // return parser.text('at 4:40pm')
    return parser.text('every 45 minutes');
  },
  job: function (intendedAt) {
    console.log('This job is scheduled to run at', intendedAt);

    const recent = WoodbridgeDLX.findOne({}, {sort: {inserted: -1}});
    const url = "https://graph.facebook.com/v2.6/6050665064452/?fields=insights,stop_time,status,name,effective_status&access_token="+token+""
    const result = HTTP.get(url, {});
    const data = result.data.insights.data[0];

    WoodbridgeDLX.insert({
      inserted: moment().toISOString(),
      spend: data.spend,
      impressions: data.impressions,
      status: result.data.status,
      effective_status: result.data.effective_status,
      readable_inserted: moment().format("MM-DD-YYYY hh:mm a")
    });


    if (data.spend - recent.spend === 0) {
      console.log('send email with warning');
      Email.send({
        to: ["cgottlieb@targetedsocial.com", "pwelber@targetedsocial.com"],
        from: "pwelber@targetedsocial.com",
        subject: "Woodbridge DLX 2017 Update",
        html: "<h2>This is an alert about the Woodbridge DLX 2017 Campaign.</h2>"+
              "<p>The difference between this spend and the most recent spend is zero.</p>"+
              "<p>API Call Status: " + result.data.status + " and Effective Status: " + result.data.effective_status + ""+
              "<p>Please check on the Campaign. This alert is the result of a function run at </p>" + moment().format("MM-DD-YYYY hh:mm a") +
              "<p>This is an automated email from the Meteor Server. Do not reply.</p>"
      });
    } else {
      console.log('send OK email')
      Email.send({
        to: "prwelber@gmail.com",
        from: "pwelber@targetedsocial.com",
        subject: "WoodbridgeDLX is running OK",
        text: "Things are OK and the status according to the API is: " + result.data.status
      });
    }
  }
});
