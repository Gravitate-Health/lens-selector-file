require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  lensesFolder: process.env.LENSES_FOLDER || './lenses',
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validate required configuration
if (!config.lensesFolder) {
  throw new Error('LENSES_FOLDER environment variable is not set');
}

module.exports = config;
