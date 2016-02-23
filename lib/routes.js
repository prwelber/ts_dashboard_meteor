FlowRouter.route('/', {
    name: 'index',
    action: function () {
        BlazeLayout.render('index', {main: 'accounts'});
    }
});

FlowRouter.route('/accounts/:account_id', {
    name: 'accountOverview',
    action: function (params) {
        console.log("route params:", params.account_id);
        BlazeLayout.render('index', {main: 'accountOverview', test: 'passing data through render function'});
    }
});

FlowRouter.route('/accounts/:campaign_id/insights', {
    name: 'campaignInsights',
    action: function (params) {
        console.log("route params:", params.campaign_id);
        BlazeLayout.render('index', {main: 'campaignInsights'});
    }
});

FlowRouter.route('/accounts/:campaign_id/breakdowns', {
    name: 'insightsBreakdown',
    action: function (params) {
        console.log("route params:", params.campaign_id);
        BlazeLayout.render('index', {main: 'insightsBreakdown'});
    }
});

FlowRouter.route('/accounts/:campaign_id/daybreakdowns', {
    name: 'insightsBreakdownDaily',
    action: function (params) {
        console.log('route params:', params.campaign_id);
        BlazeLayout.render('index', {main: 'insightsBreakdownDaily'});
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
        console.log("route params:", params.account_id);
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

