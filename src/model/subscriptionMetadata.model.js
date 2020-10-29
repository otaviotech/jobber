module.exports = class SubscriptionMetadata {
    constructor({ subject, body, footer } = {}) {
        this.subject = subject;
        this.body = body;
        this.footer = footer;
    }
}