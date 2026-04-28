---
name: fastapi-backend
description: Build production-ready FastAPI backends with async database support, API endpoints, and structured architecture. Use when creating Python backend services, REST APIs, or data processing services that need high performance and clean code organization.
---

# FastAPI Backend Development

Build robust, production-ready FastAPI backends.

## Quick Start

Create a new FastAPI project:

```python
# app/main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown

app = FastAPI(lifespan=lifespan)

@app.get("/health")
async def health():
    return {"status": "healthy"}
```

## Project Structure

```
project/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   └── database.py
│   ├── models/
│   ├── schemas/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       └── router.py
│   ├── services/
│   └── repositories/
└── requirements.txt
```

## Database (SQLAlchemy Async)

```python
# app/core/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(DATABASE_URL)
async_session = sessionmaker(engine, class_=AsyncSession)

async def get_db():
    async with async_session() as session:
        yield session
```

## CRUD Endpoints

```python
# app/api/v1/endpoints/items.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()

@router.post("/", response_model=ItemResponse)
async def create_item(
    item: ItemCreate,
    db: AsyncSession = Depends(get_db)
):
    service = ItemService(db)
    return await service.create(item)

@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(item_id: str, db: AsyncSession = Depends(get_db)):
    service = ItemService(db)
    item = await service.get(item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    return item
```

## Service Layer Pattern

```python
# app/services/item_service.py
class ItemService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ItemRepository(db)
    
    async def create(self, data: ItemCreate) -> Item:
        return await self.repo.create(data)
    
    async def get(self, id: str) -> Optional[Item]:
        return await self.repo.get_by_id(id)
```

## Best Practices

1. **Use dependency injection** for database sessions
2. **Separate concerns**: models, schemas, services, repositories
3. **Use Pydantic schemas** for request/response validation
4. **Handle async properly** — always use `await`
5. **Add health checks** for monitoring
