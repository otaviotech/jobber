const container = require('./container');

const logger = container.resolve('logger');

// Temporary
process.on('uncaughtException', logger.error);

async function main() {
  const bauruEmpregosService = container.resolve('bauruEmpregosService');

  await bauruEmpregosService.run();

  return 0;
}

main();
