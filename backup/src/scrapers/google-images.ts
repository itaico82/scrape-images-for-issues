import axios from 'axios';
import { ImageSearchResult, ScraperOptions } from '../types';
import { ImageScraper } from './index';
import { apiKeys } from '../config/config';

/**
 * Google Images scraper using Custom Search API
 */
export class GoogleImageScraper implements ImageScraper {
  readonly name = 'Google Images';
  
  /**
   * Search for images using Google Custom Search API
   */
  async search(options: ScraperOptions): Promise<ImageSearchResult[]> {
    const { query, maxResults, minWidth, minHeight } = options;
    const results: ImageSearchResult[] = [];
    
    // Check if Google API credentials are available
    if (!apiKeys.google.apiKey || !apiKeys.google.cseId) {
      console.warn('Google API credentials not found. Using fallback method.');
      return this.searchWithoutAPI(options);
    }
    
    try {
      // Calculate how many API calls we need to make
      const maxResultsPerPage = 10;
      const totalPages = Math.ceil(Math.min(maxResults, 100) / maxResultsPerPage);
      
      for (let page = 0; page < totalPages; page++) {
        const startIndex = page * maxResultsPerPage + 1;
        
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
          params: {
            key: apiKeys.google.apiKey,
            cx: apiKeys.google.cseId,
            q: query,
            searchType: 'image',
            imgSize: 'large',
            start: startIndex,
            num: maxResultsPerPage,
            rights: 'cc_publicdomain,cc_attribute,cc_sharealike',
            safe: 'active',
          },
        });
        
        if (!response.data.items) {
          break;
        }
        
        for (const item of response.data.items) {
          if (results.length >= maxResults) {
            break;
          }
          
          // Filter by size if dimensions are available
          if (
            item.image &&
            item.image.width &&
            item.image.height &&
            item.image.width >= minWidth &&
            item.image.height >= minHeight
          ) {
            results.push({
              url: item.link,
              sourceUrl: item.image.contextLink || item.link,
              title: item.title,
              dimensions: {
                width: item.image.width,
                height: item.image.height,
              },
              mimeType: item.mime,
            });
          }
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error searching Google Images:', error);
      return this.searchWithoutAPI(options);
    }
  }
  
  /**
   * Fallback method when API is not available (placeholder)
   * This would normally use web scraping, but is implemented as a placeholder
   */
  private async searchWithoutAPI(options: ScraperOptions): Promise<ImageSearchResult[]> {
    console.log('Using fallback method for Google Images search (placeholder)');
    
    // This is a placeholder that would normally implement web scraping
    // For production, you'd implement a proper scraper that doesn't depend on the API
    
    return [];
  }
} 