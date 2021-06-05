const Subscription = require('../../model/subscription.model');
const SubscriptionMetadata = require('../../model/subscriptionMetadata.model');

module.exports = class SubscriptionRepository {
  constructor({ db } = {}) {
    this.db = db;
  }

  async getSubscriptionsBySource(source) {
    const dbSubscriptions = await this.db
      .get('subscriptions')
      .filter((s) => s.sources.includes(source))
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
        cities: dbSubscription.cities,
      }));

    return subscriptions;
  }
};
