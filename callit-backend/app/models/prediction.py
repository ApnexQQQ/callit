import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum
from typing import List, Optional

from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base


class PredictionStatus(str, PyEnum):
    PENDING = "pending"
    ACTIVE = "active"
    RESOLVED_TRUE = "resolved_true"
    RESOLVED_FALSE = "resolved_false"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Content
    title = Column(String(280), nullable=False)
    description = Column(Text, nullable=True)
    video_url = Column(String(500), nullable=True)  # URL to stored video
    thumbnail_url = Column(String(500), nullable=True)
    
    # Prediction details
    category = Column(String(50), nullable=True, index=True)
    tags = Column(String(500), nullable=True)  # Comma-separated tags
    
    # Resolution
    status = Column(Enum(PredictionStatus), default=PredictionStatus.PENDING, nullable=False, index=True)
    resolution_criteria = Column(Text, nullable=True)
    resolution_date = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Engagement
    views_count = Column(Integer, default=0, nullable=False)
    reactions_count = Column(Integer, default=0, nullable=False)
    comments_count = Column(Integer, default=0, nullable=False)
    shares_count = Column(Integer, default=0, nullable=False)
    
    # Scoring
    confidence_score = Column(Float, default=50.0, nullable=False)  # User's confidence 0-100
    community_accuracy = Column(Float, nullable=True)  # Actual outcome accuracy
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="predictions")
    reactions = relationship("Reaction", back_populates="prediction", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Prediction(id={self.id}, title={self.title[:30]}..., status={self.status})>"
    
    def is_resolved(self) -> bool:
        return self.status in [PredictionStatus.RESOLVED_TRUE, PredictionStatus.RESOLVED_FALSE]
    
    def is_active(self) -> bool:
        return self.status == PredictionStatus.ACTIVE
