import { ImageSearchResult, ScraperOptions } from '../types';

/**
 * Interface for all image scrapers
 */
export interface ImageScraper {
  /**
   * Search for images based on given options
   */
  search(options: ScraperOptions): Promise<ImageSearchResult[]>;
  
  /**
   * Name of the scraper
   */
  readonly name: string;
}

export * from './google-images';
// export * from './bing-images';

/**
 * Get all available scrapers
 */
export const getScrapers = (): ImageScraper[] => {
  // Import and initialize all scrapers here
  const scrapers: ImageScraper[] = [];
  
  // TODO: Add actual scrapers when implemented
  
  return scrapers;
}; 