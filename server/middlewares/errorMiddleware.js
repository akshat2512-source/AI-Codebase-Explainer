/**
 * Catch-all for routes not handled by any router.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Central error-handling middleware.
 * In production, raw stack traces and internal messages are hidden.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // User-friendly fallback messages keyed by status code
  const friendlyDefaults = {
    400: 'Invalid request. Please check your input and try again.',
    401: 'Authentication required. Please log in.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Something went wrong on our end. Please try again later.',
  };

  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    message: isProduction
      ? friendlyDefaults[statusCode] || friendlyDefaults[500]
      : err.message,
    stack: isProduction ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
