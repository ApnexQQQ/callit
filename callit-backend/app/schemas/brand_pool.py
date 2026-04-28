from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class PoolStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    CLOSED = "closed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class BrandPoolBase(BaseModel):
    brand_name: str = Field(..., max_length=100)
    brand_logo_url: Optional[str] = None
    brand_website: Optional[str] = None
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    category: Optional[str] = None
    total_pool_sparks: int = Field(..., gt=0)
    min_predictions: int = Field(default=1, ge=1)
    required_category: Optional[str] = None
    starts_at: datetime
    ends_at: datetime


class BrandPoolCreate(BrandPoolBase):
    pass


class BrandPoolUpdate(BaseModel):
    brand_name: Optional[str] = Field(None, max_length=100)
    brand_logo_url: Optional[str] = None
    brand_website: Optional[str] = None
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    category: Optional[str] = None
    min_predictions: Optional[int] = Field(None, ge=1)
    required_category: Optional[str] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None


class BrandPoolResponse(BrandPoolBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    status: PoolStatus
    remaining_sparks: int
    total_participants: int
    total_predictions: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None


class BrandPool(BrandPoolBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    status: PoolStatus
    remaining_sparks: int
    total_participants: int
    total_predictions: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None


class PoolLeaderboardEntry(BaseModel):
    user_id: str
    username: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    predictions_count: int
    correct_predictions: int
    accuracy_rate: float
    sparks_won: int
    rank: int
