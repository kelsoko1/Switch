/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      success: false,
      message: `Validation Error: ${message}`,
      statusCode: 400
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = {
      success: false,
      message: `${field} already exists`,
      statusCode: 400
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      success: false,
      message: 'Invalid token',
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      success: false,
      message: 'Token expired',
      statusCode: 401
    };
  }

  // Appwrite errors
  if (err.code && err.message) {
    error = {
      success: false,
      message: err.message,
      statusCode: err.code >= 400 && err.code < 600 ? err.code : 500,
      type: 'appwrite_error',
      code: err.code,
      ...(process.env.NODE_ENV === 'development' && { details: err })
    };
  }

  // Handle specific Appwrite error codes
  if (err.code === 401) {
    error.message = 'Authentication failed. Please log in again.';
  } else if (err.code === 403) {
    error.message = 'You do not have permission to perform this action.';
  } else if (err.code === 404) {
    error.message = 'The requested resource was not found.';
  }

  res.status(error.statusCode || 500).json(error);
};

module.exports = errorHandler;
