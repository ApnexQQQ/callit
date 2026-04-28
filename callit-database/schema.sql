-- =====================================================
-- CallIt Database Schema
-- TikTok-like Social App - PostgreSQL
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For GIN indexes

-- =====================================================
-- 1. USER PROFILES & AUTHENTICATION
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile info
    display_name VARCHAR(50),
    bio TEXT,
    avatar_url TEXT,
    
    -- Verification & status
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_private BOOLEAN DEFAULT FALSE,
    
    -- Stats (denormalized for performance)
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    videos_count INTEGER DEFAULT 0,
    total_likes_received BIGINT DEFAULT 0,
    
    -- Settings
    allow_comments BOOLEAN DEFAULT TRUE,
    allow_dms BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Indexes for users table
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_is_verified ON users(is_verified) WHERE is_verified = TRUE;
CREATE INDEX idx_users_username_trgm ON users USING gin(username gin_trgm_ops);

-- =====================================================
-- 2. FOLLOWERS SYSTEM
-- =====================================================

CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Indexes for follows table
CREATE INDEX idx_follows_follower ON follows(follower_id, created_at DESC);
CREATE INDEX idx_follows_following ON follows(following_id, created_at DESC);
CREATE INDEX idx_follows_created_at ON follows(created_at DESC);

-- =====================================================
-- 3. VIDEOS & CONTENT
-- =====================================================

CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Media URLs
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    
    -- Content metadata
    caption TEXT,
    duration_seconds INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    file_size_bytes BIGINT,
    
    -- Privacy & status
    is_public BOOLEAN DEFAULT TRUE,
    is_pinned BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'processing', 'deleted', 'banned')),
    
    -- Engagement stats (denormalized)
    views_count BIGINT DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    -- Algorithm scores
    trending_score DOUBLE PRECISION DEFAULT 0,
    
    -- Location (optional)
    location_name VARCHAR(255),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for videos table
CREATE INDEX idx_videos_user_id ON videos(user_id, created_at DESC);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX idx_videos_published_at ON videos(published_at DESC);
CREATE INDEX idx_videos_status ON videos(status) WHERE status = 'active';
CREATE INDEX idx_videos_is_public ON videos(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_videos_trending ON videos(trending_score DESC, created_at DESC) WHERE status = 'active' AND is_public = TRUE;
CREATE INDEX idx_videos_caption_trgm ON videos USING gin(caption gin_trgm_ops);

-- =====================================================
-- 4. HASHTAGS SYSTEM
-- =====================================================

CREATE TABLE hashtags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    videos_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE video_hashtags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(video_id, hashtag_id)
);

-- Indexes for hashtags
CREATE INDEX idx_hashtags_name ON hashtags(name);
CREATE INDEX idx_hashtags_videos_count ON hashtags(videos_count DESC);
CREATE INDEX idx_video_hashtags_video ON video_hashtags(video_id);
CREATE INDEX idx_video_hashtags_hashtag ON video_hashtags(hashtag_id);

-- =====================================================
-- 5. ENGAGEMENT: LIKES
-- =====================================================

CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, video_id)
);

-- Indexes for likes
CREATE INDEX idx_likes_user ON likes(user_id, created_at DESC);
CREATE INDEX idx_likes_video ON likes(video_id, created_at DESC);
CREATE INDEX idx_likes_created_at ON likes(created_at DESC);

-- =====================================================
-- 6. ENGAGEMENT: COMMENTS
-- =====================================================

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For replies
    
    content TEXT NOT NULL,
    
    -- Engagement stats
    likes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    
    -- Status
    is_pinned BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for comments
CREATE INDEX idx_comments_video ON comments(video_id, created_at DESC);
CREATE INDEX idx_comments_user ON comments(user_id, created_at DESC);
CREATE INDEX idx_comments_parent ON comments(parent_id, created_at DESC) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_comments_pinned ON comments(video_id, is_pinned) WHERE is_pinned = TRUE;

-- =====================================================
-- 7. ENGAGEMENT: SHARES
-- =====================================================

CREATE TABLE shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('copy_link', 'whatsapp', 'instagram', 'twitter', 'facebook', 'other')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, video_id, share_type)
);

CREATE INDEX idx_shares_video ON shares(video_id, created_at DESC);
CREATE INDEX idx_shares_user ON shares(user_id, created_at DESC);

-- =====================================================
-- 8. VIEWS & WATCH TIME (for algorithm)
-- =====================================================

CREATE TABLE video_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for anonymous
    
    watch_time_seconds INTEGER DEFAULT 0,
    completion_rate DECIMAL(5, 4), -- 0.0 to 1.0
    
    -- For deduplication
    session_id VARCHAR(64),
    ip_hash VARCHAR(64), -- Hashed IP for anonymous tracking
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for views
CREATE INDEX idx_video_views_video ON video_views(video_id, created_at DESC);
CREATE INDEX idx_video_views_user ON video_views(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_video_views_created_at ON video_views(created_at DESC);

-- =====================================================
-- 9. USER INTERACTIONS (for recommendation algorithm)
-- =====================================================

CREATE TABLE user_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    
    -- Interaction types
    action VARCHAR(20) NOT NULL CHECK (action IN ('view', 'like', 'comment', 'share', 'save', 'dismiss', 'report')),
    
    -- For views: how much did they watch?
    watch_duration_seconds INTEGER,
    completion_rate DECIMAL(5, 4),
    
    -- For algorithm weight
    weight DECIMAL(5, 4) DEFAULT 1.0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, video_id, action)
);

-- Indexes for interactions
CREATE INDEX idx_user_interactions_user ON user_interactions(user_id, created_at DESC);
CREATE INDEX idx_user_interactions_video ON user_interactions(video_id, created_at DESC);
CREATE INDEX idx_user_interactions_user_action ON user_interactions(user_id, action, created_at DESC);

-- =====================================================
-- 10. SAVED VIDEOS (bookmarks)
-- =====================================================

CREATE TABLE saved_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    collection_name VARCHAR(100) DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, video_id)
);

CREATE INDEX idx_saved_videos_user ON saved_videos(user_id, created_at DESC);
CREATE INDEX idx_saved_videos_collection ON saved_videos(user_id, collection_name, created_at DESC);

-- =====================================================
-- 11. NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    type VARCHAR(30) NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'video_from_following', 'trending')),
    
    -- Reference to the related entity
    reference_type VARCHAR(20), -- 'video', 'comment', 'user'
    reference_id UUID,
    
    -- Content
    message TEXT,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- 12. USER FEED PREFERENCES (for personalization)
-- =====================================================

CREATE TABLE user_feed_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Content preferences
    preferred_hashtags UUID[], -- Array of hashtag IDs
    blocked_hashtags UUID[],
    blocked_users UUID[],
    
    -- Algorithm weights
    recency_weight DECIMAL(3, 2) DEFAULT 0.3,
    popularity_weight DECIMAL(3, 2) DEFAULT 0.3,
    following_weight DECIMAL(3, 2) DEFAULT 0.4,
    
    -- Content filters
    min_video_duration INTEGER DEFAULT 0,
    max_video_duration INTEGER DEFAULT 600, -- 10 minutes
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_feed_prefs_user ON user_feed_preferences(user_id);

-- =====================================================
-- 13. REAL-TIME ANALYTICS AGGREGATES
-- =====================================================

-- Hourly video stats (for real-time dashboards)
CREATE TABLE video_stats_hourly (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    hour_bucket TIMESTAMPTZ NOT NULL,
    
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    total_watch_time_seconds BIGINT DEFAULT 0,
    avg_completion_rate DECIMAL(5, 4),
    
    UNIQUE(video_id, hour_bucket)
);

CREATE INDEX idx_video_stats_hourly_video ON video_stats_hourly(video_id, hour_bucket DESC);
CREATE INDEX idx_video_stats_hourly_bucket ON video_stats_hourly(hour_bucket DESC);

-- Daily user stats
CREATE TABLE user_stats_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_bucket DATE NOT NULL,
    
    videos_uploaded INTEGER DEFAULT 0,
    total_views_received BIGINT DEFAULT 0,
    new_followers INTEGER DEFAULT 0,
    new_following INTEGER DEFAULT 0,
    
    UNIQUE(user_id, date_bucket)
);

CREATE INDEX idx_user_stats_daily_user ON user_stats_daily(user_id, date_bucket DESC);
CREATE INDEX idx_user_stats_daily_date ON user_stats_daily(date_bucket DESC);

-- =====================================================
-- 14. TRENDING/HOT CONTENT TRACKING
-- =====================================================

CREATE TABLE trending_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    
    score DOUBLE PRECISION NOT NULL,
    rank_position INTEGER,
    
    -- Time window
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(video_id, period_start)
);

CREATE INDEX idx_trending_videos_score ON trending_videos(score DESC, created_at DESC);
CREATE INDEX idx_trending_videos_period ON trending_videos(period_start, period_end);

-- =====================================================
-- 15. CONTENT MODERATION
-- =====================================================

CREATE TABLE content_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    reported_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    
    reason VARCHAR(50) NOT NULL,
    description TEXT,
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
    resolution TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_content_reports_status ON content_reports(status, created_at DESC);
CREATE INDEX idx_content_reports_reporter ON content_reports(reporter_id, created_at DESC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update followers_count when follow is created/deleted
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
        UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.following_id;
        UPDATE users SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER follow_counts_trigger
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW EXECUTE FUNCTION update_follower_counts();

-- Update video engagement counts
CREATE OR REPLACE FUNCTION update_video_engagement_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'likes' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE videos SET likes_count = likes_count + 1 WHERE id = NEW.video_id;
            UPDATE users SET total_likes_received = total_likes_received + 1 
            WHERE id = (SELECT user_id FROM videos WHERE id = NEW.video_id);
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE videos SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.video_id;
            UPDATE users SET total_likes_received = GREATEST(0, total_likes_received - 1) 
            WHERE id = (SELECT user_id FROM videos WHERE id = OLD.video_id);
        END IF;
    ELSIF TG_TABLE_NAME = 'comments' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE videos SET comments_count = comments_count + 1 WHERE id = NEW.video_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE videos SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.video_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'shares' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE videos SET shares_count = shares_count + 1 WHERE id = NEW.video_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE videos SET shares_count = GREATEST(0, shares_count - 1) WHERE id = OLD.video_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER likes_count_trigger
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW EXECUTE FUNCTION update_video_engagement_counts();

CREATE TRIGGER comments_count_trigger
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_video_engagement_counts();

CREATE TRIGGER shares_count_trigger
    AFTER INSERT OR DELETE ON shares
    FOR EACH ROW EXECUTE FUNCTION update_video_engagement_counts();

-- Update user videos count
CREATE OR REPLACE FUNCTION update_user_videos_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET videos_count = videos_count + 1 WHERE id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users SET videos_count = GREATEST(0, videos_count - 1) WHERE id = OLD.user_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER user_videos_count_trigger
    AFTER INSERT OR DELETE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_user_videos_count();

-- Update hashtag video counts
CREATE OR REPLACE FUNCTION update_hashtag_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE hashtags SET videos_count = videos_count + 1 WHERE id = NEW.hashtag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE hashtags SET videos_count = GREATEST(0, videos_count - 1) WHERE id = OLD.hashtag_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER hashtag_count_trigger
    AFTER INSERT OR DELETE ON video_hashtags
    FOR EACH ROW EXECUTE FUNCTION update_hashtag_counts();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- User profile with stats
CREATE VIEW user_profiles AS
SELECT 
    u.id,
    u.username,
    u.display_name,
    u.bio,
    u.avatar_url,
    u.is_verified,
    u.is_private,
    u.followers_count,
    u.following_count,
    u.videos_count,
    u.total_likes_received,
    u.created_at
FROM users u
WHERE u.is_active = TRUE;

-- Video feed view (for main feed queries)
CREATE VIEW video_feed AS
SELECT 
    v.id,
    v.user_id,
    u.username,
    u.display_name,
    u.avatar_url,
    u.is_verified,
    v.video_url,
    v.thumbnail_url,
    v.caption,
    v.duration_seconds,
    v.views_count,
    v.likes_count,
    v.comments_count,
    v.shares_count,
    v.trending_score,
    v.created_at,
    v.is_public
FROM videos v
JOIN users u ON v.user_id = u.id
WHERE v.status = 'active' AND v.is_public = TRUE;

-- Trending videos view
CREATE VIEW trending_feed AS
SELECT 
    v.*,
    tv.score,
    tv.rank_position
FROM video_feed v
JOIN trending_videos tv ON v.id = tv.video_id
WHERE tv.period_end > NOW()
ORDER BY tv.score DESC;
