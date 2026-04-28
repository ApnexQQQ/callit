#!/usr/bin/env node

/**
 * TikTok Caption & Hashtag Helper
 * Generates optimized captions and hashtag sets
 */

// Parse arguments
const args = process.argv.slice(2);
let topic = 'general';
let tone = 'casual';
let cta = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--topic' && args[i + 1]) topic = args[i + 1].toLowerCase();
  if (args[i] === '--tone' && args[i + 1]) tone = args[i + 1].toLowerCase();
  if (args[i] === '--cta' && args[i + 1]) cta = args[i + 1];
}

// Caption templates by tone
const captionTemplates = {
  casual: [
    'POV: {outcome} 😅',
    'No one asked but here it is anyway ✨',
    'The {topic} you didn\'t know you needed',
    'Just leaving this here 👀',
    'This changed everything for me ngl',
    'Tell me I\'m not the only one who {action}',
    'The way I {reaction} when this happened',
    'Save this for later trust me 📌',
    'Wait for it... {outcome}',
    'This is your sign to {action}'
  ],
  energetic: [
    'Let\'s GOOOO! 🔥 {outcome}',
    'This is INSANE! {reaction} ⚡',
    'You NEED to try this! {topic} 💯',
    'GAME CHANGER! {outcome} 🚀',
    'This blew my mind! {reaction} 🤯',
    'STOP scrolling and {action}! ⚡',
    'The energy when {outcome} is unmatched! 🔥',
    'We\'re not gatekeeping this anymore! {topic} 💪',
    'This is the {topic} that broke the internet! 🌟',
    'RUN don\'t walk to {action}! 🏃‍♀️💨'
  ],
  educational: [
    'Save this {topic} guide! 📚',
    'The {topic} tips I wish I knew sooner',
    'This is how you actually {action}',
    'Stop making this {topic} mistake',
    'The science behind {topic} explained simply',
    'Everything you need to know about {topic}',
    'The {number} {topic} rules everyone should follow',
    'Let me explain why {outcome} happens',
    'This is the proper way to {action}',
    '{topic} 101: The basics that actually matter'
  ],
  inspirational: [
    'Your reminder that {outcome} ✨',
    'Never give up on {topic} 💫',
    'This is your sign to {action}',
    'Believe in yourself and {outcome}',
    'The journey to {outcome} is worth it',
    'You\'re closer than you think to {outcome}',
    'Small steps toward {topic} every day 🌱',
    'Your future self will thank you for {action}',
    'This is proof that {outcome} is possible',
    'Keep going, {outcome} is coming ✨'
  ],
  funny: [
    'Me pretending I have my life together while {action} 😂',
    'POV: You {outcome} and immediately regret it',
    'The accuracy is sending me 💀',
    'Not me {action} at 3am again',
    'This is too real I\'m crying 😭',
    'When you {outcome} but make it fashion',
    'My toxic trait is {action}',
    'Tell me you\'re {topic} without telling me',
    'The way I cackled at this 💀',
    'Why is this so accurate? 😂'
  ]
};

// Hashtag sets by topic/category
const hashtagSets = {
  general: {
    viral: ['#fyp', '#foryou', '#foryoupage', '#viral', '#trending'],
    engagement: ['#explore', '#discover', '#mustwatch', '#viralvideo', '#trend'],
    community: ['#tiktok', '#community', '#contentcreator', '#creator', '#tiktokgrowth']
  },
  fitness: {
    popular: ['#fitness', '#workout', '#gym', '#fitnessmotivation', '#health'],
    niche: ['#homeworkout', '#fitnesstips', '#gymtok', '#fitnessjourney', '#workoutroutine'],
    trending: ['#gymmotivation', '#fitnessaddict', '#workoutmotivation', '#fitlife', '#exercise']
  },
  cooking: {
    popular: ['#food', '#cooking', '#recipe', '#foodie', '#foodtok'],
    niche: ['#easyrecipe', '#homecooking', '#cookwithme', '#recipeideas', '#foodhacks'],
    trending: ['#foodlover', '#delicious', '#yummy', '#cookinghacks', '#mealprep']
  },
  fashion: {
    popular: ['#fashion', '#outfit', '#style', '#fashiontok', '#ootd'],
    niche: ['#outfitinspo', '#fashionhacks', '#styletips', '#thriftflip', '#capsulewardrobe'],
    trending: ['#fashionista', '#streetstyle', '#aesthetic', '#grwm', '#fashioninspo']
  },
  beauty: {
    popular: ['#beauty', '#makeup', '#skincare', '#beautytips', '#makeuptutorial'],
    niche: ['#skincareroutine', '#makeuphacks', '#glowup', '#beautyhacks', '#skincaretips'],
    trending: ['#makeuptransformation', '#beautytok', '#glowuptiktok', '#skincareaddict', '#makeuplover']
  },
  business: {
    popular: ['#business', '#entrepreneur', '#success', '#motivation', '#money'],
    niche: ['#entrepreneurlife', '#businesstips', '#sidehustle', '#smallbusiness', '#startup'],
    trending: ['#financialfreedom', '#wealth', '#businessowner', '#hustle', '#grind']
  },
  lifestyle: {
    popular: ['#lifestyle', '#dailyvlog', '#dayinmylife', '#routine', '#productive'],
    niche: ['#morningroutine', '#selfcare', '#productivevibes', '#dayinthelife', '#lifestylevlog'],
    trending: ['#thatgirl', '#selfimprovement', '#mindset', '#vlog', '#routinecheck']
  },
  workout: {
    popular: ['#fitness', '#workout', '#gym', '#fitnessmotivation', '#health'],
    niche: ['#homeworkout', '#fitnesstips', '#gymtok', '#fitnessjourney', '#workoutroutine'],
    trending: ['#gymmotivation', '#fitnessaddict', '#workoutmotivation', '#fitlife', '#exercise']
  }
};

// CTA templates
const ctaTemplates = [
  'Double tap if you agree! ❤️',
  'Save this for later! 📌',
  'Share with someone who needs this! 👥',
  'Comment your thoughts below! 💬',
  'Follow for more {topic} tips! ✨',
  'Which one is your favorite? Tell me! 👇',
  'Tag someone who needs to see this! 🏷️',
  'Link in bio for more! 🔗',
  'Drop a 🔥 if this helped you!',
  'What should I make next? Let me know! 💭'
];

function generateCaptions() {
  const templates = captionTemplates[tone] || captionTemplates.casual;
  
  // Get hashtags for topic, fallback to general
  let hashtags = hashtagSets[topic];
  if (!hashtags) {
    hashtags = hashtagSets.general;
  }
  
  // Ensure hashtag structure exists with fallbacks
  const safeHashtags = {
    popular: hashtags.popular || hashtagSets.general.popular,
    niche: hashtags.niche || hashtags.community || hashtagSets.general.community,
    trending: hashtags.trending || hashtags.viral || hashtagSets.general.viral
  };
  
  console.log(`\n📝 Caption Options for: "${topic}" (${tone} tone)\n`);
  console.log('=' .repeat(70));
  
  // Generate 5 caption variations
  console.log('\n📌 CAPTION OPTIONS:\n');
  for (let i = 0; i < 5; i++) {
    const template = templates[i % templates.length];
    let caption = template
      .replace(/{topic}/g, topic)
      .replace(/{action}/g, 'doing this')
      .replace(/{outcome}/g, 'this happened')
      .replace(/{reaction}/g, 'freaked out')
      .replace(/{number}/g, '5');
    
    console.log(`${i + 1}. ${caption}`);
  }
  
  // Hashtag strategy
  console.log('\n' + '='.repeat(70));
  console.log('\n#️⃣ HASHTAG STRATEGY:\n');
  
  console.log('Set 1 - Mix (3 popular + 3 niche + 2 trending):');
  const set1 = [
    ...safeHashtags.popular.slice(0, 3),
    ...safeHashtags.niche.slice(0, 3),
    ...(safeHashtags.trending || []).slice(0, 2)
  ];
  console.log(set1.join(' '));
  
  console.log('\nSet 2 - Niche Focus (2 popular + 5 niche + 1 trending):');
  const set2 = [
    ...safeHashtags.popular.slice(0, 2),
    ...safeHashtags.niche.slice(0, 5),
    ...(safeHashtags.trending || []).slice(0, 1)
  ];
  console.log(set2.join(' '));
  
  console.log('\nSet 3 - Viral Push (5 viral + 3 niche):');
  const viral = hashtagSets.general.viral;
  const set3 = [
    ...viral.slice(0, 5),
    ...safeHashtags.niche.slice(0, 3)
  ];
  console.log(set3.join(' '));
  
  // CTA options
  console.log('\n' + '='.repeat(70));
  console.log('\n📢 CALL-TO-ACTION OPTIONS:\n');
  ctaTemplates.forEach((template, index) => {
    console.log(`${index + 1}. ${template.replace(/{topic}/g, topic)}`);
  });
  
  // Custom CTA if provided
  if (cta) {
    console.log(`\n🎯 Your Custom CTA:`);
    console.log(cta);
  }
  
  // Best practices
  console.log('\n' + '='.repeat(70));
  console.log('\n💡 BEST PRACTICES:\n');
  console.log('   • Keep captions under 150 characters for full display');
  console.log('   • Use 3-5 hashtags (quality over quantity)');
  console.log('   • Mix popular and niche hashtags');
  console.log('   • Place hashtags in caption OR first comment');
  console.log('   • Include a clear CTA to drive engagement');
  console.log('   • Use emojis to break up text and add personality');
}

// Generate captions
generateCaptions();