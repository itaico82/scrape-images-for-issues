import fs from 'fs/promises';
import path from 'path';

/**
 * Utility functions for file system operations
 */
export class FileSystem {
  /**
   * Ensure a directory exists
   */
  static async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(dirPath, { recursive: true });
    }
  }
  
  /**
   * Move a file to a different location
   */
  static async moveFile(source: string, destination: string): Promise<void> {
    await this.ensureDirectory(path.dirname(destination));
    await fs.rename(source, destination);
  }
  
  /**
   * Copy a file to a different location
   */
  static async copyFile(source: string, destination: string): Promise<void> {
    await this.ensureDirectory(path.dirname(destination));
    await fs.copyFile(source, destination);
  }
  
  /**
   * Delete a file
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
  
  /**
   * Check if a file exists
   */
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get file size
   */
  static async getFileSize(filePath: string): Promise<number> {
    const stats = await fs.stat(filePath);
    return stats.size;
  }
  
  /**
   * Organize files into subdirectories based on category
   */
  static async organizeByCategory(
    sourceDir: string,
    files: Array<{ id: string; category?: string; filename: string }>
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    
    for (const file of files) {
      const category = file.category || 'uncategorized';
      const categoryDir = path.join(sourceDir, category);
      
      // Ensure category directory exists
      await this.ensureDirectory(categoryDir);
      
      // Source and destination paths
      const sourcePath = path.join(sourceDir, file.filename);
      const destinationPath = path.join(categoryDir, file.filename);
      
      // Move file if it exists
      if (await this.fileExists(sourcePath)) {
        await this.moveFile(sourcePath, destinationPath);
        result[file.id] = destinationPath;
      }
    }
    
    return result;
  }
} 