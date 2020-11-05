require('dotenv').config();
const awilix = require('awilix');

// Values
const db = require('./infra/db');
const env = require('./env');

// Repositories
const JobRepository = require('./infra/repository/job.repository');
const SourceRepository = require('./infra/repository/source.repository');
const SubscriptionRepository = require('./infra/repository/subscription.repository');

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
  pass: env.gmail.pass,
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
  db: awilix.asValue(db),
  env: awilix.asValue(env),
});

module.exports = container;
