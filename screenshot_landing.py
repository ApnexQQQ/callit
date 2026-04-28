#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
import os

# Path to the HTML file
html_path = "/root/.openclaw/workspace/ghosttrace-landing/index.html"
output_path = "/root/.openclaw/workspace/ghosttrace-landing/preview.png"

# Convert to file URL
file_url = f"file://{html_path}"

print(f"Taking screenshot of {file_url}...")

with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(viewport={"width": 1920, "height": 1080})
    page = context.new_page()
    
    page.goto(file_url, wait_until="networkidle")
    page.wait_for_timeout(2000)  # Wait for animations
    
    page.screenshot(path=output_path, full_page=True)
    print(f"Screenshot saved to: {output_path}")
    
    browser.close()
