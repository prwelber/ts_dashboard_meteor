// Meteor.subscribe('Initiatives');

Tracker.autorun(function () {
    if (FlowRouter.subsReady('Initiatives')) {
        console.log('Initiatives subs ready!');
    }
})

Template.newInitiative.helpers({
    'getBrands': function () {
        return Accounts.find()
    }
});


Template.newInitiative.onRendered(function () {

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
        newInitiative['startDate'] = moment(event.target.startDate.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        newInitiative['endDate']   = moment(event.target.endDate.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");;
        newInitiative['notes']     = event.target.notes.value;
        newInitiative['quantity']  = event.target.quantity.value;
        newInitiative['price']     = event.target.price.value;
        newInitiative['searchText']= event.target.searchText.value;

        // let campaignInsight = CampaignInsights.findOne({'data.campaign_name': newInitiative.name});
        // newInitiative['campaign_id'] = campaignInsight.data.campaign_id;
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
    'getInitiativeStats': function (template) {
        camp_id = Session.get("campaign_id");
        let initiative = Initiatives.findOne({campaign_id: camp_id});
        return initiative;
    }
});

Template.initiatives.helpers({
    'getInitiatives': function () {
        return Initiatives.find().fetch();
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
    }
});

Template.editInitiative.helpers({
    'getInitiative': function () {
        return Initiatives.findOne({_id: FlowRouter.current().params._id})
    },
    'getBrands': function () {
        return Accounts.find()
    },
    'getCampaigns': function () {
        let init =  Initiatives.findOne({_id: FlowRouter.current().params._id});
        return {names: init.campaign_names, ids: init.campaign_ids};
    },
    'getCampaignIds': function () {
        let init =  Initiatives.findOne({_id: FlowRouter.current().params._id});
        return init.campaign_ids;
    }
});

Template.editInitiative.events({
    'submit #edit-initiative-form': function (event, template) {
        event.preventDefault();
        let data = {};
        data['name']      = event.target.name.value;
        data['brand']     = event.target.brand.value;
        data['agency']    = event.target.agency.value;
        data['dealType']  = event.target.dealtype.value;
        data['budget']    = event.target.budget.value;
        data['startDate'] = moment(new Date(event.target.startDate.value)).format("MM-DD-YYYY hh:mm a");
        data['endDate']   = moment(new Date(event.target.endDate.value)).format("MM-DD-YYYY hh:mm a");;
        data['notes']     = event.target.notes.value;
        data['quantity']  = event.target.quantity.value;
        data['price']     = event.target.price.value;
        data['search_text'] = event.target.search_text.value;
        let selected = template.findAll("input[type=checkbox]:checked");
        let campaigns = _.map(selected, function(item) {
            return item.value;
        });

        data['campaign_names'] = campaigns;
        console.log(data);
        Meteor.call('updateInitiative', data, function (error, result) {
            if (result) {
                mastFunc.addToBox("Initiative "+result+" Updated Successfully!");
            }
        });
    }
});

Template.initiativeAggregate.helpers({
    'showAggregate': function () {
        let init = Initiatives.findOne({_id: FlowRouter.current().params._id});
        Meteor.call('getAggregate', init.name, (error, result) => {
            if (result) {
                // mastFunc.addToBox("data refreshed on " +result[0].inserted);
            }
        });
        let ends = moment(init.endDate, "MM-DD-YYYY");
        let timeLeft = ends.diff(moment(new Date), 'days')
        console.log(timeLeft)

        // format currency data
        init.aggregateData[0].cpc = accounting.formatMoney(init.aggregateData[0].cpc, "$", 2);
        init.aggregateData[0].cpm = accounting.formatMoney(init.aggregateData[0].cpm, "$", 2);
        return init
    }
});

Template.editInitiativeCampaigns.helpers({
    'getInitiative': function () {
        let init =  Initiatives.findOne({_id: FlowRouter.current().params._id});
        return [init];
    },
    'getCampaigns': function () {
        let init =  Initiatives.findOne({_id: FlowRouter.current().params._id});
        return init.campaign_names;
    },
    'getAllCampaigns': function () {
        let camps = CampaignInsights.find().fetch();
        return camps
    }
});

Template.editInitiativeCampaigns.events({
    'submit #edit-initiative-campaigns': function (event, template) {
        event.preventDefault();

        let init = Initiatives.findOne({_id: FlowRouter.current().params._id})
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
                mastFunc.addToBox("Campaigns for "+result+" updated successfully!");
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
