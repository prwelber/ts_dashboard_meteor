import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Initiatives from '/collections/Initiatives';
import moment from 'moment-timezone';

Template.calllog.onCreated(() => {

});

Template.calllog.onRendered(() => {

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
  }
});


Template.calllog.events({
  'input #cl-table': (event, instance) => {
    // this gets init _id for the row
    const _id = event.target.parentNode.dataset._id;
    const attr = event.target.dataset.attr;
    const val = event.target.textContent;
    console.log(attr, val)
    var setObj = {};
    setObj[attr] = val
    console.log(setObj)

    // Initiatives.update(
    //   {_id: _id},
    //   {$set: {attr: val}}
    // )

  },
  'change .cl-status': (e, instance) => {
    // console.log(event.target.value);
    const _id = e.target.parentNode.parentNode.dataset._id;

    Initiatives.update(
      {_id: _id},
      {$set: {'cl_status': e.target.value}}
    )
  }
});

Template.calllog.onDestroyed(() => {

});
