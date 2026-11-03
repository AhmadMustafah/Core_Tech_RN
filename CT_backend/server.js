const { app } = require('./app');
const { env } = require('./config/env');
const { connectDb } = require('./config/db');
const { logger } = require('./utils/logger');

const start = async () => {
  await connectDb();
  app.listen(env.port, () => {
    logger.info('api listening', { port: env.port, db: env.mongoDb });
  });
};

if (require.main === module) {
  start().catch((error) => {
    logger.error('failed to start server', { message: error.message });
    process.exit(1);
  });
}

module.exports = { app, start };
