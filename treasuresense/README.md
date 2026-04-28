# TreasureSense 🗺️✨

A global treasure discovery platform combining geolocation, AI-powered historical insights, and social interaction.

## Core Philosophy
- **FUN** → Gamified, addictive, shareable
- **SMART** → Data-driven, AI insights, realistic probabilities  
- **SOCIAL** → Community-driven discoveries and viral growth

## Quick Start

```bash
# Start all services
docker-compose up -d

# Run migrations
cd backend && npm run migrate

# Seed sample data
npm run seed

# Start mobile app
cd mobile && npx expo start
```

## Project Structure
```
treasuresense/
├── mobile/          # React Native app
├── backend/         # Node.js API
├── ai-service/      # Python AI microservices
├── database/        # Schema & migrations
└── docs/           # Architecture & specs
```

## Tech Stack
- **Frontend:** React Native + Expo + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + PostGIS
- **Maps:** Mapbox GL
- **AI:** Python + FastAPI + scikit-learn
- **Infrastructure:** Docker + AWS

## Documentation
- [Architecture](./docs/ARCHITECTURE.md)
- [API Specification](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [MVP Roadmap](./docs/MVP_ROADMAP.md)
- [Growth Strategy](./docs/GROWTH.md)
