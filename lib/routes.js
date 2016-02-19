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
        BlazeLayout.render('index', {main: 'accountOverview', test: 'passing data through render function'})
    }
});

FlowRouter.route('/accounts/:campaign_id/insights', {
    name: 'campaignInsights',
    action: function (params) {
        console.log("route params:", params.account_id);
        BlazeLayout.render('index', {main: 'campaignInsights'})
    }
});

FlowRouter.route('/accounts/:campaign_id/breakdowns', {
    name: 'insightsBreakdown',
    action: function (params) {
        console.log("route params:", params.account_id);
        BlazeLayout.render('index', {main: 'insightsBreakdown'})
    }
});

FlowRouter.route('/newinitiative', {
    name: 'newInitiative',
    action: function (params) {
        console.log("route params:", params.account_id);
        BlazeLayout.render('index', {main: 'newInitiative'})
    }
});
