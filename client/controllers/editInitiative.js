Template.editInitiative.onRendered(function () {
  $('.collapsible').collapsible({
    accordion: false
  });
  $('.tooltipped').tooltip({delay: 50});
});

Template.editInitiative.helpers({
    'getInitiative': function () {
      return Initiatives.findOne({_id: FlowRouter.current().params._id})
    },
    'getBrands': function () {
      return Accounts.find()
    },
    'getCampaigns': function () {
      const init =  Initiatives.findOne({_id: FlowRouter.current().params._id});
      return {names: init.campaign_names, ids: init.campaign_ids};
    },
    'getCampaignIds': function () {
      const init =  Initiatives.findOne({_id: FlowRouter.current().params._id});
      return init.campaign_ids;
    },
    'isChecked': function () {
      const init =  Initiatives.findOne({_id: FlowRouter.current().params._id});
      if (init.costPlus === true) {
        return "checked";
      }
    },
    'isChecked2': function () {
      const init =  Initiatives.findOne({_id: FlowRouter.current().params._id});
      if (init.costPlus2 === true) {
        return "checked";
      }
    },'isChecked3': function () {
      const init =  Initiatives.findOne({_id: FlowRouter.current().params._id});
      if (init.costPlus3 === true) {
        return "checked";
      }
    },
    'isChecked4': function () {
      const init =  Initiatives.findOne({_id: FlowRouter.current().params._id});
      if (init.costPlus4 === true) {
        return "checked";
      }
    },
    'isChecked5': function () {
      const init =  Initiatives.findOne({_id: FlowRouter.current().params._id});
      if (init.costPlus5 === true) {
        return "checked";
      }
    },
    'isChecked6': function () {
      const init =  Initiatives.findOne({_id: FlowRouter.current().params._id});
      if (init.costPlus6 === true) {
        return "checked";
      }
    },
    'isChecked7': function () {
      const init =  Initiatives.findOne({_id: FlowRouter.current().params._id});
      if (init.costPlus7 === true) {
        return "checked";
      }
    },
    'isChecked8': function () {
      const init =  Initiatives.findOne({_id: FlowRouter.current().params._id});
      if (init.costPlus8 === true) {
        return "checked";
      }
    },
});

Template.editInitiative.events({
    'submit #edit-initiative-form': function (event, template) {

      // prevent default behavior
      event.preventDefault();

      const updatedInitiative = {};
      updatedInitiative['name']      = event.target.name.value;
      updatedInitiative['search_text']= event.target.search_text.value;
      updatedInitiative['brand']     = event.target.brand.value;
      updatedInitiative['agency']    = event.target.agency.value;
      updatedInitiative['notes']     = event.target.notes.value;
      updatedInitiative['product']   = event.target.product.value;

      updatedInitiative['platform']  = event.target.platform.value;
      updatedInitiative['objective']  = event.target.objective.value;
      updatedInitiative['dealType']  = event.target.dealType.value;
      updatedInitiative['budget']    = event.target.budget.value;
      updatedInitiative['startDate'] = moment(event.target.startDate.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
      updatedInitiative['endDate']   = moment(event.target.endDate.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
      updatedInitiative['quantity']  = event.target.quantity.value;
      updatedInitiative['price']     = event.target.price.value;
      updatedInitiative['costPlusPercent'] = event.target.costPlus.value;
      updatedInitiative['cost_plus'] = event.target.costplus.checked;

      updatedInitiative['platform2']  = event.target.platform2.value;
      updatedInitiative['objective2']  = event.target.objective2.value;
      updatedInitiative['dealType2']  = event.target.dealType2.value;
      updatedInitiative['budget2']    = event.target.budget2.value;
      updatedInitiative['startDate2'] = moment(event.target.startDate2.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
      updatedInitiative['endDate2']   = moment(event.target.endDate2.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
      updatedInitiative['quantity2']  = event.target.quantity2.value;
      updatedInitiative['price2']     = event.target.price2.value;
      updatedInitiative['costPlusPercent2'] = event.target.costPlus2.value;
      updatedInitiative['cost_plus2'] = event.target.costplus2.checked;

      updatedInitiative['platform3']  = event.target.platform3.value;
      updatedInitiative['objective3']  = event.target.objective3.value;
      updatedInitiative['dealType3']  = event.target.dealType3.value;
      updatedInitiative['budget3']    = event.target.budget3.value;
      updatedInitiative['startDate3'] = moment(event.target.startDate3.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
      updatedInitiative['endDate3']   = moment(event.target.endDate3.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
      updatedInitiative['quantity3']  = event.target.quantity3.value;
      updatedInitiative['price3']     = event.target.price3.value;
      updatedInitiative['costPlusPercent3'] = event.target.costPlus3.value;
      updatedInitiative['cost_plus3'] = event.target.costplus3.checked;

      updatedInitiative['platform4']  = event.target.platform4.value;
      updatedInitiative['objective4']  = event.target.objective4.value;
      updatedInitiative['dealType4']  = event.target.dealType4.value;
      updatedInitiative['budget4']    = event.target.budget4.value;
      updatedInitiative['startDate4'] = moment(event.target.startDate4.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
      updatedInitiative['endDate4']   = moment(event.target.endDate4.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
      updatedInitiative['quantity4']  = event.target.quantity4.value;
      updatedInitiative['price4']     = event.target.price4.value;
      updatedInitiative['costPlusPercent4'] = event.target.costPlus4.value;
      updatedInitiative['cost_plus4'] = event.target.costplus4.checked;

      updatedInitiative['platform5']  = event.target.platform5.value;
      updatedInitiative['objective5']  = event.target.objective5.value;
      updatedInitiative['dealType5']  = event.target.dealType5.value;
      updatedInitiative['budget5']    = event.target.budget5.value;
      updatedInitiative['startDate5'] = moment(event.target.startDate5.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
      updatedInitiative['endDate5']   = moment(event.target.endDate5.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
      updatedInitiative['quantity5']  = event.target.quantity5.value;
      updatedInitiative['price5']     = event.target.price5.value;
      updatedInitiative['costPlusPercent5'] = event.target.costPlus5.value;
      updatedInitiative['cost_plus5'] = event.target.costplus5.checked;

      updatedInitiative['platform6']  = event.target.platform6.value;
      updatedInitiative['objective6']  = event.target.objective6.value;
      updatedInitiative['dealType6']  = event.target.dealType6.value;
      updatedInitiative['budget6']    = event.target.budget6.value;
      updatedInitiative['startDate6'] = moment(event.target.startDate6.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
      updatedInitiative['endDate6']   = moment(event.target.endDate6.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
      updatedInitiative['quantity6']  = event.target.quantity6.value;
      updatedInitiative['price6']     = event.target.price6.value;
      updatedInitiative['costPlusPercent6'] = event.target.costPlus6.value;
      updatedInitiative['cost_plus6'] = event.target.costplus6.checked;

      updatedInitiative['platform7']  = event.target.platform7.value;
      updatedInitiative['objective7']  = event.target.objective7.value;
      updatedInitiative['dealType7']  = event.target.dealType7.value;
      updatedInitiative['budget7']    = event.target.budget7.value;
      updatedInitiative['startDate7'] = moment(event.target.startDate7.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
      updatedInitiative['endDate7']   = moment(event.target.endDate7.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
      updatedInitiative['quantity7']  = event.target.quantity7.value;
      updatedInitiative['price7']     = event.target.price7.value;
      updatedInitiative['costPlusPercent7'] = event.target.costPlus7.value;
      updatedInitiative['cost_plus7'] = event.target.costplus7.checked;

      updatedInitiative['platform8']  = event.target.platform8.value;
      updatedInitiative['objective8']  = event.target.objective8.value;
      updatedInitiative['dealType8']  = event.target.dealType8.value;
      updatedInitiative['budget8']    = event.target.budget8.value;
      updatedInitiative['startDate8'] = moment(event.target.startDate8.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
      updatedInitiative['endDate8']   = moment(event.target.endDate8.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
      updatedInitiative['quantity8']  = event.target.quantity8.value;
      updatedInitiative['price8']     = event.target.price8.value;
      updatedInitiative['costPlusPercent8'] = event.target.costPlus8.value;
      updatedInitiative['cost_plus8'] = event.target.costplus8.checked;

      for (let key in updatedInitiative) {
        if (updatedInitiative[key] === "" || updatedInitiative[key] === "Invalid date") {
          updatedInitiative[key] = null;
        }
      }
      console.log(updatedInitiative);

      if (updatedInitiative.name === null || updatedInitiative.search_text === null) {
        Materialize.toast('Error: name, search text or both is empty', 5000);
      } else {
        Meteor.call('updateInitiative', updatedInitiative, function (error, result) {
            if (result) {
              Materialize.toast('Success! You have updated the initiative.', 5000);
            }
        });
      }
    }
});
