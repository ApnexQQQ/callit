# CallIt Infrastructure

Complete infrastructure setup for the CallIt application - Docker Compose for local development and Railway configuration for production deployment.

## 📁 Directory Structure

```
callit-infra/
├── docker-compose.yml          # Local development services
├── .env.example                # Environment variables template
├── .env.local                  # Local development defaults
├── railway.json                # Railway service config
├── railway.yml                 # Railway multi-service config
├── README.md                   # This file
│
├── init-scripts/
│   └── 01-init.sql            # PostgreSQL initialization
│
├── migrations/
│   ├── alembic.ini            # Alembic configuration
│   ├── env.py                 # Migration environment
│   ├── script.py.mako         # Migration template
│   └── README.md              # Migration guide
│
├── backend/
│   ├── Dockerfile             # Backend production image
│   ├── Dockerfile.migrations  # Migration runner image
│   ├── requirements.txt       # Python dependencies
│   └── main.py                # FastAPI entry point
│
└── frontend/
    ├── Dockerfile             # Frontend production image
    ├── nginx.conf             # Nginx configuration
    └── package.json           # Node.js dependencies
```

## 🚀 Quick Start - Local Development

### 1. Setup Environment

```bash
cd /root/.openclaw/workspace/callit-infra

# Copy environment file
cp .env.local .env

# Or use the example and customize
cp .env.example .env
# Edit .env with your values
```

### 2. Start Services

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
```

### 3. Run Database Migrations

```bash
# Run migrations
docker-compose --profile migrations up migrations

# Or using Alembic directly (if installed locally)
cd migrations
alembic upgrade head
```

### 4. Access Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React application |
| Backend API | http://localhost:8000 | FastAPI + docs at /docs |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache |

### 5. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

## 🛤️ Railway Deployment

### Setup

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Link Project**
   ```bash
   railway login
   railway link
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set SECRET_KEY="your-secret-key"
   railway variables set CORS_ORIGINS="https://yourdomain.com"
   # Set other required variables...
   ```

4. **Deploy**
   ```bash
   railway up
   ```

### Railway Services

The `railway.yml` configures:
- **PostgreSQL** - Managed database
- **Redis** - Managed cache
- **Backend** - FastAPI service
- **Frontend** - React + Nginx service
- **Migrations** - Database migration job

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://...` |
| `REDIS_URL` | Redis connection string | `redis://:password@host:6379/0` |
| `SECRET_KEY` | JWT/encryption secret | `generate-random-string` |
| `CORS_ORIGINS` | Allowed frontend origins | `https://app.callit.com` |

### Optional Variables

See `.env.example` for all available options including:
- SMTP settings for email
- S3 configuration for file storage
- Stripe keys for payments
- Sentry for error tracking

## 🗄️ Database Migrations

### Create Migration

```bash
# After modifying SQLAlchemy models
cd migrations
alembic revision --autogenerate -m "add users table"
```

### Run Migration

```bash
# Local
docker-compose --profile migrations up migrations

# Production (Railway)
railway run alembic upgrade head
```

### Rollback

```bash
# Rollback one migration
alembic downgrade -1

# Rollback all
alembic downgrade base
```

## 📊 Monitoring & Health

### Health Endpoints

- `GET /health` - Service health status
- `GET /ready` - Readiness probe (for K8s/Railway)

### Docker Health Checks

All services include health checks:
- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`
- Backend: HTTP check to `/health`
- Frontend: HTTP check to root

## 🔒 Security Checklist

- [ ] Change default passwords in production
- [ ] Use strong `SECRET_KEY` (32+ random chars)
- [ ] Enable HTTPS in production
- [ ] Restrict CORS origins to known domains
- [ ] Use Railway managed databases (not containerized in prod)
- [ ] Enable database SSL connections
- [ ] Set up proper logging and monitoring

## 📝 Useful Commands

```bash
# Rebuild containers after Dockerfile changes
docker-compose up -d --build

# Execute commands in containers
docker-compose exec backend python -c "print('hello')"
docker-compose exec postgres psql -U callit -d callit

# View database
docker-compose exec postgres psql -U callit -d callit -c "\dt"

# Redis CLI
docker-compose exec redis redis-cli

# Scale backend workers (if using)
docker-compose up -d --scale backend=3
```

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :5432

# Use different ports in .env
POSTGRES_PORT=5433
```

### Database Connection Issues

```bash
# Reset everything
docker-compose down -v
docker-compose up -d
```

### Migration Failures

```bash
# Mark current as head (careful!)
alembic stamp head

# Check current version
alembic current
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Railway Documentation](https://docs.railway.app/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
