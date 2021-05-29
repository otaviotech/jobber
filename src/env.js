module.exports = {
  gmail: {
    user: process.env.GMAIL_USER,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
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
