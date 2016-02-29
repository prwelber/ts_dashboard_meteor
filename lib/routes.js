FlowRouter.route('/', {
    name: 'index',
    action: function () {
        BlazeLayout.render('index', {main: 'accounts', other: 'endingSoon', other2: 'activeCampaigns'});
    }
});

FlowRouter.route('/accounts/:account_id', {
    name: 'accountOverview',
    action: function (params) {
        BlazeLayout.render('index', {main: 'accountOverview', test: 'passing data through render function'});
    }
});

FlowRouter.route('/accounts/:campaign_id/insights', {
    name: 'campaignInsights',
    action: function (params) {
        BlazeLayout.render('index', {main: 'campaignInsights', initiativeStats: 'initiativeStats', other: "reporter"});
    }
});

FlowRouter.route('/accounts/:campaign_id/breakdowns', {
    name: 'insightsBreakdown',
    action: function (params) {
        BlazeLayout.render('index', {main: 'insightsBreakdown'});
    }
});

FlowRouter.route('/accounts/:campaign_id/daybreakdowns', {
    name: 'insightsBreakdownDaily',
    action: function (params) {
        BlazeLayout.render('index', {main: 'insightsBreakdownDaily'});
    }
});

FlowRouter.route('/accounts/:campaign_id/hourlybreakdowns', {
    name: 'hourlyBreakdowns',
    action: function (params) {
        BlazeLayout.render('index', {main: 'hourlyBreakdowns'});
    }
});

FlowRouter.route('/accounts/:campaign_id/adsets', {
    name: 'adsets',
    action: function (parrams) {
        BlazeLayout.render('index', {main: 'campaignInsights', other: 'adsets'});
    }
});

FlowRouter.route('/accounts/:campaign_id/ads', {
    name: 'ads',
    action: function (parrams) {
        BlazeLayout.render('index', {main: 'campaignInsights', other: 'ads'});
    }
});

FlowRouter.route('/initiatives/new', {
    name: 'newInitiative',
    action: function (params) {
        BlazeLayout.render('index', {main: 'newInitiative'});
    }
});

FlowRouter.route('/agencies/new', {
    name: 'newAgency',
    action: function (params) {
        BlazeLayout.render('index', {main: 'newAgency'});
    }
});

FlowRouter.route('/agencies', {
    name: 'agencies',
    action: function () {
        BlazeLayout.render('index', {main: 'agencies'});
    }
});

FlowRouter.route('/brands/new', {
    name: "newBrand",
    action: function () {
        BlazeLayout.render('index', {main: 'newBrand'});
    }
});

FlowRouter.route('/users/', {
    name: "users",
    action: function () {
        BlazeLayout.render('index', {main: 'allUsers'})
    }
});

FlowRouter.route('/users/:_id/edit', {
    name: "newUser",
    action: function (params) {
        BlazeLayout.render('index', {main: 'allUsers', other: 'newUser'});
    }
});
