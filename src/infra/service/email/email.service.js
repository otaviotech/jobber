module.exports = function EmailService(adapter) {
    async function sendEmail({ from, to, subject, text, html }) {
        const mailOptions = { from, to, subject, text, html };

        return adapter.sendEmail(mailOptions);
    }

    return {
        sendEmail,
    };
};