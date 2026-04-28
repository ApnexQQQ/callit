---
name: tiktok-content
description: TikTok content strategy, planning, and management. Use when the user needs help with creating TikTok content calendars, generating video ideas and concepts, writing captions and hashtags, planning posting schedules, researching trends and viral formats, analyzing content performance, or developing content strategies for growth.
---

# TikTok Content Management

Comprehensive toolkit for TikTok content strategy, planning, and optimization.

## Quick Start

### 1. Content Calendar Creation

Generate a weekly or monthly content calendar:

```bash
node scripts/calendar-generator.js --weeks 4 --niche "fitness" --output calendar.md
```

### 2. Video Idea Generation

Get video ideas based on trends and your niche:

```bash
node scripts/idea-generator.js --niche "cooking" --count 10
```

### 3. Caption & Hashtag Helper

Create optimized captions and hashtags:

```bash
node scripts/caption-helper.js --topic "morning routine" --tone "energetic"
```

## Capabilities

### Content Calendar
- Weekly/monthly planning
- Optimal posting times
- Content mix (educational, entertaining, trending)
- Seasonal and event-based planning

### Video Ideas
- Trend-based concepts
- Evergreen content ideas
- Series and recurring formats
- Hook variations

### Captions & Hashtags
- Engaging caption templates
- Niche-specific hashtag sets
- Call-to-action variations
- Character count optimization

### Trend Research
- Viral format analysis
- Audio trend tracking
- Challenge participation guides
- Trend adaptation strategies

### Analytics Tracking
- Performance metrics templates
- Growth tracking spreadsheets
- Content audit frameworks

## Scripts

- `scripts/calendar-generator.js` — Create content calendars
- `scripts/idea-generator.js` — Generate video ideas
- `scripts/caption-helper.js` — Write captions and hashtags
- `scripts/trend-tracker.js` — Track and analyze trends
- `scripts/analytics-template.js` — Create tracking templates

## References

- [TRENDS.md](references/TRENDS.md) — Current TikTok trends and formats
- [BEST_PRACTICES.md](references/BEST_PRACTICES.md) — Platform best practices
- [NICHE_GUIDES.md](references/NICHE_GUIDES.md) — Niche-specific strategies
- [HASHTAG_STRATEGY.md](references/HASHTAG_STRATEGY.md) — Hashtag research and usage

## Assets

- `assets/content-calendar-template.md` — Blank calendar template
- `assets/idea-bank/` — Categorized video idea collections
- `assets/caption-templates/` — Caption templates by category

## Usage Examples

**Create a 4-week fitness content calendar:**
```bash
node scripts/calendar-generator.js --weeks 4 --niche fitness --output fitness-calendar.md
```

**Generate 15 cooking video ideas:**
```bash
node scripts/idea-generator.js --niche cooking --count 15
```

**Get captions for a product showcase:**
```bash
node scripts/caption-helper.js --topic "product review" --tone "casual" --cta "shop link in bio"
```

## Notes

- All scripts output to workspace by default
- Calendars are in Markdown format for easy editing
- Ideas are categorized by effort level and potential reach
- Hashtag sets include mix of popular and niche tags