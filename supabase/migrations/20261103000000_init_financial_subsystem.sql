-- ============================================================================
-- MADI SSS — PRODUCTION FINANCIAL SUBSYSTEM MIGRATION
-- Revision 5.7 Master Architecture Implementation
-- ============================================================================

-- 1. ROLES & SCHEMAS
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'madi_schema_owner') THEN
        CREATE ROLE madi_schema_owner NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'madi_proc_owner') THEN
        CREATE ROLE madi_proc_owner NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'madi_app_user') THEN
        CREATE ROLE madi_app_user NOLOGIN;
    END IF;
END
$$;

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA public FROM PUBLIC, anon;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated, madi_app_user;

GRANT USAGE ON SCHEMA public TO authenticated, madi_app_user, madi_proc_owner;
GRANT USAGE ON SCHEMA private TO madi_proc_owner;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ============================================================================
-- 2. CORE FINANCIAL & SECURITY TABLES
-- ============================================================================

-- A. Admin Users
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('SUPERADMIN', 'EDITOR', 'AUDITOR')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- B. Financial Accounts (NPR Strict Single Currency)
CREATE TABLE IF NOT EXISTS public.financial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code TEXT UNIQUE NOT NULL,
    name_ne TEXT NOT NULL,
    name_en TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('BANK', 'CASH', 'PROJECT', 'RESERVE', 'SPECIAL')),
    bank_name TEXT,
    account_number_mask TEXT,
    current_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    opening_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'NPR' CHECK (currency = 'NPR'),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- C. Internal Transfers
CREATE TABLE IF NOT EXISTS public.internal_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_account_id UUID NOT NULL REFERENCES public.financial_accounts(id) ON DELETE RESTRICT,
    destination_account_id UUID NOT NULL REFERENCES public.financial_accounts(id) ON DELETE RESTRICT,
    amount_npr NUMERIC(14, 2) NOT NULL CHECK (amount_npr > 0.00),
    currency TEXT NOT NULL DEFAULT 'NPR' CHECK (currency = 'NPR'),
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'POSTED', 'REVERSED', 'CANCELLED')),
    purpose_ne TEXT NOT NULL,
    purpose_en TEXT NOT NULL,
    notes TEXT,
    voucher_number TEXT UNIQUE,
    created_by_admin_id UUID NOT NULL REFERENCES public.admin_users(id),
    posted_by_admin_id UUID REFERENCES public.admin_users(id),
    posted_at TIMESTAMPTZ,
    reversed_by_admin_id UUID REFERENCES public.admin_users(id),
    reversed_at TIMESTAMPTZ,
    reversal_reason TEXT,
    cancelled_by_admin_id UUID REFERENCES public.admin_users(id),
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT chk_diff_accounts CHECK (source_account_id <> destination_account_id)
);

-- D. Financial Transactions (Ledger Legs)
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    master_transfer_id UUID REFERENCES public.internal_transfers(id) ON DELETE RESTRICT,
    leg_type TEXT NOT NULL CHECK (leg_type IN ('SOURCE', 'DESTINATION')),
    type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    account_id UUID NOT NULL REFERENCES public.financial_accounts(id) ON DELETE RESTRICT,
    amount_npr NUMERIC(14, 2) NOT NULL CHECK (amount_npr > 0.00),
    currency TEXT NOT NULL DEFAULT 'NPR' CHECK (currency = 'NPR'),
    is_reversal BOOLEAN NOT NULL DEFAULT false,
    reversal_of_transaction_id UUID REFERENCES public.financial_transactions(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_tx_original_leg 
    ON public.financial_transactions (master_transfer_id, leg_type) 
    WHERE is_reversal = false AND master_transfer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_tx_single_reversal 
    ON public.financial_transactions (reversal_of_transaction_id) 
    WHERE is_reversal = true;

-- E. Consumed Nonces (Preflight Burn Table)
CREATE TABLE IF NOT EXISTS public.consumed_nonces (
    nonce TEXT PRIMARY KEY CHECK (nonce ~ '^[a-f0-9]{32}$'),
    action TEXT NOT NULL CHECK (action IN ('POST', 'REVERSE', 'CANCEL_DRAFT', 'DELETE_DRAFT')),
    transfer_id UUID NOT NULL,
    idempotency_key UUID NOT NULL,
    admin_id UUID NOT NULL,
    key_id TEXT NOT NULL,
    request_timestamp BIGINT NOT NULL,
    request_hash TEXT NOT NULL,
    consumed_in_business_tx BOOLEAN NOT NULL DEFAULT false,
    consumed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- F. Idempotency Records
CREATE TABLE IF NOT EXISTS public.idempotency_records (
    workflow_name TEXT NOT NULL,
    idempotency_key UUID NOT NULL,
    transfer_id UUID NOT NULL,
    actor_id UUID NOT NULL,
    request_hash TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'COMMITTED')),
    response_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    locked_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (workflow_name, idempotency_key)
);

-- G. Immutable Audit Logs (Append-Only WORM)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    actor_id UUID,
    transaction_id BIGINT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ============================================================================
-- 3. INVARIANT & IMMUTABILITY TRIGGERS
-- ============================================================================

-- A. Audit Logs WORM Guard
CREATE OR REPLACE FUNCTION public.trg_fn_audit_logs_immutable()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
    RAISE EXCEPTION 'Security Invariant: audit_logs is append-only WORM storage. Modifications/deletions forbidden.'
        USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON public.audit_logs;
CREATE TRIGGER trg_audit_logs_immutable
    BEFORE UPDATE OR DELETE ON public.audit_logs
    FOR EACH ROW EXECUTE FUNCTION public.trg_fn_audit_logs_immutable();

-- B. Opening Balance Guard
CREATE OR REPLACE FUNCTION public.trg_fn_guard_opening_balance()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
    IF OLD.opening_balance IS DISTINCT FROM NEW.opening_balance THEN
        IF OLD.is_active = true THEN
            RAISE EXCEPTION 'Invariant Violation: Opening balance cannot be modified on active account %.', OLD.id
                USING ERRCODE = 'P0001';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_opening_balance ON public.financial_accounts;
CREATE TRIGGER trg_guard_opening_balance
    BEFORE UPDATE OF opening_balance ON public.financial_accounts
    FOR EACH ROW EXECUTE FUNCTION public.trg_fn_guard_opening_balance();

-- C. Financial Legs Immutability Guard
CREATE OR REPLACE FUNCTION public.trg_fn_leg_immutability_guard()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
    RAISE EXCEPTION 'Security Invariant: Posted financial ledger legs cannot be modified or deleted directly.'
        USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS trg_leg_immutability_guard ON public.financial_transactions;
CREATE TRIGGER trg_leg_immutability_guard
    BEFORE UPDATE OR DELETE ON public.financial_transactions
    FOR EACH ROW EXECUTE FUNCTION public.trg_fn_leg_immutability_guard();

-- D. Master Transfer State Machine Guard
CREATE OR REPLACE FUNCTION public.trg_fn_master_transfer_guard()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        IF OLD.status IS DISTINCT FROM 'DRAFT' THEN
            RAISE EXCEPTION 'State Machine Violation: Cannot delete transfer in status % (DRAFT required).', OLD.status
                USING ERRCODE = '55000';
        END IF;
        RETURN OLD;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'DRAFT' AND NEW.status IN ('POSTED', 'CANCELLED') THEN
            RETURN NEW;
        END IF;
        IF OLD.status = 'POSTED' AND NEW.status = 'REVERSED' THEN
            RETURN NEW;
        END IF;
        IF OLD.status = NEW.status AND OLD.status = 'DRAFT' THEN
            RETURN NEW;
        END IF;

        RAISE EXCEPTION 'State Machine Violation: Invalid transfer status transition from % to %.', OLD.status, NEW.status
            USING ERRCODE = '55000';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_master_transfer_guard ON public.internal_transfers;
CREATE TRIGGER trg_master_transfer_guard
    BEFORE UPDATE OR DELETE ON public.internal_transfers
    FOR EACH ROW EXECUTE FUNCTION public.trg_fn_master_transfer_guard();

-- E. Deferred Parity Triggers: Account Side
CREATE OR REPLACE FUNCTION public.trg_fn_assert_account_balance_parity()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
    v_acc RECORD;
    v_ledger_sum NUMERIC(14,2);
BEGIN
    SELECT id, currency, current_balance, opening_balance 
    INTO v_acc 
    FROM public.financial_accounts 
    WHERE id = NEW.id;

    IF v_acc.currency IS DISTINCT FROM 'NPR' THEN
        RAISE EXCEPTION 'Currency Invariant Violation: Account % has invalid currency % (NPR required).',
            v_acc.id, v_acc.currency USING ERRCODE = 'P0001';
    END IF;

    SELECT v_acc.opening_balance + COALESCE(SUM(
        CASE 
            WHEN type = 'INCOME' THEN amount_npr
            WHEN type = 'EXPENSE' THEN -amount_npr
            ELSE 0.00
        END
    ), 0.00)
    INTO v_ledger_sum
    FROM public.financial_transactions
    WHERE account_id = v_acc.id;

    IF v_acc.current_balance IS DISTINCT FROM v_ledger_sum THEN
        RAISE EXCEPTION 'Ledger Corruption: Account % balance (%) does not equal opening balance plus ledger sum (%). Transaction aborted.',
            v_acc.id, v_acc.current_balance, v_ledger_sum USING ERRCODE = 'P0001';
    END IF;

    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_assert_account_balance_parity ON public.financial_accounts;
CREATE CONSTRAINT TRIGGER trg_assert_account_balance_parity
    AFTER UPDATE OF current_balance ON public.financial_accounts
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_fn_assert_account_balance_parity();

-- F. Deferred Parity Triggers: Transaction Leg Side
CREATE OR REPLACE FUNCTION public.trg_fn_assert_leg_account_parity()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
    v_target_account_id UUID;
    v_acc RECORD;
    v_ledger_sum NUMERIC(14,2);
BEGIN
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        v_target_account_id := OLD.account_id;
        SELECT id, currency, current_balance, opening_balance 
        INTO v_acc 
        FROM public.financial_accounts 
        WHERE id = v_target_account_id;

        IF v_acc.id IS NOT NULL THEN
            SELECT v_acc.opening_balance + COALESCE(SUM(
                CASE 
                    WHEN type = 'INCOME' THEN amount_npr
                    WHEN type = 'EXPENSE' THEN -amount_npr
                    ELSE 0.00
                END
            ), 0.00)
            INTO v_ledger_sum
            FROM public.financial_transactions
            WHERE account_id = v_acc.id;

            IF v_acc.current_balance IS DISTINCT FROM v_ledger_sum THEN
                RAISE EXCEPTION 'Ledger Corruption: Account % balance (%) does not match ledger sum (%) following leg mutation.',
                    v_acc.id, v_acc.current_balance, v_ledger_sum USING ERRCODE = 'P0001';
            END IF;
        END IF;
    END IF;

    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        v_target_account_id := NEW.account_id;
        SELECT id, currency, current_balance, opening_balance 
        INTO v_acc 
        FROM public.financial_accounts 
        WHERE id = v_target_account_id;

        IF v_acc.id IS NOT NULL THEN
            SELECT v_acc.opening_balance + COALESCE(SUM(
                CASE 
                    WHEN type = 'INCOME' THEN amount_npr
                    WHEN type = 'EXPENSE' THEN -amount_npr
                    ELSE 0.00
                END
            ), 0.00)
            INTO v_ledger_sum
            FROM public.financial_transactions
            WHERE account_id = v_acc.id;

            IF v_acc.current_balance IS DISTINCT FROM v_ledger_sum THEN
                RAISE EXCEPTION 'Ledger Corruption: Account % balance (%) does not match ledger sum (%) following leg insertion.',
                    v_acc.id, v_acc.current_balance, v_ledger_sum USING ERRCODE = 'P0001';
            END IF;
        END IF;
    END IF;

    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_assert_leg_account_parity ON public.financial_transactions;
CREATE CONSTRAINT TRIGGER trg_assert_leg_account_parity
    AFTER INSERT OR UPDATE OR DELETE ON public.financial_transactions
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_fn_assert_leg_account_parity();

-- G. Deferred Reversal Symmetry & Leg Count Validator
CREATE OR REPLACE FUNCTION public.trg_fn_validate_reversal_deferred()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
    v_mid UUID;
    v_master RECORD;
    v_total_legs INT;
    v_orig_legs INT;
    v_rev_legs INT;
    v_orig_src INT;
    v_orig_dest INT;
BEGIN
    v_mid := NEW.id;

    IF NEW.status = 'REVERSED' THEN
        SELECT * INTO v_master FROM public.internal_transfers WHERE id = v_mid;

        SELECT count(*) INTO v_total_legs FROM public.financial_transactions WHERE master_transfer_id = v_mid;
        IF v_total_legs != 4 THEN
            RAISE EXCEPTION 'Invariant Failure: REVERSED transfer must have exactly 4 total legs. Found %', v_total_legs USING ERRCODE = 'P0001';
        END IF;

        SELECT count(*) FILTER (WHERE is_reversal = false),
               count(*) FILTER (WHERE is_reversal = true)
        INTO v_orig_legs, v_rev_legs
        FROM public.financial_transactions WHERE master_transfer_id = v_mid;

        IF v_orig_legs != 2 OR v_rev_legs != 2 THEN
            RAISE EXCEPTION 'Invariant Failure: REVERSED transfer requires 2 original and 2 reversal legs. Found orig=%, rev=%', v_orig_legs, v_rev_legs USING ERRCODE = 'P0001';
        END IF;

        SELECT count(*) FILTER (WHERE leg_type = 'SOURCE'),
               count(*) FILTER (WHERE leg_type = 'DESTINATION')
        INTO v_orig_src, v_orig_dest
        FROM public.financial_transactions 
        WHERE master_transfer_id = v_mid AND is_reversal = false;

        IF v_orig_src != 1 OR v_orig_dest != 1 THEN
            RAISE EXCEPTION 'Invariant Failure: Must contain exactly 1 original SOURCE and 1 original DESTINATION leg.' USING ERRCODE = 'P0001';
        END IF;
    END IF;

    IF NEW.status = 'POSTED' THEN
        SELECT count(*) INTO v_total_legs FROM public.financial_transactions WHERE master_transfer_id = v_mid;
        IF v_total_legs != 2 THEN
            RAISE EXCEPTION 'Invariant Failure: POSTED transfer must have exactly 2 legs. Found %', v_total_legs USING ERRCODE = 'P0001';
        END IF;
    END IF;

    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_reversal_deferred ON public.internal_transfers;
CREATE CONSTRAINT TRIGGER trg_validate_reversal_deferred
    AFTER UPDATE OF status ON public.internal_transfers
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_fn_validate_reversal_deferred();

-- H. Current User Superadmin Evaluator (Parameterless RLS Helper)
CREATE OR REPLACE FUNCTION public.is_current_user_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = auth.uid() 
          AND role = 'SUPERADMIN' 
          AND is_active = true
    );
$$;

REVOKE ALL ON FUNCTION public.is_current_user_superadmin() FROM PUBLIC, anon, madi_app_user;
GRANT EXECUTE ON FUNCTION public.is_current_user_superadmin() TO authenticated, madi_proc_owner;

-- I. Controlled Account Archival Engine
CREATE OR REPLACE FUNCTION public.archive_financial_account(p_account_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_acc RECORD;
    v_pending_count INT;
BEGIN
    SELECT * INTO v_acc FROM public.financial_accounts WHERE id = p_account_id FOR UPDATE;
    IF v_acc.id IS NULL THEN
        RAISE EXCEPTION 'Not Found: Account % does not exist.', p_account_id USING ERRCODE = 'P0002';
    END IF;

    IF v_acc.current_balance IS DISTINCT FROM 0.00 THEN
        RAISE EXCEPTION 'Archival Rejected: Cannot archive account % with non-zero balance (%).',
            p_account_id, v_acc.current_balance USING ERRCODE = 'P0001';
    END IF;

    SELECT count(*) INTO v_pending_count
    FROM public.internal_transfers
    WHERE (source_account_id = p_account_id OR destination_account_id = p_account_id)
      AND status = 'DRAFT';

    IF v_pending_count > 0 THEN
        RAISE EXCEPTION 'Archival Rejected: Account % is referenced by % pending DRAFT transfers.',
            p_account_id, v_pending_count USING ERRCODE = 'P0001';
    END IF;

    UPDATE public.financial_accounts
    SET is_active = false, updated_at = pg_catalog.clock_timestamp()
    WHERE id = p_account_id;

    INSERT INTO public.audit_logs (action, entity_type, entity_id, actor_id, transaction_id, payload)
    VALUES ('ACCOUNT_ARCHIVED', 'FinancialAccount', p_account_id::text, auth.uid(), pg_catalog.txid_current(), jsonb_build_object('archived_at', pg_catalog.clock_timestamp()));
END;
$$;

REVOKE ALL ON FUNCTION public.archive_financial_account FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.archive_financial_account TO authenticated, madi_proc_owner;


-- ============================================================================
-- 4. DETERMINISTIC HELPERS, ENGINES & ENTRYPOINTS
-- ============================================================================

CREATE OR REPLACE FUNCTION private.fn_compute_request_hash(
    p_key_id TEXT,
    p_action TEXT,
    p_transfer_id UUID,
    p_idempotency_key UUID,
    p_admin_id UUID,
    p_timestamp BIGINT,
    p_nonce TEXT,
    p_aux_reason TEXT
)
RETURNS TEXT 
LANGUAGE plpgsql 
IMMUTABLE 
STRICT 
SET search_path = ''
AS $$
DECLARE
    v_canonical TEXT;
    v_clean_reason TEXT;
BEGIN
    v_clean_reason := COALESCE(pg_catalog.normalize(p_aux_reason, NFC), '');
    v_canonical := 'v1,' || 
        pg_catalog.octet_length(p_key_id)::text || ':' || p_key_id || ',' ||
        pg_catalog.octet_length(p_action)::text || ':' || p_action || ',' ||
        '36:' || pg_catalog.lower(p_transfer_id::text) || ',' ||
        '36:' || pg_catalog.lower(p_idempotency_key::text) || ',' ||
        '36:' || pg_catalog.lower(p_admin_id::text) || ',' ||
        pg_catalog.octet_length(p_timestamp::text)::text || ':' || p_timestamp::text || ',' ||
        '32:' || pg_catalog.lower(p_nonce) || ',' ||
        pg_catalog.octet_length(v_clean_reason)::text || ':' || v_clean_reason || ',';

    RETURN pg_catalog.encode(extensions.digest(v_canonical::bytea, 'sha256'), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION private.fn_compute_idempotency_hash(
    p_workflow TEXT,
    p_transfer_id UUID,
    p_admin_id UUID,
    p_aux_reason TEXT DEFAULT ''
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
STRICT
SET search_path = ''
AS $$
DECLARE
    v_payload TEXT;
    v_clean_reason TEXT;
BEGIN
    v_clean_reason := COALESCE(pg_catalog.normalize(p_aux_reason, NFC), '');
    v_payload := 'idemp_v1|' || p_workflow || '|' || 
                 pg_catalog.lower(p_transfer_id::text) || '|' || 
                 pg_catalog.lower(p_admin_id::text) || '|' || 
                 v_clean_reason;

    RETURN pg_catalog.encode(extensions.digest(v_payload::bytea, 'sha256'), 'hex');
END;
$$;


-- ============================================================================
-- 2. CRYPTOGRAPHIC ATTESTATION & PREFLIGHT NONCE CLAIM ENGINE
-- ============================================================================
CREATE OR REPLACE FUNCTION private.fn_verify_attestation(
    p_action TEXT,
    p_transfer_id UUID,
    p_idempotency_key UUID,
    p_admin_id UUID,
    p_key_id TEXT,
    p_timestamp BIGINT,
    p_nonce TEXT,
    p_signature TEXT,
    p_aux_reason TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_now BIGINT;
    v_secret TEXT;
    v_request_hash TEXT;
    v_expected_sig TEXT;
BEGIN
    -- 1. Action allowlist validation
    IF p_action NOT IN ('POST', 'REVERSE', 'DELETE_DRAFT', 'CANCEL_DRAFT', 'GET_DETAILS') THEN
        RAISE EXCEPTION 'Authentication Failure: Invalid action name %.', p_action USING ERRCODE = 'P0001';
    END IF;

    -- 2. Timestamp range validation (±60 seconds)
    v_now := EXTRACT(EPOCH FROM pg_catalog.clock_timestamp())::BIGINT;
    IF ABS(v_now - p_timestamp) > 60 THEN
        RAISE EXCEPTION 'Authentication Failure: Timestamp skewed beyond 60s window.' USING ERRCODE = 'P0001';
    END IF;

    -- 3. Nonce & signature format checks
    IF p_nonce !~ '^[a-f0-9]{32}$' THEN
        RAISE EXCEPTION 'Authentication Failure: Malformed nonce format.' USING ERRCODE = 'P0001';
    END IF;
    IF p_signature !~ '^[a-f0-9]{64}$' THEN
        RAISE EXCEPTION 'Authentication Failure: Malformed signature format.' USING ERRCODE = 'P0001';
    END IF;

    -- 4. Load secret from Supabase Vault
    SELECT decrypted_secret INTO v_secret FROM vault.decrypted_secrets WHERE name = p_key_id;
    IF v_secret IS NULL THEN
        RAISE EXCEPTION 'Authentication Failure: Unknown or expired key_id %.', p_key_id USING ERRCODE = 'P0001';
    END IF;

    -- 5. Compute canonical request hash
    v_request_hash := private.fn_compute_request_hash(
        p_key_id, p_action, p_transfer_id, p_idempotency_key, p_admin_id, p_timestamp, p_nonce, p_aux_reason
    );

    -- 6. Compute expected HMAC-SHA256 signature
    v_expected_sig := pg_catalog.encode(
        extensions.hmac(v_request_hash::bytea, v_secret::bytea, 'sha256'),
        'hex'
    );

    -- 7. Comparison (Timing side-channel classified as UNRESOLVED RESIDUAL RISK)
    IF p_signature IS DISTINCT FROM v_expected_sig THEN
        RAISE EXCEPTION 'Authentication Failure: Cryptographic signature mismatch.' USING ERRCODE = 'P0001';
    END IF;

    -- 8. Verify active SUPERADMIN status
    IF NOT EXISTS (
        SELECT 1 FROM public.admin_users WHERE id = p_admin_id AND role = 'SUPERADMIN' AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Authorization Failure: Actor % is not an active SUPERADMIN.', p_admin_id USING ERRCODE = 'P0001';
    END IF;

    RETURN v_request_hash;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_nonce_preflight(
    p_action TEXT,
    p_transfer_id UUID,
    p_idempotency_key UUID,
    p_admin_id UUID,
    p_key_id TEXT,
    p_timestamp BIGINT,
    p_nonce TEXT,
    p_signature TEXT,
    p_aux_reason TEXT DEFAULT ''
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_request_hash TEXT;
BEGIN
    -- Verify attestation and compute canonical hash
    v_request_hash := private.fn_verify_attestation(
        p_action, p_transfer_id, p_idempotency_key, p_admin_id, p_key_id, p_timestamp, p_nonce, p_signature, p_aux_reason
    );

    -- Atomic persistence in consumed_nonces table
    INSERT INTO public.consumed_nonces (
        nonce, action, transfer_id, idempotency_key, admin_id, key_id,
        request_timestamp, request_hash, consumed_in_business_tx, consumed_at
    ) VALUES (
        p_nonce, p_action, p_transfer_id, p_idempotency_key, p_admin_id, p_key_id,
        p_timestamp, v_request_hash, false, pg_catalog.clock_timestamp()
    );
END;
$$;

REVOKE ALL ON FUNCTION public.claim_nonce_preflight FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_nonce_preflight TO madi_app_user;


-- ============================================================================
-- 3. ATOMIC IDEMPOTENCY ENGINE
-- ============================================================================
CREATE OR REPLACE FUNCTION private.fn_claim_idempotency(
    p_workflow TEXT,
    p_key UUID,
    p_transfer_id UUID,
    p_admin_id UUID,
    p_aux_reason TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_record RECORD;
    v_request_hash TEXT;
BEGIN
    -- Internally derive deterministic request hash
    v_request_hash := private.fn_compute_idempotency_hash(p_workflow, p_transfer_id, p_admin_id, p_aux_reason);

    -- Step 1: Enforce lock timeout prior to any blocking query
    PERFORM set_config('lock_timeout', '3s', true);

    -- Step 2: Atomic first-claim insertion
    INSERT INTO public.idempotency_records (
        workflow_name, idempotency_key, transfer_id, actor_id, request_hash, status, created_at, locked_at
    ) VALUES (
        p_workflow, p_key, p_transfer_id, p_admin_id, v_request_hash, 'PENDING',
        pg_catalog.clock_timestamp(), pg_catalog.clock_timestamp()
    ) ON CONFLICT (workflow_name, idempotency_key) DO NOTHING;

    -- Step 3: Exclusive row lock on existing record
    SELECT * INTO v_record
    FROM public.idempotency_records
    WHERE workflow_name = p_workflow AND idempotency_key = p_key
    FOR UPDATE;

    -- Step 4: Payload mismatch detection
    IF v_record.request_hash IS DISTINCT FROM v_request_hash THEN
        RAISE EXCEPTION 'Idempotency Conflict: Key % reused with different business payload arguments.', p_key USING ERRCODE = '22023';
    END IF;

    -- Step 5: Cached response delivery if committed
    IF v_record.status = 'COMMITTED' THEN
        RETURN v_record.response_payload;
    END IF;

    RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION private.fn_complete_idempotency(
    p_workflow TEXT,
    p_key UUID,
    p_response JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.idempotency_records
    SET status = 'COMMITTED',
        response_payload = p_response,
        locked_at = pg_catalog.clock_timestamp()
    WHERE workflow_name = p_workflow AND idempotency_key = p_key;
END;
$$;


-- ============================================================================
-- 4. PRIVATE BUSINESS MUTATION ENGINES
-- ============================================================================

-- A. Core Posting Engine
CREATE OR REPLACE FUNCTION private.fn_execute_post_transfer(
    p_transfer_id UUID,
    p_idempotency_key UUID,
    p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_master RECORD;
    v_idemp_result JSONB;
    v_result JSONB;
    v_voucher TEXT;
BEGIN
    -- 1. Idempotency claim
    v_idemp_result := private.fn_claim_idempotency('POST_INTERNAL_TRANSFER', p_idempotency_key, p_transfer_id, p_admin_id);
    IF v_idemp_result IS NOT NULL THEN
        RETURN v_idemp_result;
    END IF;

    -- 2. Lock master record FOR UPDATE
    SELECT * INTO v_master FROM public.internal_transfers WHERE id = p_transfer_id FOR UPDATE;
    IF v_master.id IS NULL THEN
        RAISE EXCEPTION 'Not Found: Internal transfer % does not exist.', p_transfer_id USING ERRCODE = 'P0002';
    END IF;
    IF v_master.status IS DISTINCT FROM 'DRAFT' THEN
        RAISE EXCEPTION 'Security Violation: Cannot post transfer in status % (DRAFT required).', v_master.status USING ERRCODE = '55000';
    END IF;

    -- 3. Ascending Primary Key Account Row Locks
    PERFORM id FROM public.financial_accounts
    WHERE id IN (v_master.source_account_id, v_master.destination_account_id)
    ORDER BY id ASC
    FOR UPDATE;

    -- 4. Validate accounts active and currency NPR
    IF EXISTS (
        SELECT 1 FROM public.financial_accounts 
        WHERE id IN (v_master.source_account_id, v_master.destination_account_id) 
          AND (is_active = false OR currency IS DISTINCT FROM 'NPR')
    ) THEN
        RAISE EXCEPTION 'Validation Failure: One or more accounts are inactive or have non-NPR currency.' USING ERRCODE = 'P0001';
    END IF;

    -- 5. Mutate Master Status to POSTED
    v_voucher := 'TRF-' || pg_catalog.to_char(pg_catalog.clock_timestamp(), 'YYYYMMDD') || '-' || pg_catalog.substr(p_transfer_id::text, 1, 8);
    UPDATE public.internal_transfers
    SET status = 'POSTED',
        posted_at = pg_catalog.clock_timestamp(),
        posted_by_admin_id = p_admin_id,
        voucher_number = v_voucher
    WHERE id = p_transfer_id;

    -- 6. Insert Original Legs (SOURCE: EXPENSE, DEST: INCOME)
    INSERT INTO public.financial_transactions (
        master_transfer_id, leg_type, type, account_id, amount_npr, currency, is_reversal
    ) VALUES 
    (p_transfer_id, 'SOURCE', 'EXPENSE', v_master.source_account_id, v_master.amount_npr, 'NPR', false),
    (p_transfer_id, 'DESTINATION', 'INCOME', v_master.destination_account_id, v_master.amount_npr, 'NPR', false);

    -- 7. Update Account Balances
    UPDATE public.financial_accounts SET current_balance = current_balance - v_master.amount_npr WHERE id = v_master.source_account_id;
    UPDATE public.financial_accounts SET current_balance = current_balance + v_master.amount_npr WHERE id = v_master.destination_account_id;

    -- 8. Audit event
    INSERT INTO public.audit_logs (action, entity_type, entity_id, actor_id, transaction_id, payload)
    VALUES ('TRANSFER_POSTED', 'InternalTransfer', p_transfer_id::text, p_admin_id, pg_catalog.txid_current(), jsonb_build_object('voucher_number', v_voucher));

    v_result := jsonb_build_object('status', 'POSTED', 'transfer_id', p_transfer_id, 'voucher_number', v_voucher);
    PERFORM private.fn_complete_idempotency('POST_INTERNAL_TRANSFER', p_idempotency_key, v_result);

    RETURN v_result;
END;
$$;

-- B. Core Reversal Engine
CREATE OR REPLACE FUNCTION private.fn_execute_reverse_transfer(
    p_transfer_id UUID,
    p_idempotency_key UUID,
    p_reversal_reason TEXT,
    p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_master RECORD;
    v_orig_src RECORD;
    v_orig_dest RECORD;
    v_idemp_result JSONB;
    v_clean_reason TEXT;
    v_result JSONB;
BEGIN
    v_clean_reason := COALESCE(pg_catalog.normalize(p_reversal_reason, NFC), '');
    IF pg_catalog.length(v_clean_reason) = 0 THEN
        RAISE EXCEPTION 'Validation Failure: Reversal reason is strictly required.' USING ERRCODE = '22023';
    END IF;

    -- 1. Idempotency claim
    v_idemp_result := private.fn_claim_idempotency('REVERSE_INTERNAL_TRANSFER', p_idempotency_key, p_transfer_id, p_admin_id, v_clean_reason);
    IF v_idemp_result IS NOT NULL THEN
        RETURN v_idemp_result;
    END IF;

    -- 2. Lock master record FOR UPDATE
    SELECT * INTO v_master FROM public.internal_transfers WHERE id = p_transfer_id FOR UPDATE;
    IF v_master.id IS NULL THEN
        RAISE EXCEPTION 'Not Found: Internal transfer % does not exist.', p_transfer_id USING ERRCODE = 'P0002';
    END IF;
    IF v_master.status IS DISTINCT FROM 'POSTED' THEN
        RAISE EXCEPTION 'Security Violation: Cannot reverse transfer in status % (POSTED required).', v_master.status USING ERRCODE = '55000';
    END IF;

    -- 3. Ascending Primary Key Account Row Locks
    PERFORM id FROM public.financial_accounts
    WHERE id IN (v_master.source_account_id, v_master.destination_account_id)
    ORDER BY id ASC
    FOR UPDATE;

    -- 4. Locate Original Legs
    SELECT * INTO v_orig_src FROM public.financial_transactions 
    WHERE master_transfer_id = p_transfer_id AND leg_type = 'SOURCE' AND is_reversal = false;
    SELECT * INTO v_orig_dest FROM public.financial_transactions 
    WHERE master_transfer_id = p_transfer_id AND leg_type = 'DESTINATION' AND is_reversal = false;

    IF v_orig_src.id IS NULL OR v_orig_dest.id IS NULL THEN
        RAISE EXCEPTION 'Integrity Failure: Original legs for POSTED transfer % are missing.', p_transfer_id USING ERRCODE = 'P0001';
    END IF;

    -- 5. Mutate Master Status to REVERSED
    UPDATE public.internal_transfers
    SET status = 'REVERSED',
        reversed_at = pg_catalog.clock_timestamp(),
        reversed_by_admin_id = p_admin_id,
        reversal_reason = v_clean_reason
    WHERE id = p_transfer_id;

    -- 6. Insert Symmetrical Reversal Legs
    INSERT INTO public.financial_transactions (
        master_transfer_id, leg_type, type, account_id, amount_npr, currency, is_reversal, reversal_of_transaction_id
    ) VALUES 
    (p_transfer_id, 'SOURCE', 'INCOME', v_master.source_account_id, v_master.amount_npr, 'NPR', true, v_orig_src.id),
    (p_transfer_id, 'DESTINATION', 'EXPENSE', v_master.destination_account_id, v_master.amount_npr, 'NPR', true, v_orig_dest.id);

    -- 7. Reverse Account Balances
    UPDATE public.financial_accounts SET current_balance = current_balance + v_master.amount_npr WHERE id = v_master.source_account_id;
    UPDATE public.financial_accounts SET current_balance = current_balance - v_master.amount_npr WHERE id = v_master.destination_account_id;

    -- 8. Audit event
    INSERT INTO public.audit_logs (action, entity_type, entity_id, actor_id, transaction_id, payload)
    VALUES ('TRANSFER_REVERSED', 'InternalTransfer', p_transfer_id::text, p_admin_id, pg_catalog.txid_current(), jsonb_build_object('reversal_reason', v_clean_reason));

    v_result := jsonb_build_object('status', 'REVERSED', 'transfer_id', p_transfer_id);
    PERFORM private.fn_complete_idempotency('REVERSE_INTERNAL_TRANSFER', p_idempotency_key, v_result);

    RETURN v_result;
END;
$$;

-- C. Core Draft Cancellation Engine
CREATE OR REPLACE FUNCTION private.fn_execute_cancel_draft(
    p_transfer_id UUID,
    p_idempotency_key UUID,
    p_cancellation_reason TEXT,
    p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_master RECORD;
    v_leg_count INT;
    v_idemp_result JSONB;
    v_clean_reason TEXT;
    v_result JSONB;
BEGIN
    v_clean_reason := COALESCE(pg_catalog.normalize(p_cancellation_reason, NFC), '');
    IF pg_catalog.length(v_clean_reason) = 0 THEN
        RAISE EXCEPTION 'Validation Failure: Cancellation reason is strictly required.' USING ERRCODE = '22023';
    END IF;

    -- 1. Idempotency claim
    v_idemp_result := private.fn_claim_idempotency('CANCEL_DRAFT_INTERNAL_TRANSFER', p_idempotency_key, p_transfer_id, p_admin_id, v_clean_reason);
    IF v_idemp_result IS NOT NULL THEN
        RETURN v_idemp_result;
    END IF;

    -- 2. Lock master record FOR UPDATE
    SELECT * INTO v_master FROM public.internal_transfers WHERE id = p_transfer_id FOR UPDATE;
    IF v_master.id IS NULL THEN
        RAISE EXCEPTION 'Not Found: Internal transfer % does not exist.', p_transfer_id USING ERRCODE = 'P0002';
    END IF;
    IF v_master.status IS DISTINCT FROM 'DRAFT' THEN
        RAISE EXCEPTION 'Security Violation: Cannot cancel transfer in status % (DRAFT required).', v_master.status USING ERRCODE = '55000';
    END IF;

    -- 3. Assert zero legs exist
    SELECT count(*) INTO v_leg_count FROM public.financial_transactions WHERE master_transfer_id = p_transfer_id;
    IF v_leg_count > 0 THEN
        RAISE EXCEPTION 'Integrity Failure: DRAFT transfer % has % financial legs. Cannot cancel.', p_transfer_id, v_leg_count USING ERRCODE = 'P0001';
    END IF;

    -- 4. Mutate status to CANCELLED
    UPDATE public.internal_transfers
    SET status = 'CANCELLED',
        cancelled_at = pg_catalog.clock_timestamp(),
        cancelled_by_admin_id = p_admin_id,
        cancellation_reason = v_clean_reason
    WHERE id = p_transfer_id;

    -- 5. Audit log
    INSERT INTO public.audit_logs (action, entity_type, entity_id, actor_id, transaction_id, payload)
    VALUES ('DRAFT_TRANSFER_CANCELLED', 'InternalTransfer', p_transfer_id::text, p_admin_id, pg_catalog.txid_current(), jsonb_build_object('cancellation_reason', v_clean_reason));

    v_result := jsonb_build_object('status', 'CANCELLED', 'transfer_id', p_transfer_id);
    PERFORM private.fn_complete_idempotency('CANCEL_DRAFT_INTERNAL_TRANSFER', p_idempotency_key, v_result);

    RETURN v_result;
END;
$$;

-- D. Core Draft Deletion Engine
CREATE OR REPLACE FUNCTION private.fn_execute_delete_draft(
    p_transfer_id UUID,
    p_idempotency_key UUID,
    p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_master RECORD;
    v_leg_count INT;
    v_idemp_result JSONB;
    v_corr_id UUID;
    v_result JSONB;
BEGIN
    -- 1. Idempotency claim
    v_idemp_result := private.fn_claim_idempotency('DELETE_DRAFT_INTERNAL_TRANSFER', p_idempotency_key, p_transfer_id, p_admin_id);
    IF v_idemp_result IS NOT NULL THEN
        RETURN v_idemp_result;
    END IF;

    -- 2. Lock master record FOR UPDATE
    SELECT * INTO v_master FROM public.internal_transfers WHERE id = p_transfer_id FOR UPDATE;
    IF v_master.id IS NULL THEN
        RAISE EXCEPTION 'Not Found: Internal transfer % does not exist.', p_transfer_id USING ERRCODE = 'P0002';
    END IF;
    IF v_master.status IS DISTINCT FROM 'DRAFT' THEN
        RAISE EXCEPTION 'Security Violation: Cannot delete transfer in status % (DRAFT required).', v_master.status USING ERRCODE = '55000';
    END IF;

    -- 3. Assert zero legs exist
    SELECT count(*) INTO v_leg_count FROM public.financial_transactions WHERE master_transfer_id = p_transfer_id;
    IF v_leg_count > 0 THEN
        RAISE EXCEPTION 'Integrity Failure: DRAFT transfer % has % financial legs. Cannot delete.', p_transfer_id, v_leg_count USING ERRCODE = 'P0001';
    END IF;

    -- 4. Emit Audit Snapshot with Durable Correlation UUID
    v_corr_id := pg_catalog.gen_random_uuid();
    INSERT INTO public.audit_logs (
        id, action, entity_type, entity_id, actor_id, transaction_id, payload
    ) VALUES (
        v_corr_id, 'DRAFT_TRANSFER_DELETED', 'InternalTransfer', p_transfer_id::text, p_admin_id,
        pg_catalog.txid_current(), jsonb_build_object('deleted_master', to_jsonb(v_master), 'audit_correlation_id', v_corr_id)
    );

    -- 5. Delete master row
    DELETE FROM public.internal_transfers WHERE id = p_transfer_id;

    v_result := jsonb_build_object('status', 'DELETED', 'transfer_id', p_transfer_id, 'audit_correlation_id', v_corr_id);
    PERFORM private.fn_complete_idempotency('DELETE_DRAFT_INTERNAL_TRANSFER', p_idempotency_key, v_result);

    RETURN v_result;
END;
$$;


-- ============================================================================
-- 5. PUBLIC CLIENT ENTRYPOINTS (POSTGREST & PRISMA)
-- ============================================================================

-- A. PostgREST Posting RPC
CREATE OR REPLACE FUNCTION public.post_internal_transfer_postgrest(
    p_transfer_id UUID,
    p_idempotency_key UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    v_admin_id := auth.uid();
    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'Authentication Failure: Missing Supabase JWT context.' USING ERRCODE = 'P0001';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM public.admin_users WHERE id = v_admin_id AND role = 'SUPERADMIN' AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Authorization Failure: SUPERADMIN privileges required.' USING ERRCODE = 'P0001';
    END IF;

    RETURN private.fn_execute_post_transfer(p_transfer_id, p_idempotency_key, v_admin_id);
END;
$$;

-- B. Prisma Posting Entrypoint
CREATE OR REPLACE FUNCTION public.post_internal_transfer_prisma(
    p_transfer_id UUID,
    p_idempotency_key UUID,
    p_admin_id UUID,
    p_key_id TEXT,
    p_timestamp BIGINT,
    p_nonce TEXT,
    p_signature TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_nonce_rec RECORD;
    v_computed_hash TEXT;
BEGIN
    -- 1. Compute canonical request hash from actual arguments
    v_computed_hash := private.fn_compute_request_hash(
        p_key_id, 'POST', p_transfer_id, p_idempotency_key, p_admin_id, p_timestamp, p_nonce, ''
    );

    -- 2. Lock and verify preflight nonce record
    SELECT * INTO v_nonce_rec FROM public.consumed_nonces WHERE nonce = p_nonce FOR UPDATE;
    IF v_nonce_rec.nonce IS NULL THEN
        RAISE EXCEPTION 'Authentication Failure: Preflight nonce claim does not exist.' USING ERRCODE = 'P0001';
    END IF;
    IF v_nonce_rec.consumed_in_business_tx THEN
        RAISE EXCEPTION 'Authentication Failure: Nonce % has already been consumed in a business transaction.', p_nonce USING ERRCODE = 'P0001';
    END IF;
    IF v_nonce_rec.action IS DISTINCT FROM 'POST' OR
       v_nonce_rec.transfer_id IS DISTINCT FROM p_transfer_id OR
       v_nonce_rec.idempotency_key IS DISTINCT FROM p_idempotency_key OR
       v_nonce_rec.admin_id IS DISTINCT FROM p_admin_id OR
       v_nonce_rec.request_hash IS DISTINCT FROM v_computed_hash THEN
        RAISE EXCEPTION 'Authentication Failure: Business request arguments do not match preflight nonce claim.' USING ERRCODE = 'P0001';
    END IF;

    -- 3. Consume nonce atomically
    UPDATE public.consumed_nonces SET consumed_in_business_tx = true WHERE nonce = p_nonce;

    -- 4. Execute business logic
    RETURN private.fn_execute_post_transfer(p_transfer_id, p_idempotency_key, p_admin_id);
END;
$$;

-- C. PostgREST Reversal RPC
CREATE OR REPLACE FUNCTION public.reverse_internal_transfer_postgrest(
    p_transfer_id UUID,
    p_idempotency_key UUID,
    p_reversal_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    v_admin_id := auth.uid();
    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'Authentication Failure: Missing Supabase JWT context.' USING ERRCODE = 'P0001';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM public.admin_users WHERE id = v_admin_id AND role = 'SUPERADMIN' AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Authorization Failure: SUPERADMIN privileges required.' USING ERRCODE = 'P0001';
    END IF;

    RETURN private.fn_execute_reverse_transfer(p_transfer_id, p_idempotency_key, p_reversal_reason, v_admin_id);
END;
$$;

-- D. Prisma Reversal Entrypoint
CREATE OR REPLACE FUNCTION public.reverse_internal_transfer_prisma(
    p_transfer_id UUID,
    p_idempotency_key UUID,
    p_admin_id UUID,
    p_reversal_reason TEXT,
    p_key_id TEXT,
    p_timestamp BIGINT,
    p_nonce TEXT,
    p_signature TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_nonce_rec RECORD;
    v_computed_hash TEXT;
BEGIN
    v_computed_hash := private.fn_compute_request_hash(
        p_key_id, 'REVERSE', p_transfer_id, p_idempotency_key, p_admin_id, p_timestamp, p_nonce, p_reversal_reason
    );

    SELECT * INTO v_nonce_rec FROM public.consumed_nonces WHERE nonce = p_nonce FOR UPDATE;
    IF v_nonce_rec.nonce IS NULL OR v_nonce_rec.consumed_in_business_tx THEN
        RAISE EXCEPTION 'Authentication Failure: Invalid or consumed preflight nonce.' USING ERRCODE = 'P0001';
    END IF;
    IF v_nonce_rec.action IS DISTINCT FROM 'REVERSE' OR
       v_nonce_rec.transfer_id IS DISTINCT FROM p_transfer_id OR
       v_nonce_rec.idempotency_key IS DISTINCT FROM p_idempotency_key OR
       v_nonce_rec.admin_id IS DISTINCT FROM p_admin_id OR
       v_nonce_rec.request_hash IS DISTINCT FROM v_computed_hash THEN
        RAISE EXCEPTION 'Authentication Failure: Arguments do not match preflight claim.' USING ERRCODE = 'P0001';
    END IF;

    UPDATE public.consumed_nonces SET consumed_in_business_tx = true WHERE nonce = p_nonce;

    RETURN private.fn_execute_reverse_transfer(p_transfer_id, p_idempotency_key, p_reversal_reason, p_admin_id);
END;
$$;

-- E. Prisma Draft Deletion Entrypoint
CREATE OR REPLACE FUNCTION public.delete_draft_internal_transfer_prisma(
    p_transfer_id UUID,
    p_idempotency_key UUID,
    p_admin_id UUID,
    p_key_id TEXT,
    p_timestamp BIGINT,
    p_nonce TEXT,
    p_signature TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_nonce_rec RECORD;
    v_computed_hash TEXT;
BEGIN
    v_computed_hash := private.fn_compute_request_hash(
        p_key_id, 'DELETE_DRAFT', p_transfer_id, p_idempotency_key, p_admin_id, p_timestamp, p_nonce, ''
    );

    SELECT * INTO v_nonce_rec FROM public.consumed_nonces WHERE nonce = p_nonce FOR UPDATE;
    IF v_nonce_rec.nonce IS NULL OR v_nonce_rec.consumed_in_business_tx THEN
        RAISE EXCEPTION 'Authentication Failure: Invalid or consumed preflight nonce.' USING ERRCODE = 'P0001';
    END IF;
    IF v_nonce_rec.action IS DISTINCT FROM 'DELETE_DRAFT' OR
       v_nonce_rec.transfer_id IS DISTINCT FROM p_transfer_id OR
       v_nonce_rec.idempotency_key IS DISTINCT FROM p_idempotency_key OR
       v_nonce_rec.admin_id IS DISTINCT FROM p_admin_id OR
       v_nonce_rec.request_hash IS DISTINCT FROM v_computed_hash THEN
        RAISE EXCEPTION 'Authentication Failure: Arguments do not match preflight claim.' USING ERRCODE = 'P0001';
    END IF;

    UPDATE public.consumed_nonces SET consumed_in_business_tx = true WHERE nonce = p_nonce;

    RETURN private.fn_execute_delete_draft(p_transfer_id, p_idempotency_key, p_admin_id);
END;
$$;

-- F. PostgREST Draft Cancellation RPC
CREATE OR REPLACE FUNCTION public.cancel_draft_internal_transfer_postgrest(
    p_transfer_id UUID,
    p_idempotency_key UUID,
    p_cancellation_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    v_admin_id := auth.uid();
    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'Authentication Failure: Missing Supabase JWT context.' USING ERRCODE = 'P0001';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM public.admin_users WHERE id = v_admin_id AND role = 'SUPERADMIN' AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Authorization Failure: SUPERADMIN privileges required.' USING ERRCODE = 'P0001';
    END IF;

    RETURN private.fn_execute_cancel_draft(p_transfer_id, p_idempotency_key, p_cancellation_reason, v_admin_id);
END;
$$;

-- G. Prisma Draft Cancellation Entrypoint
CREATE OR REPLACE FUNCTION public.cancel_draft_internal_transfer_prisma(
    p_transfer_id UUID,
    p_idempotency_key UUID,
    p_admin_id UUID,
    p_cancellation_reason TEXT,
    p_key_id TEXT,
    p_timestamp BIGINT,
    p_nonce TEXT,
    p_signature TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_nonce_rec RECORD;
    v_computed_hash TEXT;
BEGIN
    v_computed_hash := private.fn_compute_request_hash(
        p_key_id, 'CANCEL_DRAFT', p_transfer_id, p_idempotency_key, p_admin_id, p_timestamp, p_nonce, p_cancellation_reason
    );

    SELECT * INTO v_nonce_rec FROM public.consumed_nonces WHERE nonce = p_nonce FOR UPDATE;
    IF v_nonce_rec.nonce IS NULL OR v_nonce_rec.consumed_in_business_tx THEN
        RAISE EXCEPTION 'Authentication Failure: Invalid or consumed preflight nonce.' USING ERRCODE = 'P0001';
    END IF;
    IF v_nonce_rec.action IS DISTINCT FROM 'CANCEL_DRAFT' OR
       v_nonce_rec.transfer_id IS DISTINCT FROM p_transfer_id OR
       v_nonce_rec.idempotency_key IS DISTINCT FROM p_idempotency_key OR
       v_nonce_rec.admin_id IS DISTINCT FROM p_admin_id OR
       v_nonce_rec.request_hash IS DISTINCT FROM v_computed_hash THEN
        RAISE EXCEPTION 'Authentication Failure: Arguments do not match preflight claim.' USING ERRCODE = 'P0001';
    END IF;

    UPDATE public.consumed_nonces SET consumed_in_business_tx = true WHERE nonce = p_nonce;

    RETURN private.fn_execute_cancel_draft(p_transfer_id, p_idempotency_key, p_cancellation_reason, p_admin_id);
END;
$$;

-- H. Authenticated Administrative Read Entrypoint
CREATE OR REPLACE FUNCTION public.get_internal_transfer_details(
    p_transfer_id UUID,
    p_idempotency_key UUID,
    p_admin_id UUID,
    p_key_id TEXT,
    p_timestamp BIGINT,
    p_nonce TEXT,
    p_signature TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_nonce_rec RECORD;
    v_computed_hash TEXT;
    v_transfer RECORD;
    v_legs JSONB;
BEGIN
    -- 1. Compute request hash
    v_computed_hash := private.fn_compute_request_hash(
        p_key_id, 'GET_DETAILS', p_transfer_id, p_idempotency_key, p_admin_id, p_timestamp, p_nonce, ''
    );

    -- 2. Lock and verify preflight nonce
    SELECT * INTO v_nonce_rec FROM public.consumed_nonces WHERE nonce = p_nonce FOR UPDATE;
    IF v_nonce_rec.nonce IS NULL OR v_nonce_rec.consumed_in_business_tx THEN
        RAISE EXCEPTION 'Authentication Failure: Invalid or consumed read nonce.' USING ERRCODE = 'P0001';
    END IF;
    IF v_nonce_rec.action IS DISTINCT FROM 'GET_DETAILS' OR
       v_nonce_rec.transfer_id IS DISTINCT FROM p_transfer_id OR
       v_nonce_rec.idempotency_key IS DISTINCT FROM p_idempotency_key OR
       v_nonce_rec.admin_id IS DISTINCT FROM p_admin_id OR
       v_nonce_rec.request_hash IS DISTINCT FROM v_computed_hash THEN
        RAISE EXCEPTION 'Authentication Failure: Arguments do not match read preflight claim.' USING ERRCODE = 'P0001';
    END IF;

    UPDATE public.consumed_nonces SET consumed_in_business_tx = true WHERE nonce = p_nonce;

    -- 3. Query transfer with explicit projected fields
    SELECT id, voucher_number, status, amount_npr, currency,
           source_account_id, destination_account_id,
           created_at, posted_at, reversed_at, cancelled_at
    INTO v_transfer FROM public.internal_transfers WHERE id = p_transfer_id;

    IF v_transfer.id IS NULL THEN
        RAISE EXCEPTION 'Not Found: Internal transfer % does not exist.', p_transfer_id USING ERRCODE = 'P0002';
    END IF;

    -- 4. Query legs with explicit projected fields
    SELECT jsonb_agg(jsonb_build_object(
        'id', l.id,
        'leg_type', l.leg_type,
        'type', l.type,
        'account_id', l.account_id,
        'amount_npr', l.amount_npr,
        'currency', l.currency,
        'is_reversal', l.is_reversal,
        'reversal_of_transaction_id', l.reversal_of_transaction_id
    ))
    INTO v_legs FROM public.financial_transactions l WHERE l.master_transfer_id = p_transfer_id;

    -- 5. Audit read event
    INSERT INTO public.audit_logs (action, entity_type, entity_id, actor_id, transaction_id, payload)
    VALUES ('TRANSFER_DETAILS_ACCESSED', 'InternalTransfer', p_transfer_id::text, p_admin_id, pg_catalog.txid_current(), jsonb_build_object('accessed_at', pg_catalog.clock_timestamp()));

    RETURN jsonb_build_object('transfer', to_jsonb(v_transfer), 'legs', COALESCE(v_legs, '[]'::jsonb));
END;
$$;


-- ============================================================================
-- 6. DISCRETIONARY GRANTS FOR ENTRYPOINTS
-- ============================================================================
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.post_internal_transfer_postgrest TO authenticated;
GRANT EXECUTE ON FUNCTION public.reverse_internal_transfer_postgrest TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_draft_internal_transfer_postgrest TO authenticated;

GRANT EXECUTE ON FUNCTION public.post_internal_transfer_prisma TO madi_app_user;
GRANT EXECUTE ON FUNCTION public.reverse_internal_transfer_prisma TO madi_app_user;
GRANT EXECUTE ON FUNCTION public.delete_draft_internal_transfer_prisma TO madi_app_user;
GRANT EXECUTE ON FUNCTION public.cancel_draft_internal_transfer_prisma TO madi_app_user;
GRANT EXECUTE ON FUNCTION public.get_internal_transfer_details TO madi_app_user;
GRANT EXECUTE ON FUNCTION public.claim_nonce_preflight TO madi_app_user;
