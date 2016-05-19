import { Meteor } from 'meteor/meteor'
import { FlowRouter } from 'meteor/kadira:flow-router'
import CampaignInsights from '/collections/CampaignInsights'
import Initiatives from '/collections/Initiatives'
import dragula from 'dragula'
import { initiativesFunctionObject } from './initiativesFuncs'

Tracker.autorun(function () {
    if (FlowRouter.subsReady('Initiatives') && FlowRouter.subsReady('campaignInsightList')) {
        // console.log('Initiatives and Insights subs ready!');
    }
});

// Template.initiativeStats.helpers({
//     'getInitiativeStats': function (template) {
//         camp_id = Session.get("campaign_id");
//         let initiative = Initiatives.findOne({campaign_id: camp_id});
//         return initiative;
//     }
// });

Template.initiatives.helpers({
    'getInitiatives': function () {
      let inits =  Initiatives.find().fetch();
      inits.forEach(el => {
        el.startDate = moment(el.startDate).format("MM-DD-YYYY");
      });
      return inits;
    }
});

Template.initiative.helpers({
    'getInitiative': function () {
      return Initiatives.findOne({_id: FlowRouter.current().params._id})
    }
});

Template.initiative.events({
    'click #edit-initiative-button': function (event) {
        FlowRouter.go('/admin/initiatives/'+this._id+'/edit');
    },
    'click #delete-initiative': function (event, template) {
      console.log(this._id)
      Meteor.call('deleteInitiative', this._id, function( err, res ) {
        if (res) {
          Materialize.toast('Initiative Deleted', 2500);
        }
      });
    }
});



Template.initiativeAggregate.helpers({
    'showAggregate': function () {
        let init = Initiatives.findOne({_id: FlowRouter.current().params._id});
        Meteor.call('getAggregate', init.name, (error, result) => {
            if (result) {

            }
        });
        let ends = moment(init.endDate, "MM-DD-YYYY");
        let timeLeft = ends.diff(moment(new Date), 'days')

        // format currency data
        init.aggregateData.cpc = mastFunc.money(init.aggregateData.cpc);
        init.aggregateData.cpm = mastFunc.money(init.aggregateData.cpm);
        return init
    }
});

Template.editInitiativeCampaigns.onCreated( function () {
  this.templateDict = new ReactiveDict();
  const initiative = Initiatives.findOne({_id: FlowRouter.current().params._id});
  this.templateDict.set('initiative', initiative);
});

Template.editInitiativeCampaigns.onRendered(function () {
  const initiative = Template.instance().templateDict.get('initiative');
  dragula([document.getElementById("left"), document.getElementById("right")])
    .on('drop',
      // dragula throws off data on events, in this case were using the element
      // container and source on the 'drop' event
      function (el, container, source) {
        const campName = $(el).text().trim()
        const campaign = CampaignInsights.findOne({'data.campaign_name': campName});
        let id;
        if (campaign) {
          id = campaign.data.campaign_id;
          console.log('id reassigned!');
        } else {
          console.log('did not work');
        }

        /*
        'container' is where it was dropped into (the target)
        'source' is where it came from
        What we're doing here is using the dragula library to move campaigns around
        and in and out of initiatives. Below, the psuedo code reads:
        if it moves from left to right (actually this is reversed because I used
        position: fixed to keep one of the divs always viewable) ..anyway, if it moves
        from 'left' to 'right' remove the campaign from the initiative and remove the
        initiative from the campaignInsight document. There are two seperate method calls
        for these transactions. The reverse is executed below and they are very similar.
        */

        if ($(source).attr('id') === "left" && $(container).attr('id') === "right") {
          Meteor.call("removeCampaign", initiative, campName, id, function (error, result) {
            if (result) {
              Materialize.toast('Initiative Updated!', 2000);
            } else {
              alert('Could not updated Initiative.')
            }
          });
          // this takes place in campaignInsight method file
          Meteor.call("removeInitiativeFromCampaignInsight", campName, function (error, result) {
            if (result) {
              Materialize.toast('Initiative Name Removed From Campaign', 2000);
            }
          });
        }

        if ($(source).attr('id') === "right" && $(container).attr('id') === "left") {
          Meteor.call('addCampaign', initiative, campName, id, function (error, result) {
            if (result) {
              Materialize.toast('Campaign Added to Initiative!', 2000);
            } else {
              alert('Could not update initiative');
            }
          });
          // this takes place in campaignInsight method file
          Meteor.call('addInitiativeToCampaignInsight', campName, initiative, function (error, result) {
            if (result) {
              Materialize.toast('Initiative added to Campaign Insight', 2000);
            } else {
              alert('Could not update Campaign Insight');
            }
          });
        }
      });
});

Template.editInitiativeCampaigns.helpers({
    'getInitiative': function () {
        const initiative = Template.instance().templateDict.get('initiative');
        return [initiative];
    },
    'getCampaigns': function () {
        const initiative = Template.instance().templateDict.get('initiative');
        return initiative.campaign_names;
    },
    'getAllCampaigns': function () {
        /**
        * grabs templateDict, which has the initiative for this page
        * matches the first word in the initiative name
        * turns the first word in the name into a regular expression object
        * uses that RegEx to find a list of campaign names so that the list
        * of possible campaigns to match isn't so long
        **/

        const initiative = Template.instance().templateDict.get('initiative');
        const reResult = initiative['name'].match(/\w*/);
        const re = new RegExp(reResult[0], "i");
        const camps = CampaignInsights.find({'data.campaign_name': {$regex: re}}).fetch();
        return camps
    }
});

Template.editInitiativeCampaigns.events({
    'submit #edit-initiative-campaigns': function (event, template) {
      event.preventDefault();

      const init = Template.instance().templateDict.get('initiative');
      let data = {};
      data['name'] = init.name
      let selected = template.findAll("input[type=checkbox]:checked");
      let campaigns = _.map(selected, function(item) {
        return item.value;
      });
      data['campaign_names'] = campaigns;
      console.log(data)
      Meteor.call('updateInitiativeCampaigns', data, function (error, result) {
        if (result) {
            Materialize.toast('Campaigns Updated!', 5000);
        }
      });
    }
});

Template.editInitiativeCampaigns.onDestroyed(func => {
    $("#message-box li").remove();
});

Template.editInitiative.onDestroyed(func => {
    $("#message-box li").remove();
});

Template.initiativeAggregate.onDestroyed(func => {
    $("#message-box li").remove();
})

Template.initiativesHome.onRendered(function () {
  Meteor.typeahead.inject();
});

Template.initiativesHome.onCreated(function () {

})

Template.initiativesHome.helpers({
  isReady: (sub1) => {
    if (FlowRouter.subsReady(sub1)) {
      return true;
    }
  },
  settings: function() {
    return {
      position: "top",
      limit: 5,
      rules: [
        {
          token: '',
          collection: Initiatives,
          field: "name",
          options: '',
          matchAll: true,
          // filter: { type: "autocomplete" },
          template: Template.dataPiece
        },
        // {
        //   token: '@',
        //   collection: CampaignInsights,
        //   field: 'data.name',
        //   options: '',
        //   matchAll: true,
        //   template: Template.datapiece
        // }
      ]
    };
  },
  'getAllInitiatives': function () {
    const inits = Initiatives.find({},
      {sort: {active: -1, recentlyEnded: -1, lastThreeMonths: -1}}
    ).fetch();

    inits.forEach(el => {
      el.startDate = moment(el.startDate, moment.ISO_8601).format("MM-DD-YYYY hh:mm a");
      el.endDate = moment(el.endDate, moment.ISO_8601).format("MM-DD-YYYY hh:mm a");
    });

    return inits;
  },
  'isActiveInitiative': function () {
    const now = moment()
    if (this.active === true) {
      return "Active"
    } else if (now.diff(moment(this.endDate, moment.ISO_8601), "days") <= 30) {
      return "Ended within the last 30 days"
    } else {
      return "Not Active"
    }
  },
  'isActiveClass': function () {
    const now = moment()
    if (this.active === true) {
      return "green-text"
    } else if (now.diff(moment(this.endDate, moment.ISO_8601), "days") <= 30) {
      return "orange-text"
    } else {
      return "red-text"
    }
  },
  'formatDate': (date) => {
    return moment(date, moment.ISO_8601).format("MM-DD-YYYY hh:mm a");
  },
  'assignAgency': () => {
    console.log('this', this);
    return this.agency;
  },
  'assignBrand': () => {
    return this.brand;
  },
  userInfo: () => {
    return Meteor.user();
  },
  getOwner: () => {
    return this.owner;
  },
  calcSpend: (_id) => {
    const init = Initiatives.findOne({_id: _id});
    return numeral(initiativesFunctionObject.calculateSpendPercent(init)).format("00.00");
  },
  calcDelivery: (_id) => {
    const init = Initiatives.findOne({_id: _id});
    return numeral(initiativesFunctionObject.calculateDeliveryPercent(init)).format("00.00");
  },
  calcFlight: (_id) => {
    const init = Initiatives.findOne({_id: _id});
    return numeral(initiativesFunctionObject.calculateFlightPercentage(init)).format("00.00");
  },
  activeUpdates: (_id) => {
    const init = Initiatives.findOne({_id: _id});
    if (init.userActive) {
      return "checked";
    } else {
      return "";
    }
  }
});

Template.initiativesHome.events({
 "click .userLogout": (event, template) => {
    Meteor.logout( () => {
      console.log('user logged out');
    });
 },
 "click .switch": (event, instance) => {
  let _id, checked;
  if (event.target.dataset.id) { _id = event.target.dataset.id };
  checked = event.target.checked;
  if (_id && (checked === true || checked === false)) {
    Meteor.call('changeActiveStatus', _id, checked);
  }
 }
});
