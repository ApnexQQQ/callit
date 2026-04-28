from typing import List, Optional
from sqlalchemy import select, update, delete, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.reaction import Reaction, ReactionType


class ReactionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, reaction_id: str) -> Optional[Reaction]:
        result = await self.db.execute(
            select(Reaction).where(Reaction.id == reaction_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_user_and_prediction(
        self,
        user_id: str,
        prediction_id: str
    ) -> Optional[Reaction]:
        result = await self.db.execute(
            select(Reaction)
            .where(
                and_(
                    Reaction.user_id == user_id,
                    Reaction.prediction_id == prediction_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_by_prediction(self, prediction_id: str) -> List[Reaction]:
        result = await self.db.execute(
            select(Reaction).where(Reaction.prediction_id == prediction_id)
        )
        return result.scalars().all()
    
    async def get_by_user(self, user_id: str, limit: int = 50) -> List[Reaction]:
        result = await self.db.execute(
            select(Reaction)
            .where(Reaction.user_id == user_id)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def create(self, reaction: Reaction) -> Reaction:
        self.db.add(reaction)
        await self.db.flush()
        await self.db.refresh(reaction)
        return reaction
    
    async def update(self, reaction: Reaction) -> Reaction:
        await self.db.flush()
        await self.db.refresh(reaction)
        return reaction
    
    async def delete(self, reaction: Reaction) -> bool:
        await self.db.delete(reaction)
        await self.db.flush()
        return True
    
    async def delete_by_user_and_prediction(self, user_id: str, prediction_id: str) -> bool:
        result = await self.db.execute(
            delete(Reaction)
            .where(
                and_(
                    Reaction.user_id == user_id,
                    Reaction.prediction_id == prediction_id
                )
            )
        )
        return result.rowcount > 0
    
    async def count_by_prediction(self, prediction_id: str) -> dict:
        """Get reaction counts by type for a prediction."""
        result = await self.db.execute(
            select(Reaction.reaction_type, Reaction.id)
            .where(Reaction.prediction_id == prediction_id)
        )
        reactions = result.all()
        
        counts = {rt.value: 0 for rt in ReactionType}
        for reaction_type, _ in reactions:
            counts[reaction_type.value] += 1
        return counts
    
    async def update_was_correct(
        self,
        prediction_id: str,
        outcome: bool
    ) -> int:
        """Update was_correct field for all reactions on a prediction."""
        # For agree/fire reactions, was_correct = outcome
        # For disagree reactions, was_correct = not outcome
        result = await self.db.execute(
            update(Reaction)
            .where(Reaction.prediction_id == prediction_id)
            .values(was_correct=outcome)
        )
        return result.rowcount
