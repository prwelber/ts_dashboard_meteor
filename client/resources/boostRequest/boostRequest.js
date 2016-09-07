import BoostRequests from '/collections/BoostRequests';
import BoostTargeting from '/collections/BoostTargeting';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor'
import { formatters } from '/both/utilityFunctions/formatters';

Template.boostrequests.onCreated(function() {
  this.modalData = new ReactiveDict();
});

Template.boostrequests.onRendered(function() {
  $('.modal-trigger').leanModal();
});

Template.boostrequests.helpers({
  isReady: (sub1) => {
    if (FlowRouter.subsReady(sub1)) {
      return true;
    }
  },
  getRequests: () => {
    const mon = Session.get('month');
    console.log('month', mon);
    const year = new Date().getFullYear();


    // switch statement for filtering by month
    switch (mon) {

      case "1":
        var start = moment('1-1-'+year, 'MM-DD-YYYY').toISOString();
        var end = moment('1-31-'+year, 'MM-DD-YYYY').toISOString();
        return BoostRequests.find({
            creatives: { $elemMatch: { start: {$gte: start, $lte: end } } }
          });
        break;
      case "2":
        var start = moment('2-1-'+year, 'MM-DD-YYYY').toISOString();
        var end = moment('2-29-'+year, 'MM-DD-YYYY').toISOString();
        return BoostRequests.find({
            creatives: { $elemMatch: { start: {$gte: start, $lte: end } } }
          });
        break;
      case "3":
        var start = moment('3-1-'+year, 'MM-DD-YYYY').toISOString();
        var end = moment('3-31-'+year, 'MM-DD-YYYY').toISOString();
        return BoostRequests.find({
            creatives: { $elemMatch: { start: {$gte: start, $lte: end } } }
          });
        break;
      case "4":
        var start = moment('4-1-'+year, 'MM-DD-YYYY').toISOString();
        var end = moment('4-30-'+year, 'MM-DD-YYYY').toISOString();
        return BoostRequests.find({
            creatives: { $elemMatch: { start: {$gte: start, $lte: end } } }
          });
        break;
      case "5":
        var start = moment('5-1-'+year, 'MM-DD-YYYY').toISOString();
        var end = moment('5-31-'+year, 'MM-DD-YYYY').toISOString();
        return BoostRequests.find({
            creatives: { $elemMatch: { start: {$gte: start, $lte: end } } }
          });
        break;
      case "6":
        var start = moment('6-1-'+year, 'MM-DD-YYYY').toISOString();
        var end = moment('6-30-'+year, 'MM-DD-YYYY').toISOString();
        return BoostRequests.find({
            creatives: { $elemMatch: { start: {$gte: start, $lte: end } } }
          });
        break;
      case "7":
        var start = moment('7-1-'+year, 'MM-DD-YYYY').toISOString();
        var end = moment('7-31-'+year, 'MM-DD-YYYY').toISOString();
        return BoostRequests.find({
            creatives: { $elemMatch: { start: {$gte: start, $lte: end } } }
          });
        break;
      case "8":
        var start = moment('8-1-'+year, 'MM-DD-YYYY').toISOString();
        var end = moment('8-31-'+year, 'MM-DD-YYYY').toISOString();
        return BoostRequests.find({
            creatives: { $elemMatch: { start: {$gte: start, $lte: end } } }
          });
        break;
      case "9":
        var start = moment('9-1-'+year, 'MM-DD-YYYY').toISOString();
        var end = moment('9-30-'+year, 'MM-DD-YYYY').toISOString();
        return BoostRequests.find({
            creatives: { $elemMatch: { start: {$gte: start, $lte: end } } }
          });
        break;
      case "10":
        var start = moment('10-1-'+year, 'MM-DD-YYYY').toISOString();
        var end = moment('10-31-'+year, 'MM-DD-YYYY').toISOString();
        return BoostRequests.find({
            creatives: { $elemMatch: { start: {$gte: start, $lte: end } } }
          });
        break;
      case "11":
        var start = moment('11-1-'+year, 'MM-DD-YYYY').toISOString();
        var end = moment('11-30-'+year, 'MM-DD-YYYY').toISOString();
        return BoostRequests.find({
            creatives: { $elemMatch: { start: {$gte: start, $lte: end } } }
          });
        break;
      case "12":
        var start = moment('12-1-'+year, 'MM-DD-YYYY').toISOString();
        var end = moment('12-31-'+year, 'MM-DD-YYYY').toISOString();
        return BoostRequests.find({
            creatives: { $elemMatch: { start: {$gte: start, $lte: end } } }
          });
        break;
      default:
        return BoostRequests.find({}, {sort: {created: -1}});
    }

    // return BoostRequests.find({}, {sort: {created: -1}});
  },
  date: (date) => {
    return formatters.time(date);
  },
  modalData: () => {
    console.log('modalData', Template.instance().modalData.get('data'))
    return Template.instance().modalData.get('data');
  },
  getGender: (name) => {
    console.log('name', name)
    return BoostTargeting.findOne({name: name}).gender;
  },
  getMinAge: (name) => {
    return BoostTargeting.findOne({name: name}).minAge;
  },
  getMaxAge: (name) => {
    return BoostTargeting.findOne({name: name}).maxAge;
  },
  getLocation: (name) => {
    return BoostTargeting.findOne({name: name}).location;
  },
  getInterests: (name) => {
    return BoostTargeting.findOne({name: name}).interests;
  },
  getConnections: (name) => {
    return BoostTargeting.findOne({name: name}).connections;
  },
  statusBackground: (_id) => {
    const boost = BoostRequests.findOne({_id: _id});
    if (boost.status === 'Requested') {
      return 'background-color: #bbdefb';
    } else if (boost.status === 'Scheduled') {
      return 'background-color: #c5e1a5';
    } else if (boost.status === 'Modified') {
      return 'background-color: #fff59d';
    } else if (boost.status === 'Cancelled') {
      return 'background-color: #ef9a9a';
    }
  },
  getTargets: () => {
    return BoostTargeting.find({}, {sort: {name: 1}});
  }
});



Template.boostrequests.events({
  'click .link-to-creatives': (event, template) => {
    event.preventDefault();
    const boost = BoostRequests.findOne({_id: event.target.dataset._id});
    template.modalData.set('data', boost);
    template.$("#modal1").openModal();
  },
  'click .delete-boost-request': (event, template) => {
    event.preventDefault();
    const id = event.target.dataset.identifier;

    Meteor.call('deleteBoostRequest', id, (err, res) => {
      if (err) { alert('There was an error!') }
    });
  },
  'click .month-selector': (event, template) => {
    $('.month-selector').css('background-color', 'white');
    if (event.target.dataset.month === 'null') {
      Session.set('month', null);
      return;
    }
    event.target.style.backgroundColor = 'lightblue';
    Session.set('month', event.target.dataset.month);
  },
  'change .boost-status': (e, instance) => {
    // console.log(event.target.value);
    const _id = e.target.parentNode.parentNode.dataset._id;

    BoostRequests.update(
      {_id: _id},
      {$set: {'status': e.target.value}}
    )
  },
  'click .view-targeting-profiles': (event, template) => {
    template.$("#modal2").openModal();
  },
  'click .delete-targeting': (event, template) => {
    event.preventDefault();
    const id = event.target.dataset.id;
    Meteor.call('deleteBoostTargeting', id, (err, res) => {
      if (err) { alert(err) }
    });
  }
});


Template.boostrequests.onDestroyed(function () {
  Session.set('month', null);
});
