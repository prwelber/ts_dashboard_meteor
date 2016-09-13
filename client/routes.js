import { Meteor } from 'meteor/meteor'
import { FlowRouter } from 'meteor/kadira:flow-router'

FlowRouter.route('/', {
    name: 'landing',
    action: () => {
        FlowRouter.go('/home');
    }
});

FlowRouter.route('/home', {
    subscriptions: function () {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
    },
    name: 'index',
    action: () => {
        Session.set("route", "home");
        BlazeLayout.render('index', {main: 'initiativesHome', other: 'timing'});
    }
});

FlowRouter.route('/terms', {
    name: "terms",
    action: () => {
        BlazeLayout.render('terms');
    }
});

FlowRouter.route('/initiatives/:_id/homepage', {
    subscriptions: function (params) {
        if (/homepage/.test(FlowRouter.current().path) === true) {
            params["page"] = "homepage";
        }
        this.register('Initiatives', Meteor.subscribe('Initiatives', params._id));
        this.register('campaignInsightList', Meteor.subscribe('campaignInsightList', params._id));
        this.register('campaignBasicsList', Meteor.subscribe('campaignBasicsList', params));
        this.register('insightsBreakdownByDaysList', Meteor.subscribe('insightsBreakdownByDaysList', params._id));
        this.register('Uploads', Meteor.subscribe('Uploads', params));
    },
    name: 'initiativeHomepage',
    action: function () {
        Session.set("route", "initiativeHomepage");
        BlazeLayout.render('index', {main: 'initiativeHomepage', tasks: 'taskTracker'})
    }
});

FlowRouter.route('/viewaccounts', {
    name: "viewAccounts",
    action: function () {
        Session.set("route", "home");
        BlazeLayout.render('index', {main: 'accounts'});
    }
});

FlowRouter.route('/accounts/:account_id', {
    subscriptions: function (params) {
        this.register('campaignBasicsList', Meteor.subscribe('campaignBasicsList', params.account_id));
    },
    name: 'accountOverview',
    action: function (params) {
        BlazeLayout.render('index', {main: 'accountOverview', test: 'passing data through render function'});
    }
});

FlowRouter.route('/accounts/:campaign_id/dashboard', {
  subscriptions: function () {
    this.register('campaignInsightList', Meteor.subscribe('campaignInsightList'));
    this.register('Initiatives', Meteor.subscribe('Initiatives'));
    this.register('campaignBasicsList', Meteor.subscribe('campaignBasicsList'));
  },
  name: 'campaignDashboard',
  action: function (params) {
    BlazeLayout.render('index', {main: 'campaignDashboard', dash: 'campaignInsights'});
  }
});

FlowRouter.route('/accounts/:campaign_id/overview', {
  subscriptions: function (params) {
    this.register('campaignInsightList', Meteor.subscribe('campaignInsightList', params.campaign_id));
    this.register('campaignBasicsList', Meteor.subscribe('campaignBasicsList', params.campaign_id));
    this.register('Initiatives', Meteor.subscribe('Initiatives', params.campaign_id, 'campaign'));
    this.register('insightsBreakdownByDaysList', Meteor.subscribe('insightsBreakdownByDaysList', params.campaign_id));
  },
  name: 'campaignInsights',
  action: function (params) {
    Session.set("route", "overview");
    BlazeLayout.render('index', {main: 'campaignDashboard', projection: 'projections', dash: 'campaignInsights'});
  }
});

FlowRouter.route('/accounts/:campaign_id/report', {
    subscriptions: function (params) {
        this.register('campaignInsightList', Meteor.subscribe('campaignInsightList', params.campaign_id));
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
    },
    name: 'report',
    action: function (params) {
        Session.set("route", "report");
        BlazeLayout.render('index', {main: 'report'});
    }
});

FlowRouter.route('/accounts/:campaign_id/charts', {
  subscriptions: function (params) {
    this.register('Initiatives', Meteor.subscribe('Initiatives'));
    this.register('campaignInsightList', Meteor.subscribe('campaignInsightList', params.campaign_id));
  },
  name: 'charts',
  action: function (params) {
    Session.set("route", "charts");
    BlazeLayout.render('index', {main: 'campaignDashboard', dash: 'charts'});
  }
});

FlowRouter.route('/accounts/:campaign_id/breakdowns', {
    subscriptions: function (opts) {
        this.register('insightsBreakdownList', Meteor.subscribe('insightsBreakdownList', opts.campaign_id));
        this.register('campaignInsightList', Meteor.subscribe('campaignInsightList', opts.campaign_id));
        this.register("Initiatives", Meteor.subscribe("Initiatives"));
    },
    name: 'insightsBreakdown',
    action: function (params) {
        Session.set("route", "breakdowns");
        // BlazeLayout.render('index', {main: 'campaignDashboard', dash: 'insightsBreakdown'});
        BlazeLayout.render('index', {main: 'insightsBreakdown'})
    }
});

FlowRouter.route('/accounts/:campaign_id/daybreakdowns', {
    subscriptions: function (params) {
        this.register('insightsBreakdownByDaysList', Meteor.subscribe('insightsBreakdownByDaysList', params.campaign_id));
        this.register('campaignInsightList', Meteor.subscribe('campaignInsightList', params.campaign_id));
        this.register("Initiatives", Meteor.subscribe("Initiatives"));
    },
    name: 'insightsBreakdownDaily',
    action: function (params) {
        Session.set("route", "daybreakdowns");
        BlazeLayout.render('index', {main: 'campaignDashboard', dash: 'insightsBreakdownDaily'});
    }
});

FlowRouter.route('/accounts/:campaign_id/hourlybreakdowns', {
    subscriptions: function (params) {
        this.register('hourlyBreakdownsList', Meteor.subscribe('hourlyBreakdownsList', params.campaign_id));
        this.register('campaignInsightList', Meteor.subscribe('campaignInsightList', params.campaign_id));
        this.register("Initiatives", Meteor.subscribe("Initiatives"));
    },
    name: 'hourlyBreakdowns',
    action: function (params) {
        Session.set("route", "hourlyBreakdowns");
        BlazeLayout.render('index', {main: 'hourlyBreakdowns'});
    }
});

FlowRouter.route('/accounts/:campaign_id/devicebreakdowns', {
    subscriptions: function (params) {
        this.register("Initiatives", Meteor.subscribe("Initiatives"));
        this.register("DeviceAndPlacement", Meteor.subscribe("DeviceAndPlacement", params.campaign_id, 'campaign'));
        this.register('campaignInsightList', Meteor.subscribe('campaignInsightList', params.campaign_id));
    },
    name: 'deviceAndPlacement',
    action: function (params) {
        Session.set('route', 'deviceAndPlacement');
        BlazeLayout.render('index', {main: 'deviceAndPlacement'});
    }
});

FlowRouter.route('/accounts/:campaign_id/targeting', {
    subscriptions: function (opts) {
        this.register('AdSetsList', Meteor.subscribe('AdSetsList', opts.campaign_id));
        this.register("Initiatives", Meteor.subscribe("Initiatives"));
        this.register("campaignInsightList", Meteor.subscribe("campaignInsightList", opts.campaign_id));
    },
    name: 'adsets',
    action: function (parrams) {
        Session.set("route", "targeting");
        BlazeLayout.render('index', {main: 'campaignDashboard', dash: 'adsets'});
    }
});

FlowRouter.route('/accounts/:campaign_id/creative', {
    subscriptions: function (opts) {
        this.register('AdsList', Meteor.subscribe('AdsList', opts.campaign_id));
        this.register("Initiatives", Meteor.subscribe("Initiatives"));
        this.register("campaignInsightList", Meteor.subscribe("campaignInsightList", opts.campaign_id));
    },
    name: 'ads',
    action: function (params) {
        Session.set("route", "creative");
        // BlazeLayout.render('index', {main: 'campaignDashboard', dash: 'ads'});
        BlazeLayout.render('index', {main: 'ads'});
    }
});

FlowRouter.route('/admin/', {
    name: "admin",
    action: function () {
        Session.set('route', 'admin');
        BlazeLayout.render('index', {main: "admin"});
    }
});

// ------------------------- AGGREGATIONS ----------------- //

FlowRouter.route('/admin/aggregations', {
    subscriptions: function () {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
        this.register('Agencies', Meteor.subscribe('Agencies'));
    },
    name: "aggregations",
    action: function () {
        Session.set("route", "admin");
        BlazeLayout.render('index', {main: "aggregations"});
    }
});

// ------------------------- AGENCIES --------------------- //

FlowRouter.route('/admin/agencies/new', {
    subscriptions: function () {
        this.register("Agencies", Meteor.subscribe("Agencies"));
    },
    name: 'newAgency',
    action: function (params) {
        Session.set("route", "admin");
        BlazeLayout.render('index', {main: 'newAgency'});
    }
});

FlowRouter.route('/admin/agencies/:_id/update', {
    name: 'updateAgency',
    action: function (params) {
        Session.set("route", "admin");
        BlazeLayout.render('index', {main: 'updateAgency'});
    }
});

FlowRouter.route('/admin/agencies', {
    subscriptions: function () {
        this.register("Agencies", Meteor.subscribe("Agencies"));
    },
    name: 'agencies',
    action: function () {
        Session.set("route", "admin");
        BlazeLayout.render('index', {main: 'agencies'});
    }
});

// --------------------- BRANDS ----------------------- //

FlowRouter.route('/admin/brands/new', {
    subscriptions: function () {
        this.register("Brands", Meteor.subscribe("Brands"));
        this.register("Agencies", Meteor.subscribe("Agencies"));
    },
    name: "newBrand",
    action: function () {
        Session.set("route", "admin");
        BlazeLayout.render('index', {main: 'newBrand'});
    }
});

FlowRouter.route('/admin/brands/', {
    subscriptions: function () {
        this.register("Brands", Meteor.subscribe("Brands"));
        this.register("Agencies", Meteor.subscribe("Agencies"));
    },
    name: "brands",
    action: function () {
        Session.set("route", "admin");
        BlazeLayout.render('index', {main: 'brands'});
    }
});

FlowRouter.route('/admin/brands/:account_id/update', {
    name: "updatebrand",
    action: function () {
        Session.set("route", "admin");
        BlazeLayout.render('index', {main: 'updateBrand'});
    }
});

// --------------------- CAMPAIGN ---------------------- //

FlowRouter.route('/admin/campaigns', {
    subscriptions: function () {
        const params = "search";
        // the campaign insight list subscription takes place in getCampaigns
        // helper located in the editCampaignInit.js file on the client

        // this.register('campaignInsightList', Meteor.subscribe('campaignInsightList', params));
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
    },
    name: "editCampaignInit",
    action: function () {
        Session.set("route", "admin");
        BlazeLayout.render('index', {main: 'editCampaignInit'});
    }
});


// ---------------------- USERS ------------------------ //

FlowRouter.route('/admin/users/', {
    name: "users",
    action: function () {
        Session.set("route", "admin");
        BlazeLayout.render('index', {main: 'allUsers'})
    }
});

FlowRouter.route('/admin/users/:_id/edit', {
    subscriptions: function () {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
        this.register('Agencies', Meteor.subscribe('Agencies'));
    },
    name: "editUser",
    action: function (params) {
        Session.set("route", "admin");
        BlazeLayout.render('index', {main: 'editUser'});
    }
});

FlowRouter.route('/admin/users/create', {
    subscriptions: function () {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
    },
    name: "createUser",
    action: function () {
        Session.set("route", "admin");
        BlazeLayout.render('index', {main: "createUser"});
    }
});

// -------------------- INITIATIVES ------------------------ //

FlowRouter.route('/admin/initiatives/', {
    subscriptions: function () {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
    },
    name: "initiatives",
    action: function () {
        Session.set("route", "admin");
        BlazeLayout.render('index', {main: "initiatives"});
    }
});

FlowRouter.route('/admin/initiatives/:_id', {
    subscriptions: function () {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
    },
    name: "initiative",
    action: function () {
        Session.set("route", "admin");
        BlazeLayout.render('index', {main: "initiative"});
    }
});

FlowRouter.route('/admin/initiatives/:_id/edit', {
    subscriptions: function (params) {
        if (/edit/.test(FlowRouter.current().path) === true) {
            params["page"] = "edit";
        }
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
        this.register('campaignBasicsList', Meteor.subscribe('campaignBasicsList', params));
        this.register('Brands', Meteor.subscribe('Brands'));
        this.register('Agencies', Meteor.subscribe('Agencies'));
    },
    name: "editInitiative",
    action: function () {
        Session.set("route", "admin");
        BlazeLayout.render('index', {main: "editInitiative"});
    }
});

FlowRouter.route('/admin/initiatives/:_id/edit/campaigns', {
    subscriptions: function (params) {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
        this.register('campaignInsightList', Meteor.subscribe('campaignInsightList', params._id));
    },
    name: "editInitiativeCampaigns",
    action: function () {
        Session.set("route", "admin");
        BlazeLayout.render('index', {main: "editInitiativeCampaigns"});
    }
});

FlowRouter.route('/admin/initiatives/:_id/aggregate', {
    subscriptions: function () {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
    },
    name: "initiativeAggregate",
    action: function () {
        Session.set("route", "admin");
        BlazeLayout.render('index', {main: "initiativeAggregate"});
    }
});

FlowRouter.route('/initiatives/new', {
    subscriptions: function () {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
        this.register('Brands', Meteor.subscribe('Brands'));
        this.register("Agencies", Meteor.subscribe("Agencies"));
    },
    name: 'newInitiative',
    action: function (params) {
        BlazeLayout.render('index', {main: 'newInitiative'});
    }
});

FlowRouter.route('/terms', {
    name: "terms",
    action: function () {
        BlazeLayout.render('index', {main: "terms"});
    }
});

// ----------------------- SPENDING ----------------------- //

FlowRouter.route('/admin/spending', {
    subscriptions: function () {
        const params = {'spending': 'spending'};
        this.register('campaignBasicsList', Meteor.subscribe('campaignBasicsList', params));
        // this.register('campaignInsightList', Meteor.subscribe('campaignInsightList', params));
        this.register('insightsBreakdownByDaysList', Meteor.subscribe('insightsBreakdownByDaysList', params));
    },
    name: 'spending',
    action: () => {
        Session.set("route", "admin");
        BlazeLayout.render("index", {main: "spending"});
    }
});

// ----------------- PDF ------------------------ //


FlowRouter.route('/admin/pdf', {
    subscriptions: function () {
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
    },
    name: 'pdf',
    action: () => {
        Session.set('route', 'admin');
        BlazeLayout.render('index', {main: 'pdf'});
    }
});

// ----------------- CALL LOG ------------------------ //


FlowRouter.route('/admin/calllog', {
    subscriptions: function () {
        const params = 'all';
        this.register('Initiatives', Meteor.subscribe('Initiatives'));
        this.register('Uploads', Meteor.subscribe('Uploads', params));
    },
    name: 'calllog',
    action: () => {
        Session.set('route', 'calllog');
        BlazeLayout.render('index', {main: 'calllog'});
    }
})


// ----------------- BOOST REQUESTS ------------------------ //


FlowRouter.route('/admin/boostrequest', {
    subscriptions: function () {
        this.register('BoostRequests', Meteor.subscribe('BoostRequests'));
        this.register('BoostTargeting', Meteor.subscribe('BoostTargeting'));
    },
    name: 'boostrequests',
    action: () => {
        BlazeLayout.render('index', {main: 'boostrequests'});
    }
});

FlowRouter.route('/admin/boostrequest/new', {
    subscriptions: function (params) {
        params['type'] = 'boost';
        this.register('BoostRequests', Meteor.subscribe('BoostRequests'));
        this.register('BoostTargeting', Meteor.subscribe('BoostTargeting'));
        this.register('Initiatives', Meteor.subscribe('Initiatives', params));
    },
    name: 'createBoostRequest',
    action: () => {
        BlazeLayout.render('index', {main: 'createBoostRequest'});
    }
});

FlowRouter.route('/admin/boostrequest/:id/edit', {
    subscriptions: function (params) {
        params['type'] = 'boost';
        this.register('BoostRequests', Meteor.subscribe('BoostRequests'));
        this.register('BoostTargeting', Meteor.subscribe('BoostTargeting'));
        this.register('Initiatives', Meteor.subscribe('Initiatives', params));
    },
    name: 'editBoostRequest',
    action: () => {
        BlazeLayout.render('index', {main: 'editBoostRequest'});
    }
});
