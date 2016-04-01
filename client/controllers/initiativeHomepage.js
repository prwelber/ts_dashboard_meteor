
Tracker.autorun(function () {
  if (FlowRouter.subsReady('campaignInsightList') && FlowRouter.subsReady('Initiatives')) {
    console.log('Insights and Initiatives subs are now ready!');
  }
});


Template.initiativeHomepage.onCreated(function () {
  this.templateDict = new ReactiveDict();
  const initiative = Initiatives.findOne({_id: FlowRouter.current().params._id});
  this.templateDict.set('initiative', initiative);
});

Template.initiativeHomepage.onRendered(function () {

});

Template.initiativeHomepage.helpers({
  // need to gather all the campaigns associated with this initiative
  'getCampaigns': function () {
    const init = Template.instance().templateDict.get('initiative');
    const camps = CampaignInsights.find(
      {'data.initiative': init.name},
      {sort: {
        'data.date_stop': -1
      }
    })
    return camps;
  },
  'initiative': function () {
    return Template.instance().templateDict.get('initiative');
  }
});

Template.initiativeHomepage.events({

});
