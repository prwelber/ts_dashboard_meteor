import { Meteor } from 'meteor/meteor'
import MasterAccounts from '/collections/MasterAccounts';
import { TwitterAdsAPI } from 'meteor/fallentech:twitter-ads';



Meteor.methods({
  getTwitterAccounts: () => {
    MasterAccounts.remove({'data.platform': 'twitter'});

    var T = TwitterAdsAPI({
      consumer_key: Meteor.settings.consumer_key,
      consumer_secret: Meteor.settings.consumer_secret,
      access_token: Meteor.settings.access_token,
      access_token_secret: Meteor.settings.access_token_secret,
      sandbox: false
    });

    var result = T.get('accounts');
    // console.log(result.twitterBody)
    const toInsert = [];

    result.twitterBody.data.forEach(el => {
      let o = {};
      o['name'] = el.name;
      o['account_id'] = el.id;
      o['timezone'] = el.timezone;
      o['inserted'] = moment().toISOString();
      o['platform'] = 'twitter';
      toInsert.push(o);
    });

    toInsert.forEach(el => {
      MasterAccounts.insert({
        data: el
      })
    })

  }
});



Meteor.publish('accountList', function () {
    return MasterAccounts.find({'data.platform': 'twitter'});
});
