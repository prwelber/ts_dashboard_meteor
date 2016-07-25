import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Initiatives from '/collections/Initiatives';

Template.pdf.helpers({
  isReady: (sub1) => {
    if (FlowRouter.subsReady(sub1)) {
      return true;
    }
  },
  getInits: () => {
    return Initiatives.find({}, {fields: {name: 1}, sort: {name: 1}});
  },
  clientName: () => {
    return Session.get('clientName') || '';
  },
  advertiserName: () => {
    return Session.get('advertiserName') || '';
  },
  initiativeName: () => {
    const initName = Session.get('initiativeName');
    if (initName) {
      return initName;
    }
  }
});

Template.pdf.events({
  'click #pdf-submit': (event, instance) => {
    var client = $("#pdf-client-name").val();
    var advertiser = $("#pdf-advertiser-name").val()
    var initiative = $("#pdf-initiative-name").val()
    var notes = $("#pdf-notes").val();

    var info = {
      client: client,
      advertiser: advertiser,
      initiative: initiative,
      notes: notes
    }
    const selected = $("#pdf-select").val();
    const init = Initiatives.findOne({name: selected});

    Meteor.call('generatePDF', info, init, function(err, res) {
      if (err) {
        console.error(err);
      } else if (res) {
        window.open("data:application/pdf;base64, " + res);
      }
    });
  },
  'change #pdf-select': (event, instance) => {
    const init = Initiatives.findOne({name: event.target.value});
    Session.set('initiativeName', init.name);
    Session.set('clientName', init.agency);
    Session.set('advertiserName', init.brand);
  }
});

Template.pdf.onDestroyed(() => {
  Session.set('initiativeName', null);
  Session.set('clientName', null);
  Session.set('advertiserName', null);
});
