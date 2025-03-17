/**
 * Core types for the construction defect image collector
 */

/** 
 * Metadata information for each collected image
 */
export type ImageMetadata = {
  id: string;
  sourceUrl: string;
  localPath: string;
  title: string;
  description: string;
  dateCollected: string;
  category?: string;
  tags?: string[];
  imageQualityScore?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  fileSize?: number;
};

/**
 * Options for the image scrapers
 */
export type ScraperOptions = {
  query: string;
  maxResults: number;
  minWidth: number;
  minHeight: number;
  includeTerms?: string[];
  excludeTerms?: string[];
};

/**
 * Search result item from web scraping
 */
export type ImageSearchResult = {
  url: string;
  sourceUrl: string;
  title?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  mimeType?: string;
};

/**
 * Options for the OpenAI integration
 */
export type LlmOptions = {
  model: string;
  maxTokens?: number;
  temperature?: number;
};

/**
 * Options for generating image descriptions
 */
export type DescriptionGenerationOptions = LlmOptions & {
  promptTemplate?: string;
  includeDetails?: boolean;
  maxLength?: number;
};

/**
 * Options for image downloading
 */
export type DownloaderOptions = {
  timeout?: number;
  maxRetries?: number;
  concurrentDownloads?: number;
  userAgent?: string;
};

/**
 * Application configuration
 */
export type AppConfig = {
  searchTerms: string[];
  maxResults: number;
  minImageWidth: number;
  minImageHeight: number;
  outputDirectory: string;
  llmOptions: LlmOptions;
  downloaderOptions: DownloaderOptions;
}; 