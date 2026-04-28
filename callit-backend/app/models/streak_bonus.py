import uuid
from datetime import datetime, timezone, date
from typing import Optional

from sqlalchemy import Column, String, Integer, DateTime, Date, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.core.database import Base


class StreakBonus(Base):
    __tablename__ = "streak_bonuses"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Streak info
    streak_day = Column(Integer, nullable=False)  # Day number in streak (1, 2, 3...)
    bonus_date = Column(Date, nullable=False, index=True)
    
    # Bonus calculation
    base_amount = Column(Integer, nullable=False)
    multiplier = Column(Float, nullable=False)
    total_bonus = Column(Integer, nullable=False)
    
    # Status
    claimed = Column(Boolean, default=False, nullable=False)
    claimed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Related transaction
    transaction_id = Column(String(36), ForeignKey("sparks_transactions.id", ondelete="SET NULL"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="streak_bonuses")
    transaction = relationship("SparksTransaction")
    
    def __repr__(self):
        return f"<StreakBonus(user={self.user_id}, day={self.streak_day}, bonus={self.total_bonus})>"
