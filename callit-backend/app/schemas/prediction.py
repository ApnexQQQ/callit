from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class PredictionStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    RESOLVED_TRUE = "resolved_true"
    RESOLVED_FALSE = "resolved_false"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class PredictionBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=280)
    description: Optional[str] = Field(None, max_length=2000)
    category: Optional[str] = Field(None, max_length=50)
    tags: Optional[List[str]] = None
    resolution_criteria: Optional[str] = Field(None, max_length=1000)
    expires_at: Optional[datetime] = None
    confidence_score: float = Field(50.0, ge=0, le=100)


class PredictionCreate(PredictionBase):
    pass


class PredictionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=280)
    description: Optional[str] = Field(None, max_length=2000)
    category: Optional[str] = Field(None, max_length=50)
    tags: Optional[List[str]] = None
    resolution_criteria: Optional[str] = Field(None, max_length=1000)
    expires_at: Optional[datetime] = None


class PredictionResolution(BaseModel):
    outcome: bool  # True = prediction was correct, False = incorrect
    resolution_notes: Optional[str] = None


class PredictionResponse(PredictionBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    status: PredictionStatus
    resolution_date: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    views_count: int
    reactions_count: int
    comments_count: int
    shares_count: int
    community_accuracy: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    
    # User info (for feed)
    user: Optional[dict] = None
    
    # User's reaction (if authenticated)
    user_reaction: Optional[str] = None


class PredictionFeedItem(BaseModel):
    """Simplified prediction for feed display."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    title: str
    thumbnail_url: Optional[str] = None
    video_url: Optional[str] = None
    status: PredictionStatus
    category: Optional[str] = None
    views_count: int
    reactions_count: int
    created_at: datetime
    user: dict  # Minimal user info
    
    # Feed algorithm score
    feed_score: float


class Prediction(PredictionBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    status: PredictionStatus
    resolution_date: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    views_count: int
    reactions_count: int
    comments_count: int
    shares_count: int
    community_accuracy: Optional[float] = None
    created_at: datetime
    updated_at: datetime
