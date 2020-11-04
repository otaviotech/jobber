const Notification = require('../model/notification.model');

module.exports = class SubscriptionService {
    constructor({ subscriptionRepository } = {}) {
        this.subscriptionRepository = subscriptionRepository;
    }

    async getSubscriptionsBySource(source) {
        return this.subscriptionRepository.getSubscriptionsBySource(source);
    }

    async getNotificationsBySubscription(source, jobs) {
        const subscriptions = await this.getSubscriptionsBySource(source);

        const notifications = [];

        const asCaseInsensitiveRegExp = str => new RegExp(str, 'i');

        subscriptions.forEach((subscription) => {
            jobs.forEach((job) => {
                const titleMatches = subscription.tags.some((tag => asCaseInsensitiveRegExp(tag).test(job.title)));
                const descriptionMatches = subscription.tags.some((tag => asCaseInsensitiveRegExp(tag).test(job.description)));

                const titleMatchesExclude = subscription.excludeTags.some((excludeTag => asCaseInsensitiveRegExp(excludeTag).test(job.title)));
                const descriptionMatchesExclude = subscription.excludeTags.some((excludeTag => asCaseInsensitiveRegExp(excludeTag).test(job.description)));

                const shouldExclude = titleMatchesExclude || descriptionMatchesExclude;
                const shouldNotify = !shouldExclude && (titleMatches || descriptionMatches);

                if (!shouldNotify) {
                    return;
                }

                let notification = notifications.find(n => n.subscription.id === subscription.id);
                let isNewNotification = !notification;

                if (!notification) {
                    notification = new Notification({ subscription, jobs: [] });
                }


                const isNewJob = !notification.jobs.find(j => j.id === job.id);
                
                if (isNewJob) {
                    notification.jobs.push(job);
                }

                if (isNewNotification) {
                    notifications.push(notification);
                }
            });
        });

        return notifications.map(n => new Notification({ 
            subscription: n.subscription, 
            jobs: n.jobs,
        }));
    }
};