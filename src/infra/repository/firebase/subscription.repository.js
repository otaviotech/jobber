const Subscription = require('../../../model/subscription.model');
const SubscriptionMetadata = require('../../../model/subscriptionMetadata.model');

const SUBSCRIPTIONS = '/subscriptions.json';

module.exports = class SubscriptionRepository {
  constructor({ firebaseClient } = {}) {
    this.firebaseClient = firebaseClient;
  }

  async getSubscriptions() {
    const res = await this.firebaseClient.get(SUBSCRIPTIONS);
    return res.data;
  }

  async getSubscriptionsBySource(source) {
    const allSubscriptions = await this.getSubscriptions();
    const dbSubscriptions = allSubscriptions.filter((s) => s.sources.includes(source));

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
};
