from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class PayoutStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class PayoutMethod(str, Enum):
    PAYPAL = "paypal"
    BANK_TRANSFER = "bank_transfer"
    GIFT_CARD = "gift_card"
    CRYPTO = "crypto"


class PayoutBase(BaseModel):
    sparks_amount: int = Field(..., gt=0)
    payout_method: PayoutMethod
    payout_details: str  # JSON string with method-specific details


class PayoutCreate(PayoutBase):
    brand_pool_id: Optional[str] = None


class PayoutResponse(PayoutBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    brand_pool_id: Optional[str] = None
    conversion_rate: float
    payout_amount: float
    currency: str
    status: PayoutStatus
    processed_at: Optional[datetime] = None
    transaction_id: Optional[str] = None
    failure_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class Payout(PayoutBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    brand_pool_id: Optional[str] = None
    conversion_rate: float
    payout_amount: float
    currency: str
    status: PayoutStatus
    processed_at: Optional[datetime] = None
    processed_by: Optional[str] = None
    transaction_id: Optional[str] = None
    failure_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class PayoutStats(BaseModel):
    total_payouts: int
    total_amount: float
    pending_payouts: int
    pending_amount: float
    currency: str
