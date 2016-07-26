import Initiatives from '/collections/Initiatives';
import moment from 'moment-timezone';
import webshot from 'webshot';
var fs = require('fs');
var Future  = Npm.require('fibers/future');
import { formatters } from '/both/utilityFunctions/formatters';

Meteor.methods({
  'generatePDF': (info, init) => {
    console.log("INFO", info)
    var fut = new Future();

    var fileName = info.initiative + "_IO.pdf";

    // GENERATE HTML STRING
    var css = Assets.getText('pdf/style.css');

    SSR.compileTemplate('layout', Assets.getText('pdf/layout.html'));

    Template.layout.helpers({
      getDocType: function() {
        return "<!DOCTYPE html>";
      },
      info: function() {
        return info;
      },
      init: function() {
        return init.lineItems;
      },
      time: function (timeString) {
        return moment(timeString, moment.ISO_8601).format('MM/DD/YYYY');
      },
      num: function (number) {
        return formatters.num(number);
      },
      money: function (num) {
        return formatters.money(num);
      },
      notes: function () {
        if (info.notes) {
          return "Notes: " + info.notes;
        }
      },
      placement: (num) => {
        return info.itemObject[num].select;
      },
      URL: (num) => {
        return info.itemObject[num].url;
      },
      targeting: function () {
        if (info.targeting) {
          return "Targeting: " + info.targeting;
        }
      },
      total: function () {
        const items = init.lineItems;
        let total = 0;
        items.forEach(item => {
          if (item.price) {
            total += parseFloat(item.budget);
          }
        });
        return total;
      },
      absoluteURL: function (url) {
        console.log("URL", Meteor.absoluteUrl(url));
        return Meteor.absoluteUrl(url);
      }
    });

    // SSR.compileTemplate('test_io', Assets.getText('pdf/io.html'));

    // PREPARE DATA
    // var inits = Initiatives.findOne({name: "Woodbridge DLX FY '17"});
    // var data = {
    //   init: inits
    // }

    var html_string = SSR.render('layout', {
      css: css,
      template: "layout",
      // data: data
    });

    // console.log("THIS IS AN HTML_STRING", html_string);

    // Setup Webshot options
    var options = {
      "paperSize": {
         "format": "A4",
         "orientation": "landscape",
         "margin": "1cm"
       },
       siteType: 'html',
       renderDelay: 100
    };

    webshot(html_string, fileName, options, function(err) {
      fs.readFile(fileName, function (err, data) {
         if (err) {
            return console.log(err);
         }

         fs.unlinkSync(fileName);
         fut.return(data);
      });
    });

    let pdfData = fut.wait();
    let base64String = new Buffer(pdfData).toString('base64');

    return base64String;


  }
});
