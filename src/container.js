require('dotenv').config();
const awilix = require('awilix');

// Values
const firebaseClient = require('./infra/repository/firebase/firebase.client');
const env = require('./env');

// Repositories
const JobRepository = require('./infra/repository/firebase/job.repository');
const SourceRepository = require('./infra/repository/firebase/source.repository');
const SubscriptionRepository = require('./infra/repository/firebase/subscription.repository');

// Domain Services
const BauruEmpregosService = require('./service/bauruEmpregos/bauruEmpregos.service');
const NotifyService = require('./service/notify.service');
const SubscriptionService = require('./service/subscription.service');

// Infra Services
const EmailService = require('./infra/service/email/email.service');
const Crawler = require('./infra/crawler');
const NodemailerAdapter = require('./infra/service/email/adapters/nodemailer.adapter');
const Logger = require('./infra/logger');

const container = awilix.createContainer({
  injectionMode: awilix.InjectionMode.PROXY,
});

// Register repositories
container.register({
  jobRepository: awilix.asClass(JobRepository),
  sourceRepository: awilix.asClass(SourceRepository),
  subscriptionRepository: awilix.asClass(SubscriptionRepository),
});

// Register domain services
container.register({
  bauruEmpregosService: awilix.asClass(BauruEmpregosService),
  notifyService: awilix.asClass(NotifyService),
  subscriptionService: awilix.asClass(SubscriptionService),
});

const nodeMailerAdapter = new NodemailerAdapter({
  service: 'gmail',
  user: env.gmail.user,
  clientId: env.gmail.clientId,
  clientSecret: env.gmail.clientSecret,
  refreshToken: env.gmail.refreshToken,
});

// Register infra services
container.register({
  emailService: awilix.asValue(new EmailService({ adapter: nodeMailerAdapter })),
  logger: awilix.asClass(Logger),
});

container.register({
  crawler: awilix.asClass(Crawler),
});

// Register values
container.register({
  firebaseClient: awilix.asValue(firebaseClient),
  env: awilix.asValue(env),
});

module.exports = container;
