/**
 * Error handling middleware
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[${new Date().toISOString()}] Error:`, {
    statusCode,
    message,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  res.status(statusCode).json({
    error: message,
    statusCode,
    path: req.path,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 404 Not Found middleware
 */
function notFound(req, res) {
  res.status(404).json({
    error: 'Not Found',
    statusCode: 404,
    path: req.path,
    message: `The requested resource '${req.path}' was not found`,
  });
}

module.exports = {
  errorHandler,
  notFound,
};
