import { LlmOptions } from '../types';
import { OpenAI } from 'openai';
import { apiKeys } from '../config/config';

/**
 * Base class for LLM-based generators
 */
export abstract class LlmGenerator {
  protected openai: OpenAI;
  protected options: LlmOptions;
  
  constructor(options: LlmOptions) {
    this.options = options;
    this.openai = new OpenAI({
      apiKey: apiKeys.openai,
    });
  }
  
  /**
   * Process an image and generate text
   * @param imagePath Path to the image file
   */
  abstract processImage(imagePath: string): Promise<string>;
}

export * from './title-generator';
export * from './description-generator'; 