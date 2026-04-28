from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy import select, update, desc, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.brand_pool import BrandPool, PoolStatus


class BrandPoolRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, pool_id: str) -> Optional[BrandPool]:
        result = await self.db.execute(
            select(BrandPool).where(BrandPool.id == pool_id)
        )
        return result.scalar_one_or_none()
    
    async def get_active_pools(self, limit: int = 20) -> List[BrandPool]:
        now = datetime.now(timezone.utc)
        result = await self.db.execute(
            select(BrandPool)
            .where(
                and_(
                    BrandPool.status == PoolStatus.ACTIVE,
                    BrandPool.starts_at <= now,
                    BrandPool.ends_at >= now
                )
            )
            .order_by(desc(BrandPool.total_pool_sparks))
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_all_pools(
        self,
        status: Optional[PoolStatus] = None,
        limit: int = 20,
        offset: int = 0
    ) -> List[BrandPool]:
        query = select(BrandPool)
        
        if status:
            query = query.where(BrandPool.status == status)
        
        query = query.order_by(desc(BrandPool.created_at)).limit(limit).offset(offset)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def create(self, pool: BrandPool) -> BrandPool:
        self.db.add(pool)
        await self.db.flush()
        await self.db.refresh(pool)
        return pool
    
    async def update(self, pool: BrandPool) -> BrandPool:
        await self.db.flush()
        await self.db.refresh(pool)
        return pool
    
    async def update_status(self, pool_id: str, status: PoolStatus) -> bool:
        result = await self.db.execute(
            update(BrandPool)
            .where(BrandPool.id == pool_id)
            .values(status=status)
        )
        return result.rowcount > 0
    
    async def decrement_remaining_sparks(self, pool_id: str, amount: int) -> bool:
        result = await self.db.execute(
            update(BrandPool)
            .where(BrandPool.id == pool_id)
            .values(remaining_sparks=BrandPool.remaining_sparks - amount)
        )
        return result.rowcount > 0
    
    async def increment_participants(self, pool_id: str) -> bool:
        result = await self.db.execute(
            update(BrandPool)
            .where(BrandPool.id == pool_id)
            .values(
                total_participants=BrandPool.total_participants + 1,
                total_predictions=BrandPool.total_predictions + 1
            )
        )
        return result.rowcount > 0
    
    async def get_pools_ending_soon(self, hours: int = 24) -> List[BrandPool]:
        """Get pools ending within the next N hours."""
        now = datetime.now(timezone.utc)
        from datetime import timedelta
        future = now + timedelta(hours=hours)
        
        result = await self.db.execute(
            select(BrandPool)
            .where(
                and_(
                    BrandPool.status == PoolStatus.ACTIVE,
                    BrandPool.ends_at <= future,
                    BrandPool.ends_at >= now
                )
            )
        )
        return result.scalars().all()
    
    async def get_pools_starting_soon(self, hours: int = 24) -> List[BrandPool]:
        """Get pools starting within the next N hours."""
        now = datetime.now(timezone.utc)
        from datetime import timedelta
        future = now + timedelta(hours=hours)
        
        result = await self.db.execute(
            select(BrandPool)
            .where(
                and_(
                    BrandPool.status == PoolStatus.DRAFT,
                    BrandPool.starts_at <= future,
                    BrandPool.starts_at >= now
                )
            )
        )
        return result.scalars().all()
