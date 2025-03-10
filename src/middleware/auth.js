/**
 * Authentication Middleware
 * 
 * Handles API key validation for protected endpoints.
 */

const logger = require('../utils/logger');

/**
 * Optional API key check middleware
 * Only enforces API key if enabled in configuration
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.checkApiKey = (req, res, next) => {
  // Skip validation if API keys are disabled
  if (process.env.API_KEY_ENABLED !== 'true') {
    return next();
  }
  
  const apiKey = req.query.apiKey || req.headers['x-api-key'];
  const configuredKey = process.env.API_KEY;
  
  if (!apiKey || apiKey !== configuredKey) {
    logger.warn('Unauthorized request: Invalid or missing API key');
    return res.status(401).json({
      error: {
        message: 'Unauthorized: Invalid or missing API key',
        status: 401
      }
    });
  }
  
  next();
};

/**
 * Required API key check middleware
 * Always enforces API key validation
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.requireApiKey = (req, res, next) => {
  const apiKey = req.query.apiKey || req.headers['x-api-key'];
  const configuredKey = process.env.API_KEY;
  
  if (!configuredKey) {
    logger.error('API key authentication required but not configured');
    return res.status(500).json({
      error: {
        message: 'Server configuration error',
        status: 500
      }
    });
  }
  
  if (!apiKey || apiKey !== configuredKey) {
    logger.warn('Unauthorized request: Invalid or missing API key');
    return res.status(401).json({
      error: {
        message: 'Unauthorized: Invalid or missing API key',
        status: 401
      }
    });
  }
  
  next();
};