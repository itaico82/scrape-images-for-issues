import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { AppConfig } from '../types';

// Load environment variables
dotenv.config();

// Validate environment variables
const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  GOOGLE_API_KEY: z.string().optional(),
  GOOGLE_CSE_ID: z.string().optional(),
  MAX_IMAGES: z.string().optional().transform(val => (val ? parseInt(val, 10) : 100)),
  MIN_IMAGE_WIDTH: z.string().optional().transform(val => (val ? parseInt(val, 10) : 800)),
  MIN_IMAGE_HEIGHT: z.string().optional().transform(val => (val ? parseInt(val, 10) : 600)),
  OUTPUT_DIR: z.string().optional(),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

// Construction defect search terms
const DEFAULT_SEARCH_TERMS = [
  'construction defect concrete cracks',
  'building structural damage',
  'foundation settlement issues',
  'construction water leakage',
  'masonry wall defects',
  'steel beam connection failure',
  'roof construction defects',
  'defective building materials',
  'construction joint failure',
  'improper construction techniques',
];

// Default configuration
const defaultConfig: AppConfig = {
  searchTerms: DEFAULT_SEARCH_TERMS,
  maxResults: env.MAX_IMAGES,
  minImageWidth: env.MIN_IMAGE_WIDTH,
  minImageHeight: env.MIN_IMAGE_HEIGHT,
  outputDirectory: env.OUTPUT_DIR || path.resolve(process.cwd(), 'data', 'images'),
  llmOptions: {
    model: 'gpt-4o',
    maxTokens: 500,
    temperature: 0.7,
  },
  downloaderOptions: {
    timeout: 30000,
    maxRetries: 3,
    concurrentDownloads: 5,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  },
};

// Additional API keys and configuration
export const apiKeys = {
  openai: env.OPENAI_API_KEY,
  google: {
    apiKey: env.GOOGLE_API_KEY,
    cseId: env.GOOGLE_CSE_ID,
  },
};

/**
 * Merge command line arguments with default configuration
 * @param cliArgs Command line arguments
 * @returns Merged configuration
 */
export const mergeConfig = (cliArgs: Partial<AppConfig> = {}): AppConfig => {
  return {
    ...defaultConfig,
    ...cliArgs,
    llmOptions: {
      ...defaultConfig.llmOptions,
      ...(cliArgs.llmOptions || {}),
    },
    downloaderOptions: {
      ...defaultConfig.downloaderOptions,
      ...(cliArgs.downloaderOptions || {}),
    },
  };
};

// Export default configuration
export default defaultConfig; 