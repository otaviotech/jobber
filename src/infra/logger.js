/* eslint-disable class-methods-use-this */
const log4js = require('log4js');
const logdna = require('logdna');
const os = require('os');
const Sentry = require('@sentry/node');

module.exports = class Logger {
  constructor({ env }) {
    Sentry.init({
      dsn: env.sentry.dsn,
      environment: process.env.NODE_ENV || 'development',
    });

    log4js.configure({
      appenders: {
        console: { type: 'console' },
      },

      categories: {
        default: {
          appenders: ['console'], level: 'debug',
        },
      },
    });

    const options = {
      hostname: os.hostname(),
      app: 'Jobber',
      env: process.env.NODE_ENV || 'development',
    };

    this.logdnaLogger = logdna.createLogger(env.logdna.apiKey, options);
  }

  info(message) {
    this.getLogger().info(message);
    this.logdnaLogger.log(message);
  }

  error(exception) {
    Sentry.captureException(exception);
    this.getLogger().error(exception.message);
    this.logdnaLogger.error(exception);
  }

  getLogger(category = 'default') {
    return log4js.getLogger(category);
  }
};
