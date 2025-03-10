# ShotAPI Usage Guide

This guide will help you get started with ShotAPI, showing common use cases and examples.

## Table of Contents
- [Basic Usage](#basic-usage)
- [Common Use Cases](#common-use-cases)
- [Integrating with Your Application](#integrating-with-your-application)
- [Deployment Scenarios](#deployment-scenarios)
- [Performance Optimization](#performance-optimization)
- [Security Considerations](#security-considerations)

## Basic Usage

### Capture a simple screenshot

```
GET http://localhost:3000/screenshot?url=https://example.com
```

This will return a PNG image of the website.

### Custom dimensions

```
GET http://localhost:3000/screenshot?url=https://example.com&width=1920&height=1080
```

### Different formats

```
# JPEG with quality setting
GET http://localhost:3000/screenshot?url=https://example.com&format=jpeg&quality=80

# PDF document
GET http://localhost:3000/screenshot?url=https://example.com&format=pdf
```

## Common Use Cases

### E-commerce Product Thumbnails

Capture screenshots of product pages to create thumbnails:

```
GET http://localhost:3000/screenshot?url=https://store.example.com/product/12345&selector=.product-image&width=800&height=600
```

### Website Monitoring

Capture full-page screenshots to monitor website changes:

```
GET http://localhost:3000/screenshot?url=https://example.com&fullPage=true&cacheTime=0
```

### Social Media Previews

Generate preview images for social media posts:

```
GET http://localhost:3000/screenshot?url=https://blog.example.com/article/latest&width=1200&height=630&selector=.hero-image
```

### PDF Reports

Generate PDF documents from web pages:

```
GET http://localhost:3000/screenshot?url=https://reports.example.com/quarterly&format=pdf&pdfFormat=A4&marginTop=20mm
```

## Integrating with Your Application

### Node.js Example

```javascript
const fetch = require('node-fetch');
const fs = require('fs');

async function captureScreenshot(url) {
  const apiUrl = `http://localhost:3000/screenshot?url=${encodeURIComponent(url)}`;
  
  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    throw new Error(`Screenshot API error: ${response.statusText}`);
  }
  
  // Save the screenshot
  const buffer = await response.buffer();
  fs.writeFileSync('screenshot.png', buffer);
  
  console.log('Screenshot saved to screenshot.png');
}

captureScreenshot('https://example.com')
  .catch(err => console.error(err));
```

### Python Example

```python
import requests
import shutil

def capture_screenshot(url):
    api_url = f"http://localhost:3000/screenshot?url={url}"
    
    response = requests.get(api_url, stream=True)
    response.raise_for_status()
    
    # Save the screenshot
    with open('screenshot.png', 'wb') as f:
        shutil.copyfileobj(response.raw, f)
    
    print("Screenshot saved to screenshot.png")

capture_screenshot('https://example.com')
```

## Deployment Scenarios

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/screenshotapi.git
cd screenshotapi

# Install dependencies
npm install

# Start the server
npm start
```

### Docker Container

```bash
# Build and run with Docker
docker build -t screenshotapi .
docker run -p 3000:3000 screenshotapi
```

### Docker Compose (Recommended)

```bash
# Start with Docker Compose
docker-compose up -d
```

### Cloud Deployment

For cloud deployment, you may need to adjust resource limits:

```yaml
# Example Docker Compose settings for cloud
services:
  screenshotapi:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MAX_CONCURRENT_PAGES=10
      - DEFAULT_CACHE_TIME=3600
      - MAX_CACHE_SIZE=200
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

## Performance Optimization

### Caching

Control caching behavior with the `cacheTime` parameter:

```
# Cache for 1 day (86400 seconds)
GET http://localhost:3000/screenshot?url=https://example.com&cacheTime=86400

# Disable caching
GET http://localhost:3000/screenshot?url=https://example.com&cacheTime=0
```

### Load Time Control

Use these parameters to control loading behavior:

```
# Wait at least 2 seconds for page resources to load
GET http://localhost:3000/screenshot?url=https://example.com&minLoadTime=2000

# Set a maximum load time of 10 seconds
GET http://localhost:3000/screenshot?url=https://example.com&maxLoadTime=10000

# Wait for a specific element to appear
GET http://localhost:3000/screenshot?url=https://example.com&waitForSelector=#content-loaded
```

## Security Considerations

### Enabling API Key Authentication

Set these environment variables in your `.env` file:

```
API_KEY_ENABLED=true
API_KEY=your-secret-api-key
```

Then use the API key in your requests:

```
# As a query parameter
GET http://localhost:3000/screenshot?url=https://example.com&apiKey=your-secret-api-key

# Or as a header
curl -H "X-API-Key: your-secret-api-key" http://localhost:3000/screenshot?url=https://example.com
```

### Rate Limiting

Configure rate limiting in your `.env` file:

```
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=60
```

This limits clients to 60 requests per minute.

### CORS Configuration

Restrict which domains can access your API:

```
# Allow specific origins
ALLOWED_ORIGINS=https://yourapp.com,https://anotherapp.com

# Allow all origins (not recommended for production)
ALLOWED_ORIGINS=*
```

## Troubleshooting

If you encounter issues:

1. Check the logs (`logs/combined.log` and `logs/error.log`)
2. Ensure the URL is accessible from the server
3. Try increasing `maxLoadTime` for complex pages
4. Check if the page uses JavaScript to load content and adjust `waitForSelector` accordingly
5. For "Error: Shot failed" messages, the page might be using advanced anti-scraping techniques