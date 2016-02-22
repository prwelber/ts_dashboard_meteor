Meteor.subscribe('agenciesList')

Template.agencies.helpers({
    'getAgencies': function () {
        return Agencies.find();
    }
})
