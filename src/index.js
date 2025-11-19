const config = require('./config');
const { createServer } = require('./server');

/**
 * Start the application server
 */
async function main() {
  try {
    console.log('Starting Gravitate Health Lens Selector Service...');
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Lenses folder: ${config.lensesFolder}`);
    console.log('✓ Lenses will be loaded dynamically on each request (live reload)');

    const app = await createServer();

    app.listen(config.port, () => {
      console.log(`✓ Server running on port ${config.port}`);
      console.log(`✓ API available at http://localhost:${config.port}`);
      console.log(`✓ Health check: http://localhost:${config.port}/health`);
      console.log(`✓ List lenses: http://localhost:${config.port}/lenses`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
