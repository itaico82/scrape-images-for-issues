/**
 * Custom error classes for the application
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error for scraper-related issues
 */
export class ScraperError extends AppError {
  constructor(
    message: string,
    public readonly url?: string,
    public readonly cause?: Error
  ) {
    super(`Scraper error: ${message}${url ? ` (URL: ${url})` : ''}`);
    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}

/**
 * Error for GitHub API related issues
 */
export class GitHubError extends AppError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly repoInfo?: { owner: string; repo: string },
    public readonly cause?: Error
  ) {
    super(
      `GitHub API error: ${message}${
        statusCode ? ` (Status: ${statusCode})` : ''
      }${
        repoInfo
          ? ` (Repository: ${repoInfo.owner}/${repoInfo.repo})`
          : ''
      }`
    );
    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}

/**
 * Error for configuration-related issues
 */
export class ConfigError extends AppError {
  constructor(message: string, public readonly configKey?: string) {
    super(
      `Configuration error: ${message}${
        configKey ? ` (Missing or invalid: ${configKey})` : ''
      }`
    );
  }
} 