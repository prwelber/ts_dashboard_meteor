import { Meteor } from 'meteor/meteor'

// can use Meteor.settings if you run meteor with "meteor run --settings settings.json"

var appId = Meteor.settings.facebookAppId;
var secret = Meteor.settings.facebookSecret;
console.log("appId", appId)
console.log("secret", secret)
ServiceConfiguration.configurations.remove({
    service: 'facebook'
});

ServiceConfiguration.configurations.insert({
    service: 'facebook',
    appId: appId,
    secret: secret
});
