Meteor.subscribe('InitiativesList');

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
        newInitiative['quantity']  = event.target.quantity.value;
        newInitiative['price']     = event.target.price.value;

        let campaignInsight = CampaignInsights.findOne({'data.campaign_name': newInitiative.name});
        newInitiative['campaign_id'] = campaignInsight.data.campaign_id;
        newInitiative['campaign_mongo_id'] = campaignInsight._id
        console.log(newInitiative);
        Meteor.call('insertNewInitiative', newInitiative, function (error, result) {
            if (error) {
                console.log(error);
            } else {
                alert('Initiative successfully submitted');
            }
        });


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

Template.initiativeStats.helpers({
    'getInitiative': function (template) {
        camp_id = Session.get("campaign_id");
        let initiative = Initiatives.findOne({campaign_id: camp_id});
        return initiative;
    }
});

