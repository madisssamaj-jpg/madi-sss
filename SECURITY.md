# Madi SSS — Security Architecture & Threat Model

This document outlines the security architecture, threat model, cryptographic invariants, and operational controls implemented in the Madi (Sankhuwasabha) Sarokar Samaj platform.

---

## 1. Authentication & Session Security

- **Admin Sessions:** Sessions are encrypted using **AES-256-GCM** and stored in secure, `HttpOnly`, `SameSite=Lax`, and `Secure` cookies (`madi_admin_session`).
- **Defense-in-Depth:** In addition to cryptographic token verification, high-privilege operations query the live database state to confirm that the admin account is active and has not been revoked.
- **Role-Based Access Control (RBAC):**
  - `SUPERADMIN`: Full read/write access to financial mutations, content publishing, and user administration.
  - `EDITOR`: Access to CMS content, activities, events, and reports. Blocked from financial transactions.
  - `AUDITOR`: Read-only access to financial ledgers, audit logs, and reports.

---

## 2. Financial Subsystem Invariants

The Internal Transfer financial subsystem is designed around six non-negotiable security invariants:

### 1. Cryptographic HMAC Attestation
- All financial mutations (`POST`, `REVERSE`, `CANCEL_DRAFT`) require a cryptographic HMAC-SHA256 signature generated over an intermediate request hash.
- The canonical string adheres to the **Netstring** specification:
  ```
  "v1,len:keyId,len:action,36:transferId,36:idempotencyKey,36:adminId,len:timestamp,32:nonce,len:auxReason,"
  ```
- All Devanagari text is normalized to Unicode standard **NFC** before byte counting to ensure byte-level determinism.

### 2. Preflight Nonce Protocol (Burn-on-Read)
- Execution requires a single-use 32-character hexadecimal nonce registered in a dedicated table during a preflight handshake.
- Nonces are consumed atomically upon transaction execution, preventing replay attacks across network retries.

### 3. Atomic Idempotency
- Requests contain a client-provided `idempotency_key`.
- The database stores a hash fingerprint of the request. Replay attempts with matching fingerprints return the cached committed result without re-mutating account balances.
- Requests reusing an idempotency key with conflicting payloads are strictly rejected.

### 4. Deterministic Ascending Account Locking
- To eliminate deadlock risks under concurrent transfers between identical accounts, account rows are locked using:
  ```sql
  SELECT id, current_balance FROM financial_accounts
  WHERE id IN (v_source_id, v_dest_id)
  ORDER BY id ASC
  FOR UPDATE;
  ```
- Regardless of transfer direction ($A \rightarrow B$ or $B \rightarrow A$), accounts are acquired in the same deterministic lock order.

### 5. Deferred Ledger Parity Triggers
- Ledger balance equality is enforced at transaction commit by a deferred constraint trigger (`trg_fn_ledger_parity_check`).
- The trigger validates:
  $$\text{current\_balance} = \text{opening\_balance} + \sum(\text{financial\_legs})$$
- Any discrepancy raises an exception and rolls back the entire transaction.

### 6. Currency Invariant & Immutability
- Financial accounts and transfer records enforce `CHECK (currency = 'NPR')`.
- Financial ledger entries (`financial_legs`) and audit records (`financial_audit_logs`) have `BEFORE UPDATE OR DELETE` triggers that block modifications, guaranteeing append-only immutability.

---

## 3. Privacy & Data Protection

- **Public Zero-Knowledge of Member Data:** Personal contact numbers, ward addresses, and reasons for joining submitted via membership applications are stored securely in internal CMS tables protected by PostgreSQL Row-Level Security (RLS). They are never exposed over public endpoints.
- **Confidential Grievance Desk:** Feedback and complaints are routed directly into the administrator inbox.
- **Error Masking:** Database error codes (such as SQLSTATE 55000 or table names) are masked by `sanitizeDatabaseError` into clean, generic Nepali user feedback to prevent database reconnaissance.

---

## 4. Known Residual Risks

1. **Direct DB Superuser Access:** Direct connections using PostgreSQL superuser credentials can bypass RLS. Production connections must connect through connection poolers using least-privilege roles.
2. **Key Compromise:** If `FINANCIAL_HMAC_SECRET` is compromised, an attacker with internal network access could forge transfer attestations. Key rotation runbooks are detailed below.

---

## 5. Incident Response & Key Rotation Runbook

If a secret is suspected of being compromised:
1. Generate a new 256-bit secret: `openssl rand -hex 32`.
2. Update `FINANCIAL_HMAC_SECRET` in environment variables with an incremented key ID (`keyId: 'k2'`).
3. Restart application nodes.
4. Review `financial_audit_logs` for any unauthorized transfer activities within the compromise window.

