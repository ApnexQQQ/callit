# CallIt Database Schema

A scalable PostgreSQL database schema for a TikTok-like social media application.

## 📁 Files

| File | Description |
|------|-------------|
| `schema.sql` | Complete database schema with tables, indexes, triggers, and views |
| `queries.sql` | Optimized SQL queries for common operations |
| `seed.sql` | Sample data for testing and development |

## 🗄️ Schema Overview

### Core Tables

#### 1. Users (`users`)
- User profiles and authentication
- Denormalized counts (followers, following, videos, likes)
- Privacy settings and verification status

#### 2. Followers (`follows`)
- Many-to-many relationship for user follows
- Triggers auto-update follower/following counts

#### 3. Videos (`videos`)
- Video metadata and content URLs
- Engagement stats (views, likes, comments, shares)
- Trending score for algorithmic feed
- Location data (optional)

### Engagement Tables

#### 4. Likes (`likes`)
- User-video like relationships
- Triggers auto-update video like counts

#### 5. Comments (`comments`)
- Nested comments (replies supported via `parent_id`)
- Soft delete support
- Pinned comments

#### 6. Shares (`shares`)
- Track video shares by platform
- Share type enum: copy_link, whatsapp, instagram, twitter, facebook, other

#### 7. Saved Videos (`saved_videos`)
- User bookmarks with collections
- Default collection support

### Content Organization

#### 8. Hashtags (`hashtags`)
- Global hashtag registry with video counts
- Trigram index for search

#### 9. Video Hashtags (`video_hashtags`)
- Junction table linking videos to hashtags

### Algorithm & Feed

#### 10. User Interactions (`user_interactions`)
- Tracks all user actions for ML/recommendations
- Actions: view, like, comment, share, save, dismiss, report
- Watch time and completion rate for engagement scoring

#### 11. User Feed Preferences (`user_feed_preferences`)
- Personalized algorithm weights
- Content filters (min/max duration)
- Blocked users/hashtags

### Analytics

#### 12. Video Views (`video_views`)
- Granular view tracking
- Watch time and completion rate
- Session-based deduplication

#### 13. Video Stats Hourly (`video_stats_hourly`)
- Time-series aggregation for dashboards
- Hourly buckets with engagement metrics

#### 14. User Stats Daily (`user_stats_daily`)
- Daily aggregated user performance
- New followers, views received, uploads

#### 15. Trending Videos (`trending_videos`)
- Pre-computed trending content
- Rank positions with time windows

### System

#### 16. Notifications (`notifications`)
- User notification feed
- Types: like, comment, follow, mention, video_from_following, trending
- Read/unread status

#### 17. Content Reports (`content_reports`)
- Moderation system for reported content
- Status tracking: pending, reviewing, resolved, dismissed

## 🔑 Key Features

### Performance Optimizations

1. **Denormalized Counters**: Pre-computed counts on users and videos
2. **Strategic Indexes**: 
   - B-tree for equality and range queries
   - GIN with trigram for text search
   - Partial indexes for filtered queries
3. **Partitioning Ready**: Time-series tables designed for partitioning
4. **Materialized Views**: `video_feed` and `user_profiles` for fast reads

### Triggers (Auto-Maintenance)

- `follow_counts_trigger`: Updates follower/following counts
- `likes_count_trigger`: Updates video like counts
- `comments_count_trigger`: Updates video comment counts
- `shares_count_trigger`: Updates video share counts
- `user_videos_count_trigger`: Updates user's video count
- `hashtag_count_trigger`: Updates hashtag video counts

### Algorithm Support

- **Trending Score**: Computed formula combining engagement metrics
- **User Interactions**: Full action history for ML training
- **Feed Preferences**: Per-user algorithm weights
- **Completion Rate**: Video watch percentage tracking

## 🚀 Usage

### Setup

```bash
# Create database
createdb callit

# Load schema
psql -d callit -f schema.sql

# Load seed data (optional)
psql -d callit -f seed.sql
```

### Common Operations

See `queries.sql` for optimized queries including:
- User profile lookups
- Feed generation (chronological & algorithmic)
- Video search and recommendations
- Analytics aggregation
- Notification management

## 📊 Scaling Considerations

### Read Replicas
- All SELECT queries can be routed to replicas
- Write operations go to primary

### Partitioning
- `video_stats_hourly`: Partition by `hour_bucket`
- `user_stats_daily`: Partition by `date_bucket`
- `video_views`: Partition by `created_at`

### Archival Strategy
- Move old `video_views` to cold storage after 90 days
- Aggregate into `video_stats_hourly` before archival

### Caching Layers
- User profiles: Cache for 5 minutes
- Video metadata: Cache for 1 hour
- Trending feed: Cache for 15 minutes
- Feed queries: Cache per user for 2 minutes

## 🔒 Security

- Passwords stored as bcrypt hashes
- IP addresses hashed in `video_views`
- Soft deletes for content moderation
- Row-level security ready (add policies as needed)
