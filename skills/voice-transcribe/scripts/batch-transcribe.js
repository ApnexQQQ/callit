#!/usr/bin/env node

/**
 * Batch Voice Transcription
 * Transcribe multiple audio files in a directory
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse arguments
const args = process.argv.slice(2);
let inputDir = '';
let language = 'en';
let outputDir = '';
let pattern = '*';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dir' && args[i + 1]) inputDir = args[i + 1];
  if (args[i] === '--language' && args[i + 1]) language = args[i + 1];
  if (args[i] === '--output' && args[i + 1]) outputDir = args[i + 1];
  if (args[i] === '--pattern' && args[i + 1]) pattern = args[i + 1];
}

const supportedExtensions = ['.ogg', '.mp3', '.wav', '.m4a', '.flac', '.webm'];

function findAudioFiles(dir) {
  const files = fs.readdirSync(dir);
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return supportedExtensions.includes(ext);
  });
}

function main() {
  if (!inputDir) {
    console.log('Usage: node batch-transcribe.js --dir <directory> [--language <code>] [--output <dir>]');
    console.log('');
    console.log('Options:');
    console.log('  --dir         Directory containing audio files (required)');
    console.log('  --language    Language code: en, ro, etc. (default: en)');
    console.log('  --output      Output directory for transcripts (default: same as input)');
    console.log('');
    console.log('Example:');
    console.log('  node batch-transcribe.js --dir ./voice-messages --language ro --output ./transcripts');
    process.exit(1);
  }

  if (!fs.existsSync(inputDir)) {
    console.error(`❌ Error: Directory not found: ${inputDir}`);
    process.exit(1);
  }

  const audioFiles = findAudioFiles(inputDir);
  
  if (audioFiles.length === 0) {
    console.error(`❌ No audio files found in: ${inputDir}`);
    console.error(`   Supported formats: ${supportedExtensions.join(', ')}`);
    process.exit(1);
  }

  const outDir = outputDir || inputDir;
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`🎤 Batch Transcription`);
  console.log(`   Directory: ${inputDir}`);
  console.log(`   Files found: ${audioFiles.length}`);
  console.log(`   Language: ${language}`);
  console.log(`   Output: ${outDir}`);
  console.log('');

  const results = [];
  
  for (let i = 0; i < audioFiles.length; i++) {
    const file = audioFiles[i];
    const inputPath = path.join(inputDir, file);
    const outputFile = path.basename(file, path.extname(file)) + '.txt';
    const outputPath = path.join(outDir, outputFile);

    console.log(`[${i + 1}/${audioFiles.length}] Transcribing: ${file}`);
    
    try {
      const transcript = execSync(
        `node "${__dirname}/transcribe.js" --input "${inputPath}" --language ${language} 2>/dev/null | grep -A 100 "📝 Transcript:" | tail -n +2 | head -n -1`,
        { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
      );
      
      fs.writeFileSync(outputPath, transcript.trim());
      results.push({ file, status: '✅', output: outputFile });
      console.log(`   ✅ Saved: ${outputFile}`);
    } catch (error) {
      results.push({ file, status: '❌', error: error.message });
      console.log(`   ❌ Failed`);
    }
    
    console.log('');
  }

  // Summary
  console.log('=' .repeat(60));
  console.log('📊 Summary:');
  console.log(`   Total: ${results.length}`);
  console.log(`   Success: ${results.filter(r => r.status === '✅').length}`);
  console.log(`   Failed: ${results.filter(r => r.status === '❌').length}`);
  console.log('=' .repeat(60));
}

main();