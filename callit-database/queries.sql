-- =====================================================
-- CallIt Database - Common Queries
-- Optimized for performance with proper index usage
-- =====================================================

-- =====================================================
-- USER PROFILE QUERIES
-- =====================================================

-- Get user profile by username
SELECT * FROM user_profiles WHERE username = $1;

-- Search users by username or display name
SELECT id, username, display_name, avatar_url, is_verified, followers_count
FROM users
WHERE username ILIKE $1 OR display_name ILIKE $1
ORDER BY followers_count DESC
LIMIT 20;

-- Get user's followers list with pagination
SELECT 
    u.id, u.username, u.display_name, u.avatar_url, u.is_verified,
    f.created_at as followed_at
FROM follows f
JOIN users u ON f.follower_id = u.id
WHERE f.following_id = $1
ORDER BY f.created_at DESC
LIMIT $2 OFFSET $3;

-- Get user's following list with pagination
SELECT 
    u.id, u.username, u.display_name, u.avatar_url, u.is_verified,
    f.created_at as followed_at
FROM follows f
JOIN users u ON f.following_id = u.id
WHERE f.follower_id = $1
ORDER BY f.created_at DESC
LIMIT $2 OFFSET $3;

-- Check if user A follows user B
SELECT EXISTS(
    SELECT 1 FROM follows 
    WHERE follower_id = $1 AND following_id = $2
) as is_following;

-- =====================================================
-- VIDEO FEED QUERIES
-- =====================================================

-- Get main feed (chronological from followed users)
SELECT v.*
FROM video_feed v
WHERE v.user_id IN (
    SELECT following_id FROM follows WHERE follower_id = $1
)
ORDER BY v.created_at DESC
LIMIT $2 OFFSET $3;

-- Get "For You" feed (algorithmic)
-- This uses trending_score and recency
SELECT v.*
FROM video_feed v
WHERE v.user_id != $1  -- Exclude own videos
  AND v.id NOT IN (
      SELECT video_id FROM user_interactions 
      WHERE user_id = $1 AND action = 'dismiss'
  )
ORDER BY 
    (v.trending_score * 0.5) + 
    (EXTRACT(EPOCH FROM (NOW() - v.created_at)) / -3600 * 0.3) DESC
LIMIT $2 OFFSET $3;

-- Get trending feed
SELECT * FROM trending_feed LIMIT $1 OFFSET $2;

-- Get user's videos with pagination
SELECT * FROM video_feed 
WHERE user_id = $1 
ORDER BY is_pinned DESC, created_at DESC
LIMIT $2 OFFSET $3;

-- Get liked videos by user
SELECT v.*
FROM video_feed v
JOIN likes l ON v.id = l.video_id
WHERE l.user_id = $1
ORDER BY l.created_at DESC
LIMIT $2 OFFSET $3;

-- Search videos by caption
SELECT * FROM video_feed
WHERE caption ILIKE $1
ORDER BY views_count DESC
LIMIT 20;

-- =====================================================
-- VIDEO DETAIL QUERIES
-- =====================================================

-- Get single video with user info
SELECT * FROM video_feed WHERE id = $1;

-- Get video comments (top-level only)
SELECT 
    c.id, c.content, c.likes_count, c.replies_count, c.is_pinned,
    c.created_at, c.is_deleted,
    u.id as user_id, u.username, u.display_name, u.avatar_url, u.is_verified
FROM comments c
JOIN users u ON c.user_id = u.id
WHERE c.video_id = $1 AND c.parent_id IS NULL
ORDER BY c.is_pinned DESC, c.created_at DESC
LIMIT $2 OFFSET $3;

-- Get comment replies
SELECT 
    c.id, c.content, c.likes_count, c.created_at,
    u.id as user_id, u.username, u.display_name, u.avatar_url
FROM comments c
JOIN users u ON c.user_id = u.id
WHERE c.parent_id = $1
ORDER BY c.created_at ASC;

-- Get related videos (same hashtags)
SELECT DISTINCT v.*
FROM video_feed v
JOIN video_hashtags vh ON v.id = vh.video_id
WHERE vh.hashtag_id IN (
    SELECT hashtag_id FROM video_hashtags WHERE video_id = $1
)
AND v.id != $1
ORDER BY v.views_count DESC
LIMIT 10;

-- =====================================================
-- ENGAGEMENT QUERIES
-- =====================================================

-- Like a video (idempotent)
INSERT INTO likes (user_id, video_id)
VALUES ($1, $2)
ON CONFLICT (user_id, video_id) DO NOTHING;

-- Unlike a video
DELETE FROM likes WHERE user_id = $1 AND video_id = $2;

-- Check if user liked video
SELECT EXISTS(
    SELECT 1 FROM likes WHERE user_id = $1 AND video_id = $2
) as has_liked;

-- Add comment
INSERT INTO comments (video_id, user_id, parent_id, content)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- Delete comment (soft delete)
UPDATE comments 
SET is_deleted = TRUE, content = '[deleted]' 
WHERE id = $1 AND user_id = $2;

-- Save video
INSERT INTO saved_videos (user_id, video_id, collection_name)
VALUES ($1, $2, COALESCE($3, 'default'))
ON CONFLICT (user_id, video_id) DO NOTHING;

-- Get saved videos
SELECT v.*, sv.collection_name, sv.created_at as saved_at
FROM video_feed v
JOIN saved_videos sv ON v.id = sv.video_id
WHERE sv.user_id = $1
ORDER BY sv.created_at DESC
LIMIT $2 OFFSET $3;

-- =====================================================
-- HASHTAG QUERIES
-- =====================================================

-- Get trending hashtags
SELECT name, videos_count
FROM hashtags
ORDER BY videos_count DESC
LIMIT 20;

-- Get videos by hashtag
SELECT v.*
FROM video_feed v
JOIN video_hashtags vh ON v.id = vh.video_id
JOIN hashtags h ON vh.hashtag_id = h.id
WHERE h.name = $1
ORDER BY v.created_at DESC
LIMIT $2 OFFSET $3;

-- Search hashtags
SELECT name, videos_count
FROM hashtags
WHERE name ILIKE $1
ORDER BY videos_count DESC
LIMIT 20;

-- =====================================================
-- NOTIFICATION QUERIES
-- =====================================================

-- Get user notifications
SELECT 
    n.id, n.type, n.message, n.is_read, n.created_at,
    sender.id as sender_id, sender.username as sender_username, 
    sender.avatar_url as sender_avatar
FROM notifications n
LEFT JOIN users sender ON n.sender_id = sender.id
WHERE n.recipient_id = $1
ORDER BY n.created_at DESC
LIMIT $2 OFFSET $3;

-- Get unread notification count
SELECT COUNT(*) as unread_count
FROM notifications
WHERE recipient_id = $1 AND is_read = FALSE;

-- Mark notifications as read
UPDATE notifications 
SET is_read = TRUE 
WHERE recipient_id = $1 AND id = ANY($2);

-- Mark all as read
UPDATE notifications 
SET is_read = TRUE 
WHERE recipient_id = $1 AND is_read = FALSE;

-- =====================================================
-- ANALYTICS QUERIES
-- =====================================================

-- Get video analytics (hourly breakdown)
SELECT 
    hour_bucket,
    views_count,
    likes_count,
    comments_count,
    shares_count,
    total_watch_time_seconds,
    avg_completion_rate
FROM video_stats_hourly
WHERE video_id = $1
ORDER BY hour_bucket DESC
LIMIT 24; -- Last 24 hours

-- Get user's daily stats
SELECT 
    date_bucket,
    videos_uploaded,
    total_views_received,
    new_followers,
    new_following
FROM user_stats_daily
WHERE user_id = $1
ORDER BY date_bucket DESC
LIMIT 30; -- Last 30 days

-- Get total stats for user
SELECT 
    SUM(videos_uploaded) as total_videos,
    SUM(total_views_received) as total_views,
    SUM(new_followers) as total_new_followers
FROM user_stats_daily
WHERE user_id = $1
AND date_bucket >= $2 AND date_bucket <= $3;

-- =====================================================
-- ALGORITHM / RECOMMENDATION QUERIES
-- =====================================================

-- Update trending score (run periodically)
UPDATE videos
SET trending_score = (
    (likes_count * 1.0) + 
    (comments_count * 2.0) + 
    (shares_count * 3.0) + 
    (views_count * 0.1)
) / GREATEST(EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600, 1)
WHERE status = 'active' AND is_public = TRUE;

-- Get recommended videos based on user interactions
SELECT DISTINCT v.*
FROM video_feed v
JOIN video_hashtags vh ON v.id = vh.video_id
WHERE vh.hashtag_id IN (
    -- Get hashtags from videos user liked
    SELECT DISTINCT vh2.hashtag_id
    FROM likes l
    JOIN video_hashtags vh2 ON l.video_id = vh2.video_id
    WHERE l.user_id = $1
)
AND v.id NOT IN (
    SELECT video_id FROM likes WHERE user_id = $1
)
AND v.id NOT IN (
    SELECT video_id FROM user_interactions 
    WHERE user_id = $1 AND action = 'dismiss'
)
ORDER BY v.trending_score DESC, v.created_at DESC
LIMIT 20;

-- Record user interaction for algorithm
INSERT INTO user_interactions 
    (user_id, video_id, action, watch_duration_seconds, completion_rate, weight)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (user_id, video_id, action) 
DO UPDATE SET 
    watch_duration_seconds = EXCLUDED.watch_duration_seconds,
    completion_rate = EXCLUDED.completion_rate,
    weight = EXCLUDED.weight,
    created_at = NOW();

-- =====================================================
-- AGGREGATION QUERIES (for background jobs)
-- =====================================================

-- Aggregate video stats hourly (run every hour)
INSERT INTO video_stats_hourly (
    video_id, hour_bucket, views_count, likes_count, 
    comments_count, shares_count, total_watch_time_seconds, avg_completion_rate
)
SELECT 
    video_id,
    date_trunc('hour', created_at) as hour_bucket,
    COUNT(*) FILTER (WHERE action = 'view') as views_count,
    COUNT(*) FILTER (WHERE action = 'like') as likes_count,
    COUNT(*) FILTER (WHERE action = 'comment') as comments_count,
    COUNT(*) FILTER (WHERE action = 'share') as shares_count,
    COALESCE(SUM(watch_duration_seconds) FILTER (WHERE action = 'view'), 0) as total_watch_time,
    AVG(completion_rate) FILTER (WHERE action = 'view') as avg_completion
FROM user_interactions
WHERE created_at >= date_trunc('hour', NOW()) - INTERVAL '1 hour'
  AND created_at < date_trunc('hour', NOW())
GROUP BY video_id, date_trunc('hour', created_at)
ON CONFLICT (video_id, hour_bucket) DO UPDATE SET
    views_count = EXCLUDED.views_count,
    likes_count = EXCLUDED.likes_count,
    comments_count = EXCLUDED.comments_count,
    shares_count = EXCLUDED.shares_count,
    total_watch_time_seconds = EXCLUDED.total_watch_time_seconds,
    avg_completion_rate = EXCLUDED.avg_completion_rate;

-- Aggregate user stats daily (run once per day)
INSERT INTO user_stats_daily (
    user_id, date_bucket, videos_uploaded, total_views_received,
    new_followers, new_following
)
SELECT 
    u.id as user_id,
    CURRENT_DATE - 1 as date_bucket,
    COUNT(DISTINCT v.id) FILTER (WHERE v.created_at::date = CURRENT_DATE - 1) as videos_uploaded,
    COALESCE(SUM(vsh.views_count), 0) as total_views,
    COUNT(DISTINCT f.id) FILTER (WHERE f.created_at::date = CURRENT_DATE - 1) as new_followers,
    0 as new_following
FROM users u
LEFT JOIN videos v ON v.user_id = u.id
LEFT JOIN video_stats_hourly vsh ON vsh.video_id = v.id 
    AND vsh.hour_bucket::date = CURRENT_DATE - 1
LEFT JOIN follows f ON f.following_id = u.id 
    AND f.created_at::date = CURRENT_DATE - 1
GROUP BY u.id
ON CONFLICT (user_id, date_bucket) DO UPDATE SET
    videos_uploaded = EXCLUDED.videos_uploaded,
    total_views_received = EXCLUDED.total_views_received,
    new_followers = EXCLUDED.new_followers;
