const fs = require('fs');
const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Gearbox <${process.env.EMAIL_FROM}>`;
  }

  // TODO : Create A transporter
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: process.env.TURBO_EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.TURBO_USERNAME,
          pass: process.env.TURBO_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: template,
    };
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    const templateWelcome = fs.readFileSync(
      `${__dirname}/../views/Welcome.html`,
      'utf-8'
    );
    const html = templateWelcome
      .replace(/{{firstName}}/g, this.firstName)
      .replace(/{{url}}/g, this.url);
    await this.send(html, 'Welcome to the Gearbox family!');
  }

  async sendPasswordReset() {
    const templatePasswordReset = fs.readFileSync(
      `${__dirname}/../views/reset.html`,
      'utf-8'
    );
    const html = templatePasswordReset
      .replace(/{{firstName}}/g, this.firstName)
      .replace(/{{otp}}/g, this.url);

    await this.send(
      html,
      'Your OTP to reset password (valid for only 10 minutes)'
    );
  }
};
