const SubscriptionMetadata = require('./subscriptionMetadata.model');

module.exports = class Subscription {
    constructor({
        id,
        email,
        tags = [],
        excludeTags = [],
        metadata = new SubscriptionMetadata(),
        name,
        sources = [],
     } = {}) {
        this.id = id;
        this.email = email;
        this.tags = tags;
        this.excludeTags = excludeTags;
        this.metadata = metadata;
        this.name = name;
        this.sources = sources;
    }
}