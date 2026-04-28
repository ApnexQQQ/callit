#!/usr/bin/env node

/**
 * Voice Transcription Script
 * Transcribes audio files using OpenAI Whisper API or local Whisper
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse arguments
const args = process.argv.slice(2);
let inputFile = '';
let language = 'en';
let outputFile = '';
let autoDetect = false;
let useLocal = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--input' && args[i + 1]) inputFile = args[i + 1];
  if (args[i] === '--language' && args[i + 1]) language = args[i + 1];
  if (args[i] === '--output' && args[i + 1]) outputFile = args[i + 1];
  if (args[i] === '--auto-detect') autoDetect = true;
  if (args[i] === '--local') useLocal = true;
}

// Language names for display
const languageNames = {
  en: 'English',
  ro: 'Romanian',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  pl: 'Polish',
  hu: 'Hungarian'
};

function checkOpenAIKey() {
  return process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
}

function checkLocalWhisper() {
  try {
    execSync('which whisper', { stdio: 'pipe' });
    return true;
  } catch {
    try {
      execSync('which faster-whisper', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }
}

function transcribeWithOpenAI(filePath, lang) {
  const apiKey = checkOpenAIKey();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not set. Set it with: export OPENAI_API_KEY="your-key"');
  }

  const formData = new (require('form-data'))();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('model', 'whisper-1');
  if (!autoDetect) {
    formData.append('language', lang);
  }

  const response = execSync(
    `curl -s https://api.openai.com/v1/audio/transcriptions \
     -H "Authorization: Bearer ${apiKey}" \
     -H "Content-Type: multipart/form-data" \
     -F file=@"${filePath}" \
     -F model="whisper-1" \
     ${autoDetect ? '' : `-F language="${lang}"`}`,
    { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
  );

  const result = JSON.parse(response);
  return result.text;
}

function transcribeWithLocalWhisper(filePath, lang) {
  const tempOutput = `/tmp/whisper-output-${Date.now()}`;
  
  try {
    // Try faster-whisper first
    execSync(
      `faster-whisper "${filePath}" --model small --language ${lang} --output_format txt --output_dir "${tempOutput}" 2>/dev/null || \
       whisper "${filePath}" --model small --language ${lang} --output_format txt --output_dir "${tempOutput}"`,
      { stdio: 'pipe', timeout: 300000 }
    );
    
    // Read the output file
    const outputFiles = fs.readdirSync(tempOutput);
    const txtFile = outputFiles.find(f => f.endsWith('.txt'));
    
    if (txtFile) {
      const text = fs.readFileSync(path.join(tempOutput, txtFile), 'utf-8');
      // Cleanup
      fs.rmSync(tempOutput, { recursive: true, force: true });
      return text.trim();
    }
    
    throw new Error('No output file generated');
  } catch (error) {
    // Cleanup on error
    try {
      fs.rmSync(tempOutput, { recursive: true, force: true });
    } catch {}
    throw error;
  }
}

function detectLanguage(filePath) {
  const apiKey = checkOpenAIKey();
  if (!apiKey) {
    console.log('⚠️  Cannot auto-detect: OPENAI_API_KEY not set');
    console.log('   Defaulting to English');
    return 'en';
  }

  try {
    const response = execSync(
      `curl -s https://api.openai.com/v1/audio/transcriptions \
       -H "Authorization: Bearer ${apiKey}" \
       -F file=@"${filePath}" \
       -F model="whisper-1"`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );

    const result = JSON.parse(response);
    return result.language || 'en';
  } catch (error) {
    console.log('⚠️  Language detection failed, defaulting to English');
    return 'en';
  }
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function main() {
  if (!inputFile) {
    console.log('Usage: node transcribe.js --input <audio-file> [--language <code>] [--output <file>] [--auto-detect] [--local]');
    console.log('');
    console.log('Options:');
    console.log('  --input       Path to audio file (required)');
    console.log('  --language    Language code: en, ro, es, fr, etc. (default: en)');
    console.log('  --output      Output file path (optional)');
    console.log('  --auto-detect Auto-detect language (requires API key)');
    console.log('  --local       Use local whisper instead of API');
    console.log('');
    console.log('Examples:');
    console.log('  node transcribe.js --input voice.ogg --language ro');
    console.log('  node transcribe.js --input message.ogg --auto-detect --output text.txt');
    process.exit(1);
  }

  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Error: File not found: ${inputFile}`);
    process.exit(1);
  }

  const stats = fs.statSync(inputFile);
  console.log(`🎤 Transcribing: ${path.basename(inputFile)}`);
  console.log(`   Size: ${(stats.size / 1024).toFixed(1)} KB`);
  
  // Auto-detect language if requested
  if (autoDetect) {
    console.log('🔍 Detecting language...');
    language = detectLanguage(inputFile);
    console.log(`   Detected: ${languageNames[language] || language}`);
  } else {
    console.log(`   Language: ${languageNames[language] || language}`);
  }

  // Determine transcription method
  const hasOpenAI = checkOpenAIKey();
  const hasLocal = checkLocalWhisper();

  if (useLocal && !hasLocal) {
    console.error('❌ Local whisper not found. Install with: pip install openai-whisper');
    process.exit(1);
  }

  if (!hasOpenAI && !hasLocal) {
    console.error('❌ No transcription method available.');
    console.error('   Option 1: Set OPENAI_API_KEY environment variable');
    console.error('   Option 2: Install local whisper: pip install openai-whisper');
    process.exit(1);
  }

  const useLocalMode = useLocal || (!hasOpenAI && hasLocal);
  
  console.log(`   Method: ${useLocalMode ? 'Local Whisper' : 'OpenAI API'}`);
  console.log('');

  try {
    const startTime = Date.now();
    
    const transcript = useLocalMode 
      ? transcribeWithLocalWhisper(inputFile, language)
      : transcribeWithOpenAI(inputFile, language);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('✅ Transcription complete!');
    console.log(`   Time: ${duration}s`);
    console.log('');
    console.log('📝 Transcript:');
    console.log('=' .repeat(60));
    console.log(transcript);
    console.log('=' .repeat(60));

    // Save to file if requested
    if (outputFile) {
      fs.writeFileSync(outputFile, transcript);
      console.log('');
      console.log(`💾 Saved to: ${outputFile}`);
    }

    return transcript;
  } catch (error) {
    console.error('❌ Transcription failed:');
    console.error(error.message);
    process.exit(1);
  }
}

main();