from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class TransactionType(str, Enum):
    DAILY_BONUS = "daily_bonus"
    STREAK_BONUS = "streak_bonus"
    CORRECT_PREDICTION = "correct_prediction"
    REACTION_REWARD = "reaction_reward"
    REFERRAL = "referral"
    BRAND_POOL_WIN = "brand_pool_win"
    CREATE_PREDICTION = "create_prediction"
    BOOST_PREDICTION = "boost_prediction"
    PAYOUT = "payout"
    ADJUSTMENT = "adjustment"


class SparksTransactionBase(BaseModel):
    transaction_type: TransactionType
    amount: int
    description: Optional[str] = None


class SparksTransactionResponse(SparksTransactionBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    balance_after: int
    prediction_id: Optional[str] = None
    reaction_id: Optional[str] = None
    brand_pool_id: Optional[str] = None
    payout_id: Optional[str] = None
    created_at: datetime


class SparksTransaction(SparksTransactionBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    balance_after: int
    prediction_id: Optional[str] = None
    reaction_id: Optional[str] = None
    brand_pool_id: Optional[str] = None
    payout_id: Optional[str] = None
    metadata_json: Optional[str] = None
    created_at: datetime


class SparksBalance(BaseModel):
    balance: int
    total_earned: int
    total_spent: int
    pending_payout: int


class SparksEarnRequest(BaseModel):
    action: str  # e.g., "daily_login", "watch_ad", "complete_challenge"
    metadata: Optional[Dict[str, Any]] = None


class SparksHistoryResponse(BaseModel):
    transactions: list[SparksTransactionResponse]
    total_count: int
    page: int
    page_size: int
