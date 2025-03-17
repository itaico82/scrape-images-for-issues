/**
 * Main entry point for the scrape-images-for-issues application
 */
import { Command } from 'commander';
import { scrapeImagesFromUrl } from './scrapers/image-scraper';
import { createIssueWithImages } from './github/issue-creator';
import { logger } from './utils/logger';
import { config } from './utils/config';
import { AppError, ConfigError } from './utils/errors';

// Setup command-line interface
const program = new Command();

program
  .name('scrape-images-for-issues')
  .description('Scrape images from a website and create GitHub issues with them')
  .version('0.1.0');

program
  .command('scrape')
  .description('Scrape images from a URL and create a GitHub issue')
  .requiredOption('-u, --url <url>', 'URL to scrape for images')
  .requiredOption('-o, --owner <owner>', 'GitHub repository owner')
  .requiredOption('-r, --repo <repo>', 'GitHub repository name')
  .option('-t, --title <title>', 'Issue title', 'Scraped Images')
  .option('-b, --body <body>', 'Issue body text', 'Images scraped from website')
  .option('-m, --max <count>', 'Maximum number of images to include', '10')
  .option('-v, --verbose', 'Enable verbose logging')
  .action(async (options) => {
    try {
      // Handle verbose flag
      if (options.verbose) {
        const { LogLevel } = require('./utils/logger');
        logger.setLogLevel(LogLevel.DEBUG);
        logger.debug('Verbose logging enabled');
      }

      // Validate configuration before proceeding
      if (!config.validate()) {
        logger.error('Invalid configuration. Check your .env file and try again.');
        process.exit(1);
      }

      logger.info(`Scraping images from ${options.url}...`);
      
      // Scrape images
      const images = await scrapeImagesFromUrl(options.url, parseInt(options.max, 10));
      logger.info(`Found ${images.length} images.`);
      
      if (images.length === 0) {
        logger.warn('No images found. Exiting.');
        return;
      }
      
      // Create GitHub issue
      logger.info(`Creating GitHub issue in ${options.owner}/${options.repo}...`);
      const issueUrl = await createIssueWithImages(
        options.title,
        options.body,
        images,
        options.owner,
        options.repo
      );
      
      logger.info(`Success! Issue created at: ${issueUrl}`);
    } catch (error) {
      if (error instanceof AppError) {
        logger.error(`Application error: ${error.message}`);
      } else if (error instanceof Error) {
        logger.error('Unexpected error:', error);
      } else {
        logger.error('Unknown error occurred');
      }
      process.exit(1);
    }
  });

program
  .command('verify')
  .description('Verify application configuration')
  .action(() => {
    try {
      // Validate app configuration
      if (config.validate()) {
        logger.info('Configuration valid! Application is ready to use.');
        const appConfig = config.getConfig();
        logger.info(`Maximum images per page: ${appConfig.maxImagesPerPage}`);
        logger.info(`User agent: ${appConfig.userAgent}`);
        logger.info('GitHub token is configured');
      } else {
        logger.error('Configuration is invalid. Please check your .env file.');
        process.exit(1);
      }
    } catch (error) {
      if (error instanceof ConfigError) {
        logger.error(`Configuration error: ${error.message}`);
      } else {
        logger.error('Error verifying configuration:', error);
      }
      process.exit(1);
    }
  });

// Execute the program
const main = async (): Promise<void> => {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    logger.error('Application error:', error);
    process.exit(1);
  }
};

main();
