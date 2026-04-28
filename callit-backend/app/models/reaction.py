import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum
from typing import Optional

from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class ReactionType(str, PyEnum):
    AGREE = "agree"
    DISAGREE = "disagree"
    FIRE = "fire"
    THINKING = "thinking"


class Reaction(Base):
    __tablename__ = "reactions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    prediction_id = Column(String(36), ForeignKey("predictions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    reaction_type = Column(Enum(ReactionType), nullable=False)
    
    # For predictions that get resolved
    was_correct = Column(Boolean, nullable=True)  # Did this reaction align with outcome?
    sparks_earned = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="reactions")
    prediction = relationship("Prediction", back_populates="reactions")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'prediction_id', name='unique_user_prediction_reaction'),
    )
    
    def __repr__(self):
        return f"<Reaction(user={self.user_id}, prediction={self.prediction_id}, type={self.reaction_type})>"
