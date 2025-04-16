# Release Note Generator

A tool that automatically generates release notes for iOS and Android applications in multiple languages.

## Features

- Generate release notes for iOS and Android platforms
- Support for multiple languages
- JSON output format for iOS release notes
- Formatted text output for Android release notes
- Built with Next.js API routes
- Separate API endpoints for iOS and Android to improve response time

## Prerequisites

- Node.js (v14 or higher)
- OpenAI API key

## Setup

1. Clone this repository:
```bash
git clone https://github.com/yourusername/app-releasenote-generator.git
cd app-releasenote-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your-api-key-here
```

4. Start the development server:
```bash
npm run dev
```

## Usage

### API Endpoints

#### Generate iOS Release Notes

Send a POST request to the `/api/generate-ios` endpoint with the following JSON body:

```json
{
  "translationContent": "Your app update content description",
  "baseLanguage": "en",
  "iOSLanguages": ["en", "ja", "fr", "es"]
}
```

Response format:

```json
{
  "iOSReleaseNotes": {
    "en": "Release note content in English",
    "ja": "Release note content in Japanese",
    "fr": "Release note content in French",
    "es": "Release note content in Spanish"
  }
}
```

#### Generate Android Release Notes

Send a POST request to the `/api/generate-android` endpoint with the following JSON body:

```json
{
  "translationContent": "Your app update content description",
  "baseLanguage": "en",
  "androidLanguages": ["en", "ja", "fr", "es"]
}
```

Response format:

```json
{
  "androidReleaseNotes": "<en>\nRelease note content in English\n</en>\n<ja>\nRelease note content in Japanese\n</ja>\n<fr>\nRelease note content in French\n</fr>\n<es>\nRelease note content in Spanish\n</es>"
}
```

## Configuration

You can adjust the OpenAI model used for generation by modifying the `model` parameter in `pages/api/generate.js`. The default model is "gpt-4o-mini".

## License

MIT 