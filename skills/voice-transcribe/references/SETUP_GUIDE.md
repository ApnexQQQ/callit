# Voice Transcription Setup Guide

## Installation Options

### Option 1: OpenAI Whisper API (Easiest)

**Requirements:**
- OpenAI API key
- Internet connection

**Setup:**
```bash
export OPENAI_API_KEY="sk-your-api-key-here"
```

Add to your `~/.bashrc` or `~/.zshrc` to make it permanent:
```bash
echo 'export OPENAI_API_KEY="sk-your-api-key-here"' >> ~/.bashrc
source ~/.bashrc
```

**Pros:**
- No local installation needed
- Best accuracy
- Fast processing
- Auto language detection

**Cons:**
- Requires API key
- Costs per minute of audio
- Requires internet

---

### Option 2: Local OpenAI Whisper (Free, Private)

**Requirements:**
- Python 3.7-3.11
- 4GB+ RAM
- ~2GB disk space for models

**Setup:**
```bash
# Install Python dependencies
pip install openai-whisper

# Or with conda
conda install -c conda-forge openai-whisper
```

**Verify installation:**
```bash
whisper --help
```

**Pros:**
- Completely free
- Works offline
- Private (no data leaves your computer)

**Cons:**
- Requires more RAM
- Slower than API
- Need to download models

---

### Option 3: Faster-Whisper (Recommended for Local)

**Requirements:**
- Python 3.8+
- CTranslate2 support

**Setup:**
```bash
pip install faster-whisper
```

**Pros:**
- 4x faster than standard Whisper
- Uses less memory
- Same accuracy

**Cons:**
- Slightly more complex setup
- Requires C++ compiler for some systems

---

## Language Support

### Fully Supported Languages

| Language | Code | Quality |
|----------|------|---------|
| English | en | Excellent |
| Romanian | ro | Excellent |
| Spanish | es | Excellent |
| French | fr | Excellent |
| German | de | Excellent |
| Italian | it | Excellent |
| Portuguese | pt | Very Good |
| Russian | ru | Very Good |
| Polish | pl | Very Good |
| Hungarian | hu | Good |

### Romanian Specific Notes

- Whisper handles Romanian very well
- Supports both standard Romanian and regional accents
- Works with common Romanian audio formats from WhatsApp
- Can handle mixed Romanian-English speech

---

## Troubleshooting

### "OPENAI_API_KEY not set" Error

**Solution:** Set your API key:
```bash
export OPENAI_API_KEY="sk-..."
```

### "whisper command not found" Error

**Solution:** Install local whisper:
```bash
pip install openai-whisper
```

### Out of Memory Errors

**Solutions:**
1. Use smaller model: Edit script to use `--model tiny` or `--model base`
2. Use API instead of local
3. Split long audio files

### Poor Transcription Quality

**Solutions:**
1. Use API instead of local (better accuracy)
2. Ensure audio is clear with minimal background noise
3. Specify correct language code
4. For Romanian, use `--language ro` explicitly

### Audio File Too Large

**Solutions:**
1. Compress audio before transcription
2. Split into smaller chunks
3. Use API (handles large files better)

---

## Model Sizes (Local Whisper)

| Model | Size | Speed | Accuracy | RAM Needed |
|-------|------|-------|----------|------------|
| tiny | 39 MB | ~32x | Basic | ~1 GB |
| base | 74 MB | ~16x | Good | ~1 GB |
| small | 244 MB | ~6x | Very Good | ~2 GB |
| medium | 769 MB | ~2x | Excellent | ~5 GB |
| large | 1550 MB | 1x | Best | ~10 GB |

Default used in scripts: `small` (good balance)

---

## WhatsApp Audio Specifics

WhatsApp voice messages use:
- **Format:** OGG/Opus
- **Sample rate:** 16kHz or 48kHz
- **Bitrate:** ~24kbps

These work perfectly with Whisper transcription.

---

## Cost Estimation (OpenAI API)

- **Whisper:** $0.006 per minute of audio
- Example: 10-minute voice message = $0.06
- Example: 1 hour of audio = $0.36

Local whisper is free after initial setup.