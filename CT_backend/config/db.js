const mongoose = require('mongoose');
const { env } = require('./env');
const { logger } = require('../utils/logger');

const connectDb = async () => {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.mongoUri, {
      dbName: env.mongoDb,
      serverSelectionTimeoutMS: 25000,
      family: 4,
    });
    logger.info('mongodb connected', { db: mongoose.connection.name });
  } catch (error) {
    logger.error('mongodb connection failed', { message: error.message });
    throw error;
  }

  mongoose.connection.on('error', (error) => {
    logger.error('mongodb runtime error', { message: error.message });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('mongodb disconnected');
  });
};

const disconnectDb = async () => {
  await mongoose.connection.close();
};

module.exports = { connectDb, disconnectDb };
