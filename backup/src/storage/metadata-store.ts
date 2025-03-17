import fs from 'fs/promises';
import path from 'path';
import { ImageMetadata } from '../types';

/**
 * Handles storage and retrieval of image metadata
 */
export class MetadataStore {
  private filePath: string;
  private data: ImageMetadata[] = [];
  
  constructor(filePath: string) {
    this.filePath = filePath;
  }
  
  /**
   * Initialize the metadata store
   */
  async initialize(): Promise<void> {
    try {
      // Create directory if it doesn't exist
      const directory = path.dirname(this.filePath);
      await fs.mkdir(directory, { recursive: true });
      
      // Try to read existing metadata
      const fileContent = await fs.readFile(this.filePath, 'utf-8');
      this.data = JSON.parse(fileContent);
    } catch (error) {
      // If file doesn't exist or has invalid JSON, initialize with empty array
      this.data = [];
      // Create the file with empty array
      await this.save();
    }
  }
  
  /**
   * Save metadata to storage
   */
  async save(): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
  }
  
  /**
   * Add a new metadata entry
   */
  async addMetadata(metadata: ImageMetadata): Promise<void> {
    // Check if entry with this ID already exists
    const existingIndex = this.data.findIndex(item => item.id === metadata.id);
    
    if (existingIndex !== -1) {
      // Update existing entry
      this.data[existingIndex] = metadata;
    } else {
      // Add new entry
      this.data.push(metadata);
    }
    
    await this.save();
  }
  
  /**
   * Get all metadata entries
   */
  getAllMetadata(): ImageMetadata[] {
    return [...this.data];
  }
  
  /**
   * Get metadata by ID
   */
  getMetadataById(id: string): ImageMetadata | undefined {
    return this.data.find(item => item.id === id);
  }
  
  /**
   * Search metadata with filter function
   */
  searchMetadata(filterFn: (item: ImageMetadata) => boolean): ImageMetadata[] {
    return this.data.filter(filterFn);
  }
  
  /**
   * Remove metadata by ID
   */
  async removeMetadata(id: string): Promise<boolean> {
    const initialLength = this.data.length;
    this.data = this.data.filter(item => item.id !== id);
    
    if (this.data.length !== initialLength) {
      await this.save();
      return true;
    }
    
    return false;
  }
  
  /**
   * Get metadata statistics
   */
  getStats(): {
    totalImages: number;
    categoryCounts: Record<string, number>;
  } {
    const categoryCounts: Record<string, number> = {};
    
    this.data.forEach(item => {
      const category = item.category || 'uncategorized';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    return {
      totalImages: this.data.length,
      categoryCounts,
    };
  }
} 