FlowRouter.route('/', {
    name: 'index',
    action: function () {
        BlazeLayout.render('index', {main: 'accounts', other: 'timing'});
    }
});

FlowRouter.route('/accounts/:account_id', {
    subscriptions: function () {
        this.register('campaignBasicsList', Meteor.subscribe('campaignBasicsList'));
    },
    name: 'accountOverview',
    action: function (params) {
        console.log('this will print regardless of subscription status');
        BlazeLayout.render('index', {main: 'accountOverview', test: 'passing data through render function'});
    }
});

FlowRouter.route('/accounts/:campaign_id/insights', {
    subscriptions: function () {
        this.register('campaignInsightList', Meteor.subscribe('campaignInsightList'));
    },
    name: 'campaignInsights',
    action: function (params) {
        BlazeLayout.render('index', {main: 'campaignInsights', initiativeStats: 'initiativeStats'});
    }
});

FlowRouter.route('/accounts/:campaign_id/breakdowns', {
    subscriptions: function () {
        this.register('insightsBreakdownList', Meteor.subscribe('insightsBreakdownList'));
    },
    name: 'insightsBreakdown',
    action: function (params) {
        BlazeLayout.render('index', {main: 'insightsBreakdown'});
    }
});

FlowRouter.route('/accounts/:campaign_id/daybreakdowns', {
    subscriptions: function () {
        this.register('insightsBreakdownByDaysList', Meteor.subscribe('insightsBreakdownByDaysList'));
    },
    name: 'insightsBreakdownDaily',
    action: function (params) {
        BlazeLayout.render('index', {main: 'insightsBreakdownDaily'});
    }
});

FlowRouter.route('/accounts/:campaign_id/hourlybreakdowns', {
    subscriptions: function () {
        this.register('hourlyBreakdownsList', Meteor.subscribe('hourlyBreakdownsList'));
    },
    name: 'hourlyBreakdowns',
    action: function (params) {
        BlazeLayout.render('index', {main: 'hourlyBreakdowns'});
    }
});

FlowRouter.route('/accounts/:campaign_id/adsets', {
    subscriptions: function () {
        this.register('AdSetsList', Meteor.subscribe('AdSetsList'));
    },
    name: 'adsets',
    action: function (parrams) {
        BlazeLayout.render('index', {main: 'adsets'});
    }
});

FlowRouter.route('/accounts/:campaign_id/ads', {
    subscriptions: function () {
        this.register('AdsList', Meteor.subscribe('AdsList'));
    },
    name: 'ads',
    action: function (parrams) {
        BlazeLayout.render('index', {main: 'ads'});
    }
});

FlowRouter.route('/initiatives/new', {
    name: 'newInitiative',
    action: function (params) {
        BlazeLayout.render('index', {main: 'newInitiative'});
    }
});

FlowRouter.route('/admin/', {
    name: "admin",
    action: function () {
        BlazeLayout.render('index', {main: "admin"});
    }
});

FlowRouter.route('/admin/agencies/new', {
    name: 'newAgency',
    action: function (params) {
        BlazeLayout.render('index', {main: 'newAgency'});
    }
});

FlowRouter.route('/admin/agencies/:_id/update', {
    name: 'updateAgency',
    action: function (params) {
        BlazeLayout.render('index', {main: 'updateAgency'});
    }
});

FlowRouter.route('/admin/agencies', {
    name: 'agencies',
    action: function () {
        BlazeLayout.render('index', {main: 'agencies'});
    }
});

FlowRouter.route('/admin/brands/new', {
    name: "newBrand",
    action: function () {
        BlazeLayout.render('index', {main: 'newBrand'});
    }
});

FlowRouter.route('/admin/brands/', {
    name: "brands",
    action: function () {
        BlazeLayout.render('index', {main: 'brands'});
    }
});

FlowRouter.route('/admin/brands/:account_id/update', {
    name: "updatebrand",
    action: function () {
        BlazeLayout.render('index', {main: 'updateBrand'});
    }
});

FlowRouter.route('/admin/users/', {
    name: "users",
    action: function () {
        BlazeLayout.render('index', {main: 'allUsers'})
    }
});

FlowRouter.route('/admin/users/:_id/edit', {
    name: "newUser",
    action: function (params) {
        BlazeLayout.render('index', {main: 'newUser'});
    }
});
