FlowRouter.route('/', {
    name: 'index',
    action: function () {
        BlazeLayout.render('landing');
    }
});

FlowRouter.route('/accounts/:_id', {
    name: 'account',
    action: function (params) {
        console.log(params._id)
        BlazeLayout.render('', {mongoId: params._id})
    }
});
