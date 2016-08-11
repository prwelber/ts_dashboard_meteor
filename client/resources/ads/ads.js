import CampaignInsights from '/collections/CampaignInsights'
import Initiatives from '/collections/Initiatives'
import Ads from '/collections/Ads'
const Promise = require('bluebird');
import mastFunc from '../masterFunctions';
import { getLineItem } from '/both/utilityFunctions/getLineItem';


// -------------- FUNCTIONS -------------- //
const stringToCostPlusPercentage = function stringToCostPlusPercentage (num) {
  num = num.toString().split('');
  num.unshift(".");
  num = 1 + parseFloat(num.join(''));
  return num;
}

const defineAction = function defineAction (init, index) {
  let action;
  init.lineItems[index].dealType === "CPC" ? action = "clicks" : '';
  init.lineItems[index].dealType === "CPM" ? action = "impressions" : '';
  init.lineItems[index].dealType === "CPL" ? action = "like" : '';
  init.lineItems[index].dealType === "CPVV" ? action = "video_view" : '';
  return action;
}

// ------------ END FUNCTIONS -------------- //


Template.ads.onCreated(function () {
  this.templateDict = new ReactiveDict();
  const campaign = CampaignInsights.findOne({'data.campaign_id': FlowRouter.getParam('campaign_id')});
  const init = Initiatives.findOne({name: campaign.data.initiative});
  this.templateDict.set('camp', campaign);
  this.templateDict.set('init', init);
  this.templateDict.set('ads', null);
});

Template.ads.onRendered(() => {
  $('.tooltipped').tooltip({delay: 50});
});

Template.ads.helpers({
  isReady: (sub) => {
    const campaignNumber = FlowRouter.current().params.campaign_id;

    if (FlowRouter.subsReady(sub) && Ads.find({'data.campaign_id': campaignNumber}).count() === 0) {

      var target = document.getElementById("spinner-div");
      let spun = Blaze.render(Template.spin, target);

      var call = Promise.promisify(Meteor.call);
      call('getAds', campaignNumber)
      .then(function (result) {
        Blaze.remove(spun);
      }).catch(function (err) {
        console.log('uh no error', err)
      });
    } else {
      return true;
    }
  },
  'getAds': function () {
    const campaignNumber = FlowRouter.current().params.campaign_id;
    const init = Template.instance().templateDict.get('init');
    const camp = Template.instance().templateDict.get('camp');

    if (Ads.find({'data.campaign_id': campaignNumber}).count() >= 1) {
      let ads = Ads.find({'data.campaign_id': campaignNumber}, {sort: {'data.name': 1}}).fetch();
      Template.instance().templateDict.set('ads', ads)

      try {

        if (init.lineItems[0].cost_plus === true) {
          const costPlusPercent = stringToCostPlusPercentage(init.lineItems[0].costPlusPercent);
          let adSpend = 0;
          ads.forEach((ad) => {
            adSpend = accounting.unformat(ad.data.spend) * costPlusPercent;
            ad.data.spend = adSpend;
            ad.data.cpm = adSpend / (ad.data.impressions / 1000);
            ad.data.cpc = adSpend / ad.data.clicks;
            ad.data.cpl = adSpend / ad.data.like;
            ad.data['cost_per_total_action'] = adSpend / ad.data.total_actions;
            ad.data.cost_per_video_view = adSpend / ad.data.video_view;
            ad.data.cost_per_post_engagement = adSpend / ad.data.post_engagement;
            ad.data.cost_per_post_like = adSpend / ad.data.post_like;
            ad.data.cost_per_link_click = adSpend / ad.data.link_click;
            ad.data.cost_per_website_clicks = adSpend / ad.data.website_clicks;
          });
          return ads;
        } else if (init.lineItems[0].percent_total === true) {
          // get the objective of the campaign and match it to the objective
          // from the initiative
          // then get the spend for that objective
          const item = getLineItem.getLineItem(camp.data, init);
          const index = item.name.substring(item.name.length - 1, item.name.length) - 1;
          const objective = getLineItem.getLineItem(camp.data, init).objective.toUpperCase();
          const allCapsObjective = objective.replace(/ /g, '_');
          const factorData = init[allCapsObjective]['net'];

          const deal = getLineItem.getLineItem(camp.data, init).dealType.toLowerCase();
          let action = defineAction(init, index);
          let adSpend = 0;
          ads.forEach((ad) => {
            if (item.dealType === "CPM") {
              adSpend = (ad.data.impressions / 1000) * factorData['client_' + deal];
            } else {
              adSpend = ad.data[action] * factorData['client_' + deal];
            }
            ad.data.spend = adSpend;
            // ad.data.cpm = adSpend / (ad.data.impressions / 1000);
            // ad.data.cpc = adSpend / ad.data.clicks;
            // ad.data.cpl = adSpend / ad.data.like;
            // ad.data['cost_per_total_action'] = adSpend / ad.data.total_actions;
            // ad.data.cost_per_video_view = adSpend / ad.data.video_view;
            // ad.data.cost_per_post_engagement = adSpend / ad.data.post_engagement;
            // ad.data.cost_per_post_like = adSpend / ad.data.post_like;
            // ad.data.cost_per_link_click = adSpend / ad.data.link_click;
            // ad.data.cost_per_website_clicks = adSpend / ad.data.website_clicks;
          });
          return ads;
        } else {
          return '';
        }
      } catch (e) {
        console.log("Error in ads controller", e);
      }
    }
  },
  money: (num) => {
    return mastFunc.money(num);
  },
  'getCampaignNumber': function () {
      let campaignNumber = FlowRouter.current().params.campaign_id;
      return campaignNumber;
  },
  number: (num) => {
    if (num === NaN) {
      return 0;
    }
    return mastFunc.num(num);
  },
  shortenMessage: (string) => {
    if (string) {
      return string.substring(0, 35)
    }
  },
  shortenCTR: (num) => {
    return numeral(num).format('0.000');
  },
  getKeywordstats: () => {
    const ads = Template.instance().templateDict.get('ads');
    // console.log('ads', ads)

    if (ads) {
      const arr = [];
      ads.forEach(ad => {
        let keyword = ad.data.keywordstats;
        // console.log(ad.data.keywordstats)
        for (let key in keyword) {
          let keywordObj = {};
          keywordObj = {
            'adName': ad.data.name,
            'word': key,
            'impressions': keyword[key]['impressions'],
            'clicks': keyword[key]['clicks']
          }
          arr.push(keywordObj);
        }
      });
      return arr;
    }
  },
  keywordChart: () => {
    const ads = Template.instance().templateDict.get('ads');
    const arr = [];
    const adNames = [];
    const words = [];
    const impressions = [];
    const clicks = [];
    if (ads) {

      ads.forEach(ad => {
        let keyword = ad.data.keywordstats;
        // console.log(ad.data.keywordstats)
        adNames.push(ad.data.name);
        for (let key in keyword) {
          let keywordObj = {};
          keywordObj = {
            'adName': ad.data.name,
            'word': key,
            'impressions': keyword[key]['impressions'],
            'clicks': keyword[key]['clicks']
          }
          arr.push(keywordObj);
        }
      });
      // console.log("ARR", arr);
      // return arr;


      chartArr = arr.map(el => {
        return {
          name: el.word,
          data: parseFloat(el.impressions),
        }
      });
      // console.log('chartArr', chartArr)

      // i want an array of objects, each object has the name of the keyword
      // and it has an array inside of it with the data points for impressions


      // object needs name, data
    const testArr = [];
    for (let i = 0; i <= 14; i++) {
      let tracker = {};
      let impArr = [];

      let result = _.where(arr, {word: arr[i]['word']})
      tracker['name'] = result[0]['word']
      result.forEach(el => {
        impArr.push(el.impressions)
      });
      tracker['data'] = impArr;
      testArr.push(tracker)

    }

    return {
      chart: {
        zoomType: 'x'
      },
      // TODO FIX THIS
      title: {
        text: `Keyword Impressions Performance`,
      },

      subtitle: {
        text: document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
      },

      tooltip: {
        // valueSuffix: " " + type,
        shared: true,
        crosshairs: true
      },
      xAxis: {
        categories: adNames
      },

      yAxis: {
        title: {
          text: 'Impressions'
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },

      plotOptions: { // removes the markers along the plot lines
        series: {
          marker: {
            enabled: false
          }
        }
      },
      series: testArr
    }

    } // end of if


  },
  keywordClicksChart: () => {
    const ads = Template.instance().templateDict.get('ads');
    const arr = [];
    const adNames = [];
    const words = [];
    if (ads) {

      ads.forEach(ad => {
        let keyword = ad.data.keywordstats;
        // console.log(ad.data.keywordstats)
        adNames.push(ad.data.name);
        for (let key in keyword) {
          let keywordObj = {};
          keywordObj = {
            'adName': ad.data.name,
            'word': key,
            'clicks': keyword[key]['clicks']
          }
          arr.push(keywordObj);
        }
      });

      // i want an array of objects, each object has the name of the keyword
      // and it has an array inside of it with the data points for impressions


      // object needs name, data
    const testArr = [];
    for (let i = 0; i <= 14; i++) {
      let tracker = {};
      let clicksArr = [];

      let result = _.where(arr, {word: arr[i]['word']})
      tracker['name'] = result[0]['word']
      result.forEach(el => {
        clicksArr.push(el.clicks);
      });
      tracker['data'] = clicksArr;
      testArr.push(tracker)
    }

    return {
      chart: {
        zoomType: 'x'
      },
      // TODO FIX THIS
      title: {
        text: `Keyword Clicks Performance`,
      },

      subtitle: {
        text: document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
      },

      tooltip: {
        // valueSuffix: " " + type,
        shared: true,
        crosshairs: true
      },
      xAxis: {
        categories: adNames
      },

      yAxis: {
        title: {
          text: 'Clicks'
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },

      plotOptions: { // removes the markers along the plot lines
        series: {
          marker: {
            enabled: false
          }
        }
      },
      series: testArr
    }

    } // end of if


  },
  adCreativeChart: () => {
    const ads = Template.instance().templateDict.get('ads');
    const names = [];
    const impressions = [];
    const clicks = [];
    const videoView = [];
    const actions = [];
    const ctr = [];
    if (ads) {
      ads.forEach(ad => {
        names.push(ad.data.name);
        if (! ad.data.impressions || ad.data.clicks === NaN) {
          impressions.push(0)
        } else {
          impressions.push(parseFloat(ad.data.impressions));
        }
        if (! ad.data.clicks || ad.data.clicks === NaN) {
          clicks.push(0)
        } else {
          clicks.push(ad.data.clicks);
        }
        if (ad.data.video_view) {
          videoView.push(ad.data.video_view);
        }
        actions.push(ad.data.total_actions);
        ctr.push(parseFloat(numeral(ad.data.ctr).format('0.000')));
      });

      return {
        chart: {
          zoomType: 'x'
        },
        // TODO FIX THIS
        title: {
          text: `Ad Performance`,
        },

        subtitle: {
          text: document.ontouchstart === undefined ? 'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
        },

        tooltip: {
          // valueSuffix: " " + type,
          shared: true,
          crosshairs: true
        },
        xAxis: {
          categories: names
        },

        yAxis: {
          title: {
            // text: type
          },
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }]
        },

        plotOptions: { // removes the markers along the plot lines
          series: {
            marker: {
              enabled: false
            }
          }
        },
        series: [
        {
          name: 'Impressions',
          data: impressions,
          color: '#f44336'
        },
        {
          name: 'Clicks',
          data: clicks,
          color: '#3f51b5'
        },
        {
          name: 'Video View',
          data: videoView,
          color: '#009688'
        },
        {
          name: 'Actions',
          data: actions,
          color: '#4caf50'
        },
        {
          name: 'CTR',
          data: ctr,
          color: '#ef6c00'
        }]
      }
    }
  },
  adPerformanceChart: () => {

    const ads = Template.instance().templateDict.get('ads');
    const names = [];
    const impressions = [];
    const postEngagement = [];
    // const videoView = [];
    const ctr = [];
    if (ads) {
      ads.forEach(ad => {
        names.push(ad.data.name);
        if (! ad.data.impressions || ad.data.clicks === NaN) {
          impressions.push(0)
        } else {
          impressions.push(parseFloat(ad.data.impressions));
        }
        if (! ad.data.post_engagement || ad.data.post_engagement === NaN) {
          postEngagement.push(0)
        } else {
          postEngagement.push(ad.data.post_engagement);
        }

        ctr.push(parseFloat(numeral(ad.data.ctr).format('0.000')));
      });
    }

    return {
      chart: {
            zoomType: 'xy'
        },
        title: {
            text: 'Impressions vs CTR vs Clicks'
        },
        xAxis: [{
            categories: names,
            crosshair: true
        }],
        yAxis: [{ // Primary yAxis
            labels: {
                format: '{value} post engs',
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
            },
            title: {
                text: 'Post Engagement',
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
            },
            opposite: true

        }, { // Secondary yAxis
            gridLineWidth: 0,
            title: {
                text: 'Impressions',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            labels: {
                format: '{value} impressions',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            }

        }, { // Tertiary yAxis
            gridLineWidth: 0,
            title: {
                text: 'CTR',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            labels: {
                format: '{value}%',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            opposite: true
        }],
        tooltip: {
            shared: true
        },
        series: [{
            name: 'Impressions',
            type: 'column',
            yAxis: 1,
            data: impressions,
            tooltip: {
                valueSuffix: ' impressions'
            }

        }, {
            name: 'CTR',
            type: 'spline',
            yAxis: 2,
            data: ctr,
            marker: {
                enabled: false
            },
            dashStyle: 'shortdot',
            tooltip: {
                valueSuffix: '%'
            }

        }, {
            name: 'Post Engagement',
            type: 'spline',
            data: postEngagement,
            tooltip: {
                valueSuffix: ' post engs'
            }
        }]
    }
  }
});

Template.ads.events({
  'click #refresh-ads': (event, template) => {
    const campId = event.target.dataset.id;
    Meteor.call('refreshAds', campId);
  }
});

Template.ads.onDestroyed(func => {
  $('.tooltipped').tooltip('remove');
});
