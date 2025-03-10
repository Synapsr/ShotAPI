/**
 * Screenshot Controller
 * 
 * Handles the logic for capturing and serving screenshots.
 */

const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;
const browserService = require('../services/browserService');
const cacheService = require('../services/cacheService');
const logger = require('../utils/logger');

/**
 * Capture a screenshot of a webpage
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.captureScreenshot = async (req, res) => {
  try {
    const params = req.query;
    const url = params.url;
    
    // Generate a cache key based on the request parameters
    const cacheKey = generateCacheKey(params);
    
    // Check if we have a cached version
    const cacheTime = parseInt(params.cacheTime !== undefined ? params.cacheTime : process.env.DEFAULT_CACHE_TIME);
    
    if (cacheTime > 0) {
      const cachedScreenshot = await cacheService.get(cacheKey);
      
      if (cachedScreenshot) {
        logger.info(`Serving cached screenshot for ${url}`);
        
        // Set appropriate content type
        const contentType = getContentType(params.format || 'png');
        res.set('Content-Type', contentType);
        res.set('X-Cache', 'HIT');
        
        return res.send(cachedScreenshot);
      }
    }
    
    // No cache hit, capture a new screenshot
    logger.info(`Capturing new screenshot for ${url}`);
    
    const screenshot = await browserService.captureScreenshot(params);
    
    // Cache the screenshot if caching is enabled
    if (cacheTime > 0) {
      await cacheService.set(cacheKey, screenshot, cacheTime);
    }
    
    // Set appropriate content type
    const contentType = getContentType(params.format || 'png');
    res.set('Content-Type', contentType);
    res.set('X-Cache', 'MISS');
    
    return res.send(screenshot);
  } catch (error) {
    logger.error(`Error capturing screenshot: ${error.message}`, { stack: error.stack });
    
    if (error.message.includes('net::ERR_NAME_NOT_RESOLVED') || 
        error.message.includes('net::ERR_ABORTED') ||
        error.message.includes('Invalid URL')) {
      return res.status(400).json({ 
        error: { 
          message: 'Invalid or inaccessible URL',
          status: 400
        } 
      });
    }
    
    if (error.message.includes('Navigation timeout')) {
      return res.status(504).json({ 
        error: { 
          message: 'Page load timed out',
          status: 504
        } 
      });
    }
    
    res.status(500).json({ 
      error: { 
        message: 'Failed to capture screenshot',
        status: 500
      } 
    });
  }
};

/**
 * Clear the screenshot cache
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.clearCache = async (req, res) => {
  try {
    await cacheService.clear();
    logger.info('Cache cleared successfully');
    res.status(200).json({ message: 'Cache cleared successfully' });
  } catch (error) {
    logger.error(`Error clearing cache: ${error.message}`);
    res.status(500).json({ 
      error: { 
        message: 'Failed to clear cache',
        status: 500
      } 
    });
  }
};

/**
 * Generate a unique cache key based on request parameters
 * 
 * @param {Object} params - Request parameters
 * @returns {String} - The cache key
 */
function generateCacheKey(params) {
  // Sort keys to ensure consistent ordering
  const ordered = Object.keys(params)
    .sort()
    .reduce((obj, key) => {
      obj[key] = params[key];
      return obj;
    }, {});
  
  // Create a hash of the stringified parameters
  return crypto
    .createHash('md5')
    .update(JSON.stringify(ordered))
    .digest('hex');
}

/**
 * Get the appropriate content type based on format
 * 
 * @param {String} format - The screenshot format (png, jpeg, pdf)
 * @returns {String} - The content type
 */
function getContentType(format) {
  switch (format.toLowerCase()) {
    case 'jpeg':
    case 'jpg':
      return 'image/jpeg';
    case 'pdf':
      return 'application/pdf';
    case 'png':
    default:
      return 'image/png';
  }
}