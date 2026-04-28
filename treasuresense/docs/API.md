# TreasureSense API Specification

## Base URL
```
Production: https://api.treasuresense.app/v1
Staging: https://api-staging.treasuresense.app/v1
```

## Authentication
All endpoints require Bearer token except `/auth/*`
```
Authorization: Bearer <jwt_token>
```

## Response Format
```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

## Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [{"field": "email", "message": "Required"}]
  }
}
```

---

## Authentication Endpoints

### POST /auth/register
Register new user
```json
// Request
{
  "email": "user@example.com",
  "username": "treasurehunter",
  "password": "securePass123!"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "treasurehunter",
      "level": 1,
      "xp": 0
    },
    "tokens": {
      "accessToken": "eyJhbG...",
      "refreshToken": "eyJhbG..."
    }
  }
}
```

### POST /auth/login
```json
// Request
{
  "email": "user@example.com",
  "password": "securePass123!"
}

// Response - same as register
```

### POST /auth/refresh
Refresh access token
```json
// Request
{
  "refreshToken": "eyJhbG..."
}

// Response
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

---

## User Endpoints

### GET /users/me
Get current user profile
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "treasurehunter",
    "displayName": "Treasure Hunter",
    "avatarUrl": "https://cdn...",
    "level": 5,
    "xp": 2450,
    "nextLevelXp": 3000,
    "rank": "HUNTER",
    "stats": {
      "discoveriesCount": 12,
      "totalXpEarned": 3450,
      "streakDays": 5,
      "zonesVisited": 47
    },
    "subscription": {
      "tier": "FREE",
      "expiresAt": null
    }
  }
}
```

### GET /users/:id/profile
Get public profile
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "treasurehunter",
    "displayName": "Treasure Hunter",
    "avatarUrl": "https://cdn...",
    "level": 5,
    "rank": "HUNTER",
    "discoveriesCount": 12,
    "followersCount": 89,
    "followingCount": 34
  }
}
```

### PATCH /users/me
Update profile
```json
// Request
{
  "displayName": "New Name",
  "avatarUrl": "https://cdn..."
}
```

---

## Map & Zones Endpoints

### GET /zones/nearby
Get zones near location
```
GET /zones/nearby?lat=40.7128&lng=-74.0060&radius=5000&minScore=30
```

```json
{
  "success": true,
  "data": {
    "zones": [
      {
        "id": "uuid",
        "center": {"lat": 40.7128, "lng": -74.0060},
        "radius": 100,
        "probabilityScore": 78.5,
        "scoreFactors": {
          "historical": 85,
          "terrain": 70,
          "proximity": 80
        },
        "zoneType": "HOT",
        "terrainType": "forest",
        "historicalContext": "This area was near a colonial trade route. Coins and small artifacts often found near old paths.",
        "distance": 450
      }
    ]
  }
}
```

### GET /zones/:id
Get zone details
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "boundary": {...},
    "probabilityScore": 78.5,
    "historicalContext": "...",
    "nearbyDiscoveries": 5,
    "aiInsights": {
      "terrainAnalysis": "Sandy soil, good drainage",
      "historicalData": "18th century settlement nearby",
      "recommendations": ["Search near tree lines", "Check south-facing slopes"]
    }
  }
}
```

### POST /zones/:id/visit
Record zone visit (for XP)
```json
{
  "success": true,
  "data": {
    "xpEarned": 25,
    "newStreak": 6,
    "message": "Zone visited! +25 XP"
  }
}
```

---

## Discovery Endpoints

### GET /discoveries/feed
Get discovery feed
```
GET /discoveries/feed?page=1&limit=20&sort=latest
// sort: latest, trending, nearby
```

```json
{
  "success": true,
  "data": {
    "discoveries": [
      {
        "id": "uuid",
        "title": "Silver Coin from 1850s",
        "description": "Found near the old mill...",
        "findType": "coin",
        "estimatedEra": "19th century",
        "primaryImageUrl": "https://cdn...",
        "publicLocation": {"lat": 40.71, "lng": -74.01},
        "locationAccuracy": 10.5,
        "user": {
          "id": "uuid",
          "username": "coinhunter",
          "avatarUrl": "...",
          "level": 8
        },
        "likesCount": 47,
        "commentsCount": 12,
        "userLiked": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "certificateUrl": "https://..."
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156
  }
}
```

### POST /discoveries
Create new discovery
```json
// Request
{
  "title": "Silver Coin from 1850s",
  "description": "Found near the old mill while hiking",
  "findType": "coin",
  "estimatedEra": "19th century",
  "exactLocation": {"lat": 40.7128, "lng": -74.0060},
  "locationAccuracy": 8.5,
  "images": ["uuid-of-uploaded-image"]
}

// Response
{
  "success": true,
  "data": {
    "discovery": {
      "id": "uuid",
      "status": "PENDING",
      "certificateHash": "a1b2c3...",
      "xpEarned": 150
    }
  }
}
```

### GET /discoveries/:id
Get discovery details
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "...",
    "images": [...],
    "user": {...},
    "comments": [...],
    "certificate": {
      "hash": "a1b2c3...",
      "verifiedAt": "2024-01-15T12:00:00Z",
      "url": "https://..."
    }
  }
}
```

### POST /discoveries/:id/like
Like/unlike discovery
```json
// Response
{
  "success": true,
  "data": {
    "liked": true,
    "likesCount": 48
  }
}
```

### POST /discoveries/:id/comment
Add comment
```json
// Request
{
  "content": "Amazing find! What detector do you use?"
}

// Response
{
  "success": true,
  "data": {
    "comment": {
      "id": "uuid",
      "content": "...",
      "user": {...},
      "createdAt": "2024-01-15T14:30:00Z"
    }
  }
}
```

---

## Upload Endpoints

### POST /uploads/presigned-url
Get presigned URL for image upload
```json
// Request
{
  "filename": "discovery_001.jpg",
  "contentType": "image/jpeg"
}

// Response
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3...",
    "publicUrl": "https://cdn...",
    "imageId": "uuid",
    "expiresIn": 300
  }
}
```

---

## Gamification Endpoints

### GET /missions
Get active missions
```json
{
  "success": true,
  "data": {
    "missions": [
      {
        "id": "uuid",
        "title": "Explorer's Path",
        "description": "Visit 3 new zones today",
        "missionType": "DAILY",
        "requirement": {"type": "VISIT_ZONES", "count": 3},
        "xpReward": 100,
        "progress": 1,
        "isCompleted": false,
        "expiresAt": "2024-01-16T00:00:00Z"
      }
    ]
  }
}
```

### GET /leaderboards
Get leaderboards
```
GET /leaderboards?type=GLOBAL|LOCAL&period=WEEKLY
```

```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user": {
          "id": "uuid",
          "username": "top_hunter",
          "avatarUrl": "...",
          "level": 15
        },
        "score": 12500
      }
    ],
    "userRank": 47
  }
}
```

---

## Events Endpoints

### GET /events/active
Get active events
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "name": "Legendary Zone: Old Gold Mine",
        "description": "A legendary zone has appeared!",
        "eventType": "LEGENDARY",
        "startsAt": "2024-01-15T00:00:00Z",
        "endsAt": "2024-01-22T00:00:00Z",
        "centerLocation": {"lat": 40.7, "lng": -74.0},
        "radiusKm": 5,
        "xpMultiplier": 2.0,
        "participantsCount": 342
      }
    ]
  }
}
```

### POST /events/:id/join
Join event
```json
{
  "success": true,
  "data": {
    "joined": true,
    "bonusXp": 50
  }
}
```

---

## AI Endpoints

### POST /ai/analyze-location
Analyze location for treasure probability
```json
// Request
{
  "lat": 40.7128,
  "lng": -74.0060
}

// Response
{
  "success": true,
  "data": {
    "probabilityScore": 78.5,
    "confidence": 0.85,
    "factors": {
      "historical": 85,
      "terrain": 70,
      "proximity": 80
    },
    "explanation": "High probability area due to proximity to 18th century trade route",
    "recommendations": [
      "Search near old tree lines",
      "Check south-facing slopes",
      "Look for disturbed soil patterns"
    ],
    "nearbyDiscoveries": 5
  }
}
```

### POST /ai/verify-image
Verify discovery image authenticity
```json
// Request
{
  "imageUrl": "https://cdn..."
}

// Response
{
  "success": true,
  "data": {
    "authenticityScore": 92.5,
    "checks": {
      "exifValid": true,
      "gpsMatches": true,
      "noAiArtifacts": true,
      "timestampValid": true
    },
    "detectedObjects": ["coin", "soil"],
    "verification": "PASSED"
  }
}
```

---

## WebSocket Events

Connect to: `wss://api.treasuresense.app/v1/ws`

### Client → Server
```json
// Authenticate
{"type": "AUTH", "token": "jwt_token"}

// Subscribe to location updates
{"type": "SUBSCRIBE_LOCATION", "lat": 40.7128, "lng": -74.0060, "radius": 5000}

// Ping
{"type": "PING"}
```

### Server → Client
```json
// New zone discovered nearby
{
  "type": "ZONE_DISCOVERED",
  "data": {
    "zoneId": "uuid",
    "probabilityScore": 85,
    "distance": 450,
    "location": {"lat": 40.71, "lng": -74.01}
  }
}

// New discovery in feed
{
  "type": "NEW_DISCOVERY",
  "data": {
    "discoveryId": "uuid",
    "user": {...},
    "preview": {...}
  }
}

// Event started
{
  "type": "EVENT_STARTED",
  "data": {
    "eventId": "uuid",
    "name": "Legendary Zone!",
    "location": {...}
  }
}

// XP earned
{
  "type": "XP_EARNED",
  "data": {
    "amount": 50,
    "reason": "Zone visited",
    "newTotal": 2500,
    "leveledUp": false
  }
}
```

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Authentication | 10/min |
| API (general) | 100/min |
| Uploads | 10/min |
| AI analysis | 30/min (free), 100/min (premium) |

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```
