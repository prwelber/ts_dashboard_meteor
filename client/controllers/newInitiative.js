Tracker.autorun(function () {
    if (FlowRouter.subsReady('Initiatives') && FlowRouter.subsReady('campaignInsightList')) {
        // console.log('Initiatives and Insights subs ready!');
    }
});

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
    'submit .new-initiative': function (event) {
        // prevent default behavior
        event.preventDefault();
        console.log(event.target);

        //TODO make this whole thing into array of objects

        const newInitiative = {};
        let testArray = [];
        for (let i = 1; i <= 8; i++) {
            let testObj = {};
            testObj['name'] = "Line Item " + i;
            testObj['platform']  = event.target['platform' + i].value;
            testObj['objective'] = event.target['objective' + i].value;
            testObj['dealType']  = event.target['dealType' + i].value;
            testObj['budget']    = event.target['budget' + i].value;
            testObj['startDate'] = moment(event.target['startDate' + i].value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
            testObj['endDate']   = moment(event.target['endDate' + i].value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
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
        console.log(testArray)

        // newInitiative['name']      = event.target.name.value;
        // newInitiative['search_text']= event.target.search_text.value;
        // newInitiative['brand']     = event.target.brand.value;
        // newInitiative['agency']    = event.target.agency.value;
        // newInitiative['notes']     = event.target.notes.value;

        // newInitiative['platform']  = event.target.platform.value;
        // newInitiative['objective'] = event.target.objective.value;
        // newInitiative['dealType']  = event.target.dealType.value;
        // newInitiative['budget']    = event.target.budget.value;
        // newInitiative['startDate'] = moment(event.target.startDate.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        // newInitiative['endDate']   = moment(event.target.endDate.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        // newInitiative['quantity']  = event.target.quantity.value;
        // newInitiative['price']     = event.target.price.value;
        // newInitiative['costPlusPercent'] = event.target.costPlus.value;
        // newInitiative['cost_plus'] = event.target.costplus.checked;
        // newInitiative['percent_total'] = event.target.percentTotal.checked;
        // newInitiative['percentTotalPercent'] = event.target.percentTotalPercentage.value;
        // newInitiative['is_client'] = event.target.isClient.checked;
        // newInitiative['isClientPercent'] = event.target.clientPercentage.value;

        // newInitiative['platform2']  = event.target.platform2.value;
        // newInitiative['objective2'] = event.target.objective2.value;
        // newInitiative['dealType2']  = event.target.dealType2.value;
        // newInitiative['budget2']    = event.target.budget2.value;
        // newInitiative['startDate2'] = moment(event.target.startDate2.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        // newInitiative['endDate2']   = moment(event.target.endDate2.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        // newInitiative['quantity2']  = event.target.quantity2.value;
        // newInitiative['price2']     = event.target.price2.value;
        // newInitiative['costPlusPercent2'] = event.target.costPlus2.value;
        // newInitiative['cost_plus2'] = event.target.costplus2.checked;
        // newInitiative['percent_total2'] = event.target.percentTotal2.checked;
        // newInitiative['percentTotalPercent2'] = event.target.percentTotalPercentage2.value;
        // newInitiative['is_client2'] = event.target.isClient2.checked;
        // newInitiative['isClientPercent2'] = event.target.clientPercentage2.value;

        // newInitiative['platform3']  = event.target.platform3.value;
        // newInitiative['objective3']  = event.target.objective3.value;
        // newInitiative['dealType3']  = event.target.dealType3.value;
        // newInitiative['budget3']    = event.target.budget3.value;
        // newInitiative['startDate3'] = moment(event.target.startDate3.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        // newInitiative['endDate3']   = moment(event.target.endDate3.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        // newInitiative['quantity3']  = event.target.quantity3.value;
        // newInitiative['price3']     = event.target.price3.value;
        // newInitiative['costPlusPercent3'] = event.target.costPlus3.value;
        // newInitiative['cost_plus3'] = event.target.costplus3.checked;
        // newInitiative['percent_total3'] = event.target.percentTotal3.checked;
        // newInitiative['percentTotalPercent3'] = event.target.percentTotalPercentage3.value;
        // newInitiative['is_client3'] = event.target.isClient3.checked;
        // newInitiative['isClientPercent3'] = event.target.clientPercentage3.value;

        // newInitiative['platform4']  = event.target.platform4.value;
        // newInitiative['objective4']  = event.target.objective4.value;
        // newInitiative['dealType4']  = event.target.dealType4.value;
        // newInitiative['budget4']    = event.target.budget4.value;
        // newInitiative['startDate4'] = moment(event.target.startDate4.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        // newInitiative['endDate4']   = moment(event.target.endDate4.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        // newInitiative['quantity4']  = event.target.quantity4.value;
        // newInitiative['price4']     = event.target.price4.value;
        // newInitiative['costPlusPercent4'] = event.target.costPlus4.value;
        // newInitiative['cost_plus4'] = event.target.costplus4.checked;
        // newInitiative['percent_total4'] = event.target.percentTotal4.checked;
        // newInitiative['percentTotalPercent4'] = event.target.percentTotalPercentage4.value;
        // newInitiative['is_client4'] = event.target.isClient4.checked;
        // newInitiative['isClientPercent4'] = event.target.clientPercentage4.value;

        // newInitiative['platform5']  = event.target.platform5.value;
        // newInitiative['objective5']  = event.target.objective5.value;
        // newInitiative['dealType5']  = event.target.dealType5.value;
        // newInitiative['budget5']    = event.target.budget5.value;
        // newInitiative['startDate5'] = moment(event.target.startDate5.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        // newInitiative['endDate5']   = moment(event.target.endDate5.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        // newInitiative['quantity5']  = event.target.quantity5.value;
        // newInitiative['price5']     = event.target.price5.value;
        // newInitiative['costPlusPercent5'] = event.target.costPlus5.value;
        // newInitiative['cost_plus5'] = event.target.costplus5.checked;
        // newInitiative['percent_total5'] = event.target.percentTotal5.checked;
        // newInitiative['percentTotalPercent5'] = event.target.percentTotalPercentage5.value;
        // newInitiative['is_client5'] = event.target.isClient5.checked;
        // newInitiative['isClientPercent5'] = event.target.clientPercentage5.value;

        // newInitiative['platform6']  = event.target.platform6.value;
        // newInitiative['objective6']  = event.target.objective6.value;
        // newInitiative['dealType6']  = event.target.dealType6.value;
        // newInitiative['budget6']    = event.target.budget6.value;
        // newInitiative['startDate6'] = moment(event.target.startDate6.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        // newInitiative['endDate6']   = moment(event.target.endDate6.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        // newInitiative['quantity6']  = event.target.quantity6.value;
        // newInitiative['price6']     = event.target.price6.value;
        // newInitiative['costPlusPercent6'] = event.target.costPlus6.value;
        // newInitiative['cost_plus6'] = event.target.costplus6.checked;
        // newInitiative['percent_total6'] = event.target.percentTotal6.checked;
        // newInitiative['percentTotalPercent6'] = event.target.percentTotalPercentage6.value;
        // newInitiative['is_client6'] = event.target.isClient6.checked;
        // newInitiative['isClientPercent6'] = event.target.clientPercentage6.value;

        // newInitiative['platform7']  = event.target.platform7.value;
        // newInitiative['objective7']  = event.target.objective7.value;
        // newInitiative['dealType7']  = event.target.dealType7.value;
        // newInitiative['budget7']    = event.target.budget7.value;
        // newInitiative['startDate7'] = moment(event.target.startDate7.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        // newInitiative['endDate7']   = moment(event.target.endDate7.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        // newInitiative['quantity7']  = event.target.quantity7.value;
        // newInitiative['price7']     = event.target.price7.value;
        // newInitiative['costPlusPercent7'] = event.target.costPlus7.value;
        // newInitiative['cost_plus7'] = event.target.costplus7.checked;
        // newInitiative['percent_total7'] = event.target.percentTotal7.checked;
        // newInitiative['percentTotalPercent7'] = event.target.percentTotalPercentage7.value;
        // newInitiative['is_client7'] = event.target.isClient7.checked;
        // newInitiative['isClientPercent7'] = event.target.clientPercentage7.value;

        // newInitiative['platform8']  = event.target.platform8.value;
        // newInitiative['objective8']  = event.target.objective8.value;
        // newInitiative['dealType8']  = event.target.dealType8.value;
        // newInitiative['budget8']    = event.target.budget8.value;
        // newInitiative['startDate8'] = moment(event.target.startDate8.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        // newInitiative['endDate8']   = moment(event.target.endDate8.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        // newInitiative['quantity8']  = event.target.quantity8.value;
        // newInitiative['price8']     = event.target.price8.value;
        // newInitiative['costPlusPercent8'] = event.target.costPlus8.value;
        // newInitiative['cost_plus8'] = event.target.costplus8.checked;
        // newInitiative['percent_total8'] = event.target.percentTotal8.checked;
        // newInitiative['percentTotalPercent8'] = event.target.percentTotalPercentage8.value;
        // newInitiative['is_client8'] = event.target.isClient8.checked;
        // newInitiative['isClientPercent8'] = event.target.clientPercentage8.value;

        // for (let key in newInitiative) {
        //   if (newInitiative[key] === "" || newInitiative[key] === "Invalid date") {
        //     newInitiative[key] = null;
        //   }
        // }

        testArray.forEach(el => {
            if (el.startDate === "Invalid Date" || el.endDate === "Invalid Date") {
                el.startDate = null;
                el.endDate = null;
            }
        });

        console.log(newInitiative);

        // if (newInitiative.name === null || newInitiative.search_text === null) {
        //   Materialize.toast('Error: name, search text or both is empty.', 5000);
        // } else {
        //   Meteor.call('insertNewInitiative', newInitiative, function (error, result) {
        //     if (error) {
        //       console.log(error);
        //     } else {
        //       Materialize.toast('Initiative Created!', 2500);
        //     }
        //   });
        // }



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
