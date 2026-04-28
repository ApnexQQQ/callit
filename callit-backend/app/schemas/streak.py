from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, ConfigDict


class StreakBonusBase(BaseModel):
    streak_day: int
    bonus_date: date
    base_amount: int
    multiplier: float
    total_bonus: int


class StreakBonusResponse(StreakBonusBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    claimed: bool
    claimed_at: Optional[datetime] = None
    created_at: datetime


class StreakStatus(BaseModel):
    current_streak: int
    longest_streak: int
    streak_multiplier: float
    last_prediction_date: Optional[datetime] = None
    today_bonus_available: bool
    today_bonus_amount: int
    next_milestone: int  # Next streak day with bonus
    next_milestone_bonus: int


class StreakBonus(StreakBonusBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    claimed: bool
    claimed_at: Optional[datetime] = None
    transaction_id: Optional[str] = None
    created_at: datetime


class DailyCheckInResponse(BaseModel):
    success: bool
    streak_day: int
    bonus_earned: int
    new_balance: int
    message: str
