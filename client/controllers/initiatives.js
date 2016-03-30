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
        console.log(event.target)

        const newInitiative = {};
        newInitiative['name']      = event.target.name.value;
        newInitiative['search_text']= event.target.search_text.value;
        newInitiative['brand']     = event.target.brand.value;
        newInitiative['agency']    = event.target.agency.value;
        newInitiative['notes']     = event.target.notes.value;

        newInitiative['platform']  = event.target.platform.value;
        newInitiative['objective']  = event.target.objective.value;
        newInitiative['dealType']  = event.target.dealType.value;
        newInitiative['budget']    = event.target.budget.value;
        newInitiative['startDate'] = moment(event.target.startDate.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        newInitiative['endDate']   = moment(event.target.endDate.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        newInitiative['quantity']  = event.target.quantity.value;
        newInitiative['price']     = event.target.price.value;

        newInitiative['platform2']  = event.target.platform2.value;
        newInitiative['objective2']  = event.target.objective2.value;
        newInitiative['dealType2']  = event.target.dealType2.value;
        newInitiative['budget2']    = event.target.budget2.value;
        newInitiative['startDate2'] = moment(event.target.startDate2.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        newInitiative['endDate2']   = moment(event.target.endDate2.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        newInitiative['quantity2']  = event.target.quantity2.value;
        newInitiative['price2']     = event.target.price2.value;

        newInitiative['platform3']  = event.target.platform3.value;
        newInitiative['objective3']  = event.target.objective3.value;
        newInitiative['dealType3']  = event.target.dealType3.value;
        newInitiative['budget3']    = event.target.budget3.value;
        newInitiative['startDate3'] = moment(event.target.startDate3.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        newInitiative['endDate3']   = moment(event.target.endDate3.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        newInitiative['quantity3']  = event.target.quantity3.value;
        newInitiative['price3']     = event.target.price3.value;

        newInitiative['platform4']  = event.target.platform4.value;
        newInitiative['objective4']  = event.target.objective4.value;
        newInitiative['dealType4']  = event.target.dealType4.value;
        newInitiative['budget4']    = event.target.budget4.value;
        newInitiative['startDate4'] = moment(event.target.startDate4.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        newInitiative['endDate4']   = moment(event.target.endDate4.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        newInitiative['quantity4']  = event.target.quantity4.value;
        newInitiative['price4']     = event.target.price4.value;

        newInitiative['platform5']  = event.target.platform5.value;
        newInitiative['objective5']  = event.target.objective5.value;
        newInitiative['dealType5']  = event.target.dealType5.value;
        newInitiative['budget5']    = event.target.budget5.value;
        newInitiative['startDate5'] = moment(event.target.startDate5.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        newInitiative['endDate5']   = moment(event.target.endDate5.value, "MM-DD-YYYY hh:mm a").format("MM-DD-YYYY hh:mm a");
        newInitiative['quantity5']  = event.target.quantity5.value;
        newInitiative['price5']     = event.target.price5.value;

        for (let key in newInitiative) {
          if (newInitiative[key] === "" || newInitiative[key] === "Invalid date") {
            newInitiative[key] = null;
          }
        }
        console.log(newInitiative);

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
    },
    'click #delete-initiative': function (event, template) {
      console.log(this._id)
      Meteor.call('deleteInitiative', this._id, function( err, res ) {
        if (res) {
          Materialize.toast('Initiative Deleted', 2500);
        }
      });
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
