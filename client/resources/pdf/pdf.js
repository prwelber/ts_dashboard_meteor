import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Initiatives from '/collections/Initiatives';
import moment from 'moment-timezone';

Template.pdf.onCreated(function () {
  this.lineItems = new ReactiveDict();
  this.lineItems.set('lineItems', null);
});

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
  },
  lineItems: () => {
    const items = Template.instance().lineItems.get('lineItems');
    var arr = [];
    items.forEach(item => {
      if (item.price) {
        arr.push(item);
      }
    });
    return arr;
  },
  initSelected: () => {
    const bool = Template.instance().lineItems.get('lineItems');
    if (bool) {
      return true;
    }
  },
  time: (date) => {
    return moment(date, moment.ISO_8601).format("MM/DD/YYYY");
  }
});

Template.pdf.events({
  'click #pdf-submit': (event, instance) => {
    var client = $("#pdf-client").val();
    var advertiser = $("#pdf-advertiser-name").val()
    var initiative = $("#pdf-initiative-name").val()
    var clientName = $("#pdf-client-name").val();
    var clientTitle = $("#pdf-client-title").val();
    var tsName = $("#pdf-ts-name").val();
    var tsTitle = $("#pdf-ts-title").val();
    var paymentTerms = $("#pdf-payment-terms").val();
    var notes = $("#pdf-notes").val();
    var sendInvoice = $("#pdf-send-invoice").val();
    var itemObject = {
      0: {},
      1: {},
      2: {},
      3: {},
      4: {}
    };
    let itemLength;

    // var targeting = $("#pdf-targeting").val();

    for (let i = 0; i <= 4; i++) {
      var URL = instance.$("#pdf-url" + i).val();

      if (URL) {
        var select = instance.$("#pdf-select" + i).val();
        itemObject[i]['select'] = select;
        itemObject[i]['url'] = URL;
      }
    }

    var info = {
      client: client,
      advertiser: advertiser,
      initiative: initiative,
      clientName: clientName,
      clientTitle: clientTitle,
      tsName: tsName,
      tsTitle: tsTitle,
      paymentTerms: paymentTerms,
      notes: notes,
      itemObject: itemObject,
      sendInvoice: sendInvoice
      // targeting: targeting
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
    instance.lineItems.set('lineItems', init.lineItems);
  }
});

Template.pdf.onDestroyed(() => {
  Session.set('initiativeName', null);
  Session.set('clientName', null);
  Session.set('advertiserName', null);
});
