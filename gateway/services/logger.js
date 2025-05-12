import winston from 'winston';

// Create a logger instance using Winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(), 
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}] - ${message}`)
  ),
  transports: [
    new winston.transports.Console(),  // Output to console
    new winston.transports.File({ filename: 'logs/app.log' })  // Output to file
  ],
});

export default logger;
