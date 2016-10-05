import { Meteor } from 'meteor/meteor';
import { Materialize } from 'meteor/materialize:materialize';
import { FlowRouter } from 'meteor/kadira:flow-router';
import BoostRequests from '/collections/BoostRequests';
import Initiatives from '/collections/Initiatives';
import BoostTargeting from '/collections/BoostTargeting';
// import { ReactiveVar } from 'meteor/meteor:reactive-var';

Template.createBoostRequest.onCreated(function () {
  this.creative = new ReactiveVar([1]);
  this.newTargeting = new ReactiveVar(true);
});

Template.createBoostRequest.onRendered(function () {
  $('.tooltipped').tooltip({delay: 50});
  $('.modal-trigger').leanModal();
})

Template.createBoostRequest.helpers({
  isReady: (sub1, sub2) => {
    if (FlowRouter.subsReady(sub1) && FlowRouter.subsReady(sub2)) {
      return true;
    }
  },
  getUsers: () => {
    return Meteor.users.find({
      agency: {$in: ['Constellation']}
    });
  },
  getInitiatives: () => {
    return Initiatives.find({});
  },
  createRows: () => {
    return [1,2,3,4,5,6,7,8,9,10];
  },
  addOne: (num) => {
    return num + 1;
  },
  showRow: (num) => {
    var reactive = Template.instance().creative.get();
    if (reactive.indexOf(num) >= 0) { return true; }
  },
  addTwo: (num) => {
    return num + 2;
  },
  newTargeting: () => {
    var newTargeting = Template.instance().newTargeting.get();
    return newTargeting;
  },
  getBoostTargeting: () => {
    return BoostTargeting.find();
  }
});



Template.createBoostRequest.events({
  'click .boost-add-creative': (event, template) => {
    event.preventDefault();
    var reactive = template.creative.get();
    reactive.push(parseInt(event.target.dataset.index));
    template.creative.set(reactive)
  },
  'click .new-targeting': (event, template) => {
    template.newTargeting.set(true);
  },
  'click .pre-made-targeting': (event, template) => {
    template.newTargeting.set(false);
  },
  'submit .new-boost-form': (event, template) => {
    event.preventDefault();
    const date = "MM-DD-YYYY";
    let boost = {};
    boost['owner'] = event.target['boost-owner'].value;
    boost['initiative'] = event.target['boost-initiative'].value;
    boost['creativeLink'] = event.target['boost-creative-link'].value;
    boost['optimization'] = event.target[`boost-optimization`].value;
    boost['notes'] = event.target['boost-notes'].value;
    boost['creatives'] = [];
    var length = template.creative.get().length;
    for (let i = 1; i < length + 1; i++) {
      let creative = {};
      creative['start'] = moment(event.target[`boost-start-${i}`].value, date).toISOString();
      creative['end'] = moment(event.target[`boost-end-${i}`].value, date).toISOString();
      creative['budget'] = event.target[`boost-budget-${i}`].value;
      creative['targeting'] = event.target[`boost-targeting-${i}`].value;
      // creative['optimization'] = event.target[`boost-optimization-${i}`].value;
      boost.creatives.push(creative);
    }
    Meteor.call('createBoostRequest', boost, (err, res) => {
      if (err) { alert(err) }
      if (res) {
        alert('Created Successfully');
        FlowRouter.go('/admin/boostrequest');
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
      if (res) {
        Materialize.toast('Successfully Created Targeting!', 2000);
        template.$("#modal1").closeModal()
      }
    });

  }
});
