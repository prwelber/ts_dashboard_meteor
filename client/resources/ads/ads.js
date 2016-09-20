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
  Session.set('sessionSorter', 'ctr');
});

Template.ads.onRendered(() => {
  $('.tooltipped').tooltip({delay: 50});
  $('.modal-trigger').leanModal();
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
  shortDate: (date) => {
    return moment(date, "YYYY-MM-DD").format("MM-DD")
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
      let keyObj = {};
      ads.forEach(ad => {
        let keyword = ad.data.keywordstats;
        // console.log(ad.data.keywordstats)
        for (let key in keyword) {
          if (!keyObj[key]) {
            keyObj[key] = {};
            keyObj[key]['impressions'] = keyword[key].impressions;
            if (!keyword[key].clicks) {
              keyObj[key]['clicks'] = 0;
            } else {
              keyObj[key]['clicks'] = keyword[key].clicks;
            }

            keyObj[key]['keyword'] = key;
            keyObj[key]['ctr'] = keyObj[key].clicks / keyObj[key].impressions;
          } else if (keyObj[key]) {
            keyObj[key]['impressions'] += keyword[key].impressions;
            if (!keyword[key].clicks) {
              keyObj[key]['clicks'] += 0;
            } else {
              keyObj[key]['clicks'] += keyword[key].clicks;
            }

            keyObj[key]['ctr'] = keyObj[key].clicks / keyObj[key].impressions;
          }
        }
      });
      for (let key in keyObj) {
        arr.push(keyObj[key]);
      }
      Template.instance().templateDict.set('keywords', arr);
      const sessionSorter = Session.get('sessionSorter');
      var sorted = arr.sort(function (a,b) {
        return b[sessionSorter] - a[sessionSorter];
      });
      return sorted;
    }
  },
  keywordCTR: (num) => {
    if (num > 0) {
      return numeral(num * 100).format('0.000');
    } else {
      return 0;
    }
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
          type: 'bar',
          zoomType: 'x'
        },
        // TODO FIX THIS
        title: {
          text: `Ad Performance`,
        },

        subtitle: {
          text: 'You can turn metrics on and off by clicking their name in the Legend below the graph.'
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
          color: '#f44336',
          visible: false
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
            text: 'Impressions vs CTR vs Post Engagement'
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
  },
  adModal: () => {
    const ad = Template.instance().templateDict.get('modal');
    if (ad) {
      return ad.data;
    } else {
      return '';
    }
  },
  keywordPerformanceChart: () => {
    const keywords = Template.instance().templateDict.get('keywords')

    if (keywords) {
      const words = [];
      const impressions = [];
      const clicks = [];
      const ctr = [];

      keywords.forEach(word => {
        words.push(word.keyword);
        impressions.push(word.impressions);
        clicks.push(word.clicks);
        ctr.push(parseFloat(numeral(word.ctr * 100).format('0.000')));
      });

      return {
        chart: {
            zoomType: 'xy'
          },
          title: {
            text: 'Keyword Performance'
          },
          subtitle: {
            text: 'Impressions vs CTR vs Clicks'
          },
          xAxis: [{
            categories: words,
            crosshair: true
          }],
          yAxis: [{ // Primary yAxis
            labels: {
              format: '{value} clicks',
              style: {
                color: Highcharts.getOptions().colors[2]
              }
            },
            title: {
              text: 'Clicks',
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
        series: [
          {
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
            name: 'Clicks',
            type: 'spline',
            data: clicks,
            tooltip: {
              valueSuffix: ' clicks'
            }
          }
        ]
      } // end of return
    } // end of if
  }
});

Template.ads.events({
  'click #refresh-ads': (event, template) => {
    const campId = event.target.dataset.id;
    Meteor.call('refreshAds', campId);
  },
  'click .modal-trigger': (event, template) => {
    const factorSpend = event.target.dataset.spend;
    const adName = event.target.textContent;
    $('#ad-modal').openModal();
    const ad = Ads.findOne({'data.name': adName});
    // set actual spend to adjusted spend
    ad.data.spend = factorSpend;
    template.templateDict.set('modal', ad);
  },
  'click .close-modal-x': (event, instance) => {
    $('#ad-modal').closeModal();
  },
  'click .keyword-table': (event, instance) => {
    let sortBy = event.target.textContent.toLowerCase();
    if (!sortBy) {
      sortBy = event.target.dataset.name.toLowerCase();
    }
    Session.set('sessionSorter', sortBy);
  }
});

Template.ads.onDestroyed(func => {
  $('.tooltipped').tooltip('remove');
});
