const NodeCrawler = require('crawler');

module.exports = class Crawler {
    constructor() {
        this.crawler = new NodeCrawler({});
    }

    async getPage(url) {
        return new Promise((resolve, reject) => {
            this.crawler.queue({
                uri: url,
                callback: (error, res, done) => {
                    if (error) {
                        reject(error);
                        return;
                    }
    
                    resolve(res);
                    done();
                }
            });
        });
    }
};