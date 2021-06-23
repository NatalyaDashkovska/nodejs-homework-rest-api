const sgMail = require('@sendgrid/mail');
const Mailgen = require('mailgen');
require('dotenv').config();

const createTemplate = (verificationToken, name) => {
  // console.log(verificationToken);
  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'System Contacts',
      link: 'http://localhost:3000',
    },
  });
  const template = {
    body: {
      name,
      intro:
        "Welcome to System Contacts! We're very excited to have you on board.",
      action: {
        instructions: 'To get started with System Contacts, please click here:',
        button: {
          color: '#22BC66', // Optional action button color
          text: 'Confirm your account',
          link: `http://localhost:3000/api/users/verify/${verificationToken}`,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
  const emailBody = mailGenerator.generate(template);
  return emailBody;
};

const sendEmail = async (verificationToken, email, name) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const emailBody = createTemplate(verificationToken, name);
  const msg = {
    to: email, // Change to your recipient
    from: 'dashkovsk@gmail.com', // Change to your verified sender
    subject: 'Sending with SendGrid is Fun',

    html: emailBody,
  };
  // console.log(msg);
  await sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent');
    })
    .catch(error => {
      console.error(error);
    });
};

module.exports = sendEmail;
