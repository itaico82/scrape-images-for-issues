/**
 * Configuration manager for application settings
 */
import dotenv from 'dotenv';
import { ConfigError } from './errors';
import { logger } from './logger';

// Load environment variables
dotenv.config();

/**
 * Interface for application configuration
 */
export interface AppConfig {
  // GitHub settings
  githubToken: string;
  
  // Scraper settings
  maxImagesPerPage: number;
  userAgent: string;
  
  // Application settings
  logLevel: string;
}

/**
 * Configuration manager class
 */
class ConfigManager {
  private config: AppConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfig(): AppConfig {
    try {
      // Required configurations
      const githubToken = this.getRequiredEnv('GITHUB_TOKEN');
      
      // Optional configurations with defaults
      const maxImagesPerPage = this.getNumberEnv('MAX_IMAGES_PER_PAGE', 10);
      const userAgent = process.env.USER_AGENT || 'scrape-images-for-issues';
      const logLevel = process.env.LOG_LEVEL || 'INFO';
      
      return {
        githubToken,
        maxImagesPerPage,
        userAgent,
        logLevel
      };
    } catch (error) {
      // Log the error but don't fail immediately to allow CLI help to work
      if (error instanceof ConfigError) {
        logger.error('Configuration error', error);
      } else {
        logger.error('Unexpected error loading configuration', error);
      }
      
      // Return defaults
      return {
        githubToken: '',
        maxImagesPerPage: 10,
        userAgent: 'scrape-images-for-issues',
        logLevel: 'INFO'
      };
    }
  }

  /**
   * Get a required environment variable
   */
  private getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new ConfigError(`Missing required environment variable`, key);
    }
    return value;
  }

  /**
   * Get an environment variable as a number
   */
  private getNumberEnv(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (!value) {
      return defaultValue;
    }
    
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      throw new ConfigError(`Invalid number format for environment variable`, key);
    }
    
    return numValue;
  }

  /**
   * Get the full configuration
   */
  getConfig(): AppConfig {
    return { ...this.config };
  }

  /**
   * Validate that all required configuration is present
   */
  validate(): boolean {
    try {
      if (!this.config.githubToken) {
        throw new ConfigError('GitHub token is required', 'GITHUB_TOKEN');
      }
      
      return true;
    } catch (error) {
      if (error instanceof ConfigError) {
        logger.error('Configuration validation failed', error);
      }
      return false;
    }
  }
}

// Export singleton instance
export const config = new ConfigManager(); 