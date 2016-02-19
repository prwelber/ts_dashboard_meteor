
// Need to remember this file is in .gitignore because of password
// Meteor.startup( function () {
//     // let pword = process.env.SENDGRID_PW;
//     process.env.MAIL_URL = "smtp://prwelber:gators4114@smtp.sendgrid.net:587"
//     let toAddress = 'prwelber@gmail.com'
//     let subject = 'This is a test email from Meteor'
//     Email.send({
//         to: toAddress,
//         from: "philip.welber@gmail.com",
//         subject: subject,
//         text: "This is a test email from the Meteor server"
//     });
// });

// details = {
//     to:
//     from:
//     subject:
//     text:
// }
function sendSomething (details) {
    Email.send(details)
}
