const nodemailer = require('nodemailer');
const { google } = require('googleapis');

module.exports = class NodemailerAdapter {
  constructor({
    service, user, clientId, clientSecret, refreshToken,
  } = {}) {
    const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

    this.oAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      REDIRECT_URI,
    );

    this.oAuth2Client.setCredentials({ refresh_token: refreshToken });

    this.transporter = nodemailer.createTransport({
      service,
      auth: {
        type: 'OAuth2',
        user,
        clientId,
        clientSecret,
        refreshToken,
      },
    });
  }

  async sendEmail(mailOptions) {
    const options = { ...mailOptions };

    if (options.html) {
      delete options.text;
    }

    return new Promise((resolve, reject) => {
      this.transporter.sendMail(options, (error, info) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(info);
      });
    });
  }
};
