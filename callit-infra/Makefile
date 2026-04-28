# =============================================================================
# CallIt - Makefile for Common Operations
# =============================================================================

.PHONY: help up down build logs migrate migrate-create shell clean

# Default target
help:
	@echo "CallIt Infrastructure Commands:"
	@echo ""
	@echo "  make up              - Start all services"
	@echo "  make down            - Stop all services"
	@echo "  make build           - Rebuild all containers"
	@echo "  make logs            - View all service logs"
	@echo "  make logs-backend    - View backend logs only"
	@echo "  make logs-frontend   - View frontend logs only"
	@echo "  make migrate         - Run database migrations"
	@echo "  make migrate-create  - Create new migration (prompts for message)"
	@echo "  make shell-backend   - Open shell in backend container"
	@echo "  make shell-db        - Open PostgreSQL shell"
	@echo "  make clean           - Stop and remove all volumes (⚠️ destroys data)"
	@echo "  make reset           - Full reset: clean + up + migrate"
	@echo ""

# Start services
up:
	docker-compose up -d

# Stop services
down:
	docker-compose down

# Build/rebuild containers
build:
	docker-compose up -d --build

# View logs
logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f postgres

# Database migrations
migrate:
	docker-compose --profile migrations up migrations

migrate-create:
	@read -p "Migration message: " msg; \
	docker-compose exec backend alembic revision --autogenerate -m "$$msg"

migrate-rollback:
	docker-compose exec backend alembic downgrade -1

migrate-history:
	docker-compose exec backend alembic history

# Shell access
shell-backend:
	docker-compose exec backend bash

shell-db:
	docker-compose exec postgres psql -U callit -d callit

shell-redis:
	docker-compose exec redis redis-cli

# Cleanup
clean:
	docker-compose down -v
	@echo "Removed all containers and volumes"

reset: clean up migrate
	@echo "Full reset complete"

# Development helpers
dev-backend:
	docker-compose up -d postgres redis
	@echo "Backend dependencies running. Start backend locally with:"
	@echo "  cd backend && uvicorn main:app --reload"

dev-frontend:
	@echo "Start frontend locally with:"
	@echo "  cd frontend && npm run dev"

# Railway deployment
railway-deploy:
	railway up

railway-logs:
	railway logs

railway-migrate:
	railway run alembic upgrade head
