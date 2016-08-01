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
    return Initiatives.find({}, {sort: {'cl_status': -1}});
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
});


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
  }
});

Template.calllog.onDestroyed(() => {
  Session.set('_id', null);
  Session.set('setObj', null);
});
