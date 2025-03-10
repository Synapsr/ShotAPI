/**
 * Request Validator Middleware
 * 
 * Validates incoming request parameters.
 */

const Joi = require('joi');
const logger = require('../utils/logger');

// Define validation schema for screenshot parameters
const screenshotSchema = Joi.object({
  url: Joi.string().uri().required(),
  width: Joi.number().integer().min(1).max(5000),
  height: Joi.number().integer().min(1).max(5000),
  format: Joi.string().valid('png', 'jpeg', 'jpg', 'pdf'),
  quality: Joi.number().integer().min(1).max(100),
  fullPage: Joi.string().valid('true', 'false'),
  minLoadTime: Joi.number().integer().min(0).max(30000),
  maxLoadTime: Joi.number().integer().min(1000).max(60000),
  cacheTime: Joi.number().integer().min(0),
  darkMode: Joi.string().valid('true', 'false'),
  userAgent: Joi.string(),
  selector: Joi.string(),
  waitForSelector: Joi.string(),
  waitUntil: Joi.string().valid('load', 'domcontentloaded', 'networkidle0', 'networkidle2'),
  transparent: Joi.string().valid('true', 'false'),
  blockAds: Joi.string().valid('true', 'false'),
  headers: Joi.string(),
  pdfFormat: Joi.string().valid('Letter', 'Legal', 'Tabloid', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5'),
  printBackground: Joi.string().valid('true', 'false'),
  marginTop: Joi.string(),
  marginRight: Joi.string(),
  marginBottom: Joi.string(),
  marginLeft: Joi.string(),
  apiKey: Joi.string()
}).unknown(false);

/**
 * Validate screenshot parameters
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.validateScreenshotParams = (req, res, next) => {
  const { error, value } = screenshotSchema.validate(req.query);
  
  if (error) {
    logger.warn(`Invalid request parameters: ${error.message}`);
    return res.status(400).json({
      error: {
        message: `Invalid request parameters: ${error.message}`,
        status: 400
      }
    });
  }
  
  // Update the request with validated values
  req.query = value;
  next();
};