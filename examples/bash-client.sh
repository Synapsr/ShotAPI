#!/bin/bash
#
# Example Bash client for ShotAPI
#
# This script demonstrates how to use the ShotAPI service
# to capture and save screenshots using curl.

# Configuration
API_URL="http://localhost:3000"  # Change to your API URL
OUTPUT_DIR="./output"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Print a message with a timestamp
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Capture a screenshot and save to file
capture_screenshot() {
  local params="$1"
  local output_file="$2"
  local full_url="${API_URL}/screenshot?${params}"
  
  log "Requesting: $full_url"
  
  # Make the request with curl
  if curl -s -f -o "${OUTPUT_DIR}/${output_file}" "$full_url"; then
    log "Saved to: ${OUTPUT_DIR}/${output_file}"
    return 0
  else
    local status=$?
    log "Error: Failed to capture screenshot (exit code: $status)"
    return $status
  fi
}

# Main script

log "Starting ShotAPI examples"

# Example 1: Basic screenshot
log "Example 1: Basic screenshot"
capture_screenshot "url=https://example.com&width=1280&height=800" "basic.png"

# Example 2: Full page screenshot with JPEG format
log "Example 2: Full page JPEG screenshot"
capture_screenshot "url=https://example.com&format=jpeg&quality=90&fullPage=true" "full-page.jpg"

# Example 3: PDF document
log "Example 3: PDF document"
capture_screenshot "url=https://example.com&format=pdf&pdfFormat=A4&marginTop=10mm" "document.pdf"

# Example 4: Mobile device emulation
log "Example 4: Mobile device emulation"
capture_screenshot "url=https://example.com&width=375&height=812&userAgent=Mozilla/5.0%20(iPhone;%20CPU%20iPhone%20OS%2014_0%20like%20Mac%20OS%20X)%20AppleWebKit/605.1.15%20(KHTML,%20like%20Gecko)%20Version/14.0%20Mobile/15E148%20Safari/604.1" "mobile.png"

# Example 5: Dark mode
log "Example 5: Dark mode"
capture_screenshot "url=https://example.com&darkMode=true" "dark-mode.png"

log "All examples completed"