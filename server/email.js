
Meteor.startup( function () {
    let pword = process.env.SENDGRID_PW;
    process.env.MAIL_URL = "smtp://prwelber:"+pword+"@smtp.sendgrid.net:587"
    console.log("SENDGRID_PW:", pword)
    let toAddress = 'prwelber@gmail.com'
    // Email.send({
    //     to: toAddress,
    //     from: "philip.welber@gmail.com",
    //     subject: "Meteor Test Email",
    //     text: "This is a test email from the Meteor server"
    // });
});



