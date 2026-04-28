import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum
from typing import Optional

from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base


class TransactionType(str, PyEnum):
    # Earnings
    DAILY_BONUS = "daily_bonus"
    STREAK_BONUS = "streak_bonus"
    CORRECT_PREDICTION = "correct_prediction"
    REACTION_REWARD = "reaction_reward"
    REFERRAL = "referral"
    BRAND_POOL_WIN = "brand_pool_win"
    
    # Spending
    CREATE_PREDICTION = "create_prediction"
    BOOST_PREDICTION = "boost_prediction"
    
    # Other
    PAYOUT = "payout"
    ADJUSTMENT = "adjustment"


class SparksTransaction(Base):
    __tablename__ = "sparks_transactions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    transaction_type = Column(Enum(TransactionType), nullable=False, index=True)
    amount = Column(Integer, nullable=False)  # Positive for credit, negative for debit
    balance_after = Column(Integer, nullable=False)
    
    # Related entities
    prediction_id = Column(String(36), ForeignKey("predictions.id", ondelete="SET NULL"), nullable=True)
    reaction_id = Column(String(36), ForeignKey("reactions.id", ondelete="SET NULL"), nullable=True)
    brand_pool_id = Column(String(36), ForeignKey("brand_pools.id", ondelete="SET NULL"), nullable=True)
    payout_id = Column(String(36), ForeignKey("payouts.id", ondelete="SET NULL"), nullable=True)
    
    # Metadata
    description = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True)  # JSON for additional data
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="sparks_transactions")
    prediction = relationship("Prediction")
    reaction = relationship("Reaction")
    brand_pool = relationship("BrandPool")
    payout = relationship("Payout")
    
    def __repr__(self):
        return f"<SparksTransaction(user={self.user_id}, type={self.transaction_type}, amount={self.amount})>"
