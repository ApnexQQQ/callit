#!/usr/bin/env node

/**
 * TikTok Video Idea Generator
 * Generates video ideas based on niche and current trends
 */

// Parse arguments
const args = process.argv.slice(2);
let niche = 'general';
let count = 10;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--niche' && args[i + 1]) niche = args[i + 1].toLowerCase();
  if (args[i] === '--count' && args[i + 1]) count = parseInt(args[i + 1]);
}

// Idea templates by niche
const ideaTemplates = {
  fitness: [
    { title: 'The [number] exercises nobody told you about', effort: 'Low', reach: 'High' },
    { title: 'POV: You fixed your posture in [timeframe]', effort: 'Medium', reach: 'High' },
    { title: 'Stop doing [exercise] if you have [condition]', effort: 'Low', reach: 'Medium' },
    { title: 'What I eat in a day as a [profession]', effort: 'Low', reach: 'Medium' },
    { title: 'The [number] minute workout that actually works', effort: 'Medium', reach: 'High' },
    { title: 'Transformation: Day 1 vs Day [number]', effort: 'Medium', reach: 'High' },
    { title: 'Gym anxiety? Start with these [number] exercises', effort: 'Low', reach: 'High' },
    { title: 'This hack saved my [body part]', effort: 'Low', reach: 'Medium' },
    { title: 'The truth about [fitness trend]', effort: 'Low', reach: 'Medium' },
    { title: 'Home workout with [household item] only', effort: 'Low', reach: 'Medium' },
    { title: 'What [number] years of training taught me', effort: 'Medium', reach: 'Medium' },
    { title: 'The supplement that actually works', effort: 'Low', reach: 'Medium' },
    { title: 'Fix your [body part] pain with this stretch', effort: 'Low', reach: 'High' },
    { title: 'Beginner vs Advanced [exercise]', effort: 'Medium', reach: 'Medium' },
    { title: 'My honest review of [fitness product]', effort: 'Low', reach: 'Low' }
  ],
  cooking: [
    { title: 'If you have [ingredient], make this [time]-minute meal', effort: 'Low', reach: 'High' },
    { title: 'Restaurant-style [dish] at home', effort: 'Medium', reach: 'High' },
    { title: 'The [cooking method] hack that changed everything', effort: 'Low', reach: 'High' },
    { title: 'What I cook when I\'m lazy but want to eat healthy', effort: 'Low', reach: 'Medium' },
    { title: 'Meal prep for [timeframe] in [time]', effort: 'Medium', reach: 'High' },
    { title: 'Turn [cheap ingredient] into a gourmet meal', effort: 'Medium', reach: 'High' },
    { title: 'The mistake everyone makes with [dish]', effort: 'Low', reach: 'Medium' },
    { title: 'Copycat [restaurant] [dish] recipe', effort: 'Medium', reach: 'High' },
    { title: 'One pan [meal type] for busy weeknights', effort: 'Low', reach: 'Medium' },
    { title: 'Foods you\'re cooking wrong (and how to fix them)', effort: 'Medium', reach: 'High' },
    { title: 'The [number] ingredients I always have stocked', effort: 'Low', reach: 'Medium' },
    { title: 'Budget-friendly [cuisine] feast for [price]', effort: 'Medium', reach: 'High' },
    { title: 'Secret ingredient that makes [dish] better', effort: 'Low', reach: 'Medium' },
    { title: 'What professional chefs don\'t tell you about [technique]', effort: 'Low', reach: 'Medium' },
    { title: 'No-oven [meal type] for hot days', effort: 'Low', reach: 'Medium' }
  ],
  fashion: [
    { title: 'Outfits that make me feel like [aesthetic]', effort: 'Low', reach: 'Medium' },
    { title: 'Thrift flip: [item] transformation', effort: 'Medium', reach: 'High' },
    { title: 'The [clothing item] that goes with literally everything', effort: 'Low', reach: 'Medium' },
    { title: 'Dressing for [body type] without hiding your shape', effort: 'Low', reach: 'High' },
    { title: '[Number] ways to style one [item]', effort: 'Medium', reach: 'Medium' },
    { title: 'What to wear to [event] when you have nothing to wear', effort: 'Low', reach: 'High' },
    { title: 'Stop buying [item] and buy this instead', effort: 'Low', reach: 'Medium' },
    { title: 'Capsule wardrobe for [season]', effort: 'Medium', reach: 'Medium' },
    { title: 'The [trend] trend but make it wearable', effort: 'Low', reach: 'Medium' },
    { title: 'How to look expensive on a budget', effort: 'Low', reach: 'High' },
    { title: 'Clothing hacks that save me [time/money]', effort: 'Low', reach: 'Medium' },
    { title: 'Get ready with me: [occasion] edition', effort: 'Low', reach: 'Medium' },
    { title: 'The mistake making your outfits look cheap', effort: 'Low', reach: 'High' },
    { title: 'My most-worn items this [season]', effort: 'Low', reach: 'Low' },
    { title: 'Try-on haul: [store] finds under $[price]', effort: 'Medium', reach: 'Medium' }
  ],
  beauty: [
    { title: 'The [product] that actually lives up to the hype', effort: 'Low', reach: 'Medium' },
    { title: 'My [skincare/makeup] routine for [skin concern]', effort: 'Low', reach: 'Medium' },
    { title: 'Drugstore dupes for expensive [products]', effort: 'Medium', reach: 'High' },
    { title: 'The [number] products that changed my skin', effort: 'Low', reach: 'Medium' },
    { title: 'Makeup mistakes aging your face', effort: 'Low', reach: 'High' },
    { title: 'Get ready with me: [occasion] in [time]', effort: 'Low', reach: 'Medium' },
    { title: 'The truth about [beauty trend/treatment]', effort: 'Low', reach: 'Medium' },
    { title: 'How I fixed my [skin/hair concern]', effort: 'Medium', reach: 'High' },
    { title: 'Beginner-friendly [technique] tutorial', effort: 'Medium', reach: 'Medium' },
    { title: 'Products I\'d rebuy forever', effort: 'Low', reach: 'Low' },
    { title: 'The [number] step routine that actually works', effort: 'Low', reach: 'Medium' },
    { title: 'Affordable [category] that works better than luxury', effort: 'Low', reach: 'High' },
    { title: 'Before/after: [treatment/product] results', effort: 'Low', reach: 'High' },
    { title: 'What [profession] actually uses on their [feature]', effort: 'Low', reach: 'Medium' },
    { title: 'The ingredient you\'re using wrong', effort: 'Low', reach: 'Medium' }
  ],
  business: [
    { title: 'The mistake costing you [amount] per month', effort: 'Low', reach: 'High' },
    { title: 'How I went from [start] to [result] in [time]', effort: 'Medium', reach: 'High' },
    { title: 'Tools that run my business on autopilot', effort: 'Low', reach: 'Medium' },
    { title: 'What I wish I knew before starting [business type]', effort: 'Low', reach: 'Medium' },
    { title: 'The [number] books that changed my mindset', effort: 'Low', reach: 'Medium' },
    { title: 'Day in the life: [profession/business owner]', effort: 'Medium', reach: 'Medium' },
    { title: 'Stop doing this if you want to scale', effort: 'Low', reach: 'High' },
    { title: 'My exact process for [business task]', effort: 'Medium', reach: 'Medium' },
    { title: 'The truth about [business strategy]', effort: 'Low', reach: 'Medium' },
    { title: 'How to [business goal] without [common approach]', effort: 'Low', reach: 'High' },
    { title: 'Behind the scenes: [business process]', effort: 'Medium', reach: 'Medium' },
    { title: 'The [number] revenue streams I built', effort: 'Low', reach: 'Medium' },
    { title: 'Red flags when hiring [role]', effort: 'Low', reach: 'Medium' },
    { title: 'Free tools better than expensive alternatives', effort: 'Low', reach: 'High' },
    { title: 'The mindset shift that changed everything', effort: 'Low', reach: 'Medium' }
  ],
  general: [
    { title: 'Things I learned too late in life', effort: 'Low', reach: 'High' },
    { title: 'POV: You finally [achievement]', effort: 'Low', reach: 'Medium' },
    { title: 'The [number] habits that changed my life', effort: 'Low', reach: 'High' },
    { title: 'Unpopular opinion: [topic]', effort: 'Low', reach: 'Medium' },
    { title: 'Story time: [intriguing event]', effort: 'Medium', reach: 'High' },
    { title: 'Things nobody tells you about [topic]', effort: 'Low', reach: 'Medium' },
    { title: 'The mistake I\'ll never make again', effort: 'Low', reach: 'Medium' },
    { title: 'If you\'re [age], start doing this now', effort: 'Low', reach: 'High' },
    { title: 'The [number] minute routine that changed everything', effort: 'Low', reach: 'Medium' },
    { title: 'What I\'d do differently if I started over', effort: 'Low', reach: 'Medium' },
    { title: 'Signs you\'re [positive/negative trait]', effort: 'Low', reach: 'High' },
    { title: 'The [item] that went viral for a reason', effort: 'Low', reach: 'Medium' },
    { title: 'How to [goal] when you have no [resource]', effort: 'Low', reach: 'High' },
    { title: 'The conversation that changed my perspective', effort: 'Medium', reach: 'Medium' },
    { title: 'Stop [action] and start [action] instead', effort: 'Low', reach: 'Medium' }
  ]
};

function generateIdeas() {
  const templates = ideaTemplates[niche] || ideaTemplates.general;
  
  // Shuffle and select
  const shuffled = [...templates].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  
  console.log(`\n🎬 TikTok Video Ideas for "${niche}" niche\n`);
  console.log('=' .repeat(60));
  
  selected.forEach((idea, index) => {
    console.log(`\n${index + 1}. ${idea.title}`);
    console.log(`   Effort: ${idea.effort} | Reach Potential: ${idea.reach}`);
    console.log(`   Hook: Start with a bold statement or question`);
    console.log(`   CTA: Ask viewers to share their experience or save the video`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n💡 Tips for these ideas:`);
  console.log('   - Customize the brackets [ ] with your specific details');
  console.log('   - Use trending audio when possible');
  console.log('   - Post consistently for best results');
  console.log('   - Engage with comments in the first hour');
}

// Generate ideas
generateIdeas();