const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { env } = require('./config/env');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { success } = require('./utils/response');
const { requestContext } = require('./middleware/requestContext');
const { requestLogger } = require('./middleware/requestLogger');
const { mongoSanitize } = require('./middleware/mongoSanitize');
const { globalLimiter } = require('./middleware/rateLimits');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin === '*' ? true : env.clientOrigin,
    credentials: env.clientOrigin !== '*',
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize);
app.use(requestContext);
app.use(requestLogger);
app.use(globalLimiter);

const health = (_req, res) =>
  success(res, { status: 'ok', service: 'ct-backend', time: new Date().toISOString() }, 'Healthy');

app.get('/health', health);
app.get('/api/health', health);
app.get('/api/v1/health', health);

app.use('/api', apiRoutes);
app.use('/api/v1', apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = { app };
