from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ReactionType(str, Enum):
    AGREE = "agree"
    DISAGREE = "disagree"
    FIRE = "fire"
    THINKING = "thinking"


class ReactionBase(BaseModel):
    reaction_type: ReactionType


class ReactionCreate(ReactionBase):
    prediction_id: str


class ReactionUpdate(ReactionBase):
    pass


class ReactionResponse(ReactionBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    prediction_id: str
    was_correct: Optional[bool] = None
    sparks_earned: int
    created_at: datetime
    updated_at: datetime


class Reaction(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    prediction_id: str
    reaction_type: ReactionType
    was_correct: Optional[bool] = None
    sparks_earned: int
    created_at: datetime
    updated_at: datetime
