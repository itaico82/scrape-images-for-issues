import { LlmGenerator } from './index';
import { DescriptionGenerationOptions, LlmOptions } from '../types';
import fs from 'fs/promises';

/**
 * Generates detailed descriptions for construction defect images
 */
export class DescriptionGenerator extends LlmGenerator {
  private descriptionOptions: DescriptionGenerationOptions;
  
  constructor(options: DescriptionGenerationOptions) {
    super({
      ...options,
      // Override with description-specific options
      maxTokens: options.maxTokens || 500,
      temperature: options.temperature || 0.7,
    });
    
    this.descriptionOptions = {
      ...options,
      promptTemplate: options.promptTemplate || this.getDefaultPromptTemplate(options.includeDetails || false),
      maxLength: options.maxLength || 500,
    };
  }
  
  /**
   * Generate a description for a construction defect image
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
                text: this.descriptionOptions.promptTemplate,
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
        // Format as JSON to get structured description
        response_format: { type: 'json_object' },
      });
      
      // Parse the JSON response
      try {
        const content = response.choices[0].message.content;
        if (!content) {
          throw new Error('Empty response content');
        }
        
        const parsed = JSON.parse(content);
        return parsed.description || 'No description available.';
      } catch (parseError) {
        console.error('Error parsing description response:', parseError);
        // Fall back to text content if JSON parsing fails
        return response.choices[0].message.content || 'No description available.';
      }
    } catch (error) {
      console.error('Error generating description:', error);
      return 'No description available.';
    }
  }
  
  /**
   * Get the default prompt template based on detail level
   */
  private getDefaultPromptTemplate(includeDetails: boolean): string {
    if (includeDetails) {
      return `Provide a detailed analysis of this construction defect image. Include:
1. Type of defect visible
2. Potential causes of the defect
3. Severity assessment
4. Potential consequences if not addressed
5. Possible remediation approaches

Format the response as a JSON object with a single "description" field containing the analysis.`;
    }
    
    return `Provide a concise description of the construction defect shown in this image. Focus on what type of defect is visible and its key characteristics.

Format the response as a JSON object with a single "description" field containing the description.`;
  }
} 