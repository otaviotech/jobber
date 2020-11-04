module.exports = class EmailService {
  constructor({ adapter } = {}) {
    this.adapter = adapter;
  }

  async sendEmail({
    from, to, subject, text, html,
  }) {
    const mailOptions = {
      from, to, subject, text, html,
    };

    return this.adapter.sendEmail(mailOptions);
  }
};
