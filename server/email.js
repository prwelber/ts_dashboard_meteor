
Meteor.startup( function () {
    process.env.MAIL_URL = "smtp://prwelber:gators4114@smtp.sendgrid.net:587"

    let toAddress = 'prwelber@gmail.com'
    // Email.send({
    //     to: toAddress,
    //     from: "philip.welber@gmail.com",
    //     subject: "Meteor Test Email",
    //     text: "This is a test email from the Meteor server"
    // });
});



