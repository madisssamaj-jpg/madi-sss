# Madi SSS — Staging & Production Deployment Guide

This guide details the procedures for deploying the Madi SSS web platform to staging, the deployment checklist for production go-live, rollback procedures, and database disaster recovery.

---

## 1. Staging Environment Deployment

### Step 1: Staging Supabase Project Setup
1. Create a dedicated Supabase project (e.g. `madi-sss-staging`).
2. Navigate to the SQL Editor and execute all migrations in numerical order:
   - `supabase/migrations/20261103000000_init_financial_subsystem.sql`
   - `supabase/migrations/20261103000001_community_cms_modules.sql`
   - `supabase/migrations/20261103000002_media_banners_gallery_settings.sql`
3. Execute `supabase/seed.sql` to populate staging test data.
4. Create Supabase Storage buckets with public read policies:
   - `madi-media` (for photos, banners, and thumbnails)
   - `madi-documents` (for PDF reports and audit files)

### Step 2: Hosting Platform Setup (Vercel / Railway)
1. Link repository to Vercel/Railway under the `staging` branch or preview environment.
2. Configure environment variables using `.env.staging.example`.
3. Set build command: `npm run build`.
4. Trigger deployment and verify staging smoke test.

---

## 2. Production Go-Live Checklist (TO BE PERFORMED AT GO-LIVE ONLY)

> [!IMPORTANT]
> The following steps are strictly designated for the official production launch window and must NOT be executed prior to formal authorization.

### Pre-Go-Live (Final Staging Sign-Off)
- [ ] Staging QA verification completed on mobile (360px, 390px) and desktop.
- [ ] Financial internal transfer dry run verified in staging.
- [ ] Real committee and contact data verified by Madi secretariat.
- [ ] Independent audit PDF documents reviewed and uploaded to production storage.
- [ ] Production Supabase project created with fresh migration execution (WITHOUT `seed.sql`).

### Go-Live Window Tasks (FINAL LAUNCH ONLY)
- [ ] **Task 1: Production Database Initialization**
  - Run migrations `000000`, `000001`, `000002`, `000003`, `000004`, and `000005` on clean production database (STRICTLY EXCLUDING `seed.sql`).
  - Insert initial verified financial accounts and Superadmin credentials.
  - Enforce `chk_constitution_original_before_publish` constraint ensuring non-original reference drafts are quarantined with `is_original_approved_document=false`.
- [ ] **Task 2: Production Storage Configuration**
  - Configure storage buckets (`madi-media`, `madi-documents`, `official-documents`, and private `internal-documents`).
  - Ensure `internal-documents` is strictly private (`public = false`) for confidential drafts and reference material.
  - When the stamped DAO original Constitution PDF arrives, upload to `official-documents` via Superadmin CMS and confirm `is_original_approved_document=true`.
  - Set CORS and upload size limit rules (50 MB limit for documents).
- [ ] **Task 3: Production Environment Variables**
  - Configure production `DATABASE_URL`, `MADI_SESSION_SECRET`, and `FINANCIAL_HMAC_SECRET`.
  - Configure production Resend / SMTP email credentials.
- [ ] **Task 4: Custom Domain & DNS Connection**
  - Add custom domain `madisss.org.np` and `www.madisss.org.np` to hosting dashboard.
  - Configure DNS A/CNAME records with the registrar.
  - Issue and verify production SSL certificates.
- [ ] **Task 5: Post-Launch Smoke Verification**
  - Verify homepage, SSL lock, Nepali font rendering, and contact form.
  - Test admin login with Superadmin account.
  - Test email dispatch receipt.

---

## 3. Rollback Procedure

If a critical failure occurs during deployment:

1. **Application Rollback (Vercel/Railway):**
   - In the hosting deployment history, select the previous stable deployment and click **"Rollback / Promote to Production"**.
   - Rollback takes effect in under 30 seconds globally.
2. **Database Schema Rollback:**
   - Every migration file has an inverse rollback script.
   - If a table error occurs, restore the snapshot taken prior to the deployment window:
     ```bash
     pg_restore -h [HOST] -U postgres -d postgres -c pre_launch_backup.dump
     ```

---

## 4. Database Disaster Recovery & Backup Procedure

### Daily Automated Backups
Supabase manages automated daily point-in-time recovery (PITR) for PostgreSQL.

### Manual Backup Script (Before Any Major Change)
```bash
# Dump complete database schema and data:
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  --format=custom \
  --file="madi_backup_$(date +%Y%m%d_%H%M%S).dump"
```

### Restore Procedure
```bash
# Restore to a staging or recovery instance:
pg_restore -h [HOST] -p 5432 -U postgres -d postgres \
  --clean --if-exists \
  "madi_backup_YYYYMMDD_HHMMSS.dump"
```

