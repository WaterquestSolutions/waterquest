#!/usr/bin/env node
/**
 * Inject Vercel Web Analytics into all HTML files.
 * This script adds the analytics script tag before the closing </head> tag.
 */
import { readFile, writeFile, readdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public');

/**
 * Recursively find all HTML files in a directory
 */
async function findHtmlFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// The analytics script to inject before </head>
// For static sites, use the inline script approach from Vercel docs
const ANALYTICS_SCRIPT = `<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>`;

// Marker comment to track if analytics has already been injected
const ANALYTICS_MARKER = '<!-- Vercel Web Analytics -->';

async function injectAnalytics() {
  // Find all HTML files in public directory
  const htmlFiles = await findHtmlFiles(PUBLIC);
  
  let processedCount = 0;
  let skippedCount = 0;
  
  for (const filePath of htmlFiles) {
    try {
      let content = await readFile(filePath, 'utf-8');
      
      // Skip if analytics already injected
      if (content.includes(ANALYTICS_MARKER)) {
        skippedCount++;
        continue;
      }
      
      // Find the closing </head> tag and inject the script before it
      if (content.includes('</head>')) {
        const analyticsBlock = `${ANALYTICS_MARKER}\n${ANALYTICS_SCRIPT}\n</head>`;
        content = content.replace('</head>', analyticsBlock);
        
        await writeFile(filePath, content, 'utf-8');
        processedCount++;
      } else {
        console.warn(`Warning: No </head> tag found in ${filePath}`);
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }
  
  console.log(`Vercel Analytics injection complete:`);
  console.log(`  - Processed: ${processedCount} files`);
  console.log(`  - Skipped: ${skippedCount} files (already had analytics)`);
  console.log(`  - Total HTML files: ${htmlFiles.length}`);
}

injectAnalytics().catch(console.error);
