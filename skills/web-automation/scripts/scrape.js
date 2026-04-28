#!/usr/bin/env node
/**
 * Web scraping script using Playwright
 * Usage: node scrape.js <url> <selector> [--attribute=name] [--text]
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function scrapePage(url, selector, options = {}) {
  console.log(`Scraping ${url} for selector: ${selector}`);
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    
    // Wait for the selector to appear
    await page.waitForSelector(selector, { timeout: 10000 });
    
    const data = await page.evaluate((sel, opts) => {
      const elements = Array.from(document.querySelectorAll(sel));
      return elements.map(el => {
        if (opts.attribute) {
          return el.getAttribute(opts.attribute);
        } else if (opts.text) {
          return el.textContent.trim();
        } else {
          return {
            text: el.textContent.trim(),
            href: el.href || null,
            src: el.src || null
          };
        }
      });
    }, selector, options);
    
    const output = {
      url,
      selector,
      count: data.length,
      data
    };
    
    const outputFile = 'scraped-data.json';
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
    
    console.log(`Found ${data.length} elements`);
    console.log(`Data saved to: ${outputFile}`);
    console.log('\nSample (first 3 items):');
    console.log(JSON.stringify(data.slice(0, 3), null, 2));
    
    return data;
  } catch (error) {
    console.error('Error scraping page:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Parse arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node scrape.js <url> <selector> [options]');
  console.log('Options:');
  console.log('  --attribute=name  Extract specific attribute');
  console.log('  --text            Extract text content only');
  console.log('Example: node scrape.js https://example.com ".product"');
  process.exit(1);
}

const url = args[0];
const selector = args[1];
const options = {
  attribute: args.find(a => a.startsWith('--attribute='))?.split('=')[1],
  text: args.includes('--text')
};

scrapePage(url, selector, options);
