var nodemailer = require('nodemailer');
const smtpconfig = require('./mailerconfig');
var mailerutil = module.exports = Object.create(null)
mailerutil.sendEmail=function(myMailOptions) {

    var smtpTransport = nodemailer.createTransport({
        host: smtpconfig.host,
        port: smtpconfig.port,
        secure: false,
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }
    });



    var mailOptions = {
        from: myMailOptions.from,
        to: myMailOptions.to,
        subject: myMailOptions.subject,
        text: myMailOptions.text
    };

    smtpTransport.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}




