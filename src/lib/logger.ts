import winston from 'winston';
import { NextRequest } from 'next/server';

// Log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Colors for console output
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    info => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Transports
const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({ filename: 'logs/combined.log' }),
];

// Create logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  levels,
  format,
  transports,
});

export class Logger {
  static error(message: string, meta?: any) {
    logger.error(message, meta);
  }

  static warn(message: string, meta?: any) {
    logger.warn(message, meta);
  }

  static info(message: string, meta?: any) {
    logger.info(message, meta);
  }

  static http(message: string, meta?: any) {
    logger.http(message, meta);
  }

  static debug(message: string, meta?: any) {
    logger.debug(message, meta);
  }

  // Request logging
  static logRequest(req: NextRequest, res: any, responseTime: number) {
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    };

    if (res.statusCode >= 400) {
      this.error('HTTP Request Error', logData);
    } else {
      this.http('HTTP Request', logData);
    }
  }

  // Security event logging
  static logSecurityEvent(event: string, details: any, req: Request) {
    this.warn('Security Event', {
      event,
      details,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      userAgent: req.headers.get('user-agent'),
      url: req.url,
      timestamp: new Date().toISOString(),
    });
  }

  // Database operation logging
  static logDatabaseOperation(operation: string, table: string, details: any) {
    this.debug('Database Operation', {
      operation,
      table,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // Performance logging
  static logPerformance(operation: string, duration: number, details?: any) {
    this.info('Performance', {
      operation,
      duration: `${duration}ms`,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // Error logging with stack trace
  static logError(error: Error, context?: any) {
    this.error('Application Error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  // Audit logging
  static logAudit(
    userId: string,
    action: string,
    resource: string,
    details: any
  ) {
    this.info('Audit Log', {
      userId,
      action,
      resource,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // Business logic logging
  static logBusinessEvent(event: string, userId: string, details: any) {
    this.info('Business Event', {
      event,
      userId,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}

export default logger;
