from typing import Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, user_id: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
    
    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
    
    async def get_by_username(self, username: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()
    
    async def get_by_google_id(self, google_id: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.google_id == google_id))
        return result.scalar_one_or_none()
    
    async def create(self, user: User) -> User:
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user
    
    async def update(self, user: User) -> User:
        await self.db.flush()
        await self.db.refresh(user)
        return user
    
    async def update_sparks_balance(self, user_id: str, amount: int) -> bool:
        """Update user's sparks balance. Amount can be positive or negative."""
        result = await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(sparks_balance=User.sparks_balance + amount)
        )
        return result.rowcount > 0
    
    async def update_streak(self, user_id: str, new_streak: int, multiplier: float) -> bool:
        """Update user's streak information."""
        from datetime import datetime, timezone
        result = await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(
                current_streak=new_streak,
                longest_streak=User.longest_streak,  # This needs to be calculated separately
                streak_multiplier=multiplier,
                last_prediction_date=datetime.now(timezone.utc)
            )
        )
        return result.rowcount > 0
    
    async def increment_predictions_count(self, user_id: str, was_correct: bool = False) -> bool:
        """Increment user's prediction count and accuracy."""
        updates = {"total_predictions": User.total_predictions + 1}
        if was_correct:
            updates["correct_predictions"] = User.correct_predictions + 1
        
        result = await self.db.execute(
            update(User).where(User.id == user_id).values(**updates)
        )
        return result.rowcount > 0
    
    async def delete(self, user: User) -> bool:
        await self.db.delete(user)
        await self.db.flush()
        return True
