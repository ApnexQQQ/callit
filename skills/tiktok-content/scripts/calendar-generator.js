#!/usr/bin/env node

/**
 * TikTok Content Calendar Generator
 * Creates a structured content calendar for TikTok posting
 */

const fs = require('fs');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2);
let weeks = 4;
let niche = 'general';
let outputFile = 'tiktok-calendar.md';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--weeks' && args[i + 1]) weeks = parseInt(args[i + 1]);
  if (args[i] === '--niche' && args[i + 1]) niche = args[i + 1];
  if (args[i] === '--output' && args[i + 1]) outputFile = args[i + 1];
}

// Content types by niche
const contentTypes = {
  fitness: ['Workout demo', 'Transformation', 'Tips/Education', 'What I eat', 'Myth busting', 'Motivation'],
  cooking: ['Recipe tutorial', 'Quick meals', 'Food hacks', 'Behind the scenes', 'Ingredient spotlight', 'Meal prep'],
  fashion: ['Outfit of the day', 'Styling tips', 'Thrift flip', 'Trend try-on', 'Wardrobe essentials', 'Get ready with me'],
  beauty: ['Tutorial', 'Product review', 'Skincare routine', 'Transformation', 'Tips/Hacks', 'GRWM'],
  business: ['Tips/Education', 'Behind the scenes', 'Day in the life', 'Myth busting', 'Success stories', 'Tools recommendations'],
  general: ['Trending audio', 'Educational', 'Entertainment', 'Behind the scenes', 'Story time', 'Tips/Hacks']
};

// Best posting times (general recommendations)
const bestTimes = [
  'Tuesday 7:00 AM',
  'Tuesday 11:00 AM',
  'Wednesday 7:00 AM',
  'Wednesday 11:00 AM',
  'Thursday 9:00 AM',
  'Thursday 12:00 PM',
  'Friday 9:00 AM',
  'Friday 5:00 PM'
];

// Hook templates
const hooks = {
  fitness: [
    'POV: You finally found the workout that...',
    'Stop doing [exercise] if you want to...',
    'The [number] exercises that changed my...',
    'This is your sign to start...',
    'Nobody talks about this but...'
  ],
  cooking: [
    'If you have [ingredient], make this...',
    'The [dish] that broke the internet...',
    'Stop ordering [food] and make this instead...',
    'This [time]-minute meal will change your life...',
    'POV: You just learned the secret to...'
  ],
  fashion: [
    'Outfits that make me feel like...',
    'If you\'re going to [event], wear this...',
    'The [clothing item] that goes with everything...',
    'Stop wearing [item] like this...',
    'This [season] trend is actually...'
  ],
  beauty: [
    'The [product] that actually works...',
    'Stop doing your [routine] wrong...',
    'This hack changed my [feature] forever...',
    'If you have [skin type], try this...',
    'The [number] products worth the hype...'
  ],
  business: [
    'The mistake costing you [result]...',
    'Stop doing this if you want to [goal]...',
    'What I wish I knew before starting...',
    'The [number] tools that saved my business...',
    'This mindset shift changed everything...'
  ],
  general: [
    'POV: You just realized...',
    'The [thing] nobody talks about...',
    'Stop [action] if you want to [result]...',
    'This changed my life and it might change yours...',
    'If you\'re struggling with [problem], watch this...'
  ]
};

function generateCalendar() {
  const types = contentTypes[niche] || contentTypes.general;
  const nicheHooks = hooks[niche] || hooks.general;
  let calendar = `# TikTok Content Calendar\n`;
  calendar += `**Niche:** ${niche}\n`;
  calendar += `**Duration:** ${weeks} weeks\n`;
  calendar += `**Generated:** ${new Date().toLocaleDateString()}\n\n`;
  
  calendar += `## Content Strategy\n\n`;
  calendar += `### Content Mix\n`;
  calendar += `- 40% Educational/Value\n`;
  calendar += `- 30% Entertainment/Trends\n`;
  calendar += `- 20% Behind the Scenes/Personal\n`;
  calendar += `- 10% Promotional\n\n`;
  
  calendar += `### Best Posting Times\n`;
  bestTimes.forEach(time => {
    calendar += `- ${time}\n`;
  });
  calendar += `\n`;
  
  // Generate weeks
  for (let week = 1; week <= weeks; week++) {
    calendar += `## Week ${week}\n\n`;
    calendar += `| Day | Content Type | Hook Template | Caption Notes | Hashtag Focus |\n`;
    calendar += `|-----|-------------|---------------|---------------|---------------|\n`;
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    days.forEach((day, index) => {
      const contentType = types[index % types.length];
      const hook = nicheHooks[index % nicheHooks.length];
      calendar += `| ${day} | ${contentType} | ${hook} | Add CTA | Mix popular + niche |\n`;
    });
    
    calendar += `\n### Week ${week} Goals\n`;
    calendar += `- [ ] Post ${week === 1 ? '5-7' : '7'} videos\n`;
    calendar += `- [ ] Engage with 20 accounts in niche\n`;
    calendar += `- [ ] Respond to all comments within 2 hours\n`;
    calendar += `- [ ] Test ${week === 1 ? '2' : '1'} new content format\n\n`;
  }
  
  calendar += `## Monthly Review Template\n\n`;
  calendar += `### Performance Metrics\n`;
  calendar += `- [ ] Total views: ___\n`;
  calendar += `- [ ] New followers: ___\n`;
  calendar += `- [ ] Engagement rate: ___%\n`;
  calendar += `- [ ] Top performing video: ___\n`;
  calendar += `- [ ] Best posting time: ___\n\n`;
  
  calendar += `### Content Analysis\n`;
  calendar += `- What worked well?\n`;
  calendar += `- What underperformed?\n`;
  calendar += `- New trends to try?\n`;
  calendar += `- Audience feedback/themes?\n\n`;
  
  calendar += `### Next Month Adjustments\n`;
  calendar += `- Content mix changes:\n`;
  calendar += `- New formats to test:\n`;
  calendar += `- Posting time adjustments:\n`;
  
  return calendar;
}

// Generate and save calendar
const calendar = generateCalendar();
const outputPath = path.resolve(outputFile);
fs.writeFileSync(outputPath, calendar);

console.log(`✅ Content calendar created: ${outputPath}`);
console.log(`   Niche: ${niche}`);
console.log(`   Weeks: ${weeks}`);