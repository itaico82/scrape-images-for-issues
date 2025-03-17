/**
 * Logger utility for application-wide logging
 */

// Log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// Get current log level from env var or default to INFO
const getCurrentLogLevel = (): LogLevel => {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase();
  if (envLevel && Object.keys(LogLevel).includes(envLevel)) {
    return LogLevel[envLevel as keyof typeof LogLevel];
  }
  return LogLevel.INFO; // Default log level
};

// Format the timestamp for logging
const timestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Main logger class
 */
class Logger {
  private logLevel: LogLevel;

  constructor() {
    this.logLevel = getCurrentLogLevel();
  }

  // Set the log level
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  // Log an error message
  error(message: string, error?: Error | unknown): void {
    if (this.logLevel >= LogLevel.ERROR) {
      console.error(`[${timestamp()}] ERROR: ${message}`);
      if (error instanceof Error) {
        console.error(`Stack: ${error.stack}`);
      } else if (error) {
        console.error('Additional info:', error);
      }
    }
  }

  // Log a warning message
  warn(message: string, data?: any): void {
    if (this.logLevel >= LogLevel.WARN) {
      console.warn(`[${timestamp()}] WARN: ${message}`);
      if (data) {
        console.warn('Data:', data);
      }
    }
  }

  // Log an info message
  info(message: string, data?: any): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.info(`[${timestamp()}] INFO: ${message}`);
      if (data) {
        console.info('Data:', data);
      }
    }
  }

  // Log a debug message
  debug(message: string, data?: any): void {
    if (this.logLevel >= LogLevel.DEBUG) {
      console.debug(`[${timestamp()}] DEBUG: ${message}`);
      if (data) {
        console.debug('Data:', data);
      }
    }
  }
}

// Export a singleton instance
export const logger = new Logger(); 