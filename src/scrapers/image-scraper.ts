import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Types for image scraping
export interface ScrapedImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  sourceUrl: string;
}

/**
 * Scrapes images from a specified URL
 * @param url The URL to scrape images from
 * @param maxImages Maximum number of images to return
 */
export const scrapeImagesFromUrl = async (
  url: string,
  maxImages: number = Number(process.env.MAX_IMAGES_PER_PAGE) || 10
): Promise<ScrapedImage[]> => {
  try {
    // Validate URL
    const parsedUrl = new URL(url);
    
    // Get HTML content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': process.env.USER_AGENT || 'scrape-images-for-issues',
      },
    });
    
    // Parse HTML
    const $ = cheerio.load(response.data);
    const images: ScrapedImage[] = [];
    
    // Find all img tags
    $('img').each((i, el) => {
      if (images.length >= maxImages) return false;
      
      const imgSrc = $(el).attr('src');
      if (!imgSrc) return;
      
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
      
      images.push(image);
    });
    
    return images;
  } catch (error) {
    console.error('Error scraping images:', error);
    throw error;
  }
};
