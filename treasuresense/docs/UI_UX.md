# TreasureSense UI/UX Design Specification

## Design Philosophy

### Premium, Minimal, Modern
- **Dark mode default** - Reduces eye strain outdoors, premium feel
- **High contrast** - Readable in sunlight
- **Generous spacing** - Clean, uncluttered
- **Micro-interactions** - Delightful feedback
- **Map-first** - Navigation centered around exploration

## Color Palette

### Primary Colors
```css
--color-gold: #FFD700;           /* XP, achievements, premium */
--color-gold-dark: #B8860B;      /* Hover states */
--color-accent: #00D4AA;         /* Success, actions */
--color-accent-dark: #00A884;    /* Active states */
```

### Background Colors
```css
--bg-primary: #0A0A0A;           /* Main background */
--bg-secondary: #141414;         /* Cards, sheets */
--bg-tertiary: #1E1E1E;          /* Elevated surfaces */
--bg-map: #0D1117;               /* Map background */
```

### Zone Heat Colors
```css
--heat-low: #3B82F6;             /* Blue: 0-30% */
--heat-medium: #22C55E;          /* Green: 30-50% */
--heat-high: #EAB308;            /* Yellow: 50-70% */
--heat-hot: #F97316;             /* Orange: 70-85% */
--heat-legendary: #EF4444;       /* Red: 85-100% */
```

### Text Colors
```css
--text-primary: #FFFFFF;
--text-secondary: rgba(255,255,255,0.7);
--text-tertiary: rgba(255,255,255,0.5);
--text-gold: #FFD700;
```

## Typography

### Font Stack
- **Primary:** SF Pro Display (iOS), Roboto (Android)
- **Monospace:** SF Mono (coordinates, hashes)

### Hierarchy
```
H1: 32px / Bold / -0.5px letter-spacing
H2: 24px / Bold / -0.3px letter-spacing
H3: 20px / Semibold / 0 letter-spacing
Body: 16px / Regular / 0 letter-spacing
Caption: 14px / Regular / 0 letter-spacing
Small: 12px / Medium / 0.3px letter-spacing
```

## Screen Specifications

### 1. Map Screen (Home)

**Layout:**
```
┌─────────────────────────────────────┐
│ [XP Bar]                    [Menu]  │  ← 60px safe area
├─────────────────────────────────────┤
│                                     │
│           MAPBOX GL                 │
│         (Full Screen)               │
│                                     │
│    [Zone Markers with pulses]       │
│                                     │
├─────────────────────────────────────┤
│ [Location Btn]                      │
│        [Scan Button - FAB]          │  ← 80px FAB
│ [Missions]  [Feed]  [Profile]       │  ← 60px tab bar
└─────────────────────────────────────┘
```

**Components:**
- **XP Bar:** Horizontal progress, gold accent, level badge
- **Zone Markers:** 
  - Circular with probability ring
  - Pulse animation for high-probability zones
  - Color-coded by score
- **Scan FAB:** Large centered button, camera icon
- **Location Button:** Top-right, recenter map

**Interactions:**
- Tap marker → Zone detail sheet slides up
- Long press map → "Analyze this location" option
- Pull up from bottom → Discovery feed

### 2. Zone Detail Sheet

**Layout:**
```
┌─────────────────────────────────────┐
│ ─────── (drag handle)               │
│                                     │
│ [Score Ring: 78%]                   │
│ Legendary Zone                      │
│ "Colonial trade route area"         │
│                                     │
│ ┌─────────┬─────────┬─────────┐     │
│ │Historical│ Terrain │Proximity│     │
│ │   85    │   70    │   80    │     │
│ └─────────┴─────────┴─────────┘     │
│                                     │
│ AI Insights:                        │
│ "High probability due to..."        │
│                                     │
│ Recommendations:                    │
│ • Search near tree lines            │
│ • Check south-facing slopes         │
│                                     │
│ [Navigate] [I've Been Here]         │
│                                     │
│ Recent Discoveries (3) →            │
└─────────────────────────────────────┘
```

**Score Ring:**
- SVG circular progress
- Animated fill on open
- Color matches heat level
- Glow effect for 80%+ scores

### 3. Discovery Creation Flow

**Step 1: Camera**
```
┌─────────────────────────────────────┐
│ ← Cancel              Post →        │
├─────────────────────────────────────┤
│                                     │
│         [Camera Preview]            │
│                                     │
│    [Grid overlay for composition]   │
│                                     │
├─────────────────────────────────────┤
│ [Gallery]  [○ Shutter ○]  [Flash]   │
└─────────────────────────────────────┘
```

**Step 2: Details**
```
┌─────────────────────────────────────┐
│ ← Back              Next →          │
├─────────────────────────────────────┤
│ [Captured Image Preview]            │
│                                     │
│ What did you find?                  │
│ [________________________]          │
│                                     │
│ Type: [Coin ▼]  Era: [1800s ▼]      │
│                                     │
│ Description:                        │
│ [                                ]  │
│ [                                ]  │
│                                     │
│ Location captured ✓                 │
│ Accuracy: ±8.5m                     │
└─────────────────────────────────────┘
```

**Step 3: Certificate Preview**
```
┌─────────────────────────────────────┐
│ ✓ Discovery Verified!               │
├─────────────────────────────────────┤
│                                     │
│    ┌─────────────────────────┐      │
│    │  TREASURESENSE          │      │
│    │  ─────────────────────  │      │
│    │  [Discovery Photo]      │      │
│    │                         │      │
│    │  Silver Coin            │      │
│    │  Discovered by @user    │      │
│    │  Jan 15, 2024           │      │
│    │  Cert: #A7B3C9          │      │
│    └─────────────────────────┘      │
│                                     │
│  +150 XP  Level 5 → 6               │
│                                     │
│ [Share] [View Feed] [Hunt More]     │
└─────────────────────────────────────┘
```

### 4. Discovery Feed

**Layout:**
```
┌─────────────────────────────────────┐
│ Discoveries    [Filter ▼] [Search]  │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [User Avatar] @username • Lvl 5 │ │
│ │                                 │ │
│ │     [Discovery Image]           │ │
│ │     [Multiple indicator]        │ │
│ │                                 │ │
│ │ Silver Coin - 1850s             │ │
│ │ "Found near the old mill..."    │ │
│ │                                 │ │
│ │ 📍 0.5km away  🏷️ Coin          │ │
│ │                                 │ │
│ │ ❤️ 47  💬 12  ↗️ Share          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Load more...]                      │
└─────────────────────────────────────┘
```

**Card States:**
- Default: Subtle shadow
- Liked: Heart filled gold
- Trending: "🔥 Trending" badge
- Featured: Gold border

### 5. Profile Screen

**Layout:**
```
┌─────────────────────────────────────┐
│ Settings                            │
├─────────────────────────────────────┤
│         [Avatar]                    │
│      @username                      │
│    Treasure Hunter Lvl 5            │
│                                     │
│ ┌──────┬────────┬────────┐          │
│ │  12  │  2.4K  │   5    │          │
│ │Finds │   XP   │ Streak │          │
│ └──────┴────────┴────────┘          │
│                                     │
│ [Progress to Level 6]               │
│ ████████████░░░░░░░░  65%           │
│                                     │
│ [Edit Profile] [Share Profile]      │
│                                     │
│ Discoveries | Badges | Stats        │
│ ─────────────────────────────────   │
│ [Grid of discoveries]               │
│                                     │
└─────────────────────────────────────┘
```

## Animations & Micro-interactions

### Zone Marker Pulse
```css
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}
/* Duration: 2s, infinite, ease-in-out */
/* Only for zones >70% probability */
```

### Score Ring Animation
```javascript
// Animate from 0 to score over 1s
// Easing: cubic-bezier(0.4, 0, 0.2, 1)
// Glow effect intensifies with score
```

### XP Gain Pop
```javascript
// +25 XP floats up from action
// Scale: 1 → 1.2 → 1
// TranslateY: 0 → -50px
// Fade out at end
// Duration: 1.5s
```

### Level Up Celebration
```
- Full screen gold particles
- Haptic feedback (heavy)
- "LEVEL UP!" text scales in
- New rank badge spins in
- Confetti animation
```

### Pull-to-Refresh
```
- Map icon rotates
- Gold accent color
- Spring physics on release
```

### Button Press States
```css
.button {
  transform: scale(1);
  transition: transform 0.1s ease;
}
.button:active {
  transform: scale(0.96);
}
```

## Iconography

### Icon Set
- **Tab Bar:** Map, Compass, Camera, User
- **Actions:** Scan, Navigate, Share, Like, Comment
- **Status:** Verified, Trending, Premium, Locked
- **Navigation:** Back, Close, More, Filter

### Icon Style
- Outlined style, 2px stroke
- 24px default size
- Consistent corner radius
- Gold fill for active states

## Responsive Considerations

### iPhone SE (Small)
- Compact tab bar (50px)
- Smaller FAB (64px)
- Reduced spacing

### iPhone Pro Max / Android XL
- Larger touch targets
- More content visible
- Enhanced animations

### iPad / Tablet
- Split view: Map left, Feed right
- Zone detail in sidebar
- Optimized for landscape

## Accessibility

### Requirements
- Minimum touch target: 44x44px
- Color contrast ratio: 4.5:1 minimum
- Support Dynamic Type
- VoiceOver labels for all interactive elements
- Reduce Motion support

### Dark/Light Mode
- System default: Dark
- Manual toggle in settings
- Automatic switching

## Component Library

### Buttons
```
Primary: Gold bg, black text, rounded-full
Secondary: Transparent, gold border, gold text
Tertiary: Transparent, white text
Destructive: Red bg, white text
FAB: Gold circle, 80px, shadow, icon centered
```

### Cards
```
Border radius: 16px
Background: bg-secondary
Shadow: 0 4px 20px rgba(0,0,0,0.3)
Padding: 16px
```

### Inputs
```
Background: bg-tertiary
Border: 1px solid rgba(255,255,255,0.1)
Border radius: 12px
Height: 48px
Focus: Gold border
```

### Modals/Sheets
```
Border radius (top): 24px
Background: bg-secondary
Handle: 40px x 4px, rounded, white 30%
Max height: 90% screen
Drag to dismiss
```

## Prototype Flows

### First-Time User
1. Splash → Logo animation
2. Onboarding slides (3 screens)
3. Sign up / Log in
4. Location permission
5. Notification permission
6. Tutorial overlay on map
7. "Find your first zone!" prompt

### Core Loop
1. Open app → Map with zones
2. Tap zone → View details
3. Visit zone → Get XP
4. Find item → Post discovery
5. Get likes/comments
6. Share certificate
7. Check missions
8. Repeat

## Design Tools

- **Figma:** Primary design tool
- **Principle:** Micro-interactions
- **Lottie:** Complex animations
- **SF Symbols / Material:** Icons

## Design System File

`treasuresense-design-system.fig`
- Color styles
- Text styles
- Component library
- Icon library
- Prototype flows
