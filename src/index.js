const cron = require('node-cron');
const { nanoid } = require('nanoid');
const formatISO9075 = require('date-fns/formatISO9075');
const container = require('./container');

async function main() {
  const bauruEmpregosService = container.resolve('bauruEmpregosService');

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
