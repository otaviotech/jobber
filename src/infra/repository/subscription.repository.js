const Subscription = require('../../model/subscription.model');
const SubscriptionMetadata = require('../../model/subscriptionMetadata.model');

module.exports = function SubscriptionRepository(db) {
    async function getSubscriptionsBySource(source) {
        const dbSubscriptions = await db
            .get('subscriptions')
            .filter(s => s.sources.includes(source))
            .value();

        const subscriptions = (dbSubscriptions || [])
            .map((dbSubscription) => new Subscription({
                id: dbSubscription.id,
                email: dbSubscription.email,
                name: dbSubscription.name,
                tags: dbSubscription.tags,
                excludeTags: dbSubscription.excludeTags,
                metadata: new SubscriptionMetadata({
                    subject: dbSubscription.metadata.subject,
                    body: dbSubscription.metadata.body,
                    footer: dbSubscription.metadata.footer,
                }),
                sources: dbSubscription.sources,
            }));

        return subscriptions;
    }

    return {
        getSubscriptionsBySource,
    };
}