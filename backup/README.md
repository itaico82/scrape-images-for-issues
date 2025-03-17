# Construction Defect Image Collector

A TypeScript application that finds high-quality images of construction project defects online, downloads them, and generates AI-powered metadata including titles and descriptions.

## 🔍 Features

- **Web Scraping**: Searches for construction defect images from multiple sources
- **Quality Filtering**: Ensures only high-resolution, relevant images are collected
- **AI-Powered Analysis**: Uses OpenAI's Responses API to generate accurate titles and detailed descriptions
- **Metadata Storage**: Organizes images and their associated metadata for easy access
- **Customizable Search**: Configure search terms to focus on specific types of construction defects

## 🛠️ Technology Stack

- **TypeScript**: Type-safe code for reliable operation
- **Node.js**: Runtime environment
- **OpenAI Responses API**: For intelligent image analysis and description generation
- **Axios**: HTTP client for web requests and image downloading
- **Zod**: Runtime type validation for data integrity

## 📁 Project Structure

```
construction-defects/
├── src/
│   ├── config/        # Configuration settings
│   ├── scrapers/      # Web scraping modules
│   ├── downloader/    # Image downloading functionality
│   ├── llm/           # AI integration with OpenAI
│   ├── storage/       # File system operations and metadata storage
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── index.ts       # Application entry point
├── data/
│   ├── images/        # Downloaded images storage
│   └── metadata.json  # Centralized metadata storage
├── tests/             # Test suite
└── .env               # Environment variables (API keys, etc.)
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/construction-defect-collector.git
   cd construction-defect-collector
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Build the project:
   ```bash
   npm run build
   ```

### Usage

Run the application:
```bash
npm start
```

Or with custom configuration:
```bash
npm start -- --query="concrete cracks" --limit=50
```

## ⚙️ Configuration Options

The application can be configured through the `config.ts` file or command-line arguments:

- `searchTerms`: Array of terms to search for
- `maxResults`: Maximum number of images to collect
- `minImageWidth`: Minimum width in pixels for image quality filtering
- `minImageHeight`: Minimum height in pixels for image quality filtering
- `outputDirectory`: Custom location for downloaded images

## 📊 Output Format

For each image, the following metadata is collected:

```json
{
  "id": "unique-identifier",
  "sourceUrl": "https://source-website.com/image-path.jpg",
  "localPath": "./data/images/category/image-name.jpg",
  "title": "Severe Diagonal Cracking in Reinforced Concrete Beam",
  "description": "This image shows significant diagonal cracking in a reinforced concrete beam, indicating shear failure. The cracks are approximately 3-5mm wide and extend through most of the beam depth. This type of failure typically occurs when shear forces exceed the capacity of the concrete and reinforcement. Contributing factors may include inadequate stirrup spacing, insufficient concrete strength, or design miscalculations.",
  "dateCollected": "2023-08-15T14:32:10Z",
  "tags": ["concrete", "structural", "cracking", "beam", "shear failure"]
}
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- OpenAI for their powerful AI models
- Various construction engineering resources for reference materials 