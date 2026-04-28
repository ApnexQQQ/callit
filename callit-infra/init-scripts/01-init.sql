-- =============================================================================
-- CallIt - Database Initialization Script
-- Run automatically when PostgreSQL container starts for the first time
-- =============================================================================

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- Create schemas
CREATE SCHEMA IF NOT EXISTS callit;

-- Set default schema
SET search_path TO callit, public;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA callit TO CURRENT_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA callit TO CURRENT_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA callit TO CURRENT_USER;

-- =============================================================================
-- Note: Tables are created via Alembic migrations
-- This script only sets up extensions, schemas, and utilities
-- =============================================================================
