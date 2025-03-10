/**
 * Browser Service
 * 
 * Manages browser instances and handles the actual screenshot capture logic.
 */

const puppeteer = require('puppeteer');
const logger = require('../utils/logger');

// Browser instance pool
let browserPromise = null;
const maxConcurrentPages = parseInt(process.env.MAX_CONCURRENT_PAGES || 5);
const activePages = new Set();

/**
 * Get a browser instance, creating one if it doesn't exist
 * 
 * @returns {Promise<Browser>} - A Puppeteer browser instance
 */
async function getBrowser() {
  if (!browserPromise) {
    logger.info('Launching new browser instance');
    
    // Parse puppeteer args from environment
    const puppeteerArgs = (process.env.PUPPETEER_ARGS || '').split(',').filter(Boolean);
    
    browserPromise = puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        ...puppeteerArgs
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
    });
    
    const browser = await browserPromise;
    
    // Handle browser disconnection
    browser.on('disconnected', () => {
      logger.info('Browser disconnected');
      browserPromise = null;
      activePages.clear();
    });
  }
  
  return browserPromise;
}

/**
 * Capture a screenshot of a webpage
 * 
 * @param {Object} options - Screenshot options
 * @returns {Promise<Buffer>} - The screenshot as a buffer
 */
exports.captureScreenshot = async (options) => {
  // Wait if we've reached max concurrent pages
  while (activePages.size >= maxConcurrentPages) {
    logger.debug(`Waiting for browser capacity (${activePages.size}/${maxConcurrentPages})`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const browser = await getBrowser();
  const page = await browser.newPage();
  const pageId = Date.now().toString();
  activePages.add(pageId);
  
  try {
    // Configure viewport
    const width = parseInt(options.width) || 1280;
    const height = parseInt(options.height) || 800;
    
    await page.setViewport({ 
      width,
      height
    });
    
    // Set user agent if provided
    if (options.userAgent) {
      await page.setUserAgent(options.userAgent);
    }
    
    // Set extra HTTP headers if provided
    if (options.headers) {
      try {
        const headers = JSON.parse(options.headers);
        await page.setExtraHTTPHeaders(headers);
      } catch (e) {
        logger.warn('Invalid headers JSON format, ignoring');
      }
    }
    
    // Enable dark mode if requested
    if (options.darkMode === 'true') {
      await page.emulateMediaFeatures([
        { name: 'prefers-color-scheme', value: 'dark' }
      ]);
    }
    
    // Setup request interception if needed
    if (options.blockAds === 'true') {
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const requestUrl = request.url().toLowerCase();
        const adPatterns = [
          'googlesyndication.com',
          'doubleclick.net',
          'adservice.',
          '/ads/',
          'analytics.', 
          'tracking.'
        ];
        
        if (adPatterns.some(pattern => requestUrl.includes(pattern))) {
          request.abort();
        } else {
          request.continue();
        }
      });
    }
    
    // Navigate to the URL
    const maxLoadTime = parseInt(options.maxLoadTime) || 30000;
    
    await page.goto(options.url, {
      waitUntil: options.waitUntil || 'networkidle2',
      timeout: maxLoadTime
    });
    
    // Wait for additional time if specified
    const minLoadTime = parseInt(options.minLoadTime) || 0;
    if (minLoadTime > 0) {
      await new Promise(resolve => setTimeout(resolve, minLoadTime));
    }
    
    // Wait for selector if specified
    if (options.waitForSelector) {
      await page.waitForSelector(options.waitForSelector, { 
        timeout: maxLoadTime 
      });
    }
    
    // Take the screenshot
    const screenshotOptions = {
      fullPage: options.fullPage === 'true',
      type: (options.format === 'jpeg' || options.format === 'jpg') ? 'jpeg' : 'png',
      omitBackground: options.transparent === 'true'
    };
    
    // Add quality option for JPEG
    if (screenshotOptions.type === 'jpeg' && options.quality) {
      screenshotOptions.quality = parseInt(options.quality);
    }
    
    // Capture specific element if selector is provided
    if (options.selector) {
      const element = await page.$(options.selector);
      if (!element) {
        throw new Error(`Element with selector "${options.selector}" not found`);
      }
      return await element.screenshot(screenshotOptions);
    }
    
    // Special case for PDF
    if (options.format === 'pdf') {
      return await page.pdf({
        format: options.pdfFormat || 'A4',
        printBackground: options.printBackground !== 'false',
        margin: {
          top: options.marginTop || '0',
          right: options.marginRight || '0',
          bottom: options.marginBottom || '0',
          left: options.marginLeft || '0'
        }
      });
    }
    
    // Take regular screenshot
    return await page.screenshot(screenshotOptions);
  } finally {
    // Cleanup
    await page.close();
    activePages.delete(pageId);
    logger.debug(`Active pages: ${activePages.size}/${maxConcurrentPages}`);
  }
};

/**
 * Closes the browser instance if one exists
 */
exports.closeBrowser = async () => {
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
    browserPromise = null;
    activePages.clear();
    logger.info('Browser closed');
  }
};

// Ensure browser is closed on process exit
process.on('exit', async () => {
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
  }
});