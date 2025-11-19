const express = require('express');
const morgan = require('morgan');
const config = require('./config');
const { discoverLenses } = require('./services/lensService');
const lensesRouter = require('./routes/lenses');
const { errorHandler, notFound } = require('./middleware/errorHandler');

/**
 * Creates and configures the Express application
 */
async function createServer() {
  const app = express();

  // Middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(morgan('combined'));

  // Store lenses folder path for dynamic loading on each request
  app.locals.lensesFolder = config.lensesFolder;

  // Middleware to load lenses on each request (live reload)
  app.use(async (req, res, next) => {
    try {
      const { lenses, validationErrors } = await discoverLenses(app.locals.lensesFolder);
      app.locals.lenses = lenses;
      app.locals.validationErrors = validationErrors;
      next();
    } catch (error) {
      console.error('Error loading lenses:', error);
      // Continue with empty lenses array if loading fails
      app.locals.lenses = [];
      app.locals.validationErrors = {};
      next();
    }
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      lensesLoaded: app.locals.lenses.length,
      lensesFolder: app.locals.lensesFolder,
    });
  });

  // API Routes
  app.use('/lenses', lensesRouter);

  // Error handling middleware
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createServer };
