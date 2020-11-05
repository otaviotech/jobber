module.exports = {
  gmail: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },

  sentry: {
    dsn: process.env.SENTRY_DSN,
  },

  environment: {
    isProduction: process.env.NODE_ENV === 'production',
  },
};
