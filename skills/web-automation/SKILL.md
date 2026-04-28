---
name: web-automation
description: Web scraping, screenshot capture, and browser automation using Playwright. Use when the user needs to: (1) Scrape data from websites, (2) Take screenshots of web pages, (3) Automate browser interactions, (4) Record videos of browser sessions, or (5) Extract content from JavaScript-heavy sites.
---

# Web Automation

Browser automation using Playwright for scraping, screenshots, and video recording.

## Prerequisites

Playwright must be installed:
```bash
npm install -g playwright
npx playwright install chromium
```

## Capabilities

### 1. Screenshot Capture

Take full-page or element-specific screenshots:

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({ path: 'screenshot.png', fullPage: true });
  await browser.close();
})();
```

### 2. Web Scraping

Extract data from pages:

```javascript
const data = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('.item')).map(el => ({
    title: el.querySelector('.title')?.textContent,
    price: el.querySelector('.price')?.textContent
  }));
});
```

### 3. Video Recording

Record browser sessions:

```javascript
const browser = await chromium.launch();
const context = await browser.newContext({
  recordVideo: { dir: 'videos/', size: { width: 1280, height: 720 } }
});
const page = await context.newPage();
// ... interactions ...
await context.close();
```

## Scripts

Use the provided scripts in `scripts/` for common tasks:

- `scripts/screenshot.js <url> [output.png]` — Capture screenshot
- `scripts/scrape.js <url> <selector>` — Extract data by CSS selector
- `scripts/video-record.js <url> <duration>` — Record video of page

## Usage Examples

**Screenshot a website:**
```bash
node scripts/screenshot.js https://example.com myshot.png
```

**Scrape product listings:**
```bash
node scripts/scrape.js https://shop.com/products ".product-card"
```

**Record a 30-second video:**
```bash
node scripts/video-record.js https://example.com 30
```

## Notes

- Scripts save outputs to the workspace by default
- Respect robots.txt and terms of service
- Some sites may block automation; use delays and be respectful