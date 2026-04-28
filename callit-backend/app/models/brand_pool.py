import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum
from typing import List, Optional

from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base


class PoolStatus(str, PyEnum):
    DRAFT = "draft"
    ACTIVE = "active"
    CLOSED = "closed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class BrandPool(Base):
    __tablename__ = "brand_pools"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Brand info
    brand_name = Column(String(100), nullable=False)
    brand_logo_url = Column(String(500), nullable=True)
    brand_website = Column(String(500), nullable=True)
    
    # Pool details
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=True)
    
    # Prize pool
    total_pool_sparks = Column(Integer, nullable=False)
    remaining_sparks = Column(Integer, nullable=False)
    
    # Requirements
    min_predictions = Column(Integer, default=1, nullable=False)
    required_category = Column(String(50), nullable=True)
    
    # Status
    status = Column(Enum(PoolStatus), default=PoolStatus.DRAFT, nullable=False, index=True)
    
    # Dates
    starts_at = Column(DateTime(timezone=True), nullable=False)
    ends_at = Column(DateTime(timezone=True), nullable=False)
    
    # Stats
    total_participants = Column(Integer, default=0, nullable=False)
    total_predictions = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    created_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Relationships
    payouts = relationship("Payout", back_populates="brand_pool", cascade="all, delete-orphan")
    sparks_transactions = relationship("SparksTransaction", back_populates="brand_pool")
    
    def __repr__(self):
        return f"<BrandPool(brand={self.brand_name}, pool={self.total_pool_sparks}, status={self.status})>"
    
    def is_active(self) -> bool:
        now = datetime.now(timezone.utc)
        return self.status == PoolStatus.ACTIVE and self.starts_at <= now <= self.ends_at
