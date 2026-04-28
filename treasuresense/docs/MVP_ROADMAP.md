# TreasureSense MVP Development Roadmap

## Phase 1: Foundation (Weeks 1-2)
**Goal:** Core infrastructure and authentication

### Week 1: Setup & Auth
- [ ] Initialize repositories (mobile, backend, ai-service)
- [ ] Set up CI/CD pipelines (GitHub Actions)
- [ ] Deploy staging environment (AWS/Docker)
- [ ] Implement authentication system
  - [ ] Register/Login endpoints
  - [ ] JWT token handling
  - [ ] Password reset flow
- [ ] Basic user profile

**Deliverable:** Working auth system, can register/login

### Week 2: Database & Core API
- [ ] Set up PostgreSQL + PostGIS
- [ ] Create database schema (users, zones, discoveries)
- [ ] Implement core API endpoints
  - [ ] User CRUD
  - [ ] Zone queries (PostGIS)
  - [ ] Basic discovery posting
- [ ] Image upload (S3 presigned URLs)
- [ ] Set up Redis for caching

**Deliverable:** Backend API with basic CRUD operations

---

## Phase 2: Map & Discovery (Weeks 3-4)
**Goal:** Core treasure hunting experience

### Week 3: Interactive Map
- [ ] Integrate Mapbox GL in React Native
- [ ] Display user location
- [ ] Fetch and render zones on map
- [ ] Zone detail modal (tap to view)
- [ ] Heat map visualization
- [ ] GPS tracking for zone visits

**Deliverable:** Working map with zones displayed

### Week 4: Discovery Flow
- [ ] Discovery creation UI
  - [ ] Camera integration
  - [ ] Photo upload flow
  - [ ] Location capture
  - [ ] Description form
- [ ] Discovery feed UI
- [ ] Discovery detail view
- [ ] Basic like functionality

**Deliverable:** Users can post and view discoveries

---

## Phase 3: AI Integration (Weeks 5-6)
**Goal:** Smart treasure insights

### Week 5: AI Service Setup
- [ ] Set up Python FastAPI service
- [ ] Historical data ingestion
  - [ ] Trade routes dataset
  - [ ] Archaeological sites
  - [ ] Previous discoveries
- [ ] Basic probability scoring algorithm
- [ ] Terrain analysis (satellite imagery)

**Deliverable:** AI service returning probability scores

### Week 6: AI Features Integration
- [ ] Connect AI service to backend
- [ ] Zone scoring pipeline
- [ ] AI explanation generation
- [ ] Smart recommendations
- [ ] Image verification (basic checks)

**Deliverable:** AI-powered zone insights in app

---

## Phase 4: Gamification (Weeks 7-8)
**Goal:** Engagement and retention

### Week 7: XP & Levels
- [ ] XP calculation system
- [ ] Level progression logic
  - [ ] Explorer (1-3)
  - [ ] Hunter (4-6)
  - [ ] Master (7-10)
- [ ] XP earning events
  - [ ] Zone visits
  - [ ] Discoveries
  - [ ] Likes received
- [ ] Level-up animations

**Deliverable:** Working XP/level system

### Week 8: Missions & Leaderboards
- [ ] Daily mission system
  - [ ] Mission generation
  - [ ] Progress tracking
  - [ ] Completion rewards
- [ ] Leaderboards
  - [ ] Global rankings
  - [ ] Weekly rankings
  - [ ] Friend rankings (v2)
- [ ] Achievement badges

**Deliverable:** Full gamification system

---

## Phase 5: Social Features (Weeks 9-10)
**Goal:** Community and viral growth

### Week 9: Social Feed
- [ ] Discovery feed improvements
  - [ ] Sorting (latest, trending)
  - [ ] Pull-to-refresh
  - [ ] Infinite scroll
- [ ] Comment system
- [ ] User profiles
  - [ ] Public profile view
  - [ ] Discovery history
  - [ ] Follow button (v2)

**Deliverable:** Social discovery feed

### Week 10: Proof of Discovery
- [ ] Digital certificate generation
- [ ] Certificate verification
- [ ] Share to social media
- [ ] Discovery verification workflow

**Deliverable:** Verified discoveries with certificates

---

## Phase 6: Events & Polish (Weeks 11-12)
**Goal:** Retention and monetization prep

### Week 11: Live Events
- [ ] Event creation system
- [ ] Hot zones (time-limited)
- [ ] Legendary zones (rare)
- [ ] Push notifications
- [ ] Event leaderboards

**Deliverable:** Live events system

### Week 12: Premium & Polish
- [ ] Freemium gating
  - [ ] Scan limits for free users
  - [ ] Premium upsells
- [ ] App polish
  - [ ] Animations
  - [ ] Error handling
  - [ ] Loading states
- [ ] Legal compliance
  - [ ] Terms of service
  - [ ] Privacy policy
  - [ ] Protected area warnings

**Deliverable:** MVP ready for beta launch

---

## Beta Launch Checklist

### Technical
- [ ] App store accounts (Apple/Google)
- [ ] App submissions prepared
- [ ] Analytics integrated (Amplitude/Mixpanel)
- [ ] Crash reporting (Sentry)
- [ ] Push notifications working
- [ ] Performance optimized

### Content
- [ ] Initial zone data populated
- [ ] Tutorial/onboarding flow
- [ ] Help center articles
- [ ] Sample discoveries

### Legal
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Cookie Policy
- [ ] GDPR compliance
- [ ] Archaeological warnings

### Marketing
- [ ] Landing page
- [ ] Social media accounts
- [ ] Beta signup list
- [ ] Press kit

---

## Post-MVP Roadmap

### Month 4-6: Growth
- Friend system and social graph
- Team/group challenges
- Advanced AI features
- iPad/tablet support
- Localization (ES, FR, DE)

### Month 7-12: Scale
- Premium subscriptions
- In-app purchases
- Partner integrations
- API for third-party apps
- Web version

---

## Team Structure (Recommended)

### MVP Team (4-5 people)
- **1 Tech Lead/Backend Engineer** (Node.js, PostgreSQL)
- **1 Mobile Engineer** (React Native)
- **1 AI/ML Engineer** (Python, data science)
- **1 Product Designer** (UI/UX)
- **1 Growth/Marketing** (part-time)

### Budget Estimate
- **Development:** $80K-120K (3 months)
- **Infrastructure:** $2K/month (staging + prod)
- **Marketing:** $20K (launch)
- **Total MVP:** ~$150K

---

## Success Metrics

### Launch Targets (Month 1)
- 1,000 downloads
- 30% D1 retention
- 100+ discoveries posted
- 4.0+ app store rating

### Growth Targets (Month 6)
- 50,000 downloads
- 20% D7 retention
- 10,000+ discoveries
- 5,000+ DAU
