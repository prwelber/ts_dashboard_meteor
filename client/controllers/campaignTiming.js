Template.timing.helpers({
    'getEndingSoon': function () {
        if (Meteor.userId()) {
            // TODO
        }
    },
    'getActive': function () {

        // this is good for campaigns that will start soon
        // this says that time start is greater than current date
        //
        // CampaignBasics.find({}, {lte: {sort_time_start: new Date().toISOString()}, limit: 3}).fetch();
        //this might work for current campaigns...need to confirm
        if (Meteor.userId()) {
            return CampaignBasics.find({
                "sort_time_start": {$lt: new Date().toISOString()},
                "sort_time_stop": {$gt: new Date().toISOString()},
            }).fetch()
        }
    },
    'getStartingSoon': function () {
        if (Meteor.userId()) {
            let query = CampaignBasics.find({
                "sort_time_start": {$gte: new Date().toISOString()}
            }, {
                sort: {
                    sort_time_start: 1
                },
                limit: 5
            }); // end of DB query
            return query;
        }
    }
});
// Documents.find({
//   "owner": "123456",
//   "category": { $in: [ "photos", "announcements" ] },
//   "date.year": { $lt: 2015 },
//   "tags": { $in: [ 'baby', 'wedding' ] }
// }, {
//   fields: {
//     "title": 1
//   },
//   sort: {
//     "title": -1
//   }
// });
