import { Meteor } from 'meteor/meteor';
import { Materialize } from 'meteor/materialize:materialize';
import { FlowRouter } from 'meteor/kadira:flow-router';
import BoostRequests from '/collections/BoostRequests';
import Initiatives from '/collections/Initiatives';
import BoostTargeting from '/collections/BoostTargeting';


Template.editBoostRequest.onCreated(function () {
  this.creative = new ReactiveVar([1]);
  this.newTargeting = new ReactiveVar(true);
  this.boostRequest = new ReactiveDict();
});

Template.editBoostRequest.onRendered(function () {
  $('.tooltipped').tooltip({delay: 50});
  $('.modal-trigger').leanModal();
})

Template.editBoostRequest.helpers({
  isReady: (sub1, sub2) => {
    if (FlowRouter.subsReady(sub1) && FlowRouter.subsReady(sub2)) {
      return true;
    }
  },
  getRequest: () => {
    const id = FlowRouter.getParam('id');
    const boost = BoostRequests.findOne({_id: id})
    const template = Template.instance();

    const arr = [];
    for (let i = 1; i <= boost.creatives.length; i++) {
      arr.push(i);
    }
    template.creative.set(arr)

    Template.instance().boostRequest.set('data', boost);
    return BoostRequests.findOne({_id: id});
  },
  showRow: (num) => {
    var reactive = Template.instance().creative.get();
    if (reactive.indexOf(num) >= 0) { return true; }
  },
  newTargeting: () => {
    var newTargeting = Template.instance().newTargeting.get();
    return newTargeting;
  },
  createRows: () => {
    return [1,2,3,4,5,6,7,8,9,10];
  },
  addOne: (num) => {
    return num + 1;
  },
  addTwo: (num) => {
    return num + 2;
  },
  creativeStart: (index) => {
    const dict = Template.instance().boostRequest;
    return dict.get('data').creatives[index].start;
  },
  creativeEnd: (index) => {
    const dict = Template.instance().boostRequest;
    return dict.get('data').creatives[index].end;
  },
  creativeBudget: (index) => {
    const dict = Template.instance().boostRequest;
    return dict.get('data').creatives[index].budget;
  },
  creativeOptimization: (index) => {
    const dict = Template.instance().boostRequest;
    return dict.get('data').creatives[index].optimization;
  },
  creativeTargeting: (index) => {
    const dict = Template.instance().boostRequest;
    return dict.get('data').creatives[index].targeting;
  },
  getBoostTargeting: () => {
    return BoostTargeting.find({}, {sort: {name: 1}});
  },
  getUsers: () => {
    return Meteor.users.find({
      agency: {$in: ['Constellation']}
    });
  },
  getInitiatives: () => {
    return Initiatives.find({});
  }
});

Template.editBoostRequest.events({
  'click .boost-add-creative': (event, template) => {
    event.preventDefault();
    var reactive = template.creative.get();
    reactive.push(parseInt(event.target.dataset.index));
    template.creative.set(reactive)
  },
  'submit .new-boost-form': (event, template) => {
    event.preventDefault();
    let boost = {};
    const date = "MM-DD-YYYY";
    const _id = FlowRouter.getParam('id');
    boost['_id'] = _id;
    boost['owner'] = event.target['boost-owner'].value;
    boost['initiative'] = event.target['boost-initiative'].value;
    boost['creativeLink'] = event.target['boost-creative-link'].value;
    boost['notes'] = event.target['boost-notes'].value;
    boost['creatives'] = [];
    var length = template.creative.get().length;
    for (let i = 1; i < length + 1; i++) {
      let creative = {};
      // creative['url'] = event.target[`boost-link-${i}`].value;
      creative['start'] = moment(event.target[`boost-start-${i}`].value).toISOString();
      creative['end'] = moment(event.target[`boost-end-${i}`].value).toISOString();
      creative['budget'] = event.target[`boost-budget-${i}`].value;
      creative['targeting'] = event.target[`boost-targeting-${i}`].value;
      creative['optimization'] = event.target[`boost-optimization-${i}`].value;
      boost.creatives.push(creative);
    }
    console.log('object to send to server', boost)
    Meteor.call('updateBoostRequest', boost, (err, res) => {
      if (err) { alert(err) }
      if (res) {
        alert('Updated Successfully');
        FlowRouter.go('/admin/boostrequest')
      }
    });
  },
  'change .targeting-select': (event, template) => {
    if (event.target.value === 'new-targeting') {
      template.$("#modal1").openModal()
    }
  },
  'submit .new-targeting-form': (e, template) => {
    e.preventDefault();
    let profile = {};
    profile['name'] = e.target['targeting-name'].value;
    var genderBoxes = $("input.gender-boxes:checked").val();
    profile['genderBoxes'] = genderBoxes;
    profile['minAge'] = e.target['targeting-min-age'].value;
    profile['maxAge'] = e.target['targeting-max-age'].value;
    profile['location'] = e.target['targeting-location'].value;
    profile['interests'] = e.target['targeting-interests'].value;
    var connections = [];

    var connectionArr = $("input.connections:checked");

    for (let i = 0; i < connectionArr.length; i++) {
      connections.push(connectionArr[i].value);
    }

    profile['connections'] = connections;

    // send to server
    Meteor.call('createBoostTargeting', profile, (err, res) => {
      if (err) { alert(err) }
      if (res) { console.log(res) }
    });

  }
})
