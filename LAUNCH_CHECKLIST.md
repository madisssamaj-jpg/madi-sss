# Madi SSS — Production Launch Checklist

This checklist must be reviewed and signed off by the lead developer, the Madi SSS General Secretary, and the Treasurer prior to final go-live.

---

## 1. Pre-Launch Quality Assurance (Staging Sign-Off)

- [x] All 40 automated unit, security, and constitution workflow tests passing (`npm test`).
- [x] TypeScript strict typecheck passing with 0 errors (`npm run typecheck`).
- [x] Production build succeeding without errors (`npm run build`).
- [x] Mobile responsiveness verified on 360px, 390px, 768px, 1024px, and 1440px viewports.
- [x] Nepali font rendering and typography spacing verified on mobile screens.
- [x] Navigation links on desktop and mobile menu tested for all community modules including About Us (`/about`).
- [x] Custom 404 page tested on invalid routes.
- [x] Language switcher tested between Nepali (`/ne`) and English (`/en`).

---

## 2. Content, Media & Official Constitution Readiness

- [x] Sample/demo data clearly identified in `supabase/seed.sql` (strictly excluded from production deployment).
- [x] **Official Constitution (विधान) Governance & Quarantine Architecture:**
  - [x] Official Supabase Storage bucket created (`official-documents`) with public read RLS policy.
  - [x] Private internal bucket created (`internal-documents`, `public = false`) for confidential drafts and reference material.
  - [x] Non-original reference draft quarantined: moved out of `official-documents` to `internal-documents` (`reference-drafts/madi-sss-constitution-2082-reference-draft.pdf`).
  - [x] Old public URL verified returning 404 (`{"statusCode":"404","error":"not_found","message":"Object not found","code":"NoSuchKey"}`).
  - [x] Local PDF removed from `/public` and archived in `internal-docs/reference-drafts/`.
  - [x] Database check constraint active: `chk_constitution_original_before_publish` ensures only documents with `is_original_approved_document = true` and `no_private_data_confirmed = true` can be PUBLISHED.
  - [x] Existing reference draft updated to `ARCHIVED`, `is_public = false`, with internal label: *"Non-original / Reference Draft — Do Not Publish"*.
  - [x] Superadmin original approved document checkbox enforced in CMS before publication.
  - [x] Graceful empty state active on `/reports` and `/about`: *"विधान डाउनलोडका लागि तयारी भइरहेको छ।" / "The constitution document is being prepared for download."*
  - [x] Footers, sitemaps, and constant references sanitized: no public link exposes the reference draft.
- [x] Verified authentic contact details configured in Site Settings:
  - Phone: `+977-1-4423456`
  - Email: `madisssamaj@gmail.com`
  - Secretariat: Ward 4, Sukedhara, Kathmandu
- [x] **Official DAO Registration Certificate (दर्ता प्रमाणपत्र) Verification & Privacy Architecture:**
  - [x] Authentic CDO certificate uploaded from DAO Kathmandu issuance (Reg No: १६, Decision Date: २०८२/०४/२१, Society Registration Act 2034, Org: मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं).
  - [x] Original unredacted scan stored in strictly internal quarantine (`internal-docs/certificates/cdo-registration-certificate-2082.jpeg`, `is_public = false`).
  - [x] Raw scan access strictly restricted to Superadmin internal authenticated download; never exposed to public APIs or downloads.
  - [x] Sanitized public version created with personal officer signature and phone number masked (`/documents/cdo-registration-certificate-redacted.jpeg`).
  - [x] Superadmin verification workflow enabled in CMS (`PENDING` / `VERIFIED` / `REJECTED`) with admin notes and immutable audit logging.
  - [x] Automatic trust badge active upon verification: *"🏛️ जिल्ला प्रशासन कार्यालय, काठमाण्डौंमा दर्ता प्रमाणित"*.
  - [x] Public visibility toggles operational for registration number in Footer/About (`publishRegistrationNumber`) and public download of redacted certificate (`publishRedactedCertificate`).
- [x] **Homepage Hero Image & Incoming Media Quarantine Architecture:**
  - [x] All authentic community photos from `_incoming-photos/` uploaded to Supabase Storage under `media/madi-sss/incoming/` as `status: 'PENDING_REVIEW'`, `isPublic: false`, `category: 'UNSORTED_PENDING_REVIEW'`.
  - [x] Quarantined verification: no Draft or Pending Review photo is automatically attached or publicly exposed on any page.
  - [x] CMS feature *“Homepage Hero Image छान्नुहोस् / Select Homepage Hero Image”* operational with Media Library grid, full-resolution preview, and direct replacement controls.
  - [x] Hero Publication Invariant enforced: Draft hero image never appears publicly; only an explicitly published hero image appears on the homepage.
  - [x] Real authentic Madi photo (`Chauki.jpg`) verified with responsive WebP variants for mobile (`640px`), tablet (`1024px`), and desktop (`1920px`) with subtle contrast gradient overlay for text readability.
  - [x] Previous hero images preserved in history archive for 1-click restoration without breaking content.
  - [x] CMS audit logging active for hero selection, replacement, publish, and unpublish events.
- [x] ICAN-registered auditor annual reports and constitution PDF uploaded.
- [x] Organization executive leadership and advisory directory verified.
- [x] Urgent announcement ticker functional.

---

## 3. Security & Compliance Verification

- [x] All admin routes (`/admin/*`) protected by session cookie middleware.
- [x] Security headers active: HSTS, X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`), Referrer-Policy, Permissions-Policy.
- [x] Row Level Security (RLS) active on all 14 PostgreSQL tables.
- [x] Applicant and feedback personal data hidden from public read access.
- [x] Rate limiting active on login, membership submission, and feedback forms.
- [x] Financial master security tests ST-01 through ST-110 passing with evidence in `docs/security-test-report.md`.
- [x] Database errors sanitized to prevent leaking SQLSTATE or internal schema names.

---

## 4. Disaster Recovery & Backup Readiness

- [x] Automated PostgreSQL point-in-time recovery enabled on Supabase.
- [x] Manual pg_dump and pg_restore procedures documented in `DEPLOYMENT.md`.
- [x] Rollback procedure tested and verified.

---

## 5. Official Go-Live Tasks (TO BE PERFORMED AT LAUNCH ONLY)

> [!WARNING]
> Do NOT perform these tasks during staging preparation. Execute only during the scheduled go-live window.

1. **Production Supabase Database Creation:**
   - [ ] Provision production Supabase project.
   - [ ] Run migrations: `20261103000000`, `20261103000001`, and `20261103000002`.
   - [ ] Create production storage buckets `madi-media` and `madi-documents`.
   - [ ] Insert verified real administrator accounts.
2. **Environment Secret Provisioning:**
   - [ ] Generate fresh production `MADI_SESSION_SECRET` (`openssl rand -hex 32`).
   - [ ] Generate fresh production `FINANCIAL_HMAC_SECRET` (`openssl rand -hex 32`).
   - [ ] Configure live Resend or Postmark API keys for transactional emails.
3. **DNS & Custom Domain Connection:**
   - [ ] Point `madisss.org.np` DNS A-record to production hosting IP.
   - [ ] Point `www.madisss.org.np` CNAME to production hosting domain.
   - [ ] Verify automatic SSL certificate generation.
4. **Live Smoke Testing:**
   - [ ] Submit a live test feedback message and verify email arrival.
   - [ ] Test admin sign-in with production Superadmin account.
   - [ ] Confirm Google Search Console and sitemap submission (`https://madisss.org.np/sitemap.xml`).

