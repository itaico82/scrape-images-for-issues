# Scrape Images for Issues

A tool to scrape images from websites and automatically create GitHub issues with those images attached.

## Overview
This project provides a simple way to extract images from websites and use them in GitHub issues. It's a command-line tool built with TypeScript that can be integrated into your workflow.

## Features
- Web scraping for images using Cheerio
- Automatic GitHub issue creation with Octokit
- Command-line interface with Commander
- Customizable issue templates

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup
1. Clone the repository:
```bash
git clone https://github.com/itaico82/scrape-images-for-issues.git
cd scrape-images-for-issues
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
# GitHub API Configuration
GITHUB_TOKEN=your_github_token_here

# Scraper Configuration
MAX_IMAGES_PER_PAGE=10
USER_AGENT=scrape-images-for-issues
```

4. Build the project:
```bash
npm run build
```

## Usage

### Command Line
```bash
# Basic usage
npm run scrape -- -u https://example.com -o repo-owner -r repo-name

# With all options
npm run scrape -- --url https://example.com --owner repo-owner --repo repo-name --title "My Images" --body "Custom description" --max 5
```

### Options
- `-u, --url <url>`: URL to scrape for images (required)
- `-o, --owner <owner>`: GitHub repository owner (required)
- `-r, --repo <repo>`: GitHub repository name (required)
- `-t, --title <title>`: Issue title (default: "Scraped Images")
- `-b, --body <body>`: Issue body text (default: "Images scraped from website")
- `-m, --max <count>`: Maximum number of images to include (default: 10)

## Development

### Available Scripts
- `npm run build`: Build the TypeScript code
- `npm run dev`: Run the development version
- `npm run test`: Run tests
- `npm run scrape`: Run the scraper tool

## License
MIT