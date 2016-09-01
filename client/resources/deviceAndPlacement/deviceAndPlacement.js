// import CampaignInsights from '/collections/CampaignInsights';
import { Meteor } from 'meteor/meteor'
import DeviceAndPlacement from '/collections/DeviceAndPlacement';
import Initiatives from '/collections/DeviceAndPlacement';
import CampaignInsights from '/collections/CampaignInsights';
var Promise = require('bluebird');
import { formatters as fmt } from '/both/utilityFunctions/formatters';

// learned map reduce!
const mapReduceDevice = function mapReduceDevice (device, metric, items) {

  const toReturn = items.map(el => {

      if (el.data.impression_device === device) {
        return el.data[metric];
      } else {
        return 0;
      }
    }).reduce((prev, curr) => {
      return prev + curr;
    }, 0);
    return toReturn;
}

const mapReducePlacement = function mapReducePlacement (placement, metric, items) {
  let pattern = placement
  if (placement === 'desktop') {
    pattern = 'desktop|right'
  }

  const re = new RegExp(pattern)

  const toReturn = items.map(el => {

      if (re.test(el.data.placement) === true) {
        return el.data[metric];
      } else {
        return 0;
      }
    }).reduce((prev, curr) => {
      return prev + curr;
    }, 0);
    return toReturn;
}



Template.deviceAndPlacement.onCreated(function () {
  this.templateDict = new ReactiveDict();
});


Template.deviceAndPlacement.onRendered(function () {
  $('.tooltipped').tooltip({delay: 25});
});

Template.deviceAndPlacement.helpers({
  isReady: function (sub1, sub2) {
    const templateDict = Template.instance().templateDict;
    const id = FlowRouter.getParam('campaign_id');

    if (FlowRouter.subsReady(sub1) && FlowRouter.subsReady(sub2)) {

      if (DeviceAndPlacement.find({'data.campaign_id': id}).count() === 0) {
        var call = Promise.promisify(Meteor.call);
        call('getDeviceBreakdown', id)
        .then(function (result) {
          Blaze.remove(spun);
          return true;
        }).catch(function (err) {
          console.log('uh no error', err)
        });
      }
      return true;
    }
  },
  getData: () => {
    const templateDict = Template.instance().templateDict;
    const id = FlowRouter.getParam('campaign_id');
    const data = DeviceAndPlacement.find({'data.campaign_id': id}, {sort: {'data.impressions': -1}}).fetch();
    templateDict.set('data', data);
    return data;
  },
  deviceData: () => {
    const data = Template.instance().templateDict.get('data');
    const arr = [];
    let o = {};

    o['iphoneImpressions'] = mapReduceDevice('iphone', 'impressions', data);
    o['iphoneClicks'] = mapReduceDevice('iphone', 'clicks', data);
    o['androidImpressions'] = mapReduceDevice('android_smartphone', 'impressions', data);
    o['androidClicks'] = mapReduceDevice('android_smartphone', 'clicks', data);
    o['desktopImpressions'] = mapReduceDevice('desktop', 'impressions', data);
    o['desktopClicks'] = mapReduceDevice('desktop', 'clicks', data);
    o['ipadImpressions'] = mapReduceDevice('ipad', 'impressions', data);
    o['ipadClicks'] = mapReduceDevice('ipad', 'clicks', data);
    return o;
  },
  placementData: () => {
    const data = Template.instance().templateDict.get('data');
    const arr = [];
    let o = {};
    o['desktopImpressions'] = mapReducePlacement('desktop', 'impressions', data);
    o['desktopClicks'] = mapReducePlacement('desktop', 'clicks', data);
    o['mobileImpressions'] = mapReducePlacement('mobile', 'impressions', data);
    o['mobileClicks'] = mapReducePlacement('mobile', 'clicks', data);
    o['instagramImpressions'] = mapReducePlacement('instagramstream', 'impressions', data);
    o['instagramClicks'] = mapReducePlacement('instagramstream', 'clicks', data);
    return o;
  },
  money: (num) => {
    return fmt.money(num);
  },
  num: (num) => {
    return fmt.num(num);
  },
  remove_: (str) => {
    return str.replace(/_/g, " ");
  },
  pieChartImpressions: () => {
    const data = Template.instance().templateDict.get('data');

    const chartArray = [];
    data.forEach(el => {
      let o = {};
      if (parseFloat(el.data.impressions) >= 1000) {
        o['name'] = `${el.data.impression_device} on ${el.data.placement}`;
        o.name.replace(/_/g, " ");
        o['y'] = el.data.impressions;
        chartArray.push(o);
      }
    });

    return {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        // height: 325
      },
      title: {
        text: 'Impression Device + Placement Share of Impressions'
      },
      tooltip: {
        pointFormat: '<b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '{point.percentage:.1f} %',
            style: {
              color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
            }
          }
        }
      },
      series: [{
        colorByPoint: true,
        data: chartArray
      }]
    }
  },
  pieDevice: () => {
    const data = Template.instance().templateDict.get('data');
    const realData = data.map(el => {
      return el.data;
    });
    const chartArray = [];

    var desktop = _.where(realData, {impression_device: 'desktop'});
    var iphone = _.where(realData, {impression_device: 'iphone'});
    var androidPhone = _.where(realData, {impression_device: 'android_smartphone'})
    var other = _.where(realData, {impression_device: 'other'});
    var ipad = _.where(realData, {impression_device: 'ipad'});
    var androidTablet = _.where(realData, {impression_device: 'android_tablet'});

    var arrayOfDevices = [desktop, iphone, androidPhone, other, ipad, androidTablet];

    /*
    * Below, we are looping over arrayOfDevices and mapping each
    * element, returning just the impressions, and then adding them up
    * with a reduce function. We also assign the name and the impression
    * number to an object which we push into an array that is to be charted
    */

    for (let i = 0; i < arrayOfDevices.length; i++) {
      if (arrayOfDevices[i].length === 0) {
        continue;
      }
      let name = arrayOfDevices[i][0].impression_device;

      let o = {
        name: name
      };

      let blank = arrayOfDevices[i].map(obj => {
        return obj.impressions;
      }).reduce((prev, curr) => {
        return prev + curr
      }, 0);

      o['y'] = blank;

      chartArray.push(o);
    }

    return {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        height: 300
      },
      title: {
        text: 'Share of Impressions by Device'
      },
      tooltip: {
        pointFormat: '<b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '{point.percentage:.1f} %',
            style: {
              color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
            }
          }
        }
      },
      series: [{
        colorByPoint: true,
        data: chartArray
      }]
    }
  },
  piePlacement: () => {
    const data = Template.instance().templateDict.get('data');
    const realData = data.map(el => {
      return el.data;
    });
    const otherArray = [];

    var mobile = _.where(realData, {placement: 'mobile_feed'});
    var insta = _.where(realData, {placement: 'instagramstream'});
    var rightHand = _.where(realData, {placement: 'right_hand'})
    var desk = _.where(realData, {placement: 'desktop_feed'});
    var mobileExternal = _.where(realData, {placement: 'mobile_external_only'});
    var mobileVideo = _.where(realData, {placement: 'mobile_video_channel'});
    var desktopVideo = _.where(realData, {placement: 'desktop_video_channel'});

    // concat desk and rightHand
    var allDesktop = rightHand.concat(desk)

    var arrayOfPlacements = [mobile, insta, mobileExternal, allDesktop, mobileVideo, desktopVideo];

    /*
    * Below, we are looping over arrayOfPlacements and mapping each
    * element, returning just the impressions, and then adding them up
    * with a reduce function. We also assign the name and the impression
    * number to an object which we push into an array that is to be charted
    */

    for (let i = 0; i < arrayOfPlacements.length; i++) {
      if (arrayOfPlacements[i].length === 0) {
        continue;
      }
      let name = arrayOfPlacements[i][0].placement;
      name === 'right_hand' ? name = 'desktop' : '';

      let o = {
        name: name
      };

      let blank = arrayOfPlacements[i].map(obj => {
        return obj.impressions;
      }).reduce((prev, curr) => {
        return prev + curr
      }, 0);

      o['y'] = blank;

      otherArray.push(o);
    }

    return {

      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        height: 300
      },
      title: {
        text: 'Share of Impressions by Placement'
      },
      tooltip: {
        pointFormat: '<b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '{point.percentage:.1f} %',
            style: {
              color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
            }
          }
        }
      },
      series: [{
        colorByPoint: true,
        data: otherArray
      }]
    }
  },
  campaign: () => {
    const id = FlowRouter.getParam('campaign_id');
    const camp = CampaignInsights.findOne({'data.campaign_id': id});
    if (camp) {
      return camp.data;
    }
  }
});


Template.deviceAndPlacement.events({
  'click #refresh-device-placement': (event, template) => {
    event.preventDefault();
    const id = FlowRouter.getParam('campaign_id');
    Meteor.call('refreshDevice', id);
  }
});


Template.deviceAndPlacement.onDestroyed(function () {

});
