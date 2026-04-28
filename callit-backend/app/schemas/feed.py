from datetime import datetime
from typing import Optional, List
from enum import Enum
from pydantic import BaseModel


class FeedType(str, Enum):
    FOR_YOU = "for_you"
    FOLLOWING = "following"
    TRENDING = "trending"
    RECENT = "recent"
    CATEGORY = "category"


class FeedRequest(BaseModel):
    feed_type: FeedType = FeedType.FOR_YOU
    category: Optional[str] = None
    cursor: Optional[str] = None  # Pagination cursor
    limit: int = 20


class FeedUser(BaseModel):
    id: str
    username: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_verified: bool


class FeedPrediction(BaseModel):
    id: str
    title: str
    thumbnail_url: Optional[str] = None
    video_url: Optional[str] = None
    status: str
    category: Optional[str] = None
    views_count: int
    reactions_count: int
    comments_count: int
    created_at: datetime
    user: FeedUser


class FeedItem(BaseModel):
    prediction: FeedPrediction
    score: float
    reason: Optional[str] = None  # Why this item is in the feed


class FeedResponse(BaseModel):
    items: List[FeedItem]
    next_cursor: Optional[str] = None
    has_more: bool
    total_count: Optional[int] = None