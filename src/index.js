const cron = require('node-cron');
const { nanoid } = require('nanoid');
const formatISO9075 = require('date-fns/formatISO9075');
const container = require('./container');

const logger = container.resolve('logger');

// Temporary
process.on('uncaughtException', logger.error);

async function main() {
  const bauruEmpregosService = container.resolve('bauruEmpregosService');

  await bauruEmpregosService.run();

  return 0;
}

logger.info('Jobber Started!');

const task = cron.schedule('*/15 * * * *', () => {
  const getCurrentDate = () => formatISO9075(new Date());
  const executionId = nanoid();

  logger.info(`\nStarted scheduled crawling at ${getCurrentDate()} - executionId: ${executionId}`);

  main()
    .then(() => {
      logger.info(`Finished scheduled crawling at ${getCurrentDate()} - executionId: ${executionId}\n`);
    })
    .catch(logger.error);
});

task.start();
