import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Initiatives from '/collections/Initiatives';
import Uploads from '/collections/Uploads';
import moment from 'moment-timezone';
import mastFunc from '../masterFunctions';

Template.calllog.onCreated(() => {

});

Template.calllog.onRendered(() => {
  $('.modal-trigger').leanModal({
    dismissible: true,
    opacity: .8,
    in_duration: 400,
    out_duration: 300
  });
});

Template.calllog.helpers({
  isReady: (sub1) => {
    if (FlowRouter.subsReady(sub1)) {
      return true;
    }
  },
  showInits: () => {
    const sort = Session.get('cl-sort');
    const sortBy = Session.get('cl-sort-by');
    if (! sort) {
      return Initiatives.find({}, {sort: {'cl_status': -1}});
    } else {
      if (sort === "Name") {
        return Initiatives.find({}, {sort: {'cl_status': -1, name: sortBy}});
      } else if (sort === "Owner") {
        return Initiatives.find({}, {sort: {'cl_status': -1, owner: sortBy}});
      } else if (sort === "Agency") {
        return Initiatives.find({}, {sort: {'cl_status': -1, agency: sortBy}});
      } else if (sort === "Brand") {
        return Initiatives.find({}, {sort: {'cl_status': -1, brand: sortBy}})
      } else if (sort === "LI#1 Start") {
        return Initiatives.find({}, {sort: {'cl_status': -1, 'lineItems.0.startDate': sortBy}});
      } else if (sort === "LI#1 End") {
        return Initiatives.find({}, {sort: {'cl_status': -1, 'lineItems.0.endDate': sortBy}});
      } else if (sort === "Total Budget") {
        return Initiatives.find({}, {sort: {'cl_status': -1, 'aggregateData.totalBudget': sortBy}});
      }
    }
  },
  time: (timeString) => {
    return moment(timeString, moment.ISO_8601).format('MM/DD/YYYY');
  },
  status: (_id) => {
    const init = Initiatives.findOne({_id: _id});
    return init.cl_status || init['cl']['status']
  },
  statusBackground: (_id) => {
    const init = Initiatives.findOne({_id: _id});
    if (init.cl_status === 'Ordered') {
      return 'background-color: #E7FFED';
    } else if (init.cl_status === 'Completed') {
      return 'background-color: #a8baa7';
    } else if (init.cl_status === 'Pending') {
      return 'background-color: #e6ebff';
    } else if (init.cl_status === 'Dead Pool') {
      return 'background-color: #ffe6e6';
    }
  },
  change: (_id) => {
    if (Session.get('_id') === _id) {
      return true;
    } else {
      return false;
    }
  },
  getUploads: () => {
    const initName = Session.get('modal');
    return Uploads.find({initiative: initName});
  },
  modalName: () => {
    return Session.get('modal');
  },
  fileType: (type) => {
    if (/(spreadsheet|sheet)/g.test(type)) {
      return "fa-file-excel-o";
    } else if (/pdf/.test(type)) {
      return "fa-file-pdf-o";
    } else if (/plain/.test(type)) {
      return "fa-file-text-o";
    } else if (/png/.test(type)) {
      return "fa-file-image-o";
    } else if (/(javascript|html)/g.test(type)) {
      return "fa-file-code-o";
    } else if (/(word|processing)/g.test(type)) {
      return "fa-file-word-o";
    } else {
      return "fa-file-o";
    }
  },
  'money': (num) => {
    return mastFunc.money(num);
  },
  total: (_id) => {
    const init = Initiatives.findOne({_id: _id});
    let total = 0;
    const arr = ['cl_q1', 'cl_q2', 'cl_q3', 'cl_q4'];

    for (let i = 0; i < arr.length; i++) {
      if (init) {
        if (init[arr[i]]) {
          total += parseFloat(init[arr[i]])
        }
      }
    }
    return total;
  },
  num: (num) => {
    return mastFunc.twoDecimals(num);
  },
  quarterStats: () => {
    const inits = Initiatives.find().fetch();

    let ordered = {
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      tb: 0 // total budget
    };

    inits.forEach(init => {

      if (init.cl_q1 && (init.cl_status === "Ordered" || init.cl_status === "Completed")) {
        ordered.q1 += parseFloat(init.cl_q1);
        ordered.tb += parseFloat(init.cl_q1)
      }
      if (init.cl_q2 && (init.cl_status === "Ordered" || init.cl_status === "Completed")) {
        ordered.q2 += parseFloat(init.cl_q2);
        ordered.tb += parseFloat(init.cl_q2)
      }
      if (init.cl_q3 && (init.cl_status === "Ordered" || init.cl_status === "Completed")) {
        ordered.q3 += parseFloat(init.cl_q3);
        ordered.tb += parseFloat(init.cl_q3)
      }
      if (init.cl_q4 && (init.cl_status === "Ordered" || init.cl_status === "Completed")) {
        ordered.q4 += parseFloat(init.cl_q4);
        ordered.tb += parseFloat(init.cl_q4)
      }
    });
    return ordered;
  }
});

// ---------------------------- EVENTS ---------------------------- //


Template.calllog.events({
  'input #cl-table': (event, instance) => {
    // this gets init _id for the row
    const _id = event.target.parentNode.dataset._id;
    const attr = event.target.dataset.attr;
    const val = event.target.textContent;
    var setObj = {
      [attr]: val
    };
    Session.set('_id', _id);
    Session.set('setObj', setObj);
  },
  'change .cl-status': (e, instance) => {
    // console.log(event.target.value);
    const _id = e.target.parentNode.parentNode.dataset._id;

    Initiatives.update(
      {_id: _id},
      {$set: {'cl_status': e.target.value}}
    )
  },
  'click .cl-change-button': (e, instance) => {
    e.stopPropagation();
    e.preventDefault();
    const _id = Session.get('_id');
    const setObj = Session.get('setObj');
    Initiatives.update(
      {_id: _id},
      {$set: setObj}
    )
    Session.set('_id', null);
    Session.set('setObj', null);
  },
  'click .modal-trigger': (e, instance) => {
    Session.set('modal', e.target.getAttribute('id'));
    $('#cl-modal').openModal();
  },
  'click .cl-header': (e, instance) => {
    Session.set('cl-sort', e.target.textContent);
    if (Session.get('cl-sort-by')) {
      Session.set('cl-sort-by', Session.get('cl-sort-by') * -1);
    } else {
      Session.set('cl-sort-by', 1);
    }
  }
});

Template.calllog.onDestroyed(() => {
  Session.keys = {};
});
