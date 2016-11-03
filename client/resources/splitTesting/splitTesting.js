import { Meteor } from 'meteor/meteor';

Template.splitTesting.events({
  'submit .split-form': (event, instance) => {
    event.preventDefault();

    const name = event.target.test_name.value;
    const description = event.target.test_desc.value;
    const a = event.target.item_a.value;
    const b = event.target.item_b.value;

    let start = event.target.start.value;
    let end = event.target.end.value;
    console.log(start, end)
    start = moment(start, 'MM-DD-YYYY hh:mm a');
    console.log('start', moment(start).format('MM-DD-YYYY hh:mm a'))
    end = moment(end, 'MM-DD-YYYY hh:mm a');
    console.log('end', moment(end).format('MM-DD-YYYY hh:mm a'))
    start = moment(start).unix();
    end = moment(end).unix();

    const data = {
      name: name,
      description: description,
      start: start,
      end: end,
      a: a,
      b: b
    }

    Meteor.call('createSplitTest', data, function(err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
      }
    });

    console.log('form submitted', data)
  }
});
