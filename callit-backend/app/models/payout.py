import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum
from typing import Optional

from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base


class PayoutStatus(str, PyEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class PayoutMethod(str, PyEnum):
    PAYPAL = "paypal"
    BANK_TRANSFER = "bank_transfer"
    GIFT_CARD = "gift_card"
    CRYPTO = "crypto"


class Payout(Base):
    __tablename__ = "payouts"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    brand_pool_id = Column(String(36), ForeignKey("brand_pools.id", ondelete="SET NULL"), nullable=True)
    
    # Amount
    sparks_amount = Column(Integer, nullable=False)  # Sparks withdrawn
    conversion_rate = Column(Float, nullable=False)  # Sparks to currency rate
    payout_amount = Column(Float, nullable=False)  # Final amount in currency
    currency = Column(String(3), default="USD", nullable=False)
    
    # Method
    payout_method = Column(Enum(PayoutMethod), nullable=False)
    payout_details = Column(Text, nullable=True)  # Encrypted payout info (PayPal email, etc.)
    
    # Status
    status = Column(Enum(PayoutStatus), default=PayoutStatus.PENDING, nullable=False, index=True)
    
    # Processing
    processed_at = Column(DateTime(timezone=True), nullable=True)
    processed_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    transaction_id = Column(String(255), nullable=True)  # External transaction ID
    failure_reason = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="payouts")
    brand_pool = relationship("BrandPool", back_populates="payouts")
    sparks_transaction = relationship("SparksTransaction", back_populates="payout", uselist=False)
    
    def __repr__(self):
        return f"<Payout(user={self.user_id}, amount={self.payout_amount}, status={self.status})>"
