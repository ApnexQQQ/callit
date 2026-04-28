from typing import List, Optional
from datetime import datetime, date, timezone
from sqlalchemy import select, desc, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.sparks_transaction import SparksTransaction, TransactionType
from app.models.streak_bonus import StreakBonus


class SparksRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_transaction(self, transaction: SparksTransaction) -> SparksTransaction:
        self.db.add(transaction)
        await self.db.flush()
        await self.db.refresh(transaction)
        return transaction
    
    async def get_transactions_by_user(
        self,
        user_id: str,
        limit: int = 50,
        offset: int = 0,
        transaction_type: Optional[TransactionType] = None
    ) -> List[SparksTransaction]:
        query = select(SparksTransaction).where(SparksTransaction.user_id == user_id)
        
        if transaction_type:
            query = query.where(SparksTransaction.transaction_type == transaction_type)
        
        query = query.order_by(desc(SparksTransaction.created_at)).limit(limit).offset(offset)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def count_transactions_by_user(
        self,
        user_id: str,
        transaction_type: Optional[TransactionType] = None
    ) -> int:
        query = select(func.count(SparksTransaction.id)).where(SparksTransaction.user_id == user_id)
        
        if transaction_type:
            query = query.where(SparksTransaction.transaction_type == transaction_type)
        
        result = await self.db.execute(query)
        return result.scalar()
    
    async def get_transaction_by_id(self, transaction_id: str) -> Optional[SparksTransaction]:
        result = await self.db.execute(
            select(SparksTransaction).where(SparksTransaction.id == transaction_id)
        )
        return result.scalar_one_or_none()
    
    async def get_user_stats(self, user_id: str) -> dict:
        """Get sparks statistics for a user."""
        # Total earned (positive amounts)
        earned_result = await self.db.execute(
            select(func.sum(SparksTransaction.amount))
            .where(
                and_(
                    SparksTransaction.user_id == user_id,
                    SparksTransaction.amount > 0
                )
            )
        )
        total_earned = earned_result.scalar() or 0
        
        # Total spent (negative amounts)
        spent_result = await self.db.execute(
            select(func.sum(func.abs(SparksTransaction.amount)))
            .where(
                and_(
                    SparksTransaction.user_id == user_id,
                    SparksTransaction.amount < 0
                )
            )
        )
        total_spent = spent_result.scalar() or 0
        
        # Pending payout
        pending_result = await self.db.execute(
            select(func.sum(func.abs(SparksTransaction.amount)))
            .where(
                and_(
                    SparksTransaction.user_id == user_id,
                    SparksTransaction.transaction_type == TransactionType.PAYOUT
                )
            )
        )
        pending_payout = pending_result.scalar() or 0
        
        return {
            "total_earned": total_earned,
            "total_spent": total_spent,
            "pending_payout": pending_payout
        }
    
    # Streak Bonus Methods
    
    async def get_streak_bonus(self, bonus_id: str) -> Optional[StreakBonus]:
        result = await self.db.execute(
            select(StreakBonus).where(StreakBonus.id == bonus_id)
        )
        return result.scalar_one_or_none()
    
    async def get_streak_bonus_by_user_and_date(
        self,
        user_id: str,
        bonus_date: date
    ) -> Optional[StreakBonus]:
        result = await self.db.execute(
            select(StreakBonus)
            .where(
                and_(
                    StreakBonus.user_id == user_id,
                    StreakBonus.bonus_date == bonus_date
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_streak_bonuses_by_user(
        self,
        user_id: str,
        limit: int = 30
    ) -> List[StreakBonus]:
        result = await self.db.execute(
            select(StreakBonus)
            .where(StreakBonus.user_id == user_id)
            .order_by(desc(StreakBonus.bonus_date))
            .limit(limit)
        )
        return result.scalars().all()
    
    async def create_streak_bonus(self, bonus: StreakBonus) -> StreakBonus:
        self.db.add(bonus)
        await self.db.flush()
        await self.db.refresh(bonus)
        return bonus
    
    async def has_claimed_daily_bonus(self, user_id: str, bonus_date: date) -> bool:
        result = await self.db.execute(
            select(StreakBonus)
            .where(
                and_(
                    StreakBonus.user_id == user_id,
                    StreakBonus.bonus_date == bonus_date,
                    StreakBonus.claimed == True
                )
            )
        )
        return result.scalar_one_or_none() is not None
