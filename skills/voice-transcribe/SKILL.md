---
name: voice-transcribe
description: Transcribe voice messages and audio files to text. Use when the user sends voice messages or audio files that need to be converted to text. Supports English and Romanian languages. Works with WhatsApp voice messages, audio recordings, and common audio formats like OGG, MP3, WAV, and M4A.
---

# Voice Transcription

Transcribe voice messages and audio files to text using OpenAI Whisper or local alternatives.

## Supported Languages

- **English** (en) - Primary support
- **Romanian** (ro) - Full support

## Supported Audio Formats

- OGG/Opus (WhatsApp voice messages)
- MP3
- WAV
- M4A
- FLAC
- WebM

## Quick Start

### Transcribe a Voice Message

```bash
node scripts/transcribe.js --input /path/to/audio.ogg --language en
```

### Auto-detect Language

```bash
node scripts/transcribe.js --input /path/to/audio.ogg --auto-detect
```

### Batch Transcribe Multiple Files

```bash
node scripts/batch-transcribe.js --dir /path/to/audio/folder --language ro
```

## Prerequisites

Choose one transcription method:

### Option 1: OpenAI Whisper API (Recommended)
Requires OpenAI API key:
```bash
export OPENAI_API_KEY="your-api-key"
```

### Option 2: Local Whisper (No API needed)
Install whisper locally:
```bash
pip install openai-whisper
```

### Option 3: Faster-Whisper (Faster, less memory)
```bash
pip install faster-whisper
```

## Scripts

- `scripts/transcribe.js` - Transcribe single audio file
- `scripts/batch-transcribe.js` - Transcribe multiple files
- `scripts/detect-language.js` - Detect audio language

## Usage Examples

**Transcribe English voice message:**
```bash
node scripts/transcribe.js --input voice.ogg --language en
```

**Transcribe Romanian voice message:**
```bash
node scripts/transcribe.js --input voice.ogg --language ro
```

**Auto-detect and transcribe:**
```bash
node scripts/transcribe.js --input voice.ogg --auto-detect
```

**Save transcription to file:**
```bash
node scripts/transcribe.js --input voice.ogg --language en --output transcript.txt
```

## Language Codes

| Language | Code |
|----------|------|
| English | en |
| Romanian | ro |
| Spanish | es |
| French | fr |
| German | de |
| Italian | it |

## Notes

- For best results, use clear audio with minimal background noise
- Whisper works well with accented speech
- Long audio files are automatically chunked for processing
- Transcription quality depends on audio clarity