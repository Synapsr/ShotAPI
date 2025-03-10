/**
 * API Integration Tests
 */

const request = require('supertest');
const app = require('../src/index');
const browserService = require('../src/services/browserService');
const cacheService = require('../src/services/cacheService');

// Close browser and clear cache after tests
afterAll(async () => {
  await browserService.closeBrowser();
  await cacheService.clear();
});

describe('API Endpoints', () => {
  // Health check endpoint
  test('GET /health should return 200 OK', async () => {
    const response = await request(app).get('/health');
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });
  
  // Root endpoint
  test('GET / should return API info', async () => {
    const response = await request(app).get('/');
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('endpoints');
  });
  
  // Screenshot endpoint validation
  test('GET /screenshot without URL should return 400', async () => {
    const response = await request(app).get('/screenshot');
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
  
  // Screenshot endpoint with invalid URL
  test('GET /screenshot with invalid URL should return 400', async () => {
    const response = await request(app).get('/screenshot?url=not-a-valid-url');
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
  
  // Screenshot endpoint with valid URL
  test('GET /screenshot with valid URL should return an image', async () => {
    const response = await request(app)
      .get('/screenshot?url=https://example.com')
      .timeout(30000); // Allow time for screenshot capture
    
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toBe('image/png');
    expect(response.body).toBeInstanceOf(Buffer);
  }, 30000); // Test timeout
  
  // Screenshot with JPEG format
  test('GET /screenshot with JPEG format should return JPEG image', async () => {
    const response = await request(app)
      .get('/screenshot?url=https://example.com&format=jpeg&quality=50')
      .timeout(30000);
    
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toBe('image/jpeg');
    expect(response.body).toBeInstanceOf(Buffer);
  }, 30000);
  
  // 404 for non-existent routes
  test('GET /nonexistent should return 404', async () => {
    const response = await request(app).get('/nonexistent');
    
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
});