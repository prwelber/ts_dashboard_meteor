
Meteor.startup( function () {
    process.env.MAIL_URL = "smtp://prwelber:"+process.env.SENDGRID_PW+"@smtp.sendgrid.net:587"
    console.log(process.env.SENDGRID_PW)
    let toAddress = 'prwelber@gmail.com'
    // Email.send({
    //     to: toAddress,
    //     from: "philip.welber@gmail.com",
    //     subject: "Meteor Test Email",
    //     text: "This is a test email from the Meteor server"
    // });
});



