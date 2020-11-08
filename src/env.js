module.exports = {
  gmail: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },

  sentry: {
    dsn: process.env.SENTRY_DSN,
  },

  logdna: {
    apiKey: process.env.LOGDNA_API_KEY,
  },

  environment: {
    isProduction: process.env.NODE_ENV === 'production',
  },
};
