const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');

const env = require('./config/env');
const apiRoutes = require('./routes');
const swaggerSpec = require('./swagger/swagger');
const { generalLimiter } = require('./middlewares/rateLimit');
const { notFound, errorHandler } = require('./middlewares/error');

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow image hot-linking from FE
  }),
);
app.use(
  cors({
    origin: env.corsOrigin.split(',').map((s) => s.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (env.nodeEnv !== 'test') app.use(morgan('dev'));

app.use(generalLimiter);

// Static files for uploaded images.
app.use('/uploads', express.static(path.resolve(process.cwd(), env.uploads.dir), { maxAge: '7d' }));

// Swagger docs.
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Real Estate API Docs',
    customCss: '.topbar { display: none }',
  }),
);
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

app.use('/api', apiRoutes);

app.get('/', (_req, res) =>
  res.json({
    success: true,
    data: { name: 'Real Estate API', docs: '/api-docs', health: '/api/health' },
  }),
);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
