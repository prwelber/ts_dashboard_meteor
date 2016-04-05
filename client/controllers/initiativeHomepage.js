
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
  $('.modal-trigger').leanModal({
    dismissible: true,
    opacity: .8,
    in_duration: 400,
    out_duration: 300
  });
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
    });
    return camps;
  },
  'initiative': function () {
    const initiative = Template.instance().templateDict.get('initiative');
    initiative.budget = mastFunc.money(initiative.budget);
    initiative.quantity = numeral(initiative.quantity).format("0,0");
    initiative.price = mastFunc.money(initiative.price);

    return initiative;
  },
  'initiativeStats': function () {
    const init = Template.instance().templateDict.get('initiative');
    const agData = init.aggregateData[0];
    console.log(agData);
    console.log(agData.cpl);
    const spendPercent = numeral((agData.spend / parseFloat(init.budget))).format("0.00%");
    agData['spendPercent'] = spendPercent;
    agData.spend = mastFunc.money(agData.spend);
    agData.clicks = numeral(agData.clicks).format("0,0");
    agData.impressions = numeral(agData.impressions).format("0,0");
    agData.reach = numeral(agData.reach).format("0,0");
    agData.likes = numeral(agData.likes).format("0,0");
    agData.cpc = mastFunc.money(agData.cpc);
    agData.cpm = mastFunc.money(agData.cpm);
    if (agData.cpl === null || agData.cpl === Infinity) {
      agData['cpl'] = "0";
    } else if (typeof agData.cpl === "number") {
      agData['cpl'] = mastFunc.money(agData.cpl);
    }
    console.log(agData);
    console.log(agData.cpl);
    return init.aggregateData[0];
  }
});

Template.initiativeHomepage.events({
  'click #view-initiative-stats-modal': function (event, template) {
    const initiative = Template.instance().templateDict.get('initiative');


  }
});

Template.initiativeHomepage.onDestroyed(function () {
  $('#modal1').closeModal();
});
