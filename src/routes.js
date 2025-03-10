/**
 * API Routes
 * 
 * Defines all the API endpoints for the screenshot service.
 */

const express = require('express');
const router = express.Router();
const screenshotController = require('./controllers/screenshotController');
const validator = require('./middleware/validator');
const auth = require('./middleware/auth');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API information endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    name: 'ShotAPI',
    version: '1.0.0',
    description: 'A simple API for capturing screenshots of web pages',
    docs: '/docs',
    endpoints: [
      { method: 'GET', path: '/screenshot', description: 'Capture a screenshot' },
      { method: 'GET', path: '/health', description: 'Health check endpoint' }
    ]
  });
});

// Documentation endpoint (simple HTML page)
router.get('/docs', (req, res) => {
  res.sendFile('docs.html', { root: './public' });
});

// Screenshot endpoint
router.get('/screenshot', 
  validator.validateScreenshotParams, 
  auth.checkApiKey,
  (req, res, next) => {
    // Add cross-origin headers to allow embedding in other sites
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    next();
  },
  screenshotController.captureScreenshot
);

// Clear cache endpoint (protected)
router.post('/clear-cache',
  auth.requireApiKey,
  screenshotController.clearCache
);

// Handle 404 errors
router.use((req, res) => {
  res.status(404).json({ error: { message: 'Not Found', status: 404 } });
});

module.exports = router;