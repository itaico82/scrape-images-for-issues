import { createIssueWithImages, getOctokit } from './issue-creator';
import { ScrapedImage } from '../scrapers/image-scraper';

// Mock the Octokit module
jest.mock('octokit', () => {
  const mockRequest = jest.fn().mockResolvedValue({
    data: {
      html_url: 'https://github.com/test-owner/test-repo/issues/1'
    }
  });
  
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      request: mockRequest
    }))
  };
});

// Mock dotenv config
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock the config module
jest.mock('../utils/config', () => ({
  config: {
    getConfig: jest.fn().mockReturnValue({
      githubToken: 'test-token',
      maxImagesPerPage: 10,
      userAgent: 'test-user-agent'
    }),
    validate: jest.fn().mockReturnValue(true)
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

describe('GitHub Issue Creator', () => {
  // Get the mocked function
  const mockRequest = jest.requireMock('octokit').Octokit().request;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a GitHub issue with images', async () => {
    // Test data
    const title = 'Test Issue';
    const body = 'This is a test issue';
    const images: ScrapedImage[] = [
      {
        url: 'https://example.com/image1.jpg',
        alt: 'Image 1',
        sourceUrl: 'https://example.com'
      },
      {
        url: 'https://example.com/image2.jpg',
        alt: 'Image 2',
        width: 200,
        height: 100,
        sourceUrl: 'https://example.com'
      }
    ];
    const repoOwner = 'test-owner';
    const repoName = 'test-repo';

    // Call the function
    const result = await createIssueWithImages(
      title,
      body,
      images,
      repoOwner,
      repoName
    );

    // Verify the function returns the expected URL
    expect(result).toBe('https://github.com/test-owner/test-repo/issues/1');

    // Verify Octokit request was called with correct parameters
    expect(mockRequest).toHaveBeenCalledWith(
      'POST /repos/{owner}/{repo}/issues',
      expect.objectContaining({
        owner: repoOwner,
        repo: repoName,
        title: title,
        body: expect.stringContaining(body),
        headers: expect.any(Object)
      })
    );

    // Verify the markdown for images is in the request body
    const requestCall = mockRequest.mock.calls[0][1];
    expect(requestCall.body).toContain('![Image 1](https://example.com/image1.jpg)');
    expect(requestCall.body).toContain('![Image 2](https://example.com/image2.jpg)');
    expect(requestCall.body).toContain('*Source: https://example.com*');
  });

  it('should handle errors gracefully', async () => {
    // Mock a failure
    mockRequest.mockRejectedValueOnce(new Error('API Error'));

    // Expect the function to throw
    await expect(
      createIssueWithImages(
        'Test',
        'Body',
        [{
          url: 'https://example.com/image.jpg',
          alt: 'Image',
          sourceUrl: 'https://example.com'
        }],
        'owner',
        'repo'
      )
    ).rejects.toThrow();
  });

  it('should handle empty images array', async () => {
    // Call with empty images array
    await createIssueWithImages(
      'Test',
      'Body',
      [],
      'owner',
      'repo'
    );

    // Verify the request was still made
    expect(mockRequest).toHaveBeenCalled();
    
    // The body should not contain image markdown
    const requestCall = mockRequest.mock.calls[0][1];
    expect(requestCall.body).not.toContain('![');
    expect(requestCall.body).toContain('Body');
  });
}); 