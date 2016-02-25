
Template.newInitiative.helpers({
    'getBrands': function () {
        return Accounts.find()
    }
});


Template.newInitiative.onRendered(function () {
    this.$('.datetimepicker').datetimepicker();
});

Template.newInitiative.events({
    'submit .new-initiative': function (event) {
        // prevent default behavior
        event.preventDefault();

        let newInitiative = {};
        newInitiative['name']      = event.target.name.value;
        newInitiative['brand']     = event.target.brand.value;
        newInitiative['agency']    = event.target.agency.value;
        newInitiative['dealType']  = event.target.dealtype.value;
        newInitiative['budget']    = event.target.budget.value;
        newInitiative['startDate'] = moment(new Date(event.target.startDate.value)).format("MM-DD-YYYY hh:mm a");
        newInitiative['endDate']   = moment(new Date(event.target.endDate.value)).format("MM-DD-YYYY hh:mm a");;
        newInitiative['notes']     = event.target.notes.value;
        console.log(newInitiative);

        Meteor.call('insertNewInitiative', newInitiative);
        alert('Initiative successfully submitted');

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



