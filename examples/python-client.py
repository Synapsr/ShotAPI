#!/usr/bin/env python3
"""
Example Python client for ShotAPI

This script demonstrates how to use the ShotAPI service to capture and save screenshots.
"""

import os
import requests
from urllib.parse import urlencode
import time
from pathlib import Path

# Configuration
API_URL = "http://localhost:3000"  # Change to your API URL
OUTPUT_DIR = Path(__file__).parent / "output"


def capture_screenshot(options):
    """
    Capture a screenshot with the specified options
    
    Args:
        options (dict): Screenshot options
        
    Returns:
        bytes: Screenshot data
    """
    # Build the URL with parameters
    url = f"{API_URL}/screenshot?{urlencode(options)}"
    print(f"Requesting: {url}")
    
    # Add a timestamp to prevent browser caching in case this is being run from a browser
    timestamp = int(time.time())
    if "?" in url:
        url = f"{url}&_t={timestamp}"
    else:
        url = f"{url}?_t={timestamp}"
    
    # Make the request
    response = requests.get(url, stream=True)
    
    # Check for errors
    if not response.ok:
        try:
            error_data = response.json()
            error_message = error_data.get("error", {}).get("message", response.reason)
        except:
            error_message = response.reason
            
        raise Exception(f"API Error ({response.status_code}): {error_message}")
    
    # Print response headers
    print(f"Response headers: {dict(response.headers)}")
    
    # Return the image data
    return response.content


def save_file(data, filename):
    """
    Save data to a file
    
    Args:
        data (bytes): Data to save
        filename (str): Output filename
    """
    # Create output directory if it doesn't exist
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Determine file path
    file_path = OUTPUT_DIR / filename
    
    # Write the file
    with open(file_path, "wb") as f:
        f.write(data)
        
    print(f"Saved to: {file_path}")


def main():
    """Main function to demonstrate the API usage"""
    try:
        # Example 1: Basic screenshot
        basic = capture_screenshot({
            "url": "https://example.com",
            "width": 1280,
            "height": 800
        })
        save_file(basic, "basic.png")
        
        # Example 2: Full page screenshot with JPEG format
        full_page = capture_screenshot({
            "url": "https://example.com",
            "format": "jpeg",
            "quality": 90,
            "fullPage": "true"
        })
        save_file(full_page, "full-page.jpg")
        
        # Example 3: PDF document
        pdf = capture_screenshot({
            "url": "https://example.com",
            "format": "pdf",
            "pdfFormat": "A4",
            "marginTop": "10mm"
        })
        save_file(pdf, "document.pdf")
        
        # Example 4: Mobile device emulation
        mobile = capture_screenshot({
            "url": "https://example.com",
            "width": 375,
            "height": 812,
            "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
        })
        save_file(mobile, "mobile.png")
        
        # Example 5: Dark mode
        dark_mode = capture_screenshot({
            "url": "https://example.com",
            "darkMode": "true"
        })
        save_file(dark_mode, "dark-mode.png")
        
        print("All examples completed successfully!")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        exit(1)


if __name__ == "__main__":
    main()