#!/usr/bin/env node

import minimist from 'minimist';
import { mergeConfig } from './config/config';
import { AppConfig } from './types';
import path from 'path';
import fs from 'fs/promises';

// Parse command line arguments
const argv = minimist(process.argv.slice(2));

// Build configuration from command line arguments
const cliConfig: Partial<AppConfig> = {
  searchTerms: argv.query ? [argv.query] : undefined,
  maxResults: argv.limit ? parseInt(argv.limit, 10) : undefined,
  minImageWidth: argv.minWidth ? parseInt(argv.minWidth, 10) : undefined,
  minImageHeight: argv.minHeight ? parseInt(argv.minHeight, 10) : undefined,
  outputDirectory: argv.output ? path.resolve(process.cwd(), argv.output) : undefined,
};

// Merge with default configuration
const config = mergeConfig(cliConfig);

/**
 * Main application function
 */
async function main() {
  try {
    console.log('🔍 Construction Defect Image Collector');
    console.log('-'.repeat(50));
    console.log(`🔎 Search terms: ${config.searchTerms.join(', ')}`);
    console.log(`📊 Max results: ${config.maxResults}`);
    console.log(`🖼️  Min dimensions: ${config.minImageWidth}x${config.minImageHeight}px`);
    console.log(`📁 Output directory: ${config.outputDirectory}`);
    console.log('-'.repeat(50));
    
    // Ensure output directory exists
    await fs.mkdir(config.outputDirectory, { recursive: true });
    
    // TODO: Initialize and run the scraper, downloader, and LLM components
    console.log('⏳ Starting image collection process...');
    
    // Placeholder for actual implementation
    console.log('✅ Image collection completed successfully!');
    console.log('📷 0 images collected and processed');
    
  } catch (error) {
    console.error('❌ An error occurred:', error);
    process.exit(1);
  }
}

// Run the application
main(); 