// Meteor.subscribe('Initiatives');

Tracker.autorun(function () {
    if (FlowRouter.subsReady('Initiatives')) {
        console.log('Initiatives subs ready!');
        $('select').material_select();
    }
})

Template.newInitiative.helpers({
    'getBrands': function () {
        $('select').material_select();
        return Accounts.find();
    }
});


Template.newInitiative.onRendered(function () {
    $('select').material_select();
    $('.collapsible').collapsible({
        accordion: false
    });
});

Template.newInitiative.events({
    'submit .new-initiative': function (event) {
        // prevent default behavior
        event.preventDefault();

        let newInitiative = {};
        newInitiative['name']      = event.target.name.value;
        newInitiative['brand']     = event.target.brand.value;
        newInitiative['agency']    = event.target.agency.value;
        newInitiative['dealType']  = event.target.dealType.value;
        newInitiative['budget']    = event.target.budget.value;
        newInitiative['startDate'] = moment(event.target.startDate.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        newInitiative['endDate']   = moment(event.target.endDate.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");;
        newInitiative['notes']     = event.target.notes.value;
        newInitiative['quantity']  = event.target.quantity.value;
        newInitiative['price']     = event.target.price.value;
        newInitiative['search-text']= event.target.searchText.value;

        console.log(newInitiative);
        // Meteor.call('insertNewInitiative', newInitiative, function (error, result) {
        //     if (error) {
        //         console.log(error);
        //     } else {
        //         alert('Initiative successfully submitted');
        //     }
        // });
    },
    'blur #new-init-budget': function (event, template) {
        let re = /[^0-9.]/
        let result = re.test(event.target.value)
        console.log(result)
        if (result == true) {
            alert('Budget format is incorrect. Only include numbers and one period.')
        }
    },
    'click #add-line-item': function (event, template) {
        const lineItemHTML = '<div class="row"><h3>Line Item</h3><div class="input-field col s6"><input type="text" id="platform-input" name="platform"><label for="platform-input">Platform</label></div><div class="input-field col s6"><input type="text" id="objective-input" name="objective"><label for="objetive-input">Objective</label></div><div class="input-field col s4"><select name="dealType" id="dealType-dropdown" class="browser-default"><option value="CPC">CPC</option><option value="CPM">CPM</option><option value="CPL">CPL</option><option value="FACTOR">FACTOR</option></select><label class="active">Deal Type</label></div><div class="input-field col s4"><input type="text" id="start-date" name="startDate"><label for="start-date">Start Date</label></div><div class="input-field col s4"><input type="text" id="end-date" name="endDate"><label for="end-date">End Date</label></div><div class="input-field col s4"><input type="text" id="price-input" name="price"><label for="price-input">Price</label></div><div class="input-field col s4"><input type="text" id="budget-input" name="budget"><label for="budget-input">Budget (no commas in input, ex: 15000.00)</label></div><div class="input-field col s4"><input type="text" id="quantity-input" name="quantity"><label for="quantity-input">Quantity</label></div></div>'


        console.log(event.target);
        console.log(template)
        $(lineItemHTML).insertBefore('#add-line-item')
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

        // format currency data
        init.aggregateData[0].cpc = mastFunc.money(init.aggregateData[0].cpc);
        init.aggregateData[0].cpm = mastFunc.money(init.aggregateData[0].cpm);
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
