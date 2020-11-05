module.exports = class NotifyService {
  constructor({ emailService, logger } = {}) {
    this.emailService = emailService;
    this.logger = logger;
  }

  async notifyByEmail(notifications) {
    const notificationCount = notifications.length;
    const jobCount = notifications.reduce((p, c) => p + c.jobs.length, 0);

    const source = notifications[0].jobs[0].jobSource;

    this.logger.info(`[NotifyService] Notifying ${notificationCount} users about ${jobCount} new opportunities from source ${source}.`);

    const promises = notifications.map((notification) => {
      const emailOptions = {
        from: 'Jobber',
        to: notification.subscription.email,
        subject: notification.subscription.metadata.subject,
        text: notification.emailText,
        html: notification.emailHtml,
      };

      return this.emailService.sendEmail(emailOptions);
    });

    return promises;
  }
};
