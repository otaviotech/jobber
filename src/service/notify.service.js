module.exports = function NotifyService({ emailService }) {
    async function notifyByEmail(notifications) {
        const notificationCount = notifications.length;
        const jobCount = notifications.reduce((p, c) => p + c.jobs.length, 0);

        console.log(`Notifying ${notificationCount} users about ${jobCount} new opportunities`);

        const promises = notifications.map((notification) => {
            const emailOptions = { 
                from: 'Jobber',
                to: notification.subscription.email,
                subject: notification.subscription.metadata.subject,
                text: notification.emailText,
                html: notification.emailHtml,
            };

            return emailService.sendEmail(emailOptions);
        });

        return promises;
    }

    return {
        notifyByEmail,
    };
};