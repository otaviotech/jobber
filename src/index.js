const cron = require('node-cron');
const { nanoid } = require('nanoid');
const formatISO9075 = require('date-fns/formatISO9075');
require('dotenv').config();

const db = require('./infra/db');
const Crawler = require('./infra/crawler');
const SourceRepository = require('./infra/repository/source.repository');
const SubscriptionRepository = require('./infra/repository/subscription.repository');
const BauruEmpregosService = require('./service/bauruEmpregosService');
const SubscriptionService = require('./service/subscription.service');
const NotifyService = require('./service/notify.service');
const EmailService = require('./infra/service/email/email.service');
const NodeMailerAdapter = require('./infra/service/email/adapters/nodemailer.adapter');
const env = require('./env');

async function main() {
    const crawler = Crawler();
    const nodeMailerAdapter = new NodeMailerAdapter({
        service: 'gmail',
        user: env.gmail.user,
        pass: env.gmail.pass,
    });

    // Repositories
    const sourceRepository = SourceRepository(db);
    const subscriptionRepository = SubscriptionRepository(db);

    // Services
    const emailService = EmailService(nodeMailerAdapter);
    const notifyService = NotifyService({ emailService });
    const subscriptionService = SubscriptionService({ subscriptionRepository });
    const bauruEmpregosService = BauruEmpregosService({ crawler, sourceRepository, subscriptionService, notifyService });

    await bauruEmpregosService.run();

    return 0;
}

const task = cron.schedule('*/15 * * * *', () => {
    const getCurrentDate = () => formatISO9075(new Date());
    const executionId = nanoid();

    console.log(`\nStarted scheduled crawling at ${getCurrentDate()} - executionId: ${executionId}`);

    main()
        .then(() => {
            console.log(`Finished scheduled crawling at ${getCurrentDate()} - executionId: ${executionId}\n`);
        })
        .catch(console.error);
});

task.start();
