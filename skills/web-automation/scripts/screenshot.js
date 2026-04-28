#!/usr/bin/env node
/**
 * Screenshot capture script using Playwright
 * Usage: node screenshot.js <url> [output.png] [--full-page]
 */

const { chromium } = require('playwright');
const path = require('path');

async function captureScreenshot(url, outputPath, fullPage = true) {
  console.log(`Capturing screenshot of ${url}...`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000); // Wait for any animations
    
    await page.screenshot({ 
      path: outputPath, 
      fullPage: fullPage,
      type: 'png'
    });
    
    console.log(`Screenshot saved to: ${outputPath}`);
  } catch (error) {
    console.error('Error capturing screenshot:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Parse arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Usage: node screenshot.js <url> [output.png] [--full-page]');
  console.log('Example: node screenshot.js https://example.com myshot.png');
  process.exit(1);
}

const url = args[0];
const outputPath = args[1] || 'screenshot.png';
const fullPage = !args.includes('--no-full-page');

captureScreenshot(url, outputPath, fullPage);
