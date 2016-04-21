Tracker.autorun(function () {
    if (FlowRouter.subsReady('Initiatives') && FlowRouter.subsReady('campaignInsightList')) {
        // console.log('Initiatives and Insights subs ready!');
    }
});
import CampaignInsights from '/collections/CampaignInsights'

Template.newInitiative.helpers({
    'getBrands': function () {
        $('select').material_select();
        return MasterAccounts.find();
    }
});


Template.newInitiative.onRendered(function () {
    $('#platform-select').material_select();
    $('.collapsible').collapsible({
        accordion: false
    });
    $('.tooltipped').tooltip({delay: 50});
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
                testArray.push(testObj);
            }
            testArray.forEach(el => {
                if (el.startDate === "Invalid date" || el.endDate === "Invalid date") {
                    el.startDate = null;
                    el.endDate = null;
                }
            });
            finalObj['lineItems'] = testArray;
            console.log(finalObj);
            return finalObj;
        }

        // where we run the function
        const newInitiative = makeInitObject(event);


        if (newInitiative.name === null || newInitiative.search_text === null) {
          Materialize.toast('Error: name, search text or both is empty.', 5000);
        } else {
          Meteor.call('insertNewInitiative', newInitiative, function (error, result) {
            if (error) {
              console.log(error);
            } else {
              Materialize.toast('Initiative Created!', 2500);
            }
          });
        }
    },
    'blur #new-init-budget': function (event, template) {
        let re = /[^0-9.]/
        let result = re.test(event.target.value)
        console.log(result)
        if (result == true) {
            alert('Budget format is incorrect. Only include numbers and one period.')
        }
    }
});
