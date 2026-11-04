-- ============================================================================
-- Migration: 20261103000006_add_admin_users_password_hash.sql
-- Description: Idempotently add password_hash column to public.admin_users
-- ============================================================================

ALTER TABLE public.admin_users
ADD COLUMN IF NOT EXISTS password_hash TEXT NULL;

