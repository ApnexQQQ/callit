from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy import select, update, desc, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.prediction import Prediction, PredictionStatus


class PredictionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, prediction_id: str) -> Optional[Prediction]:
        result = await self.db.execute(
            select(Prediction).where(Prediction.id == prediction_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_user(self, user_id: str, limit: int = 20, offset: int = 0) -> List[Prediction]:
        result = await self.db.execute(
            select(Prediction)
            .where(Prediction.user_id == user_id)
            .order_by(desc(Prediction.created_at))
            .limit(limit)
            .offset(offset)
        )
        return result.scalars().all()
    
    async def create(self, prediction: Prediction) -> Prediction:
        self.db.add(prediction)
        await self.db.flush()
        await self.db.refresh(prediction)
        return prediction
    
    async def update(self, prediction: Prediction) -> Prediction:
        await self.db.flush()
        await self.db.refresh(prediction)
        return prediction
    
    async def delete(self, prediction: Prediction) -> bool:
        await self.db.delete(prediction)
        await self.db.flush()
        return True
    
    async def get_feed_predictions(
        self,
        limit: int = 20,
        offset: int = 0,
        status: Optional[PredictionStatus] = None,
        category: Optional[str] = None
    ) -> List[Prediction]:
        query = select(Prediction)
        
        if status:
            query = query.where(Prediction.status == status)
        if category:
            query = query.where(Prediction.category == category)
        
        query = query.order_by(desc(Prediction.created_at)).limit(limit).offset(offset)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_trending_predictions(self, limit: int = 20) -> List[Prediction]:
        """Get predictions sorted by engagement (views + reactions)."""
        result = await self.db.execute(
            select(Prediction)
            .where(Prediction.status == PredictionStatus.ACTIVE)
            .order_by(desc(Prediction.views_count + Prediction.reactions_count * 2))
            .limit(limit)
        )
        return result.scalars().all()
    
    async def increment_views(self, prediction_id: str) -> bool:
        result = await self.db.execute(
            update(Prediction)
            .where(Prediction.id == prediction_id)
            .values(views_count=Prediction.views_count + 1)
        )
        return result.rowcount > 0
    
    async def update_reactions_count(self, prediction_id: str, delta: int = 1) -> bool:
        result = await self.db.execute(
            update(Prediction)
            .where(Prediction.id == prediction_id)
            .values(reactions_count=Prediction.reactions_count + delta)
        )
        return result.rowcount > 0
    
    async def resolve_prediction(
        self,
        prediction_id: str,
        outcome: bool,
        resolved_by: str
    ) -> bool:
        """Resolve a prediction with the outcome."""
        new_status = PredictionStatus.RESOLVED_TRUE if outcome else PredictionStatus.RESOLVED_FALSE
        result = await self.db.execute(
            update(Prediction)
            .where(Prediction.id == prediction_id)
            .values(
                status=new_status,
                resolved_at=datetime.now(timezone.utc),
                resolved_by=resolved_by,
                community_accuracy=100.0 if outcome else 0.0
            )
        )
        return result.rowcount > 0
    
    async def get_expired_predictions(self) -> List[Prediction]:
        """Get predictions that have passed their expiration date."""
        now = datetime.now(timezone.utc)
        result = await self.db.execute(
            select(Prediction)
            .where(
                and_(
                    Prediction.expires_at < now,
                    Prediction.status.in_([PredictionStatus.PENDING, PredictionStatus.ACTIVE])
                )
            )
        )
        return result.scalars().all()
    
    async def count_by_user(self, user_id: str) -> int:
        result = await self.db.execute(
            select(func.count(Prediction.id)).where(Prediction.user_id == user_id)
        )
        return result.scalar()
    
    async def get_user_predictions_stats(self, user_id: str) -> dict:
        """Get prediction statistics for a user."""
        result = await self.db.execute(
            select(
                func.count(Prediction.id).label("total"),
                func.sum(func.case((Prediction.status == PredictionStatus.RESOLVED_TRUE, 1), else_=0)).label("correct"),
                func.avg(Prediction.views_count).label("avg_views"),
                func.avg(Prediction.reactions_count).label("avg_reactions")
            )
            .where(Prediction.user_id == user_id)
        )
        row = result.one()
        return {
            "total": row.total or 0,
            "correct": row.correct or 0,
            "avg_views": float(row.avg_views or 0),
            "avg_reactions": float(row.avg_reactions or 0)
        }
