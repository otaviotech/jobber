/* eslint-disable class-methods-use-this */
const log4js = require('log4js');
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
  }

  info(message) {
    this.getLogger().info(message);
  }

  error(exception) {
    Sentry.captureException(exception);
    this.getLogger().error(exception.message);
  }

  getLogger(category = 'default') {
    return log4js.getLogger(category);
  }
};
