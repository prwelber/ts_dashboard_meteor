FlowRouter.route('/', {
    name: 'index',
    action: function () {
        BlazeLayout.render('landing', {main: 'accounts'});
    }
});

FlowRouter.route('/accounts/:account_id', {
    name: 'accountOverview',
    action: function (params) {
        console.log(params.account_id)
        BlazeLayout.render('landing', {main: 'accountOverview', test: 'passing data through render function'})
    }
});

FlowRouter.route('/accounts/:campaign_id/insights', {
    name: 'campaignInsights',
    action: function (params) {
        console.log(params);
        BlazeLayout.render('landing', {main: 'campaignInsights'})
    }
});
