-- ============================================================================
-- Migration: 20261103000007_enable_rls_admin_and_financial.sql
-- Description: Safely enable Row Level Security (RLS) on public.admin_users,
--              public.financial_accounts, public.financial_transactions,
--              and public.internal_transfers.
-- Security:
--   - Enables RLS on all 4 tables.
--   - Default state denies all access to anonymous and client-authenticated roles.
--   - Explicitly revokes all direct privileges from 'anon' and 'authenticated'.
--   - Explicitly grants full privileges to 'postgres' and 'service_role'.
--   - Defines service_role policies for administrative/service access.
-- ============================================================================

-- 1. Enable Row Level Security on all four tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_transfers ENABLE ROW LEVEL SECURITY;

-- 2. Revoke all privileges from anon and authenticated roles
REVOKE ALL ON TABLE public.admin_users FROM anon, authenticated;
REVOKE ALL ON TABLE public.financial_accounts FROM anon, authenticated;
REVOKE ALL ON TABLE public.financial_transactions FROM anon, authenticated;
REVOKE ALL ON TABLE public.internal_transfers FROM anon, authenticated;

-- 3. Ensure postgres and service_role retain full access
GRANT ALL ON TABLE public.admin_users TO postgres, service_role;
GRANT ALL ON TABLE public.financial_accounts TO postgres, service_role;
GRANT ALL ON TABLE public.financial_transactions TO postgres, service_role;
GRANT ALL ON TABLE public.internal_transfers TO postgres, service_role;

-- 4. Idempotently drop any prior policies for clean re-application
DROP POLICY IF EXISTS "service_role_admin_users_all" ON public.admin_users;
DROP POLICY IF EXISTS "service_role_financial_accounts_all" ON public.financial_accounts;
DROP POLICY IF EXISTS "service_role_financial_transactions_all" ON public.financial_transactions;
DROP POLICY IF EXISTS "service_role_internal_transfers_all" ON public.internal_transfers;

-- 5. Define explicit service_role policies
CREATE POLICY "service_role_admin_users_all"
  ON public.admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_financial_accounts_all"
  ON public.financial_accounts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_financial_transactions_all"
  ON public.financial_transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_internal_transfers_all"
  ON public.internal_transfers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

