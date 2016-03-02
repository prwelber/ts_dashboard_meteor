Meteor.subscribe('agenciesList')

Template.agencies.helpers({
    'getAgencies': function () {
        return Agencies.find();
    }
});

Template.agencies.events({
    "click .delete-agency": function (event, template) {
        let agencyId = event.target.dataset.id;
        Meteor.call("deleteAgency", agencyId);
    }
});

Template.newAgency.helpers({
    'getBrands': function () {
        return Accounts.find()
    }
});

// for testing exporting:
let person = {
    name: 'phil',
    age: 30,
    dogs: ['cooper', 'nelly']
};

Template.newAgency.events({
    "submit .new-agency-form": function (event, template) {
        event.preventDefault();
        let name = event.target.name.value;
        let location = event.target.location.value;
        // on submit, find all DOM elements of type "input checkbox" that are
        // checked and then create new array of just the defaultValues
        let selected = template.findAll("input[type=checkbox]:checked");
        let array = _.map(selected, function(item) {
            return item.value;
        });
        let inserted = moment().format("MM-DD-YYYY hh:mm a");

        let d = {};
        d.name = name;
        d.location = location;
        d.inserted = inserted
        Meteor.call('insertNewAgency', d, function (error, result) {
            if (result) {
                $("#message-box").append("Agency has been created!")
            }
        });
    }
});

Template.updateAgency.helpers({
    "getAgency": function () {
        let agencyId = FlowRouter.current().params._id;
        return Agencies.findOne(agencyId)
    }
})

Template.updateAgency.events({
    "submit .update-agency-form": function (event, template) {
        event.preventDefault();
        let name = event.target.name.value;
        let location = event.target.location.value;
        let d = {};
        d['_id'] = FlowRouter.current().params._id;
        d['name'] = name;
        d['location'] = location;
        Meteor.call("updateAgency", d, function (error, result) {
            if (result) {
                $("#message-box").append("Agency has been updated!");
            }
        })

    }
})

Template.newAgency.onDestroyed(function () {
    $("#message-box").text("");
});
Template.updateAgency.onDestroyed(function () {
    $("#message-box").text("");
});
export {person};
