#!/usr/bin/env node
/**
 * Video recording script using Playwright
 * Usage: node video-record.js <url> <duration-seconds> [output-name]
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function recordVideo(url, durationSeconds, outputName) {
  const videoDir = path.join(process.cwd(), 'videos');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }
  
  console.log(`Recording ${durationSeconds}s video of ${url}...`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { 
      dir: videoDir,
      size: { width: 1280, height: 720 }
    }
  });
  
  const page = await context.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    console.log(`Page loaded. Recording for ${durationSeconds} seconds...`);
    
    // Scroll down slowly to capture content
    const scrollInterval = setInterval(async () => {
      await page.evaluate(() => {
        window.scrollBy(0, 300);
      });
    }, 500);
    
    await new Promise(resolve => setTimeout(resolve, durationSeconds * 1000));
    clearInterval(scrollInterval);
    
    await context.close();
    
    // Find the video file and rename it
    const files = fs.readdirSync(videoDir);
    const videoFile = files.find(f => f.endsWith('.webm'));
    
    if (videoFile && outputName) {
      const oldPath = path.join(videoDir, videoFile);
      const newPath = path.join(videoDir, `${outputName}.webm`);
      fs.renameSync(oldPath, newPath);
      console.log(`Video saved to: ${newPath}`);
    } else if (videoFile) {
      console.log(`Video saved to: ${path.join(videoDir, videoFile)}`);
    }
    
  } catch (error) {
    console.error('Error recording video:', error.message);
    await browser.close();
    process.exit(1);
  }
}

// Parse arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node video-record.js <url> <duration-seconds> [output-name]');
  console.log('Example: node video-record.js https://example.com 30 myvideo');
  process.exit(1);
}

const url = args[0];
const duration = parseInt(args[1], 10);
const outputName = args[2];

if (isNaN(duration) || duration < 1) {
  console.error('Duration must be a positive number (in seconds)');
  process.exit(1);
}

recordVideo(url, duration, outputName);
