/**
 * Example Node.js client for ShotAPI
 * 
 * This script demonstrates how to use the ShotAPI service to capture and save screenshots.
 */

const fetch = require('node-fetch');
const fs = require('fs/promises');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:3000'; // Change to your API URL
const OUTPUT_DIR = path.join(__dirname, 'output');

/**
 * Capture a screenshot with the specified options
 * 
 * @param {Object} options - Screenshot options
 * @returns {Promise<Buffer>} - Screenshot data as buffer
 */
async function captureScreenshot(options) {
  // Convert options object to URL parameters
  const params = new URLSearchParams();
  Object.entries(options).forEach(([key, value]) => {
    params.append(key, value);
  });
  
  const url = `${API_URL}/screenshot?${params.toString()}`;
  console.log(`Requesting: ${url}`);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error?.message || response.statusText;
    throw new Error(`API Error (${response.status}): ${errorMessage}`);
  }
  
  console.log(`Response headers: ${JSON.stringify(Object.fromEntries([...response.headers]), null, 2)}`);
  
  return await response.buffer();
}

/**
 * Save buffer data to a file
 * 
 * @param {Buffer} data - Data to save
 * @param {String} filename - Output filename
 */
async function saveFile(data, filename) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const filePath = path.join(OUTPUT_DIR, filename);
  await fs.writeFile(filePath, data);
  console.log(`Saved to: ${filePath}`);
}

/**
 * Main function to demonstrate the API usage
 */
async function main() {
  try {
    // Example 1: Basic screenshot
    const basic = await captureScreenshot({
      url: 'https://example.com',
      width: 1280,
      height: 800
    });
    await saveFile(basic, 'basic.png');
    
    // Example 2: Full page screenshot with JPEG format
    const fullPage = await captureScreenshot({
      url: 'https://example.com',
      format: 'jpeg',
      quality: 90,
      fullPage: 'true'
    });
    await saveFile(fullPage, 'full-page.jpg');
    
    // Example 3: PDF document
    const pdf = await captureScreenshot({
      url: 'https://example.com',
      format: 'pdf',
      pdfFormat: 'A4',
      marginTop: '10mm'
    });
    await saveFile(pdf, 'document.pdf');
    
    // Example 4: Mobile device emulation
    const mobile = await captureScreenshot({
      url: 'https://example.com',
      width: 375,
      height: 812,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });
    await saveFile(mobile, 'mobile.png');
    
    // Example 5: Dark mode
    const darkMode = await captureScreenshot({
      url: 'https://example.com',
      darkMode: 'true'
    });
    await saveFile(darkMode, 'dark-mode.png');
    
    console.log('All examples completed successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the examples
main();