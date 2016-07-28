import { Meteor } from 'meteor/meteor'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Materialize } from 'meteor/materialize:materialize'
import MasterAccounts from '/collections/MasterAccounts'

Tracker.autorun(function () {
    if (FlowRouter.subsReady('Initiatives') && FlowRouter.subsReady('campaignInsightList')) {
        // console.log('Initiatives and Insights subs ready!');
    }
});
import CampaignInsights from '/collections/CampaignInsights'

Template.newInitiative.onRendered(function () {
    $('#platform-select').material_select();
    $('.collapsible').collapsible({
        accordion: false
    });
    $('.tooltipped').tooltip({delay: 50});
    Session.set('factor', false);
    Session.set('factor2', false);
    Session.set('factor3', false);
    Session.set('factor4', false);
    Session.set('factor5', false);
    Session.set('quantity1', false);
    Session.set('quantity2', false);
    Session.set('quantity3', false);
    Session.set('quantity4', false);
    Session.set('quantity5', false);
});

Template.newInitiative.helpers({
    'getBrands': function () {
        return MasterAccounts.find({}, {sort: {name: 1}});
    },
    'getTargetedUsers': function () {
        return Meteor.users.find({});
    },
    factorDisabled: () => {
        if (Session.get('factor') === true) {
            return "";
        } else {
            return "disabled";
        }
    },
    factorDisabled2: () => {
        if (Session.get('factor2') === true) {
            return "";
        } else {
            return "disabled";
        }
    },
    factorDisabled3: () => {
        if (Session.get('factor3') === true) {
            return "";
        } else {
            return "disabled";
        }
    },
    factorDisabled4: () => {
        if (Session.get('factor4') === true) {
            return "";
        } else {
            return "disabled";
        }
    },
    factorDisabled5: () => {
        if (Session.get('factor5') === true) {
            return "";
        } else {
            return "disabled";
        }
    },
    effectiveNumber1: () => {
        return parseFloat((Session.get('price1') * Session.get('percent1')).toFixed(2));
    },
    effectiveNumber2: () => {
        return parseFloat((Session.get('price2') * Session.get('percent2')).toFixed(2));
    },
    effectiveNumber3: () => {
        return parseFloat((Session.get('price3') * Session.get('percent3')).toFixed(2));
    },
    effectiveNumber4: () => {
        return parseFloat((Session.get('price4') * Session.get('percent4')).toFixed(2));
    },
    effectiveNumber5: () => {
        return parseFloat((Session.get('price5') * Session.get('percent5')).toFixed(2));
    },
    budget1: () => {
        return parseFloat((Session.get('price1') * Session.get('quantity1')).toFixed(2));
    },
    budget2: () => {
        return parseFloat((Session.get('price2') * Session.get('quantity2')).toFixed(2));
    },
    budget3: () => {
        return parseFloat((Session.get('price3') * Session.get('quantity3')).toFixed(2));
    },
    budget4: () => {
        return parseFloat((Session.get('price4') * Session.get('quantity4')).toFixed(2));
    },
    budget5: () => {
        return parseFloat((Session.get('price5') * Session.get('quantity5')).toFixed(2));
    }
});


Template.newInitiative.events({
    'submit .new-initiative': function (event, template) {
        // prevent default behavior
        event.preventDefault();

        const makeInitObject = function makeInitObject (event) {
            let finalObj = {};
            const testArray = [];

            finalObj['name']      = event.target.name.value;
            finalObj['search_text']= event.target.search_text.value;
            finalObj['brand']     = event.target.brand.value;
            finalObj['agency']    = event.target.agency.value;
            finalObj['notes']     = event.target.notes.value;
            finalObj['product']   = event.target.product.value;
            finalObj['userActive']= event.target.active.checked;
            finalObj['dupObjectives'] = event.target.dupObjectives.checked;
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
                testArray.push(testObj);
            }
            testArray.forEach(el => {
                if (el.startDate === "Invalid date" || el.endDate === "Invalid date") {
                    el.startDate = null;
                    el.endDate = null;
                }
            });
            finalObj['lineItems'] = testArray;
            return finalObj;
        }

        // where we run the function
        const newInitiative = makeInitObject(event);


        if (newInitiative.name === null || newInitiative.search_text === null) {
          Materialize.toast('Error: name, search text or both is empty.', 5000);
        } else {
          Meteor.call('insertNewInitiative', newInitiative, function (error, result) {
            if (error) {
              alert(error);
            } else {
              Materialize.toast('Initiative Created!', 1000);
              FlowRouter.go('/home');
            }
          });
        }
    },
    'blur #new-init-budget': function (event, template) {
        let re = /[^0-9.]/
        let result = re.test(event.target.value)
        if (result == true) {
            alert('Budget format is incorrect. Only include numbers and one period.')
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
    },
    'click #percent-total': (event, instance) => {
        Session.set('factor', !Session.get('factor'));
    },
    'click #percent-total2': (event, instance) => {
        Session.set('factor2', !Session.get('factor2'));
    },
    'click #percent-total3': (event, instance) => {
        Session.set('factor3', !Session.get('factor3'));
    },
    'click #percent-total4': (event, instance) => {
        Session.set('factor4', !Session.get('factor4'));
    },
    'click #percent-total5': (event, instance) => {
        Session.set('factor5', !Session.get('factor5'));
    },
    'keyup #quantity-input': (event, instance) => {
        if (instance.$('#dealType-dropdown').val() === 'CPM') {
            Session.set('quantity1', event.target.value / 1000);
        } else {
            Session.set('quantity1', event.target.value);
        }
    },
    'keyup #quantity-input2': (event, instance) => {
        if (instance.$('#dealType-dropdown2').val() === 'CPM') {
            Session.set('quantity2', event.target.value / 1000);
        } else {
            Session.set('quantity2', event.target.value);
        }
    },
    'keyup #quantity-input3': (event, instance) => {
        if (instance.$('#dealType-dropdown3').val() === 'CPM') {
            Session.set('quantity3', event.target.value / 1000);
        } else {
            Session.set('quantity3', event.target.value);
        }
    },
    'keyup #quantity-input4': (event, instance) => {
        if (instance.$('#dealType-dropdown4').val() === 'CPM') {
            Session.set('quantity4', event.target.value / 1000);
        } else {
            Session.set('quantity4', event.target.value);
        }
    },
    'keyup #quantity-input5': (event, instance) => {
        if (instance.$('#dealType-dropdown5').val() === 'CPM') {
            Session.set('quantity5', event.target.value / 1000);
        } else {
            Session.set('quantity5', event.target.value);
        }
    }
});

Template.newInitiative.onDestroyed(() => {
    $('.tooltipped').tooltip('remove');
    Session.set('price1', null);
    Session.set('percent1', null);
    Session.set('quantity1', null)
});
