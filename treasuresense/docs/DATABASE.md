# TreasureSense Database Schema

## Overview
- **Engine:** PostgreSQL 15+
- **Extensions:** PostGIS, pg_trgm (fuzzy search), uuid-ossp
- **ORM:** Prisma

## Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │────<│ discoveries │>────│    zones    │
└──────┬──────┘     └──────┬──────┘     └─────────────┘
       │                   │
       │            ┌──────┴──────┐
       │            │   images    │
       │            └─────────────┘
       │
       │     ┌─────────────┐     ┌─────────────┐
       └───> │ interactions│<────│   events    │
             └─────────────┘     └─────────────┘
             
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   missions  │────<│user_missions│>────│  user_stats │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                        ┌──────┴──────┐
                                        │leaderboards │
                                        └─────────────┘
```

## Tables

### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(30) UNIQUE NOT NULL,
    display_name VARCHAR(50),
    avatar_url TEXT,
    
    -- Gamification
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    rank VARCHAR(20) DEFAULT 'EXPLORER', -- EXPLORER, HUNTER, MASTER
    
    -- Stats
    discoveries_count INTEGER DEFAULT 0,
    total_xp_earned INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_active_at TIMESTAMP,
    
    -- Subscription
    subscription_tier VARCHAR(20) DEFAULT 'FREE', -- FREE, PREMIUM
    subscription_expires_at TIMESTAMP,
    
    -- Settings
    settings JSONB DEFAULT '{}',
    
    -- Auth
    password_hash VARCHAR(255),
    email_verified_at TIMESTAMP,
    
    -- Location (for nearby features, approx only)
    home_location GEOGRAPHY(POINT, 4326),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_xp ON users(xp DESC);
CREATE INDEX idx_users_home_location ON users USING GIST(home_location);
```

### zones
```sql
CREATE TABLE zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Geospatial
    boundary GEOGRAPHY(POLYGON, 4326) NOT NULL,
    center GEOGRAPHY(POINT, 4326) NOT NULL,
    radius_meters INTEGER, -- for circular zones
    
    -- AI Scoring
    probability_score DECIMAL(5,2), -- 0.00 to 100.00
    score_factors JSONB, -- {historical: 85, terrain: 70, proximity: 90}
    
    -- Classification
    zone_type VARCHAR(30), -- HOT, LEGENDARY, STANDARD
    terrain_type VARCHAR(50), -- forest, beach, field, etc.
    
    -- Historical data
    historical_context TEXT, -- AI-generated explanation
    nearby_discoveries_count INTEGER DEFAULT 0,
    
    -- Event-specific
    is_event BOOLEAN DEFAULT FALSE,
    event_id UUID REFERENCES events(id),
    event_expires_at TIMESTAMP,
    
    -- Metadata
    country_code CHAR(2),
    region_name VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_zones_center ON zones USING GIST(center);
CREATE INDEX idx_zones_boundary ON zones USING GIST(boundary);
CREATE INDEX idx_zones_probability ON zones(probability_score DESC);
CREATE INDEX idx_zones_event ON zones(is_event, event_expires_at) WHERE is_event = TRUE;
CREATE INDEX idx_zones_location_score ON zones USING GIST(center) INCLUDE (probability_score);
```

### discoveries
```sql
CREATE TABLE discoveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Ownership
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES zones(id),
    
    -- Location (exact GPS - private)
    exact_location GEOGRAPHY(POINT, 4326) NOT NULL,
    -- Fuzzed location (public - ±10-50m)
    public_location GEOGRAPHY(POINT, 4326) NOT NULL,
    location_accuracy DECIMAL(8,2), -- GPS accuracy in meters
    
    -- Content
    title VARCHAR(100) NOT NULL,
    description TEXT,
    find_type VARCHAR(50), -- coin, jewelry, relic, etc.
    estimated_era VARCHAR(50), -- roman, medieval, modern, etc.
    
    -- Media
    primary_image_url TEXT NOT NULL,
    images JSONB DEFAULT '[]', -- [{url, order}]
    
    -- Verification
    discovery_date TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    verified_by UUID REFERENCES users(id),
    certificate_hash VARCHAR(64) UNIQUE, -- SHA-256 hash for digital certificate
    
    -- Engagement
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED
    is_featured BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_discoveries_user ON discoveries(user_id);
CREATE INDEX idx_discoveries_zone ON discoveries(zone_id);
CREATE INDEX idx_discoveries_public_location ON discoveries USING GIST(public_location);
CREATE INDEX idx_discoveries_created ON discoveries(created_at DESC);
CREATE INDEX idx_discoveries_featured ON discoveries(is_featured, created_at) WHERE is_featured = TRUE;
```

### images
```sql
CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discovery_id UUID NOT NULL REFERENCES discoveries(id) ON DELETE CASCADE,
    
    -- Storage
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    
    -- Metadata
    width INTEGER,
    height INTEGER,
    file_size_bytes INTEGER,
    mime_type VARCHAR(50),
    
    -- EXIF data (stripped from public, stored for verification)
    exif_data JSONB,
    has_gps_data BOOLEAN DEFAULT FALSE,
    
    -- AI Analysis
    ai_tags JSONB, -- detected objects
    ai_verification_score DECIMAL(5,2), -- authenticity score
    
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_images_discovery ON images(discovery_id);
```

### interactions
```sql
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    discovery_id UUID REFERENCES discoveries(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    interaction_type VARCHAR(20) NOT NULL, -- LIKE, COMMENT, FOLLOW, SHARE
    
    -- For comments
    content TEXT,
    parent_comment_id UUID REFERENCES interactions(id),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_interactions_user ON interactions(user_id);
CREATE INDEX idx_interactions_discovery ON interactions(discovery_id) WHERE discovery_id IS NOT NULL;
CREATE INDEX idx_interactions_type ON interactions(interaction_type);
CREATE INDEX idx_interactions_created ON interactions(created_at DESC);

-- Prevent duplicate likes
CREATE UNIQUE INDEX idx_unique_like ON interactions(user_id, discovery_id) WHERE interaction_type = 'LIKE';
```

### events
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event details
    name VARCHAR(100) NOT NULL,
    description TEXT,
    event_type VARCHAR(30), -- HOT_ZONE, LEGENDARY, COMMUNITY
    
    -- Timing
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    
    -- Location (can be global or regional)
    center_location GEOGRAPHY(POINT, 4326),
    radius_km INTEGER,
    affected_countries TEXT[],
    
    -- Rewards
    xp_multiplier DECIMAL(3,1) DEFAULT 1.0,
    bonus_xp INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    participants_count INTEGER DEFAULT 0,
    discoveries_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_active ON events(is_active, ends_at) WHERE is_active = TRUE;
CREATE INDEX idx_events_time ON events(starts_at, ends_at);
```

### missions
```sql
CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Mission details
    title VARCHAR(100) NOT NULL,
    description TEXT,
    mission_type VARCHAR(30), -- DAILY, WEEKLY, SPECIAL
    
    -- Requirements
    requirement_type VARCHAR(30), -- VISIT_ZONES, MAKE_DISCOVERY, EARN_XP, etc.
    requirement_count INTEGER NOT NULL,
    requirement_data JSONB, -- extra params
    
    -- Rewards
    xp_reward INTEGER NOT NULL,
    badge_id UUID, -- optional badge
    
    -- Availability
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMP,
    ends_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### user_missions
```sql
CREATE TABLE user_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    
    progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, mission_id)
);

CREATE INDEX idx_user_missions_user ON user_missions(user_id);
CREATE INDEX idx_user_missions_active ON user_missions(user_id, is_completed) WHERE is_completed = FALSE;
```

### user_stats
```sql
CREATE TABLE user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Exploration stats
    zones_visited INTEGER DEFAULT 0,
    unique_zones_visited INTEGER DEFAULT 0,
    total_distance_km DECIMAL(10,2) DEFAULT 0,
    
    -- Discovery stats
    discoveries_by_type JSONB DEFAULT '{}', -- {coin: 5, jewelry: 2}
    discoveries_by_era JSONB DEFAULT '{}', -- {roman: 3, medieval: 4}
    
    -- Social stats
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    
    -- Streak
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_discovery_date DATE,
    
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### leaderboards
```sql
CREATE TABLE leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    leaderboard_type VARCHAR(30) NOT NULL, -- GLOBAL, LOCAL, WEEKLY
    region_code VARCHAR(10), -- for local leaderboards
    
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    score INTEGER NOT NULL, -- XP for the period
    
    period_start DATE,
    period_end DATE,
    
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(leaderboard_type, region_code, period_start, user_id)
);

CREATE INDEX idx_leaderboards_type ON leaderboards(leaderboard_type, region_code, period_start);
CREATE INDEX idx_leaderboards_rank ON leaderboards(leaderboard_type, rank);
```

### notifications
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    notification_type VARCHAR(30) NOT NULL, -- LIKE, COMMENT, FOLLOW, EVENT, MISSION
    title VARCHAR(100) NOT NULL,
    body TEXT,
    
    -- Deep link data
    data JSONB,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
```

### protected_areas
```sql
CREATE TABLE protected_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    name VARCHAR(200) NOT NULL,
    area_type VARCHAR(50), -- national_park, archaeological_site, private_property
    protection_level VARCHAR(20), -- PROHIBITED, RESTRICTED, PERMIT_REQUIRED
    
    boundary GEOGRAPHY(POLYGON, 4326) NOT NULL,
    center GEOGRAPHY(POINT, 4326) NOT NULL,
    
    country_code CHAR(2),
    warning_message TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_protected_areas_boundary ON protected_areas USING GIST(boundary);
```

## Key Queries

### Find zones near location
```sql
SELECT 
    z.id,
    z.probability_score,
    z.historical_context,
    z.zone_type,
    ST_Distance(z.center, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) as distance_meters
FROM zones z
WHERE ST_DWithin(z.center, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
  AND z.probability_score > 30
ORDER BY z.probability_score DESC, distance_meters
LIMIT 50;
```

### Get discovery feed
```sql
SELECT 
    d.*,
    u.username,
    u.avatar_url,
    u.level,
    (SELECT COUNT(*) FROM interactions WHERE discovery_id = d.id AND interaction_type = 'LIKE') as likes_count,
    EXISTS(SELECT 1 FROM interactions WHERE discovery_id = d.id AND user_id = $1 AND interaction_type = 'LIKE') as user_liked
FROM discoveries d
JOIN users u ON d.user_id = u.id
WHERE d.status = 'VERIFIED'
ORDER BY d.created_at DESC
LIMIT 20 OFFSET $2;
```

### Update user XP and level
```sql
WITH updated AS (
    UPDATE users 
    SET xp = xp + $2,
        level = CASE 
            WHEN xp + $2 >= 10000 THEN 10
            WHEN xp + $2 >= 5000 THEN 9
            -- ... more levels
            ELSE level
        END,
        updated_at = NOW()
    WHERE id = $1
    RETURNING xp, level
)
INSERT INTO user_stats (user_id, updated_at)
VALUES ($1, NOW())
ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW();
```

## Migrations

Managed via Prisma. Key migration files:
- `0001_initial.sql` - Base schema
- `0002_add_postgis.sql` - PostGIS extensions
- `0003_add_indexes.sql` - Performance indexes
- `0004_seed_zones.sql` - Initial zone data
