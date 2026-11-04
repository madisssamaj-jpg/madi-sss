# Madi (Sankhuwasabha) Sarokar Samaj
## Digital Presence Implementation Roadmap

> **Governance Directive**: This roadmap is an internal strategy and technical execution document. **No content is published, and no live analytics or tracking scripts are deployed into production.** All media items remain quarantined as `TEST_SAMPLE` / `INTERNAL_ONLY`.

---

## Executive Overview & Architectural Principles

Madi (Sankhuwasabha) Sarokar Samaj is a nonprofit, social welfare, and cultural community organization. Its digital presence is built on four core pillars:
1. **Absolute Privacy by Default**: No personally identifiable information (PII), national ID/citizenship numbers, banking details, private phone numbers, or vulnerable beneficiary identities are ever exposed to public APIs, search engines, or third-party marketing tags.
2. **Statutory Non-Commercial Balance**: Maintaining an 80/20 non-commercial posture. Outreach emphasizes community welfare, cultural preservation, health initiatives, disaster relief, and member solidarity rather than commercial marketing.
3. **Four-Stage Media Lifecycle**: Every media asset passes through strict consent, classification, and authorization gates (`TEST_SAMPLE` → `PENDING_REVIEW` → `INTERNAL_ONLY` / `APPROVED_PUBLIC`).
4. **Structured Phasing**: Technical prerequisites, audit trails, and privacy barriers are deployed and verified before any public launch or outreach campaign.

---

## Phase A: CMS Media & Content Management

### 1. Objective
Establish a centralized, audit-compliant media library and content management architecture for photos, videos, hero sections, banners, activities, committee records, official documents, and financial summaries.

### 2. Required CMS / Model Changes

#### 2.1 Media Asset Model (`lib/cms/cms-service.ts`)
- Status values: `TEST_SAMPLE`, `PENDING_REVIEW`, `INTERNAL_ONLY`, `APPROVED_PUBLIC`, `DRAFT`, `PUBLISHED`, `ARCHIVED`.
- Categories: `HERO_SCENIC`, `COMMUNITY_LANDSCAPE`, `CULTURAL_HERITAGE`, `HEALTH_CAMP`, `COMMUNITY_WELFARE`, `CONDOLENCE`, `DONATION_HANDOVER`, `PATIENT_IDENTIFICATION`, `WARD_CORRESPONDENCE`, `UNSORTED_PENDING_REVIEW`.
- Consent values: `NOT_APPLICABLE`, `PENDING`, `VERIFIED`, `REJECTED`.
- Video fields: `videoThumbnailUrl`, `videoCaptionNe`, `videoCaptionEn`, `videoDurationSeconds`.
- Responsive variants: mobile, tablet, desktop WebP formats.
- Sensitive media rules: Condolence, donation handover, and patient identification cannot be selected as hero.

#### 2.2 Content Entity Governance Models
- **Hero & Banners**: Local asset paths only, dark readability overlay (`bg-black/60`), exactly two verified action buttons (`Membership` and `Feedback`), exactly two verified milestones (`7+ Wards`, `500+ Community Members`).
- **Activities & Events**: Requires physical attendance sheet reference, zero-expense or voucher reconciliation, photo consent status, Treasurer review, and President approval.
- **Committee**: Strict public masking (no personal phone, personal email, or citizenship numbers exposed).
- **Documents & Financials**: Segregated by fiscal year (`2081-82/activities/`, `2081-82/relief-fund/`, `2081-82/audit/`, `2081-82/documents/`), masking raw bank accounts and donor/beneficiary names.
- **Current Media Invariant**: All 14 incoming media records assigned status `TEST_SAMPLE` and `isPublic: false`.

### 3. Admin UI Changes
1. **Media Library Quarantine View**: Status pill filter (`TEST_SAMPLE`, `PENDING_REVIEW`, `INTERNAL_ONLY`, `APPROVED_PUBLIC`) with red badge indicators for `Sensitive — Internal use only`.
2. **Consent & Verification Panel**: Checkbox and document link attachment for subject written consent (`consent_verified`).
3. **Hero Image Selector Gate**: Filter dropdown automatically disables any media marked `CONDOLENCE`, `DONATION_HANDOVER`, `PATIENT_IDENTIFICATION`, or `status !== 'APPROVED_PUBLIC'`.
4. **Video Management Drawer**: Fields for video thumbnail upload, bilingual captions, duration, and embedding preview.
5. **Content Editors**: Dedicated tabs for Hero, Notice Board, Activities, Executive Committee, and Financial Summary with audit trail logging.

### 4. Security & Privacy Rules
- Public queries (`getMediaItems(..., false)`) strictly execute: `status === 'APPROVED_PUBLIC' && isPublic === true`.
- Sensitive internal categories (`CONDOLENCE`, `DONATION_HANDOVER`, `PATIENT_IDENTIFICATION`) default to `INTERNAL_ONLY` and are blocked from hero candidacy by runtime assertion.
- Raw local filesystem paths and internal verifier notes are stripped from client-side JSON responses.

### 5. Test Plan
- Unit tests verifying that all demo media items have `status === 'TEST_SAMPLE'` and `isPublic === false`.
- Unit tests verifying hero candidate rejection for sensitive media categories.
- Regression tests ensuring zero unreviewed media items leak through public API endpoints.

### 6. Go / No-Go Criteria
- [x] All 14 incoming sample images initialized to `TEST_SAMPLE`.
- [x] Live hero preserved with local `Chauki.jpg` and two approved action buttons.
- [x] Zero external CDN/Unsplash URLs present in codebase.
- [ ] Physical written consent forms collected and archived in `docs/consent/` before any asset moves to `APPROVED_PUBLIC`.

---

## Phase B: Search & Local Presence

### 1. Objective
Establish an authentic, verified local and search engine presence for Madi (Sankhuwasabha) Sarokar Samaj with consistent Name, Address, Phone, and Website (NAPW) metadata, Google Business Profile (GBP), Google Search Console (GSC), and XML sitemaps.

### 2. Canonical Identity & NAPW Standardization

| Identity Field | English Canonical Value | Nepali Canonical Value |
| :--- | :--- | :--- |
| **Legal Name** | Madi (Sankhuwasabha) Sarokar Samaj | मादी (सङ्खुवासभा) सरोकार समाज |
| **Short Name** | Madi Sarokar Samaj / Madi SSS | मादी सरोकार समाज |
| **Primary Address** | Madi Municipality, Sankhuwasabha, Koshi Province, Nepal | मादी नगरपालिका, सङ्खुवासभा, कोशी प्रदेश, नेपाल |
| **Liaison Office** | Kathmandu Valley Liaison Office, Bagmati Province, Nepal | काठमाडौँ सम्पर्क कार्यालय, बागमती प्रदेश, नेपाल |
| **Official Phone** | Landline / Official Secretariat VoIP *(Personal mobile strictly withheld)* | कार्यालय सम्पर्क नम्बर |
| **Official Email** | `info@madisarokarsamaj.org.np` / `secretariat@madisarokarsamaj.org.np` | आधिकारिक इमेल |
| **Canonical URL** | `https://madisarokarsamaj.org.np` | आधिकारिक वेबसाइट |
| **Category** | Non-Governmental / Community Social Welfare Organization (गैरसरकारी सामाजिक संस्था) | सामाजिक संस्था |

### 3. Google Business Profile (GBP) Setup Plan
1. **Account Registration**: Create using organization Google Workspace account (`secretariat@madisarokarsamaj.org.np`).
2. **Category Selection**: Primary category: `Community Center` / `Non-profit organization`. Secondary: `Association or Organization`.
3. **Location Verification**: Request postal postcard verification at Madi Municipality Secretariat or official office signboard video verification with local Ward endorsement.
4. **Service Area Definition**: Sankhuwasabha District (Madi, Chainpur, Dharmadevi, Khandbari) and Kathmandu liaison network.
5. **Operating Hours**: Sunday – Friday: 10:00 AM – 5:00 PM; Saturday: Closed.
6. **Public Description**: Community-first, non-political, social welfare profile highlighting cultural preservation, health camps, relief aid, and education initiatives.

### 4. Google Search Console (GSC) Setup Plan
1. **Domain Property Verification**: Add DNS TXT record `google-site-verification=...` on `madisarokarsamaj.org.np` domain zone.
2. **URL Prefix Fallback**: HTTPS protocol verification on `https://madisarokarsamaj.org.np`.
3. **Geo-Targeting**: Country targeting set to Nepal.
4. **Sitemap Submission**: Submit `https://madisarokarsamaj.org.np/sitemap.xml`.

### 5. Sitemap & Indexing Architecture
- **Dynamic XML Sitemap (`/sitemap.xml`)**:
  - Auto-generated from published public entities only (`/`, `/about`, `/committee`, `/activities`, `/reports`, `/notices`, `/membership`, `/contact`).
  - Strict exclusion: No private admin routes (`/admin/*`), draft pages, raw internal archive paths, or quarantined media URLs.
- **Robots.txt (`/robots.txt`)**:
```txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/admin/
Disallow: /api/governance/
Disallow: /media/internal/
Disallow: /scratch/

Sitemap: https://madisarokarsamaj.org.np/sitemap.xml
```

### 6. Security & Privacy Rules
- No executive member's personal residential address or personal cellular number published in Google Business profile.
- Sitemap generator must check `isPublic: true && status === 'PUBLISHED'` before emitting any URL node.

### 7. Test Plan
- Unit tests verifying `/sitemap.xml` response schema and exclusion of private or unverified routes.
- Schema validation test for `Organization` and `NGO` JSON-LD structured data on all public page layouts.

### 8. Go / No-Go Criteria
- [ ] Official `.org.np` domain registration approved and DNS active.
- [ ] Official organization email configured.
- [ ] Signboard and physical location verification ready for GBP video audit.

---

## Phase C: Analytics & Ads Readiness

### 1. Objective
Prepare a clean, privacy-first analytics and conversion tracking infrastructure that complies with data privacy principles, implements a GDPR/ePrivacy-style cookie consent banner, and tracks high-level community engagement metrics without intrusive monitoring.

### 2. Tag Architecture & Privacy Isolation
- Consent Mode v2 by default denies storage and personalization until positive user affirmation.
- Zero PII tracking: No names, emails, phone numbers, or citizenship numbers sent to analytics.

### 3. Google Tag Manager (GTM) Container Structure
- Container: Web container (`GTM-MADI001`).
- Default state: Denied for all ad and analytics cookies.

### 4. Six Privacy-Safe Standard Conversion Events
1. `page_view`: Public page navigation.
2. `view_membership`: Reading membership guidelines and criteria.
3. `begin_membership_application`: Clicking to open membership application.
4. `submit_membership_application`: Successful application submission (`application_type` only, zero personal data).
5. `submit_feedback`: Submitting feedback/inquiry (`feedback_topic` only).
6. `download_document`: Downloading official constitution or annual report (`document_id` only).

### 5. Meta Pixel & Conversions API (CAPI) Readiness
- Environment variable placeholders only (`NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`).
- Staged for future boost campaigns; currently dormant.

### 6. Cookie Consent Banner Specification
- Bilingual overlay banner (Nepali & English).
- Choices: "Accept All" vs "Essential Only".
- Stored locally with 180-day TTL.

### 7. Security & Privacy Rules
- Tracking scripts must **NOT** load on `/admin/*` routes.
- Zero input form fields attached to analytics variables.
- Query parameters scrubbed before analytics ingestion.

### 8. Test Plan
- Unit tests verifying dataLayer event builders scrub any email, phone, or name fields.
- End-to-end tests verifying no third-party script runs when consent is denied.
- Integration tests ensuring admin portal remains 100% free of marketing pixels.

### 9. Go / No-Go Criteria
- [x] Zero tracking scripts injected into current production/staging templates.
- [ ] Cookie consent component reviewed and approved by General Secretary.
- [ ] GTM container verified in preview mode with synthetic test traffic before publishing.

---

## Phase D: Social Media Integration

### 1. Objective
Establish an integrated multi-channel social media communication pipeline connecting the website with official channels (Facebook, Instagram, TikTok, WhatsApp Community, Viber Channel), governed by the conditionally approved social outreach plan and 5-stage approval gate.

### 2. Multi-Channel Platform Matrix
- **Facebook**: Community updates, formal notices, photo albums, event pages.
- **Instagram**: Reels, carousels, Stories, visual culture highlights.
- **TikTok**: Short awareness clips, scenic heritage moments, health camp highlights.
- **WhatsApp Community**: Broadcast-only channel (no member chat, admin notices only).
- **Viber Channel**: Optional broadcast feed.

### 3. Open Graph (OG) & Social Sharing Metadata
- Standard tags with 1200x630px default preview card.
- Sensitive media fallback: Condolence or donation handover articles fall back to organization seal or scenic landscape.

### 4. Posting Cadence: Launch vs Growth Phase
- **Launch Phase (Months 1–2)**:
  - Facebook: 2 posts / week
  - Instagram: 1–2 posts / week + Stories
  - TikTok: 1 video every 2 weeks
  - WhatsApp: 1 broadcast / week
- **Growth Phase (Month 3+)**:
  - Facebook: 3–4 posts / week
  - Instagram: 3 posts / week + Stories
  - TikTok: 2 videos / week
  - WhatsApp: As needed for events/notices

### 5. Media & Communications Coordinator Role
- Internal role with draft and media assembly privileges.
- Personal contact information strictly withheld from public view.

### 6. Security & Privacy Rules
- 5-stage approval workflow strictly enforced: Creator → Coordinator → General Secretary → President → Scheduled dispatch.
- Beneficiary donation handover photos strictly prohibited on public social feeds.
- Condolence announcements require family liaison sign-off and cannot be boosted.

### 7. Test Plan
- Open Graph generator tests verifying fallback behavior on sensitive categories.
- Role-based authorization tests ensuring Coordinator cannot publish without Presidential approval.

### 8. Go / No-Go Criteria
- [ ] Official handles registered under `@madisarokarsamaj`.
- [ ] Broadcast-only WhatsApp group established.
- [ ] 5-stage approval gate ratified by Executive Committee.

