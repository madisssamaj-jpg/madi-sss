# Madi Sankhuwasabha Sarokar Samaj (Kathmandu) — Web Platform & CMS

Official bilingual web platform and content management administration suite for **Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu** (मादी संखुवासभा सरोकार समाज, काठमाण्डौं).

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL, Auth, Storage)** with an immutable double-entry financial internal transfer subsystem.

---

## 🏛️ Core Features

- **Public Bilingual Portal:** Full Nepali-first (`ne`) and English (`en`) bilingual experience.
- **Social Activities:** Health clinics, blood donation drives, cultural preservation, and educational symposiums.
- **Relief & Welfare Support:** Humanitarian aid transparency ledger with material breakdowns and audit attachments.
- **Events & Programs:** Upcoming and completed events calendar with agendas, venue information, and online registration.
- **Membership Subsystem:** Online membership application with rate-limiting, tier cards, and downloadable offline form.
- **Leadership & Committee:** Directory for Executive Committee, Advisory Council, and departmental Sub-Committees.
- **Governance & Official Constitution:** Public repository for ICAN-audited financial reports, versioned official Constitution (विधान) approved by DAO Kathmandu (मिति: २०८२/०६/२९), organizational policies, and executive minutes.
- **About Us & Objectives:** Detailed institutional history, statutory objectives (परिच्छेद २), and direct constitution PDF download.
- **Gallery & Media:** Albums, photos, video embeds, and centralized asset management.
- **Feedback & Complaints Desk:** Confidential grievance and relief request submission portal with status tracking.
- **CMS Admin Portal:** Secure administrative panel managing all site content, banners, media, notices, applications, and settings.
- **Financial Subsystem:** Hardened double-entry internal transfer ledger with HMAC attestation, preflight nonces, idempotency replay, and deferred parity constraint triggers.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js:** v20.x or v24.x LTS
- **npm:** v10.x+
- **Supabase Account:** Dedicated project for staging and production

### 2. Installation
```bash
git clone https://github.com/madi-sss/madi-sss.git
cd madi-sss
npm install
```

### 3. Environment Configuration
Copy the staging environment template:
```bash
cp .env.staging.example .env.local
```
Fill in the following variables:
- `DATABASE_URL` & `DIRECT_URL`: Supabase PostgreSQL pooled and direct connections.
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase project API keys.
- `MADI_SESSION_SECRET`: 256-bit encryption key (`openssl rand -hex 32`).
- `FINANCIAL_HMAC_SECRET`: 256-bit HMAC secret (`openssl rand -hex 32`).
- `EMAIL_NOTIFICATIONS_ENABLED`: `true` to enable transactional emails.

### 4. Database Migrations & Seeding
Apply migrations cleanly from an empty database in Supabase SQL editor or via Supabase CLI:
```bash
# Apply in numerical order:
supabase/migrations/20261103000000_init_financial_subsystem.sql
supabase/migrations/20261103000001_community_cms_modules.sql
supabase/migrations/20261103000002_media_banners_gallery_settings.sql
supabase/migrations/20261103000003_constitution_versioning.sql
supabase/migrations/20261103000004_storage_and_constitution_url.sql
supabase/migrations/20261103000005_quarantine_non_original_constitution.sql

# Seed demo/staging data (DO NOT run seed.sql on production):
supabase/seed.sql
```

### 5. Running the Application
```bash
# Start local development server
npm run dev

# Run TypeScript typecheck
npm run typecheck

# Run full test suite (Unit + Financial security)
npm test

# Build production bundle
npm run build
```

---

## 🧪 Testing Suite

- **Unit & Security Tests:** `npm test` runs 40 automated tests verifying HMAC attestation, length prefixes, error sanitization, Zod boundary validation, financial invariants, and the Constitution versioning workflow.
- **Financial Security Battery (ST-01 to ST-110):** `npm run test:financial` verifies the master financial security specification.
- **E2E Integration Tests:** `npm run test:e2e` executes Playwright tests across multiple viewports (360px, 390px, 768px, 1024px, 1440px).

---

## 📂 Documentation Directory

- [`DEPLOYMENT.md`](./DEPLOYMENT.md): Staging setup, production deployment checklist, rollback, and backup runbooks.
- [`SECURITY.md`](./SECURITY.md): Detailed security architecture, roles, RLS policies, HMAC attestation, and nonces.
- [`ADMIN_MANUAL.md`](./ADMIN_MANUAL.md): Bilingual operational guide for non-technical Madi staff.
- [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md): Production launch readiness checklist.
- [`docs/security-test-report.md`](./docs/security-test-report.md): Execution evidence for tests ST-01 through ST-110.
