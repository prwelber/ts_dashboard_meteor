FlowRouter.route('/', {
    name: 'index',
    action: function () {
        BlazeLayout.render('landing', {main: 'accounts'});
    }
});

FlowRouter.route('/accounts/:_id', {
    name: 'accountOverview',
    action: function (params) {
        console.log(params._id)
        BlazeLayout.render('landing', {main: 'accountOverview', test: 'passing data through render function'})
    }
});
