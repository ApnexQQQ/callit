from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    display_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = None


class UserStats(BaseModel):
    total_predictions: int
    correct_predictions: int
    accuracy_rate: float
    followers_count: int
    following_count: int
    current_streak: int
    longest_streak: int
    sparks_balance: int


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    is_verified: bool
    stats: UserStats
    created_at: datetime
    
    @classmethod
    def from_orm(cls, user):
        stats = UserStats(
            total_predictions=user.total_predictions,
            correct_predictions=user.correct_predictions,
            accuracy_rate=user.accuracy_rate,
            followers_count=user.followers_count,
            following_count=user.following_count,
            current_streak=user.current_streak,
            longest_streak=user.longest_streak,
            sparks_balance=user.sparks_balance
        )
        return cls(
            id=user.id,
            email=user.email,
            username=user.username,
            display_name=user.display_name,
            bio=user.bio,
            avatar_url=user.avatar_url,
            is_verified=user.is_verified,
            stats=stats,
            created_at=user.created_at
        )


class User(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    google_id: Optional[str] = None
    sparks_balance: int
    current_streak: int
    longest_streak: int
    streak_multiplier: float
    total_predictions: int
    correct_predictions: int
    accuracy_rate: float
    followers_count: int
    following_count: int
    is_active: bool
    is_verified: bool
    is_admin: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None


class UserPublic(BaseModel):
    """Public user info (for other users viewing profiles)."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    username: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    stats: UserStats
    is_verified: bool
    created_at: datetime
