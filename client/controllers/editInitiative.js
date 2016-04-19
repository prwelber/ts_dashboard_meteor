Template.editInitiative.onRendered(function () {
  $('.collapsible').collapsible({
    accordion: false
  });
  $('.tooltipped').tooltip({delay: 50});
  Session.set('counter', 8);
});

Template.editInitiative.helpers({
    'getInitiative': function () {
      let init =  Initiatives.findOne({_id: FlowRouter.current().params._id});
      init.startDate = mastFunc.time(init.startDate);
      init.endDate = mastFunc.time(init.endDate);
      return init;
    },
    'getBrands': function () {
      return MasterAccounts.find()
    },
    'getCampaigns': function () {
      const init =  Initiatives.findOne({_id: FlowRouter.current().params._id});
      return {names: init.campaign_names, ids: init.campaign_ids};
    },
    'getCampaignIds': function () {
      const init =  Initiatives.findOne({_id: FlowRouter.current().params._id});
      return init.campaign_ids;
    },
    'costPlusChecked': (indexNum) => {
      const init =  Initiatives.findOne({_id: FlowRouter.current().params._id});
      if (init.lineItems[indexNum].cost_plus === true) {
        return "checked";
      }
    },
    'percentTotalChecked': (num) => {
      const init =  Initiatives.findOne({_id: FlowRouter.current().params._id});
      if (init.lineItems[num].percent_total === true) {
        return "checked";
      }
    },
    'isClientChecked': (num) => {
      const init =  Initiatives.findOne({_id: FlowRouter.current().params._id});
      if (init.lineItems[num].is_client === true) {
        return "checked";
      }
    },
    'addOne': function (num) {
      return num + 1;
    },
    'dateFormatter': (date) => {
      return moment(date, moment.ISO_8601).format("MM-DD-YYYY hh:mm a");
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
        finalObj['product']   = event.target.product.value;
        finalObj['tags']      = [];

        for (let i = 1; i <= 8; i++) {
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
          testObj['is_client'] = event.target['isClient' + i].checked;
          testObj['isClientPercent'] = event.target['clientPercentage' + i].value;
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
        return finalObj;
      }

      const updatedInitiative = makeUpdatedInit(event);

      // if (updatedInitiative.name === null || updatedInitiative.search_text === null) {
      //   Materialize.toast('Error: name, search text or both is empty', 5000);
      // } else {
      //   Meteor.call('updateInitiative', updatedInitiative, function (error, result) {
      //       if (result) {
      //         Materialize.toast('Success! You have updated the initiative.', 5000);
      //       }
      //   });
      // }


    }
});
