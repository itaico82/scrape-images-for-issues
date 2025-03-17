import axios from 'axios';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { DownloaderOptions, ImageSearchResult } from '../types';
import sharp from 'sharp';

/**
 * Result of a download operation
 */
interface DownloadResult {
  localPath: string;
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: number;
  success: boolean;
  error?: string;
}

/**
 * Image downloader with error handling and retry logic
 */
export class ImageDownloader {
  private options: DownloaderOptions;
  private outputDir: string;
  
  constructor(outputDir: string, options: DownloaderOptions = {}) {
    this.outputDir = outputDir;
    this.options = {
      timeout: options.timeout || 30000,
      maxRetries: options.maxRetries || 3,
      concurrentDownloads: options.concurrentDownloads || 5,
      userAgent: options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    };
  }
  
  /**
   * Download a single image with retry logic
   */
  async downloadImage(image: ImageSearchResult): Promise<DownloadResult> {
    let attempts = 0;
    
    while (attempts < this.options.maxRetries!) {
      attempts++;
      
      try {
        // Generate a unique filename
        const fileId = uuidv4();
        const fileExt = this.getFileExtension(image.url, image.mimeType);
        const fileName = `${fileId}${fileExt}`;
        const outputPath = path.join(this.outputDir, fileName);
        
        // Download the image
        const response = await axios.get(image.url, {
          responseType: 'arraybuffer',
          timeout: this.options.timeout,
          headers: {
            'User-Agent': this.options.userAgent,
            'Referer': image.sourceUrl,
          },
        });
        
        // Process and validate the image
        const imageBuffer = Buffer.from(response.data);
        const imageInfo = await sharp(imageBuffer).metadata();
        
        if (!imageInfo.width || !imageInfo.height) {
          throw new Error('Invalid image dimensions');
        }
        
        // Save the image
        await fs.writeFile(outputPath, imageBuffer);
        
        // Get file size
        const stats = await fs.stat(outputPath);
        
        return {
          localPath: outputPath,
          dimensions: {
            width: imageInfo.width,
            height: imageInfo.height,
          },
          fileSize: stats.size,
          success: true,
        };
      } catch (error) {
        console.error(`Download attempt ${attempts} failed:`, error);
        
        // If we've exhausted all retries, return failure
        if (attempts >= this.options.maxRetries!) {
          return {
            localPath: '',
            dimensions: { width: 0, height: 0 },
            fileSize: 0,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
    
    // This shouldn't be reached, but TypeScript requires it
    return {
      localPath: '',
      dimensions: { width: 0, height: 0 },
      fileSize: 0,
      success: false,
      error: 'Unknown error',
    };
  }
  
  /**
   * Download multiple images concurrently
   */
  async downloadImages(images: ImageSearchResult[]): Promise<DownloadResult[]> {
    const results: DownloadResult[] = [];
    const chunks: ImageSearchResult[][] = [];
    
    // Split images into chunks for concurrent downloading
    for (let i = 0; i < images.length; i += this.options.concurrentDownloads!) {
      chunks.push(images.slice(i, i + this.options.concurrentDownloads!));
    }
    
    // Process each chunk concurrently
    for (const chunk of chunks) {
      console.log(`Downloading ${chunk.length} images...`);
      
      const chunkResults = await Promise.all(
        chunk.map(image => this.downloadImage(image))
      );
      
      results.push(...chunkResults);
    }
    
    return results;
  }
  
  /**
   * Get file extension from URL or MIME type
   */
  private getFileExtension(url: string, mimeType?: string): string {
    // Try to get extension from MIME type first
    if (mimeType) {
      const mimeExtMap: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/svg+xml': '.svg',
        'image/bmp': '.bmp',
      };
      
      if (mimeExtMap[mimeType]) {
        return mimeExtMap[mimeType];
      }
    }
    
    // Fall back to extracting from URL
    const urlPath = new URL(url).pathname;
    const extMatch = urlPath.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i);
    
    if (extMatch) {
      return `.${extMatch[1].toLowerCase()}`;
    }
    
    // Default to JPEG if we can't determine the extension
    return '.jpg';
  }
} 