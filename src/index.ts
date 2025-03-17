/**
 * Main entry point for the scrape-images-for-issues application
 */
import { Command } from 'commander';
import dotenv from 'dotenv';
import { scrapeImagesFromUrl } from './scrapers/image-scraper';
import { createIssueWithImages } from './github/issue-creator';

// Load environment variables
dotenv.config();

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
  .action(async (options) => {
    try {
      console.log(`Scraping images from ${options.url}...`);
      
      // Scrape images
      const images = await scrapeImagesFromUrl(options.url, parseInt(options.max, 10));
      console.log(`Found ${images.length} images.`);
      
      if (images.length === 0) {
        console.log('No images found. Exiting.');
        return;
      }
      
      // Create GitHub issue
      console.log(`Creating GitHub issue in ${options.owner}/${options.repo}...`);
      const issueUrl = await createIssueWithImages(
        options.title,
        options.body,
        images,
        options.owner,
        options.repo
      );
      
      console.log(`Success! Issue created at: ${issueUrl}`);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// Execute the program
const main = async (): Promise<void> => {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error('Application error:', error);
    process.exit(1);
  }
};

main();
