# 📸 ShotAPI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Node.js ≥18](https://img.shields.io/badge/Node.js-%E2%89%A518-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

**ShotAPI** is a super-simple, Docker-ready API service that captures screenshots of any webpage. Think of it as your open-source alternative to services like urlbox or thum.io but free and open source with full control and no usage limits!

## ✨ Features

- 🖼️ **Simple Screenshot Capture** - A single API endpoint to turn any URL into an image
- 🔄 **Flexible Output Options** - PNG, JPEG, or even PDF formats
- ⚙️ **Highly Customizable** - Control viewport size, image quality, load times, and more
- 💾 **Smart Caching** - Automatic caching for faster responses and reduced load
- 🚀 **Fast Deployment** - Up and running in a single Docker command
- 🔒 **Production Ready** - Built-in rate limiting, security headers, and optional API key authentication
- 🌐 **Works Everywhere** - Captures any public website, including those with JavaScript

## 🚀 Quick Start

### Using Docker (Easiest)

```bash
# Pull and run with a single command
docker run -p 3000:3000 synapsr/shotapi

# Or with Docker Compose
docker-compose up -d
```

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/Synapsr/ShotAPI.git
cd shotapi

# Install dependencies
npm install

# Start the server
npm start
```

## 🔍 Usage Examples

### Basic Screenshot

```
GET http://localhost:3000/screenshot?url=https://example.com
```

### High-Resolution Screenshot

```
GET http://localhost:3000/screenshot?url=https://example.com&width=1920&height=1080
```

### Mobile Device Emulation

```
GET http://localhost:3000/screenshot?url=https://example.com&width=375&height=812&userAgent=Mozilla/5.0+(iPhone;+CPU+iPhone+OS+14_0+like+Mac+OS+X)+AppleWebKit/605.1.15
```

### Full-Page JPEG with Quality Setting

```
GET http://localhost:3000/screenshot?url=https://example.com&format=jpeg&quality=90&fullPage=true
```

### Generate a PDF

```
GET http://localhost:3000/screenshot?url=https://example.com&format=pdf&pdfFormat=A4
```

### Dark Mode Capture

```
GET http://localhost:3000/screenshot?url=https://example.com&darkMode=true
```

## 📝 API Parameters

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `url` | The URL to capture (required) | - | `https://example.com` |
| `width` | Viewport width in pixels | 1280 | `width=1920` |
| `height` | Viewport height in pixels | 800 | `height=1080` |
| `format` | Output format (png, jpeg, pdf) | png | `format=jpeg` |
| `quality` | Image quality (1-100, jpeg only) | 80 | `quality=90` |
| `fullPage` | Capture full page height | false | `fullPage=true` |
| `minLoadTime` | Minimum page load time in ms | 0 | `minLoadTime=2000` |
| `darkMode` | Enable dark mode emulation | false | `darkMode=true` |
| `selector` | Capture specific element | - | `selector=#content` |
| `transparent` | Transparent background (png only) | false | `transparent=true` |

See the [full API documentation](http://localhost:3000/docs) for all available options.

## 🐳 Docker Deployment

ShotAPI is designed to be super easy to deploy with Docker.

### Simple Docker Run

```bash
docker run -p 3000:3000 synapsr/shotapi
```

### Using Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  shotapi:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - cache-data:/usr/src/app/cache
    restart: unless-stopped

volumes:
  cache-data:
```

Then run:

```bash
docker-compose up -d
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port to run the server on | 3000 |
| `MAX_CONCURRENT_PAGES` | Maximum concurrent browser pages | 5 |
| `DEFAULT_CACHE_TIME` | Default cache time in seconds | 3600 |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit requests per window | 60 |
| `API_KEY_ENABLED` | Enable API key authentication | false |

## 🔧 Advanced Usage

### Custom HTTP Headers

```
GET http://localhost:3000/screenshot?url=https://example.com&headers={"Authorization":"Bearer+token"}
```

### Waiting for Elements to Load

```
GET http://localhost:3000/screenshot?url=https://example.com&waitForSelector=#main-content
```

### Capture a Specific Element

```
GET http://localhost:3000/screenshot?url=https://example.com&selector=#hero-section
```

## 📚 Integration Examples

### Node.js

```javascript
const fetch = require('node-fetch');
const fs = require('fs');

async function getScreenshot(url) {
  const response = await fetch(
    `http://localhost:3000/screenshot?url=${encodeURIComponent(url)}`
  );
  
  if (!response.ok) throw new Error(`Error: ${response.statusText}`);
  
  const buffer = await response.buffer();
  fs.writeFileSync('screenshot.png', buffer);
  console.log('Screenshot saved!');
}

getScreenshot('https://example.com');
```

### Python

```python
import requests

def get_screenshot(url):
    response = requests.get(
        f"http://localhost:3000/screenshot?url={url}", 
        stream=True
    )
    
    response.raise_for_status()
    
    with open('screenshot.png', 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    print("Screenshot saved!")

get_screenshot('https://example.com')
```

## 🛡️ Security Considerations

### Enabling API Key Authentication

Update your `.env` file:

```
API_KEY_ENABLED=true
API_KEY=your-secure-api-key
```

Then include the API key in your requests:

```
GET http://localhost:3000/screenshot?url=https://example.com&apiKey=your-secure-api-key
```

Or using a header:

```
GET http://localhost:3000/screenshot?url=https://example.com
X-API-Key: your-secure-api-key
```

## 🧩 Use Cases

- 🖥️ **Website Monitoring** - Capture regular screenshots to monitor visual changes
- 📱 **Social Media Previews** - Generate preview images for social media sharing
- 🛒 **E-commerce Thumbnails** - Create product thumbnails from product pages
- 📊 **Report Generation** - Create visual reports or dashboards as images or PDFs
- 🧪 **UI Testing** - Visual regression testing for web applications

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Development

```bash
# Install dependencies
npm install

# Start with auto-reloading
npm run dev
```

### Running Tests

```bash
npm test
```

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| **Error: Shot failed** | The page might be using anti-scraping techniques or requires cookies/authentication |
| **Timeout error** | Try increasing `maxLoadTime` parameter for complex pages |
| **Blank screenshot** | Use `minLoadTime` or `waitForSelector` to ensure content is loaded |
| **Missing elements** | Try enabling `fullPage=true` or adjust viewport dimensions |

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Check out the [Contributing Guide](CONTRIBUTING.md) for more information.

---

Made with ❤️ by Synapsr

Star ⭐ this repo if you found it useful!