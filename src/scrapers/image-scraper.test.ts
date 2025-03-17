import axios from 'axios';
import { scrapeImagesFromUrl, ScrapedImage } from './image-scraper';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the config module
jest.mock('../utils/config', () => ({
  config: {
    getConfig: jest.fn().mockReturnValue({
      maxImagesPerPage: 10,
      userAgent: 'scrape-images-for-issues'
    })
  }
}));

// Mock the logger to avoid polluting test output
jest.mock('../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('Image Scraper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should extract images from HTML content', async () => {
    // Mock HTML content with images
    const mockHtml = `
      <html>
        <body>
          <img src="https://example.com/image1.jpg" alt="Image 1" width="200" height="100">
          <img src="/image2.jpg" alt="Image 2">
          <img src="image3.jpg">
          <div>Some text</div>
        </body>
      </html>
    `;

    // Mock axios response
    mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

    // Call the function with test URL
    const url = 'https://example.com';
    const result = await scrapeImagesFromUrl(url, 10);

    // Verify axios was called correctly
    expect(mockedAxios.get).toHaveBeenCalledWith(url, {
      headers: {
        'User-Agent': 'scrape-images-for-issues',
      },
      timeout: 10000,
    });

    // Verify the result
    expect(result).toHaveLength(3);

    // Check the first image
    expect(result[0]).toEqual({
      url: 'https://example.com/image1.jpg',
      alt: 'Image 1',
      width: 200,
      height: 100,
      sourceUrl: url,
    });

    // Check that relative URLs are converted to absolute
    expect(result[1].url).toBe('https://example.com/image2.jpg');
    expect(result[2].url).toBe('https://example.com/image3.jpg');
  });

  it('should handle errors gracefully', async () => {
    // Mock axios to throw an error
    const error = new Error('Network error');
    mockedAxios.get.mockRejectedValueOnce(error);

    // Call the function and expect it to throw
    await expect(scrapeImagesFromUrl('https://example.com')).rejects.toThrow();
  });

  it('should respect the maximum images limit', async () => {
    // Mock HTML with many images
    const mockHtml = `
      <html>
        <body>
          <img src="https://example.com/image1.jpg">
          <img src="https://example.com/image2.jpg">
          <img src="https://example.com/image3.jpg">
          <img src="https://example.com/image4.jpg">
          <img src="https://example.com/image5.jpg">
        </body>
      </html>
    `;

    mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

    // Call with a limit of 3
    const result = await scrapeImagesFromUrl('https://example.com', 3);

    // Should only return 3 images
    expect(result).toHaveLength(3);
  });
}); 