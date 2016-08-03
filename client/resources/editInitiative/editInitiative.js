import { Meteor } from 'meteor/meteor';
import { FlowRouter} from 'meteor/kadira:flow-router';
import { Moment } from 'meteor/momentjs:moment';
import { Materialize } from 'meteor/materialize:materialize';
import MasterAccounts from '/collections/MasterAccounts';
import Initiatives from '/collections/Initiatives';
import CampaignBasics from '/collections/CampaignBasics';
import Brands from '/collections/Brands';
import Agencies from '/collections/Agencies';


Template.editInitiative.onCreated(function () {
  this.templateDict = new ReactiveDict();
});

Template.editInitiative.onRendered(function () {
  $('.collapsible').collapsible({
    accordion: false
  });
  $('.tooltipped').tooltip({delay: 50});
  Session.set('counter', 8);
  // Session.set('effective1', parseFloat(Template.instance().$("input[name=percentTotalPercentage1]").val().toFixed(2) / 100) * Template.instance().$("#price-input1").val());
});

Template.editInitiative.helpers({
  isReady: (sub) => {
    if (FlowRouter.subsReady(sub)) {
      return true;
    };
  },
  'getInitiative': function () {
    let init = Initiatives.findOne({_id: FlowRouter.getParam('_id')});
    // init.lineItems[0].startDate = mastFunc.time(init.lineItems[0].startDate);
    // init.lineItems[0].endDate = mastFunc.time(init.lineItems[0].endDate);
    Template.instance().templateDict.set('init', init);
    return init;
  },
  'getBrands': function () {
    const masters =  MasterAccounts.find({}, {sort: {name: 1}}).fetch();
    const brands = Brands.find({}).fetch();
    return masters.concat(brands);
  },
  getAgencies: function () {
    return Agencies.find({}, {sort: {name: 1}}).fetch();
  },
  'getCampaigns': function () {
    const init =  Initiatives.findOne({_id: FlowRouter.getParam('_id')});
    return {names: init.campaign_names, ids: init.campaign_ids};
  },
  'getCampaignIds': function () {
    const init =  Initiatives.findOne({_id: FlowRouter.getParam('_id')});
    return init.campaign_ids;
  },
  'costPlusChecked': (indexNum) => {
    const init =  Initiatives.findOne({_id: FlowRouter.getParam('_id')});
    if (init.lineItems[indexNum].cost_plus === true) {
      return "checked";
    }
  },
  'percentTotalChecked': (num) => {
    const init =  Initiatives.findOne({_id: FlowRouter.getParam('_id')});
    if (init.lineItems[num].percent_total === true) {
      return "checked";
    }
  },
  factorChecked: (num) => {
    const init =  Initiatives.findOne({_id: FlowRouter.getParam('_id')});
    if (init.lineItems[num].factor === true) {
      return "checked";
    }
  },
  'isClientChecked': (num) => {
    const init =  Initiatives.findOne({_id: FlowRouter.getParam('_id')});
    if (init.lineItems[num].is_client === true) {
      return "checked";
    }
  },
  'addOne': function (num) {
    return num + 1;
  },
  'dateFormatter': (date) => {
    if (date === null || date === "") {
      return "";
    } else {
      return moment(date, moment.ISO_8601).format("MM-DD-YYYY hh:mm a");
    }

  },
  'activeChecked': () => {
    const init =  Initiatives.findOne({_id: FlowRouter.getParam('_id')});
    if (init.userActive) {
      return "checked";
    }
  },
  dupObjectivesChecked: () => {
    const init =  Initiatives.findOne({_id: FlowRouter.getParam('_id')});
    if (init.dupObjectives) {
      return "checked";
    }
  },
  effectiveNumber: (num) => {
    const init = Template.instance().templateDict.get('init');
    return init.lineItems[num].effectiveNum;
  }
});

Template.editInitiative.events({
    'submit #edit-initiative-form': function (event, template) {
      // prevent default behavior
      event.preventDefault();

      const makeUpdatedInit = function makeUpdatedInit (event) {
        let finalObj = {};
        const lineItemArray = [];

        finalObj['name']      = event.target.name.value;
        finalObj['search_text']= event.target.search_text.value;
        finalObj['brand']     = event.target.brand.value;
        finalObj['agency']    = event.target.agency.value;
        finalObj['notes']     = event.target.notes.value;
        finalObj['userActive']= event.target.active.checked;
        finalObj['dupObjectives'] = event.target.dupObjectives.checked;
        finalObj['product']   = event.target.product.value;
        finalObj['owner']     = event.target.owner.value;
        finalObj['tags']      = [];

        for (let i = 1; i <= 5; i++) {
          let testObj = {};
          testObj['name'] = "Line Item " + i;
          testObj['platform']  = event.target['platform' + i].value;
          testObj['objective'] = event.target['objective' + i].value;
          testObj['dealType']  = event.target['dealType' + i].value;
          testObj['budget']    = event.target['budget' + i].value;
          testObj['startDate'] = moment(event.target['startDate' + i].value, "MM-DD-YYYY hh:mm a").toISOString();
          testObj['endDate']   = moment(event.target['endDate' + i].value, "MM-DD-YYYY hh:mm a").toISOString();
          testObj['quantity']  = event.target['quantity' + i].value;
          testObj['price']     = event.target['price' + i].value;
          testObj['costPlusPercent'] = event.target['costPlus' + i].value;
          testObj['cost_plus'] = event.target['costplus' + i].checked;
          testObj['percent_total'] = event.target['percentTotal' + i].checked;
          testObj['percentTotalPercent'] = event.target['percentTotalPercentage' + i].value;
          testObj['effectiveNum'] = event.target['effectiveNumber' + i].value;
          // testObj['factor'] = event.target['factor' + i].checked;
          // testObj['factorNumber'] = event.target['factorNumber' + i].value;
          // testObj['is_client'] = event.target['isClient' + i].checked;
          // testObj['isClientPercent'] = event.target['clientPercentage' + i].value;
          lineItemArray.push(testObj);
        }
        lineItemArray.forEach(el => {
          if (el.startDate === "Invalid date" || el.endDate === "Invalid date") {
            el.startDate = null;
            el.endDate = null;
          }
        });
        finalObj['lineItems'] = lineItemArray;
        console.log(finalObj);
        finalObj['mongoId'] = FlowRouter.current().params._id;
        return finalObj;
      }

      const updatedInitiative = makeUpdatedInit(event); // run the function

      if (updatedInitiative.name === null || updatedInitiative.search_text === null) {
        Materialize.toast('Error: name, search text or both is empty', 5000);
      } else {
        Meteor.call('updateInitiative', updatedInitiative, function (error, result) {
            if (result) {
              Materialize.toast('Success! You have updated the initiative.', 2000);
              FlowRouter.go('/home');
            }
        });
      }
    },
    "click .deleteCampaign": (event, instance) => {
      const init = Initiatives.findOne({_id: FlowRouter.getParam('_id')});
      console.log(event.target);
      console.log(event.target.dataset.name);
      const camp = CampaignBasics.findOne({'data.name': event.target.dataset.name});

      if (camp && init) {
        console.log('meteor call to removeCampaign')
        Meteor.call('removeCampaign', init, camp.data.name, camp.data.campaign_id, (err, result) => {
          if (result) {
            console.log('great success wahwahweewah!')
          }
        });
      }
    },
    'keyup #price-input': (event, instance) => {
      Session.set('price1', event.target.value);
    },
    'keyup #percent-total-percentage': (event, instance) => {
      Session.set('percent1', event.target.value / 100);
    },
    'keyup #price-input2': (event, instance) => {
      Session.set('price2', event.target.value);
    },
    'keyup #percent-total-percentage2': (event, instance) => {
      Session.set('percent2', event.target.value / 100);
    },
    'keyup #price-input3': (event, instance) => {
      Session.set('price3', event.target.value);
    },
    'keyup #percent-total-percentage3': (event, instance) => {
      Session.set('percent3', event.target.value / 100);
    },
    'keyup #price-input4': (event, instance) => {
      Session.set('price4', event.target.value);
    },
    'keyup #percent-total-percentage4': (event, instance) => {
      Session.set('percent4', event.target.value / 100);
    },
    'keyup #price-input5': (event, instance) => {
      Session.set('price5', event.target.value);
    },
    'keyup #percent-total-percentage5': (event, instance) => {
      Session.set('percent5', event.target.value / 100);
    }
});
