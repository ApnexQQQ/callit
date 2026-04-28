-- =====================================================
-- CallIt Database - Seed Data
-- Sample data for testing and development
-- =====================================================

-- Insert sample users
INSERT INTO users (username, email, password_hash, display_name, bio, avatar_url, is_verified, followers_count, following_count, videos_count) VALUES
('alice', 'alice@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/I1K', 'Alice Johnson', 'Content creator | Lifestyle 🌸', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice', true, 15420, 340, 45),
('bob', 'bob@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/I1K', 'Bob Smith', 'Comedy & Entertainment 😂', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob', false, 8750, 520, 128),
('charlie', 'charlie@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/I1K', 'Charlie Davis', 'Dance & Music 🎵', 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie', true, 45200, 180, 89),
('diana', 'diana@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/I1K', 'Diana Prince', 'Fitness & Health 💪', 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana', false, 3210, 890, 67),
('eve', 'eve@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/I1K', 'Eve Wilson', 'Food & Cooking 🍳', 'https://api.dicebear.com/7.x/avataaars/svg?seed=eve', true, 28900, 450, 156),
('frank', 'frank@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/I1K', 'Frank Miller', 'Tech Reviews 📱', 'https://api.dicebear.com/7.x/avataaars/svg?seed=frank', false, 5600, 230, 94),
('grace', 'grace@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/I1K', 'Grace Lee', 'Travel & Adventure ✈️', 'https://api.dicebear.com/7.x/avataaars/svg?seed=grace', true, 67300, 320, 203),
('henry', 'henry@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/I1K', 'Henry Taylor', 'Gaming & Esports 🎮', 'https://api.dicebear.com/7.x/avataaars/svg?seed=henry', false, 12400, 670, 312);

-- Insert follows (create a network)
INSERT INTO follows (follower_id, following_id, created_at)
SELECT 
    u1.id as follower_id,
    u2.id as following_id,
    NOW() - (random() * INTERVAL '90 days') as created_at
FROM users u1
CROSS JOIN users u2
WHERE u1.id != u2.id
  AND random() < 0.3  -- 30% chance of following
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- Insert hashtags
INSERT INTO hashtags (name, videos_count) VALUES
('fyp', 1500000),
('viral', 890000),
('trending', 750000),
('foryou', 1200000),
('love', 650000),
('funny', 540000),
('dance', 420000),
('music', 380000),
('comedy', 320000),
('food', 290000),
('travel', 250000),
('fashion', 230000),
('beauty', 210000),
('fitness', 190000),
('gaming', 170000),
('art', 150000),
('pets', 140000),
('satisfying', 130000),
('learnontiktok', 120000),
('ootd', 110000);

-- Insert videos
INSERT INTO videos (user_id, video_url, thumbnail_url, caption, duration_seconds, width, height, views_count, likes_count, comments_count, shares_count, trending_score, is_public, status, created_at)
SELECT 
    u.id as user_id,
    'https://cdn.callit.app/videos/' || gen_random_uuid() || '.mp4' as video_url,
    'https://cdn.callit.app/thumbnails/' || gen_random_uuid() || '.jpg' as thumbnail_url,
    CASE (row_number() OVER () % 10)
        WHEN 0 THEN 'Check out this amazing moment! ✨ #fyp #viral'
        WHEN 1 THEN 'POV: You finally did it 🎉 #foryou #trending'
        WHEN 2 THEN 'Can''t believe this happened 😱 #funny #fyp'
        WHEN 3 THEN 'Tutorial: How to make the perfect... #learnontiktok'
        WHEN 4 THEN 'Day in my life 🌸 #vlog #lifestyle'
        WHEN 5 THEN 'Wait for it... 😂 #comedy #viral'
        WHEN 6 THEN 'This song hits different 🎵 #music #dance'
        WHEN 7 THEN 'Transformation complete 💫 #beauty #glowup'
        WHEN 8 THEN 'Recipe that will change your life 🍳 #food #cooking'
        WHEN 9 THEN 'Hidden gem you need to visit ✈️ #travel #wanderlust'
    END as caption,
    (random() * 59 + 1)::int as duration_seconds,
    1080 as width,
    1920 as height,
    (random() * 1000000)::bigint as views_count,
    (random() * 100000)::int as likes_count,
    (random() * 5000)::int as comments_count,
    (random() * 10000)::int as shares_count,
    random() * 1000 as trending_score,
    true as is_public,
    'active' as status,
    NOW() - (random() * INTERVAL '30 days') as created_at
FROM users u
CROSS JOIN generate_series(1, 15) as seq
ON CONFLICT DO NOTHING;

-- Link videos to hashtags
INSERT INTO video_hashtags (video_id, hashtag_id)
SELECT 
    v.id as video_id,
    h.id as hashtag_id
FROM videos v
CROSS JOIN LATERAL (
    SELECT id FROM hashtags ORDER BY random() LIMIT (random() * 4 + 1)::int
) h
ON CONFLICT (video_id, hashtag_id) DO NOTHING;

-- Insert likes
INSERT INTO likes (user_id, video_id, created_at)
SELECT 
    u.id as user_id,
    v.id as video_id,
    NOW() - (random() * INTERVAL '30 days') as created_at
FROM users u
CROSS JOIN videos v
WHERE random() < 0.15  -- 15% chance of liking
ON CONFLICT (user_id, video_id) DO NOTHING;

-- Insert comments
INSERT INTO comments (video_id, user_id, content, likes_count, created_at)
SELECT 
    v.id as video_id,
    u.id as user_id,
    CASE (row_number() OVER () % 8)
        WHEN 0 THEN 'This is amazing! 🔥'
        WHEN 1 THEN 'I can''t stop watching 😂'
        WHEN 2 THEN 'How did you do that?! 🤯'
        WHEN 3 THEN 'Love this so much ❤️'
        WHEN 4 THEN 'This deserves more views'
        WHEN 5 THEN 'Saving this for later 📌'
        WHEN 6 THEN 'The algorithm brought me here'
        WHEN 7 THEN 'Who else is watching in 2024? 👋'
    END as content,
    (random() * 1000)::int as likes_count,
    NOW() - (random() * INTERVAL '30 days') as created_at
FROM videos v
CROSS JOIN LATERAL (
    SELECT id FROM users ORDER BY random() LIMIT (random() * 20)::int
) u
ON CONFLICT DO NOTHING;

-- Insert saved videos
INSERT INTO saved_videos (user_id, video_id, collection_name, created_at)
SELECT 
    u.id as user_id,
    v.id as video_id,
    CASE (row_number() OVER () % 4)
        WHEN 0 THEN 'Favorites'
        WHEN 1 THEN 'Watch Later'
        WHEN 2 THEN 'Inspiration'
        WHEN 3 THEN 'Recipes'
    END as collection_name,
    NOW() - (random() * INTERVAL '30 days') as created_at
FROM users u
CROSS JOIN videos v
WHERE random() < 0.05  -- 5% chance of saving
ON CONFLICT (user_id, video_id) DO NOTHING;

-- Insert notifications
INSERT INTO notifications (recipient_id, sender_id, type, message, reference_type, reference_id, is_read, created_at)
SELECT 
    u2.id as recipient_id,
    u1.id as sender_id,
    CASE (row_number() OVER () % 4)
        WHEN 0 THEN 'like'
        WHEN 1 THEN 'follow'
        WHEN 2 THEN 'comment'
        WHEN 3 THEN 'video_from_following'
    END as type,
    CASE (row_number() OVER () % 4)
        WHEN 0 THEN 'liked your video'
        WHEN 1 THEN 'started following you'
        WHEN 2 THEN 'commented on your video'
        WHEN 3 THEN 'posted a new video'
    END as message,
    CASE (row_number() OVER () % 3)
        WHEN 0 THEN 'video'
        WHEN 1 THEN 'user'
        WHEN 2 THEN 'comment'
    END as reference_type,
    gen_random_uuid() as reference_id,
    random() < 0.7 as is_read,
    NOW() - (random() * INTERVAL '7 days') as created_at
FROM users u1
CROSS JOIN users u2
WHERE u1.id != u2.id
  AND random() < 0.1
ON CONFLICT DO NOTHING;

-- Insert user feed preferences
INSERT INTO user_feed_preferences (user_id, preferred_hashtags, blocked_hashtags, recency_weight, popularity_weight, following_weight)
SELECT 
    u.id as user_id,
    ARRAY(SELECT id FROM hashtags ORDER BY random() LIMIT 5) as preferred_hashtags,
    ARRAY[]::uuid[] as blocked_hashtags,
    0.25 + (random() * 0.15) as recency_weight,
    0.25 + (random() * 0.15) as popularity_weight,
    0.35 + (random() * 0.15) as following_weight
FROM users u
ON CONFLICT (user_id) DO NOTHING;

-- Insert user interactions for algorithm
INSERT INTO user_interactions (user_id, video_id, action, watch_duration_seconds, completion_rate, weight, created_at)
SELECT 
    u.id as user_id,
    v.id as video_id,
    CASE (row_number() OVER () % 5)
        WHEN 0 THEN 'view'
        WHEN 1 THEN 'like'
        WHEN 2 THEN 'share'
        WHEN 3 THEN 'save'
        WHEN 4 THEN 'dismiss'
    END as action,
    (random() * 60)::int as watch_duration_seconds,
    random() as completion_rate,
    random() as weight,
    NOW() - (random() * INTERVAL '30 days') as created_at
FROM users u
CROSS JOIN videos v
WHERE random() < 0.2
ON CONFLICT (user_id, video_id, action) DO NOTHING;

-- Update counts to match actual data
UPDATE users SET 
    followers_count = (SELECT COUNT(*) FROM follows WHERE following_id = users.id),
    following_count = (SELECT COUNT(*) FROM follows WHERE follower_id = users.id),
    videos_count = (SELECT COUNT(*) FROM videos WHERE user_id = users.id),
    total_likes_received = COALESCE((SELECT SUM(likes_count) FROM videos WHERE user_id = users.id), 0);

UPDATE videos SET 
    likes_count = (SELECT COUNT(*) FROM likes WHERE video_id = videos.id),
    comments_count = (SELECT COUNT(*) FROM comments WHERE video_id = videos.id),
    shares_count = (SELECT COUNT(*) FROM shares WHERE video_id = videos.id);

UPDATE hashtags SET 
    videos_count = (SELECT COUNT(*) FROM video_hashtags WHERE hashtag_id = hashtags.id);

-- Recalculate trending scores
UPDATE videos
SET trending_score = (
    (likes_count * 1.0) + 
    (comments_count * 2.0) + 
    (shares_count * 3.0) + 
    (views_count * 0.1)
) / GREATEST(EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600, 1)
WHERE status = 'active' AND is_public = TRUE;
