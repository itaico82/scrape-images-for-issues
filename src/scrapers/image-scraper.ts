import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import { ScraperError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../utils/config';

// Types for image scraping
export interface ScrapedImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  sourceUrl: string;
}

/**
 * Validates a URL string
 * @param url URL to validate
 * @returns Parsed URL object
 * @throws ScraperError if URL is invalid
 */
export const validateUrl = (url: string): URL => {
  try {
    return new URL(url);
  } catch (error) {
    throw new ScraperError('Invalid URL provided', url, error as Error);
  }
};

/**
 * Scrapes images from a specified URL
 * @param url The URL to scrape images from
 * @param maxImages Maximum number of images to return
 * @returns Array of scraped images
 * @throws ScraperError on request or parsing failure
 */
export const scrapeImagesFromUrl = async (
  url: string,
  maxImages: number = config.getConfig().maxImagesPerPage
): Promise<ScrapedImage[]> => {
  logger.info(`Starting image scrape for URL: ${url}`);
  
  try {
    // Validate URL
    const parsedUrl = validateUrl(url);
    logger.debug(`URL validated: ${parsedUrl.toString()}`);
    
    // Get HTML content
    logger.debug(`Fetching HTML content from ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': config.getConfig().userAgent,
      },
      timeout: 10000, // 10 second timeout
    });
    
    if (!response.data) {
      throw new ScraperError('Empty response from server', url);
    }
    
    // Parse HTML
    logger.debug('Parsing HTML content');
    const $ = cheerio.load(response.data);
    const images: ScrapedImage[] = [];
    
    // Find all img tags
    $('img').each((i, el) => {
      if (images.length >= maxImages) return false;
      
      const imgSrc = $(el).attr('src');
      if (!imgSrc) {
        logger.debug('Found img tag without src attribute, skipping');
        return;
      }
      
      try {
        // Convert relative URLs to absolute
        const imgUrl = imgSrc.startsWith('http') 
          ? imgSrc 
          : new URL(imgSrc, parsedUrl.origin).toString();
        
        // Create image object
        const image: ScrapedImage = {
          url: imgUrl,
          alt: $(el).attr('alt') || '',
          width: $(el).attr('width') ? parseInt($(el).attr('width') || '0', 10) : undefined,
          height: $(el).attr('height') ? parseInt($(el).attr('height') || '0', 10) : undefined,
          sourceUrl: url
        };
        
        logger.debug(`Found image: ${imgUrl}`);
        images.push(image);
      } catch (error) {
        // Log error but continue with other images
        logger.warn(`Error processing image: ${imgSrc}`, error);
      }
    });
    
    logger.info(`Scraped ${images.length} images from ${url}`);
    return images;
  } catch (error) {
    if (error instanceof ScraperError) {
      logger.error(`Scraper error: ${error.message}`, error);
      throw error;
    }
    
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const message = error.response?.statusText || error.message;
      logger.error(`HTTP error: ${statusCode} ${message}`, error);
      throw new ScraperError(
        `HTTP request failed: ${message}`,
        url,
        error
      );
    }
    
    logger.error('Error scraping images', error);
    throw new ScraperError('Failed to scrape images', url, error as Error);
  }
};
