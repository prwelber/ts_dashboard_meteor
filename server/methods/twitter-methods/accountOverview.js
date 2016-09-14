import CampaignBasics from '/collections/CampaignBasics';
import Initiatives from '/collections/Initiatives';
import { Meteor } from 'meteor/meteor';
import { TwitterAdsAPI } from 'meteor/fallentech:twitter-ads';


Meteor.methods({
  getTwitterCampaigns: (account_id) => {
    CampaignBasics.remove({'data.account_id': account_id, 'data.platform': 'twitter'});
    console.log('account_id', account_id)
    var T = TwitterAdsAPI({
      consumer_key: Meteor.settings.consumer_key,
      consumer_secret: Meteor.settings.consumer_secret,
      access_token: Meteor.settings.access_token,
      access_token_secret: Meteor.settings.access_token_secret,
      sandbox: false
    });

    var result = T.get(`accounts/${account_id}/campaigns`, {count: 500});
    console.log('result.twitterBody', result.twitterBody)

    // may need to divide budgets by 1 million

    const toInsert = [];

    result.twitterBody.data.forEach(el => {
      let o = {};
      o['name'] = el.name;
      o['account_id'] = el.account_id;
      o['campaign_id'] = el.id;
      o['start_time'] = el.start_time;
      o['stop_time'] = el.end_time;
      o['inserted'] = moment().toISOString();
      o['platform'] = 'twitter';
      o['initiative'] = null;
      o['objective'] = null;

      toInsert.push(o);
    });

    console.log('toInsert', toInsert)

    toInsert.forEach(el => {
      CampaignBasics.insert({
        data: el
      });
    });

    if (result.twitterBody.data) {
      return 'success';
    }

  }
});

