// import CampaignInsights from '/collections/CampaignInsights';
import { Meteor } from 'meteor/meteor'
import DeviceAndPlacement from '/collections/DeviceAndPlacement';
import Initiatives from '/collections/DeviceAndPlacement';
import CampaignInsights from '/collections/CampaignInsights';
var Promise = require('bluebird');

Template.deviceAndPlacement.onCreated(function () {
  this.templateDict = new ReactiveDict();
});


Template.deviceAndPlacement.onRendered(function () {

});


Template.deviceAndPlacement.helpers({
  isReady: function (sub1, sub2) {
    console.log('isReady firing!')
    const templateDict = Template.instance().templateDict;
    const id = FlowRouter.getParam('campaign_id');

    if (FlowRouter.subsReady(sub1) && FlowRouter.subsReady(sub2)) {
      console.log('count', DeviceAndPlacement.find({'data.campaign_id': id}).count())

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
    const data = DeviceAndPlacement.find({'data.campaign_id': id}, {sort: {'data.impression_device': 1}}).fetch();
    templateDict.set('data', data);
    console.log(data);
    return data;
  }
});


Template.deviceAndPlacement.events({

});


Template.deviceAndPlacement.onDestroyed(function () {

});
