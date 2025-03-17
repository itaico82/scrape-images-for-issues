import { LlmGenerator } from './index';
import { LlmOptions } from '../types';
import fs from 'fs/promises';

/**
 * Generates concise, descriptive titles for construction defect images
 */
export class TitleGenerator extends LlmGenerator {
  constructor(options: LlmOptions) {
    super({
      ...options,
      // Override with title-specific options
      maxTokens: options.maxTokens || 50,
      temperature: options.temperature || 0.7,
    });
  }
  
  /**
   * Generate a title for a construction defect image
   */
  async processImage(imagePath: string): Promise<string> {
    try {
      // Read the image file
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');
      
      // Call OpenAI API with Responses API
      const response = await this.openai.responses.create({
        model: this.options.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Generate a concise, technical title for this construction defect image. The title should be short (5-10 words) and describe the specific type of defect shown.',
              },
              {
                type: 'image',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: this.options.maxTokens,
        temperature: this.options.temperature,
        // Format as JSON to get just the title without additional text
        response_format: { type: 'json_object' },
      });
      
      // Parse the JSON response
      try {
        const content = response.choices[0].message.content;
        if (!content) {
          throw new Error('Empty response content');
        }
        
        const parsed = JSON.parse(content);
        return parsed.title || 'Untitled Construction Defect';
      } catch (parseError) {
        console.error('Error parsing title response:', parseError);
        // Fall back to text content if JSON parsing fails
        return response.choices[0].message.content || 'Untitled Construction Defect';
      }
    } catch (error) {
      console.error('Error generating title:', error);
      return 'Untitled Construction Defect';
    }
  }
} 