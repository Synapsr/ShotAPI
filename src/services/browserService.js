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
        '--font-render-hinting=none',
        '--disable-web-security', // Allow cross-origin requests
        '--disable-features=IsolateOrigins,site-per-process', // Disable site isolation
        ...puppeteerArgs
      ],
      ignoreHTTPSErrors: true, // Ignore HTTPS errors
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
    
    // Set default user agent with higher Chrome version if not specified
    const defaultUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
    
    if (options.userAgent) {
      await page.setUserAgent(options.userAgent);
    } else {
      await page.setUserAgent(defaultUserAgent);
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
    
    // Set default headers to better emulate a real browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });
    
    // Enable dark mode if requested
    if (options.darkMode === 'true' || options.darkMode === true) {
      await page.emulateMediaFeatures([
        { name: 'prefers-color-scheme', value: 'dark' }
      ]);
    }
    
    // Enable JavaScript and CSS
    await page.setJavaScriptEnabled(true);
    
    // Block tracking and ad scripts if requested
    if (options.blockAds === 'true' || options.blockAds === true) {
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
    
    // Set default timeout
    const maxLoadTime = parseInt(options.maxLoadTime) || 30000;
    page.setDefaultNavigationTimeout(maxLoadTime);
    page.setDefaultTimeout(maxLoadTime);
    
    // Navigate to the URL with improved waitUntil option
    let waitUntilOption = options.waitUntil || 'networkidle2';
    
    // For Nuxt and other SPAs, try to wait longer for full page rendering
    if (options.minLoadTime >= 5000 || options.fullPage === 'true' || options.fullPage === true) {
      // Use a more strict waitUntil for full page captures
      waitUntilOption = 'networkidle0';
    }
    
    logger.info(`Navigating to ${options.url} with waitUntil: ${waitUntilOption}`);
    
    await page.goto(options.url, {
      waitUntil: waitUntilOption,
      timeout: maxLoadTime
    });
    
    // Wait for additional time if specified
    const minLoadTime = parseInt(options.minLoadTime) || 0;
    if (minLoadTime > 0) {
      logger.debug(`Waiting additional ${minLoadTime}ms for page resources`);
      await new Promise(resolve => setTimeout(resolve, minLoadTime));
    }
    
    // Wait for selector if specified
    if (options.waitForSelector) {
      logger.debug(`Waiting for selector: ${options.waitForSelector}`);
      try {
        await page.waitForSelector(options.waitForSelector, { 
          timeout: maxLoadTime 
        });
      } catch (error) {
        logger.warn(`Selector ${options.waitForSelector} not found within timeout`);
        // Continue anyway
      }
    }
    
    // For Nuxt, React, Vue and other SPAs, wait for app to be fully loaded
    try {
      // Wait for common SPA containers
      for (const selector of ['#__nuxt', '#app', '#root', '#__next', '.main-content']) {
        const element = await page.$(selector);
        if (element) {
          logger.debug(`Found SPA container: ${selector}`);
          // Wait a bit more for SPA to render
          await new Promise(resolve => setTimeout(resolve, 1000));
          break;
        }
      }
    } catch (e) {
      // Ignore errors - just a best effort
    }
    
    // Make sure fonts are loaded
    await page.evaluate(() => {
      if (document.fonts && typeof document.fonts.ready.then === 'function') {
        return document.fonts.ready;
      }
    });
    
    // Take the screenshot
    const screenshotOptions = {
      fullPage: options.fullPage === 'true' || options.fullPage === true,
      type: (options.format === 'jpeg' || options.format === 'jpg') ? 'jpeg' : 'png',
      omitBackground: options.transparent === 'true' || options.transparent === true
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