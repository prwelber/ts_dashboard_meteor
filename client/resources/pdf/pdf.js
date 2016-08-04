import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Initiatives from '/collections/Initiatives';
import moment from 'moment-timezone';

Template.pdf.onCreated(function () {
  this.lineItems = new ReactiveDict();
  this.lineItems.set('lineItems', []);
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
  },
  costPlus: () => {
    const items = Template.instance().lineItems.get('lineItems');
    returnObj = {
      checked: '',
      percent: ''
    }

    if (items[0].cost_plus === true) {
      returnObj.checked = 'checked';
    } else {
      returnObj.checked = '';
    }

    if (items[0].costPlusPercent) {
      returnObj.percent = items[0].costPlusPercent;
    } else {
      returnObj.percent = '';
    }
    return returnObj;
  },
  maxPrice: () => {
    const items = Template.instance().lineItems.get('lineItems');
    if (items[0].percent_total === true) {
      return 'checked';
    }
  }
});

// --------------------- EVENTS --------------------- //

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
    var maxPrice = $("#pdf-max-price").is(":checked");
    var feeIncluded = $("#pdf-fee-included").is(":checked");
    var fee = $("#pdf-fee").val();

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
      sendInvoice: sendInvoice,
      maxPrice: maxPrice,
      feeIncluded: feeIncluded,
      fee: fee
      // itemObject: itemObject,
      // targeting: targeting
    }

    const selected = $("#pdf-select").val();
    const init = Initiatives.findOne({name: selected});
    // add manually entered to initiative
    init.lineItems = instance.lineItems.get('lineItems');

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
  },
  'click #pdf-add-item': (event, instance) => {
    const platform = instance.$('#pdf-item-platform').val();
    let startDate = instance.$('#pdf-item-start').val();
    let endDate = instance.$('#pdf-item-end').val();
    const dealType = instance.$('#pdf-item-dealType').val();
    const price = instance.$('#pdf-item-price').val();
    const quantity = instance.$('#pdf-item-delivery').val();
    const budget = instance.$('#pdf-item-budget').val();
    // ---- CONVERT TIMES ----- //
    startDate = moment(startDate, "MM/DD/YYYY").toISOString();
    endDate = moment(endDate, "MM/DD/YYYY").toISOString();
    // ------------------------ //
    const addItem = {
      platform: platform,
      startDate: startDate,
      endDate: endDate,
      dealType: dealType,
      price: price,
      quantity: quantity,
      budget: budget
    }

    const items = instance.lineItems.get('lineItems');
    items.unshift(addItem);
    instance.lineItems.set('lineItems', items);

    const itemArray = ['platform', 'start', 'end', 'dealType', 'price', 'delivery', 'budget'];

    for (let i = 0; i < itemArray.length; i++) {
      instance.$('#pdf-item-' + itemArray[i]).val("");
    }

  }
});

Template.pdf.onDestroyed(() => {
  Session.set('initiativeName', null);
  Session.set('clientName', null);
  Session.set('advertiserName', null);
});
