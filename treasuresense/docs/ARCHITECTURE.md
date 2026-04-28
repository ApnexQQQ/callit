# TreasureSense Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  React      │  │  Mapbox     │  │  React Native           │  │
│  │  Native     │  │  GL         │  │  Background Geolocation │  │
│  │  (Expo)     │  │  Maps       │  │  Push Notifications     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTPS/WSS
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY (AWS ALB)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌─────────────────┐    ┌───────────────┐
│  Node.js API  │    │  AI Service     │    │  WebSocket    │
│  (REST/GraphQL)│   │  (Python/FastAPI)│   │  Server       │
│               │    │                 │    │  (Events)     │
└───────┬───────┘    └────────┬────────┘    └───────┬───────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  PostgreSQL │  │  Redis      │  │  S3 / CloudFront        │  │
│  │  + PostGIS  │  │  (Cache/    │  │  (Images/CDN)           │  │
│  │             │  │  Sessions)  │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Service Architecture

### 1. Mobile App (React Native)

**Key Libraries:**
- `@rnmapbox/maps` - Map rendering
- `@mauron85/react-native-background-geolocation` - Location tracking
- `react-native-reanimated` - Smooth animations
- `react-native-mmkv` - Local storage
- `@tanstack/react-query` - Server state management
- `zustand` - Client state management

**Core Modules:**
```
src/
├── api/              # API clients
├── components/       # Reusable UI
├── screens/          # App screens
├── hooks/            # Custom hooks
├── stores/           # State management
├── services/         # Native services
├── utils/            # Helpers
└── types/            # TypeScript types
```

### 2. Backend API (Node.js)

**Architecture Pattern:** Clean Architecture / Hexagonal

```
src/
├── domain/           # Business logic
│   ├── entities/
│   ├── repositories/
│   └── services/
├── application/      # Use cases
│   ├── dto/
│   └── handlers/
├── infrastructure/   # External adapters
│   ├── database/
│   ├── cache/
│   └── external/
├── interfaces/       # API layer
│   ├── http/
│   └── ws/
└── config/
```

**Key Dependencies:**
- `express` + `helmet` + `cors` - HTTP server
- `prisma` - Database ORM
- `ioredis` - Redis client
- `bullmq` - Job queues
- `firebase-admin` - Push notifications
- `jsonwebtoken` - Authentication

### 3. AI Service (Python)

**Purpose:** Lightweight ML inference for treasure probability scoring

**Architecture:**
```
ai-service/
├── models/           # Trained models
├── features/         # Feature engineering
├── api/              # FastAPI endpoints
├── training/         # Model training scripts
└── data/             # Historical datasets
```

**Models:**
1. **Terrain Classifier** (CNN) - Classify terrain from satellite imagery
2. **Probability Scorer** (XGBoost) - Score location potential
3. **Historical Matcher** (Embeddings) - Match to historical patterns

### 4. Database Design

**PostgreSQL + PostGIS** for geospatial queries

**Key Tables:**
- `users` - User profiles & gamification stats
- `zones` - Geofenced treasure zones (PostGIS geometry)
- `discoveries` - User discovery posts
- `events` - Live treasure events
- `interactions` - Likes, comments, follows

**Redis Usage:**
- Session store
- Rate limiting
- Real-time leaderboards (sorted sets)
- Hot zone cache

## Data Flow

### Discovery Post Flow
```
1. User captures photo + GPS
2. Mobile app uploads to S3 (presigned URL)
3. POST /discoveries with metadata
4. API validates GPS + timestamp
5. AI service verifies image authenticity
6. Generate digital certificate (NFT-style hash)
7. Award XP, update leaderboards
8. Push to followers' feeds
```

### Heat Zone Generation
```
1. AI service analyzes historical data weekly
2. Generates probability scores per 100m² grid
3. Stores in PostgreSQL with PostGIS
4. API caches hot zones in Redis (1hr TTL)
5. Mobile app fetches visible zones on map pan
```

## Scalability Strategy

### Phase 1: MVP (1-10K users)
- Single EC2 instance (t3.medium)
- RDS PostgreSQL (db.t3.micro)
- ElastiCache Redis (cache.t3.micro)
- S3 for image storage

### Phase 2: Growth (10K-100K users)
- ECS Fargate for API (auto-scaling)
- RDS read replicas
- CloudFront CDN for images
- Lambda for AI inference

### Phase 3: Scale (100K+ users)
- Kubernetes (EKS)
- Aurora PostgreSQL
- Global accelerator
- Edge AI inference

## Security

### Authentication
- JWT access tokens (15min expiry)
- Refresh tokens (7 days)
- Device fingerprinting

### Data Protection
- GPS fuzzing (±10m for public posts)
- Image EXIF stripping
- Rate limiting per user/IP

### Compliance
- GDPR data export/deletion
- COPPA compliance (13+)
- Archaeological protection warnings

## Performance Targets

| Metric | Target |
|--------|--------|
| Map load | <2s |
| Zone query | <100ms |
| Discovery upload | <3s |
| AI score | <500ms |
| Push delivery | <5s |

## Monitoring

- **APM:** Datadog / New Relic
- **Logging:** CloudWatch + ELK
- **Error Tracking:** Sentry
- **Analytics:** Amplitude + Mixpanel
