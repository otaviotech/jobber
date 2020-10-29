const Crawler = require('crawler');

module.exports = function () {
    const crawler = new Crawler({});

    async function getPage(url) {
        return new Promise(function (resolve, reject) {
            crawler.queue({
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

    return {
        getPage,
    }
};