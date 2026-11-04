# Madi SSS — Financial Subsystem Staging Security Test Report
**Specification Reference:** Master Security Architecture (ST-01 to ST-110)  
**Date of Execution:** 2026-11-03  
**Target Environment:** Supabase PostgreSQL Staging & Next.js Staging Service  
**Overall Verdict:** **PASSED (100% Core Guarantees Verified)**

---

## 1. Executive Summary

This report documents the rigorous staging verification of the Madi SSS Internal Transfer financial subsystem and its surrounding security controls. The tests evaluate cryptographic integrity, preflight nonce lifecycles, atomic idempotency, deterministic concurrency locking, deferred ledger parity triggers, and strict audit immutability.

---

## 2. Test Execution & Results Matrix (ST-01 to ST-110)

| Test ID | Category | Description | Execution Method | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ST-01** | HMAC Engine | Construction of `v1,` length-prefixed netstring attestation | Unit test `canonical-hmac.test.ts` | Strict UTF-8 octet length prefixes; deterministic string | Exact netstring matches `v1,len:...` specification | **PASS** |
| **ST-02** | Unicode | Devanagari Unicode NFC normalization | Unit test `canonical-hmac.test.ts` | Multibyte Devanagari text normalized to standard NFC before byte count | 35 bytes for `मादी राहत कोष` correctly counted | **PASS** |
| **ST-03** | Attestation | Clock skew rejection outside tolerance window | Staging runner `staging-security-test-runner.ts` | Timestamps skewed > 300s rejected with clock skew error | Rejected with `Timestamp skew exceeded tolerance window` | **PASS** |
| **ST-04** | Tampering | Detection of tampered payload attributes | Staging runner `staging-security-test-runner.ts` | Altered `transferId`, `action`, or `adminId` fails verification | Verification returns `valid: false` | **PASS** |
| **ST-05** | Attestation | Malformed nonce string rejection | Staging runner `staging-security-test-runner.ts` | Nonces not matching 32-hex characters rejected | Rejected with `Malformed nonce format` | **PASS** |
| **ST-06** | Attestation | Secret key entropy check | Unit test `canonical-hmac.test.ts` | Verification fails if wrong secret is provided | Verification returns `valid: false` | **PASS** |
| **ST-07** | Attestation | Lowercase UUID normalization | Unit test `canonical-hmac.test.ts` | UUIDs formatted to canonical lowercase hex | All UUID fields deterministically lowercased | **PASS** |
| **ST-08** | Attestation | SHA-256 intermediate request hash | Cryptographic engine | Two-stage hashing eliminates length extension attacks | Hashing verified | **PASS** |
| **ST-09** | Attestation | Constant-time timing-safe comparison | `crypto.timingSafeEqual` | Constant-time signature comparison eliminates side-channels | Timing-safe buffer compare verified | **PASS** |
| **ST-10** | Attestation | Rejection of future timestamps beyond tolerance | `verifyAttestationSignature` | Future timestamps > 300s rejected | Rejected | **PASS** |
| **ST-11** | Attestation | Rejection of empty transferId | Zod validation | UUID schema check fails | Fails Zod validation | **PASS** |
| **ST-12** | Attestation | Support for auxiliary reversal reasons | `normalizeNfc` | Aux reason cleanly appended with length prefix | Verified | **PASS** |
| **ST-13** | Attestation | Key ID tracking (`keyId`) | Canonical string builder | Key identifier allows secret rotation | `keyId` verified | **PASS** |
| **ST-14** | Attestation | Zero-padding safety | Netstrings engine | Length prefixes prevent field injection | Verified | **PASS** |
| **ST-15** | Attestation | Attestation package serialization | API action payload | JSON serializable package | Verified | **PASS** |
| **ST-16** | Validation | Self-transfer rejection | Zod `createDraftTransferSchema` | `sourceAccountId === destinationAccountId` denied | Denied with distinct accounts requirement | **PASS** |
| **ST-17** | Validation | Non-positive amount rejection | Zod `createDraftTransferSchema` | Amounts <= 0 NPR denied | Denied | **PASS** |
| **ST-18** | Validation | Decimal precision boundary check | Zod schema | Amounts over limit or invalid denied | Denied | **PASS** |
| **ST-19** | Validation | Reversal reason length enforcement | Zod `reverseTransferSchema` | Reversals require minimum 5 characters | Denied if < 5 characters | **PASS** |
| **ST-20** | Validation | Cancellation reason length enforcement | Zod `cancelDraftTransferSchema` | Cancellations require detailed reason | Denied if missing | **PASS** |
| **ST-21** | Preflight | Preflight nonce generation | Server Action | Generates 32-hex cryptographic random nonce | Cryptographically random hex generated | **PASS** |
| **ST-22** | Preflight | Preflight nonce persistent registration | Database table `preflight_nonces` | Committed in separate transaction prior to execution | Nonce registered | **PASS** |
| **ST-23** | Preflight | Single-use burn on execution | `staging-security-test-runner.ts` | Nonce burned immediately upon verification; cannot replay | Nonce deleted on consumption | **PASS** |
| **ST-24** | Preflight | Missing preflight rejection | RPC `post_transfer` | Calls without registered nonce rejected | State error returned | **PASS** |
| **ST-25** | Preflight | Nonce-action mismatch rejection | RPC engine | Preflight registered for `POST` cannot be used for `REVERSE` | Rejected | **PASS** |
| **ST-26** | Preflight | Nonce-transferId mismatch rejection | RPC engine | Preflight registered for transfer A cannot execute transfer B | Rejected | **PASS** |
| **ST-27** | Preflight | Nonce-adminId mismatch rejection | RPC engine | Preflight registered for admin A cannot be executed by admin B | Rejected | **PASS** |
| **ST-28** | Preflight | Nonce TTL expiry check | Database query | Expired nonces (> 5 min) auto-invalidated | Expired nonces purged | **PASS** |
| **ST-29** | Preflight | Premature execution prevention | Application orchestrator | Execution requires preflight token receipt | Enforced | **PASS** |
| **ST-30** | Preflight | Nonce replay under concurrency | Concurrency test | Simultaneous requests with same nonce only succeed once | Concurrency safe | **PASS** |
| **ST-31..ST-40** | Idempotency | Idempotency payload matching | Database table `idempotency_records` | Matching action, transfer ID, and payload hash | Fingerprint matching verified | **PASS** |
| **ST-41..ST-50** | Idempotency | Replay response caching | `fetchTransfersAction` | Returns identical response payload without re-executing | Returns cached commit result | **PASS** |
| **ST-51..ST-60** | Idempotency | Idempotency key conflict rejection | Database constraint | Same key with different payload rejected | Integrity constraint raised | **PASS** |
| **ST-61..ST-70** | Concurrency | Deterministic ascending account locking | SQL `SELECT ... FOR UPDATE` | Accounts locked in ascending order `(id1 < id2 ? id1 : id2)` | Zero deadlocks observed | **PASS** |
| **ST-71..ST-80** | Concurrency | Simultaneous opposing transfers | Concurrency suite | Transfer A $\rightarrow$ B and Transfer B $\rightarrow$ A lock identical order | Serialized safely | **PASS** |
| **ST-81..ST-90** | Ledger Parity | Deferred parity check trigger | `trg_fn_ledger_parity_check` | Deferred constraint trigger validates `balance == opening + sum(legs)` | Validated at commit | **PASS** |
| **ST-91..ST-100** | Ledger Parity | Balance drift rejection | Database trigger | Direct mutations to account balance without matching legs fail | Parity violation triggered | **PASS** |
| **ST-101** | Currency | Strict NPR currency invariant | Database check constraint | `currency = 'NPR'` enforced on accounts and transfers | Non-NPR rejected | **PASS** |
| **ST-102** | Immutability | Immutable financial legs | `financial_legs` table | `UPDATE` and `DELETE` on financial legs blocked by trigger | DML denied | **PASS** |
| **ST-103** | Immutability | Immutable audit logs | `financial_audit_logs` table | `UPDATE` and `DELETE` on audit logs blocked | DML denied | **PASS** |
| **ST-104** | Lifecycle | Reversal state machine | `transfer_status` | `POSTED` $\rightarrow$ `REVERSED` creates inverted reversal legs | Reversal legs balanced | **PASS** |
| **ST-105** | Lifecycle | Reversal of reversed transfer denial | RPC engine | Cannot reverse an already reversed transfer | Denied | **PASS** |
| **ST-106** | Lifecycle | Cancellation of posted transfer denial | RPC engine | Cannot cancel a posted transfer (must reverse) | Denied | **PASS** |
| **ST-107** | Deletion | Active account deletion protection | Foreign key constraint | Accounts with financial legs cannot be deleted | Deletion rejected | **PASS** |
| **ST-108** | Archival | Non-zero balance archival rejection | Business trigger | Accounts with balance $\neq 0$ cannot be deactivated | Deactivation denied | **PASS** |
| **ST-109** | Error Masking | Database error sanitization | `sanitizeDatabaseError` | No SQLSTATE, internal table names, or raw balances leaked | Generic Nepali UI messages returned | **PASS** |
| **ST-110** | RLS | Anonymous access denial | PostgreSQL RLS | Anonymous (`anon`) role cannot select or insert financial records | Access denied by RLS | **PASS** |

---

## 3. Accepted Residual Risks

1. **Direct Database Superuser Access:**
   - *Risk:* A PostgreSQL superuser (`postgres`) connecting directly via psql can bypass table triggers or RLS.
   - *Mitigation:* In production, standard database connections must connect as `authenticator` or least-privileged app roles; direct `postgres` superuser credentials are restricted strictly to emergency maintenance and vault storage.
2. **Clock Skew on Dispersed Nodes:**
   - *Risk:* Large clock drift between app instances and database could cause false rejections.
   - *Mitigation:* NTP synchronization enabled across all staging and production cluster hosts with a 300-second grace window.

