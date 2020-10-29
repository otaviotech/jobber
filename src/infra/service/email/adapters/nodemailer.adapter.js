const nodemailer = require('nodemailer');

module.exports = class NodemailerAdapter {
    constructor({ service, user, pass }) {
        this.transporter = nodemailer.createTransport({
            service,
            auth: {
                user,
                pass,
            },
        });
    }

    async sendEmail(mailOptions) {
        const options = { ...mailOptions };

        if (!!options.html) {
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