Template.admin.helpers({
    'getCurrentUser': function () {
        let user = Meteor.userId();
        return user;
    }
});

Template.createUser.helpers({
  'getInits': function () {
    return Initiatives.find({}, {sort: {name: 1}});
  }
});

Template.createUser.events({
  "submit #create-user-form": function (event, template) {
    event.preventDefault();
    const firstName = template.find('[name="first-name"]').value;

    // get all agencies
    const select = document.getElementsByName("agency");
    const agencyArray = [];
    for (let i = 0; i < select[0].length; i++) {
      if (select[0][i].selected === true) {
        agencyArray.push(select[0][i].value);
      }
    }

    // get all initiatives
    const initSelect = document.getElementsByName("initiatives");
    const initArray = [];
    for (let i = 0; i < initSelect[0].length; i++) {
      if (initSelect[0][i].selected === true) {
        initArray.push(initSelect[0][i].value);
      }
    }

    const options = {
      firstName: template.find('[name="first-name"]').value,
      lastName: template.find('[name="last-name"]').value,
      email: template.find('[name="email"]').value,
      password: template.find('[name="password"]').value,
      agency: agencyArray,
      initiatives: initArray,
      admin: template.find('[name="adminCheckbox"]').checked
    }

    console.log(options);

    Accounts.createUser(options, function (err) {
      if (err) {
        alert(err);
      } else {
        Materialize.toast('User Created!', 2000);
      }
    })

    // Accounts.createUser({
    //   firstName: options.firstName,
    //   lastName: options.lastName,
    //   email: options.email,
    //   agency: options.agency,
    //   initiatives: options.initiatives,
    //   admin: options.admin,
    //   password: options.password
    // }, function (err, res) {
    //   if (res) {
    //     console.log('user created');
    //   }
    // });

  }
});
