const nodemailer = require('nodemailer');
require('dotenv').config(); 
const dotenv = require('dotenv');

dotenv.config({path: './.env'})

// Configuration du transporteur pour envoyer des mails
const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// Fonction pour envoyer l'email de confirmation
const sendFundedEmail = async (email) => {
  try {
    await transporter.sendMail({
      from: `"Property Stake" <${process.env.EMAIL_USER}>`, 
      to: email, 
      subject: 'Property status change', 
      text: `Property status change`, 
      html: `
        <p>Hello property fully funded</p>
      `, 
    });

    console.log('Email de confirmation envoyé à :', email);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email :', error);
    throw new Error('Impossible d\'envoyer l\'email de confirmation.');
  }
};

module.exports = { sendFundedEmail };
