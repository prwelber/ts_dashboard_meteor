
Tracker.autorun(function () {
  if (FlowRouter.subsReady('campaignInsightList') && FlowRouter.subsReady('Initiatives')) {
    console.log('Insights and Initiatives subs are now ready!');
  }
});


Template.initiativeHomepage.onCreated(function () {
  this.templateDict = new ReactiveDict();
  const initiative = Initiatives.findOne({_id: FlowRouter.current().params._id});
  this.templateDict.set('initiative', initiative);

  const campaigns = CampaignInsights.find({'data.initiative': initiative.name}).fetch();
  this.templateDict.set('campaigns', campaigns);
});

Template.initiativeHomepage.onRendered(function () {
  $('.modal-trigger').leanModal({
    dismissible: true,
    opacity: .8,
    in_duration: 400,
    out_duration: 300
  });

  const initiative = Initiatives.findOne({_id: FlowRouter.current().params._id})

  Meteor.call('aggregateObjective', initiative.name);

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
    const spendPercent = numeral((agData.spend / parseFloat(init.budget))).format("0.00%");

    //function for formatting data with numeral
    const niceNum = function niceNum (data) {
      return numeral(data).format("0,0");
    }

    agData['spendPercent'] = spendPercent;
    agData.spend = mastFunc.money(agData.spend);
    agData.clicks = niceNum(agData.clicks);
    agData.impressions = niceNum(agData.impressions);
    agData.reach = niceNum(agData.reach);
    agData.likes = niceNum(agData.likes)
    agData.cpc = mastFunc.money(agData.cpc);
    agData.cpm = mastFunc.money(agData.cpm);

    if (agData.cpl === null || agData.cpl === Infinity) {
      agData['cpl'] = "0";
    } else if (typeof agData.cpl === "number") {
      agData['cpl'] = mastFunc.money(agData.cpl);
    }

    return init.aggregateData[0];
  },
  'objectiveAggregates': function () {
    const init = Template.instance().templateDict.get('initiative');
    // TODO RIGHT HERE
    const camps = Template.instance().templateDict.get('campaigns');
    console.log("campaigns", camps);
    console.log('initiative', init);
    // const campaigns = CampaignInsights.find({""})

    const returnArray = [];

    init.VIDEO_VIEWS ? returnArray.push(init.VIDEO_VIEWS[0]) : '';
    init.POST_ENGAGEMENT ? returnArray.push(init.POST_ENGAGEMENT[0]) : '';
    init.LINK_CLICKS ? returnArray.push(init.LINK_CLICKS[0]) : '';
    init.PAGE_LIKES ? returnArray.push(init.PAGE_LIKES[0]) : '';
    init.REACH ? returnArray.push(init.REACH[0]) : '';
    init.CONVERSIONS ? returnArray.push(init.CONVERSIONS[0]) : '';
    init.APP_ENGAGEMENT ? returnArray.push(init.APP_ENGAGEMENT[0]) : '';
    init.APP_INSTALLS ? returnArray.push(init.APP_INSTALLS[0]) : '';

    //function for formatting data with numeral
    const niceNum = function niceNum (data) {
      return numeral(data).format("0,0");
    }
    _.each(returnArray, function (el) {
      el.cpc = mastFunc.money(el.cpc);
      el.cpl = mastFunc.money(el.cpl);
      el.cpm = mastFunc.money(el.cpm);
      el.spend = mastFunc.money(el.spend);
      el.impressions = niceNum(el.impressions);

    });

    console.log("returnArray:", returnArray);

    return returnArray;

    // return {
    //   videoViews: init.VIDEO_VIEWS[0],
    //   postEngagement: init.POST_ENGAGEMENT[0]
    // }


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
