import Counter from '/collections/Counter';

Meteor.startup(function () {
  if (Counter.findOne() === null || Counter.findOne() === undefined || !Counter.find()) {
    console.log('creating counter at number 3000');
    Counter.insert({'counter': 1, 'number': 3000});
  }
});

