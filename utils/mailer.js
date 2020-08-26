const nodemailer = require('nodemailer');
const config = require('../configuration/config');


module.exports = {
  sendMail: (recipient, subject, content, cb) => {
    var transporter = nodemailer.createTransport({
      service: config.mailer.service,
      auth: {
        user: config.mailer.sender,
        pass: config.mailer.password,
      },
    });

    var mailOptions = {
      from: config.mailer.sender,
      to: recipient,
      subject,
      html: content
    };

    return transporter.sendMail(mailOptions, cb);
  },
};
