const winston = require('winston');
const { combine, timestamp, printf, colorize } = winston.format;

// Define log format
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message} `;
  
  if (Object.keys(metadata).length > 0) {
    msg += JSON.stringify(metadata, null, 2);
  }
  
  return msg;
});

// Create logger instance with console transport first
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    colorize({ all: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.splat(),
    logFormat
  ),
  transports: [
    new winston.transports.Console()
  ],
  exitOnError: false // Don't crash on exception
});

// Try to set up file logging if possible
const fs = require('fs');
const path = require('path');
const logDir = path.join(__dirname, '..', 'logs');

try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Add file transports only after ensuring directory exists
  logger.add(new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }));
  logger.add(new winston.transports.File({ filename: path.join(logDir, 'combined.log') }));

  // Add exception and rejection handlers
  logger.exceptions.handle(new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') }));
  logger.rejections.handle(new winston.transports.File({ filename: path.join(logDir, 'rejections.log') }));
} catch (error) {
  console.error('Failed to set up file logging:', error);
  // Continue with console-only logging
}

// Create a stream for morgan to use
logger.stream = {
  write: function(message, encoding) {
    logger.info(message.trim());
  }
};

module.exports = logger;
