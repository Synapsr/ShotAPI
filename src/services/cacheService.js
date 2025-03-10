/**
 * Cache Service
 * 
 * Manages caching of screenshots to improve performance.
 */

const NodeCache = require('node-cache');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

// Cache configuration
const MAX_CACHE_SIZE = parseInt(process.env.MAX_CACHE_SIZE || 100);
const CACHE_DIR = path.join(process.cwd(), 'cache');

// Initialize the cache
const memoryCache = new NodeCache({
  stdTTL: 3600, // Default TTL in seconds
  checkperiod: 120, // Check for expired entries every 2 minutes
  maxKeys: MAX_CACHE_SIZE
});

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    logger.error(`Error creating cache directory: ${error.message}`);
    throw error;
  }
}

/**
 * Get a screenshot from the cache
 * 
 * @param {String} key - The cache key
 * @returns {Promise<Buffer|null>} - The cached screenshot or null if not found
 */
exports.get = async (key) => {
  try {
    // First check memory cache
    if (memoryCache.has(key)) {
      return memoryCache.get(key);
    }
    
    // Then check file cache
    await ensureCacheDir();
    const filePath = path.join(CACHE_DIR, `${key}.bin`);
    
    try {
      const stat = await fs.stat(filePath);
      const data = await fs.readFile(filePath);
      
      // Add to memory cache for faster access next time
      memoryCache.set(key, data);
      
      logger.debug(`Cache hit (file) for key: ${key}`);
      return data;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        logger.error(`Error reading from file cache: ${error.message}`);
      }
      return null;
    }
  } catch (error) {
    logger.error(`Cache get error: ${error.message}`);
    return null;
  }
};

/**
 * Store a screenshot in the cache
 * 
 * @param {String} key - The cache key
 * @param {Buffer} data - The screenshot data
 * @param {Number} ttl - Time to live in seconds
 * @returns {Promise<Boolean>} - Success status
 */
exports.set = async (key, data, ttl) => {
  try {
    // Store in memory cache
    memoryCache.set(key, data, ttl);
    
    // Store in file cache
    await ensureCacheDir();
    const filePath = path.join(CACHE_DIR, `${key}.bin`);
    
    await fs.writeFile(filePath, data);
    logger.debug(`Cached screenshot with key: ${key}`);
    
    return true;
  } catch (error) {
    logger.error(`Cache set error: ${error.message}`);
    return false;
  }
};

/**
 * Clear the entire cache
 * 
 * @returns {Promise<Boolean>} - Success status
 */
exports.clear = async () => {
  try {
    // Clear memory cache
    memoryCache.flushAll();
    
    // Clear file cache
    await ensureCacheDir();
    const files = await fs.readdir(CACHE_DIR);
    
    for (const file of files) {
      if (file.endsWith('.bin')) {
        await fs.unlink(path.join(CACHE_DIR, file));
      }
    }
    
    logger.info('Cache cleared successfully');
    return true;
  } catch (error) {
    logger.error(`Error clearing cache: ${error.message}`);
    return false;
  }
};