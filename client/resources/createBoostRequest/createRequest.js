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
    console.log('get reactive', reactive)
    reactive.push(parseInt(event.target.dataset.index));
    console.log('event.target', event.target.dataset.index)
    console.log('set reactive', reactive);
    template.creative.set(reactive)
  },
  'click .new-targeting': (event, template) => {
    console.log('new targeting')
    template.newTargeting.set(true);
  },
  'click .pre-made-targeting': (event, template) => {
    console.log('pre-made targeting')
    template.newTargeting.set(false);
    console.log(template.newTargeting.get())
  },
  'submit .new-boost-form': (event, template) => {
    event.preventDefault();
    let boost = {};
    boost['owner'] = event.target['boost-owner'].value;
    boost['initiative'] = event.target['boost-initiative'].value;
    boost['creativeLink'] = event.target['boost-creative-link'].value;
    boost['creatives'] = [];
    var length = template.creative.get().length;
    for (let i = 1; i < length + 1; i++) {
      let creative = {};
      // creative['url'] = event.target[`boost-link-${i}`].value;
      creative['start'] = event.target[`boost-start-${i}`].value;
      creative['end'] = event.target[`boost-end-${i}`].value;
      creative['budget'] = event.target[`boost-budget-${i}`].value;
      creative['targeting'] = event.target[`boost-targeting-${i}`].value;
      creative['optimization'] = event.target[`boost-optimization-${i}`].value;
      boost.creatives.push(creative);
    }
    console.log('object to send to server', boost)
    // Meteor.call('createBoostRequest', boost, (err, res) => {
    //   if (err) { alert(err) }
    //   if (res) { console.log(res) }
    // });
  },
  'change .targeting-select': (event, template) => {
    console.log(event.target.value);
    if (event.target.value === 'new-targeting') {
      template.$("#modal1").openModal()
    }
  },
  'submit .new-targeting-form': (e, template) => {
    e.preventDefault();
    let profile = {};
    profile['name'] = e.target['targeting-name'].value;
    var genderBoxes = $("input.gender-boxes:checked").val();
    console.log('genderBoxes', genderBoxes)
    profile['genderBoxes'] = genderBoxes;
    profile['minAge'] = e.target['targeting-min-age'].value;
    profile['maxAge'] = e.target['targeting-max-age'].value;
    profile['location'] = e.target['targeting-location'].value;
    profile['interests'] = e.target['targeting-interests'].value;
    var connections = $("input.connections:checked").val();
    profile['connections'] = connections;

    console.log(profile)
    // send to server
    Meteor.call('createBoostTargeting', profile, (err, res) => {
      if (err) { alert(err) }
      if (res) { console.log(res) }
    });

  }
});
