# CallIt Database Migrations

This directory contains Alembic database migrations for the CallIt application.

## Quick Start

### Run Migrations

```bash
# Using Docker Compose
docker-compose up migrations

# Or manually with Alembic
cd /root/.openclaw/workspace/callit-infra
alembic upgrade head
```

### Create a New Migration

```bash
# After modifying your SQLAlchemy models
cd /root/.openclaw/workspace/callit-infra
alembic revision --autogenerate -m "description of changes"

# Or create an empty migration
alembic revision -m "manual migration"
```

### Common Commands

| Command | Description |
|---------|-------------|
| `alembic upgrade head` | Run all pending migrations |
| `alembic downgrade -1` | Rollback one migration |
| `alembic downgrade base` | Rollback all migrations |
| `alembic current` | Show current migration version |
| `alembic history` | Show migration history |
| `alembic stamp head` | Mark database as up-to-date (no migration) |

## Migration Best Practices

1. **Always review auto-generated migrations** before committing
2. **Test migrations** on a copy of production data when possible
3. **Make migrations reversible** - always implement `downgrade()`
4. **Keep migrations small** - one logical change per migration
5. **Don't modify existing migrations** after they've been applied

## Directory Structure

```
migrations/
├── alembic.ini          # Alembic configuration
├── env.py               # Migration environment setup
├── script.py.mako       # Migration template
├── README.md            # This file
└── versions/            # Migration scripts
    ├── 20240115_1200_initial_schema.py
    └── 20240116_0900_add_user_table.py
```
