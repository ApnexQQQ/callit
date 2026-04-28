# CallIt Database - Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                    USERS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK  id                    UUID                                              │
│     username              VARCHAR(30) UNIQUE                                │
│     email                 VARCHAR(255) UNIQUE                               │
│     password_hash         VARCHAR(255)                                      │
│     display_name          VARCHAR(50)                                       │
│     bio                   TEXT                                              │
│     avatar_url            TEXT                                              │
│     is_verified           BOOLEAN                                           │
│     is_active             BOOLEAN                                           │
│     is_private            BOOLEAN                                           │
│     followers_count       INTEGER                                           │
│     following_count       INTEGER                                           │
│     videos_count          INTEGER                                           │
│     total_likes_received  BIGINT                                            │
│     created_at            TIMESTAMPTZ                                       │
└──────────────────┬──────────────────────────────────────────────────────────┘
                   │
                   │ 1:N
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                   VIDEOS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK  id                    UUID                                              │
│ FK  user_id               UUID → users.id                                   │
│     video_url             TEXT                                              │
│     thumbnail_url         TEXT                                              │
│     caption               TEXT                                              │
│     duration_seconds      INTEGER                                           │
│     width/height          INTEGER                                           │
│     views_count           BIGINT                                            │
│     likes_count           INTEGER                                           │
│     comments_count        INTEGER                                           │
│     shares_count          INTEGER                                           │
│     trending_score        DOUBLE                                            │
│     is_public             BOOLEAN                                           │
│     status                VARCHAR(20)                                       │
│     created_at            TIMESTAMPTZ                                       │
└──────────────────┬───────────────────────┬──────────────────────────────────┘
                   │                       │
         ┌─────────┴─────────┐             │ N:M
         │ 1:N               │ 1:N         │
         ▼                   ▼             ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────────────┐
│     LIKES       │  │    COMMENTS     │  │          VIDEO_HASHTAGS             │
├─────────────────┤  ├─────────────────┤  ├─────────────────────────────────────┤
│ PK id           │  │ PK id           │  │ PK id                               │
│ FK user_id      │  │ FK video_id     │  │ FK video_id → videos.id             │
│ FK video_id     │  │ FK user_id      │  │ FK hashtag_id → hashtags.id         │
│ created_at      │  │ FK parent_id    │  │ created_at                          │
└─────────────────┘  │ content         │  └─────────────────────────────────────┘
                     │ likes_count     │                    │
                     │ is_pinned       │                    │ N:1
                     │ created_at      │                    │
                     └─────────────────┘                    ▼
                                            ┌─────────────────────────────────────┐
                                            │           HASHTAGS                  │
                                            ├─────────────────────────────────────┤
                                            │ PK id                               │
                                            │ name                VARCHAR(100)    │
                                            │ videos_count        INTEGER         │
                                            │ created_at          TIMESTAMPTZ     │
                                            └─────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                                   FOLLOWS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK  id                    UUID                                              │
│ FK  follower_id           UUID → users.id                                   │
│ FK  following_id          UUID → users.id                                   │
│     created_at            TIMESTAMPTZ                                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                                   SHARES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK  id                    UUID                                              │
│ FK  user_id               UUID → users.id                                   │
│ FK  video_id              UUID → videos.id                                  │
│     share_type            VARCHAR(20)                                       │
│     created_at            TIMESTAMPTZ                                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                                SAVED_VIDEOS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK  id                    UUID                                              │
│ FK  user_id               UUID → users.id                                   │
│ FK  video_id              UUID → videos.id                                  │
│     collection_name       VARCHAR(100)                                      │
│     created_at            TIMESTAMPTZ                                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              VIDEO_VIEWS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK  id                    UUID                                              │
│ FK  video_id              UUID → videos.id                                  │
│ FK  user_id               UUID → users.id (nullable)                        │
│     watch_time_seconds    INTEGER                                           │
│     completion_rate       DECIMAL                                           │
│     session_id            VARCHAR(64)                                       │
│     ip_hash               VARCHAR(64)                                       │
│     created_at            TIMESTAMPTZ                                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER_INTERACTIONS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK  id                    UUID                                              │
│ FK  user_id               UUID → users.id                                   │
│ FK  video_id              UUID → videos.id                                  │
│     action                VARCHAR(20)                                       │
│     watch_duration_seconds INTEGER                                          │
│     completion_rate       DECIMAL                                           │
│     weight                DECIMAL                                           │
│     created_at            TIMESTAMPTZ                                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER_FEED_PREFERENCES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK  id                    UUID                                              │
│ FK  user_id               UUID → users.id UNIQUE                            │
│     preferred_hashtags    UUID[]                                            │
│     blocked_hashtags      UUID[]                                            │
│     blocked_users         UUID[]                                            │
│     recency_weight        DECIMAL                                           │
│     popularity_weight     DECIMAL                                           │
│     following_weight      DECIMAL                                           │
│     updated_at            TIMESTAMPTZ                                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              NOTIFICATIONS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK  id                    UUID                                              │
│ FK  recipient_id          UUID → users.id                                   │
│ FK  sender_id             UUID → users.id (nullable)                        │
│     type                  VARCHAR(30)                                       │
│     reference_type        VARCHAR(20)                                       │
│     reference_id          UUID                                              │
│     message               TEXT                                              │
│     is_read               BOOLEAN                                           │
│     created_at            TIMESTAMPTZ                                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           VIDEO_STATS_HOURLY                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK  id                    UUID                                              │
│ FK  video_id              UUID → videos.id                                  │
│     hour_bucket           TIMESTAMPTZ                                       │
│     views_count           INTEGER                                           │
│     likes_count           INTEGER                                           │
│     comments_count        INTEGER                                           │
│     shares_count          INTEGER                                           │
│     total_watch_time_seconds BIGINT                                         │
│     avg_completion_rate   DECIMAL                                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            USER_STATS_DAILY                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK  id                    UUID                                              │
│ FK  user_id               UUID → users.id                                   │
│     date_bucket           DATE                                              │
│     videos_uploaded       INTEGER                                           │
│     total_views_received  BIGINT                                            │
│     new_followers         INTEGER                                           │
│     new_following         INTEGER                                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                             TRENDING_VIDEOS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK  id                    UUID                                              │
│ FK  video_id              UUID → videos.id                                  │
│     score                 DOUBLE PRECISION                                  │
│     rank_position         INTEGER                                           │
│     period_start          TIMESTAMPTZ                                       │
│     period_end            TIMESTAMPTZ                                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            CONTENT_REPORTS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ PK  id                    UUID                                              │
│ FK  reporter_id           UUID → users.id                                   │
│ FK  reported_user_id      UUID → users.id (nullable)                        │
│ FK  reported_video_id     UUID → videos.id (nullable)                       │
│ FK  reported_comment_id   UUID → comments.id (nullable)                     │
│     reason                VARCHAR(50)                                       │
│     description           TEXT                                              │
│     status                VARCHAR(20)                                       │
│     resolution            TEXT                                              │
│     created_at            TIMESTAMPTZ                                       │
│     resolved_at           TIMESTAMPTZ                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Relationships Summary

| Table | Relationships |
|-------|--------------|
| users | 1:N videos, 1:N follows (as follower), 1:N follows (as following), 1:N likes, 1:N comments |
| videos | N:1 users, 1:N likes, 1:N comments, 1:N shares, N:M hashtags |
| follows | N:1 users (follower), N:1 users (following) |
| comments | N:1 videos, N:1 users, N:1 comments (parent) |
| likes | N:1 users, N:1 videos |
| hashtags | N:M videos |
