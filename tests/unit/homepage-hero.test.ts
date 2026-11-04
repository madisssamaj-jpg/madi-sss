import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getMediaItems,
  getHomepageHero,
  getHeroHistory,
  saveHomepageHero,
  publishHomepageHero,
  unpublishHomepageHero,
  replaceHomepageHero,
  validateHeroCandidateEligibility,
  getHeroCandidateMediaItems,
  PROHIBITED_HERO_MEDIA_TYPES,
} from '../../lib/cms/cms-service.ts';

describe('Homepage Hero Image & Incoming Photos Quarantine Workflow', () => {
  it('quarantines all incoming photos with Draft / Pending Review status and public visibility false', async () => {
    // 1. Admin query sees all photos including incoming quarantined photos
    const allMedia = await getMediaItems(undefined, 'IMAGE', true);
    const incomingPhotos = allMedia.filter((m) => m.category === 'UNSORTED_PENDING_REVIEW');

    assert.ok(incomingPhotos.length >= 14, 'All 14 incoming photos must be present in admin media library');
    for (const photo of incomingPhotos) {
      assert.equal(photo.status, 'TEST_SAMPLE', 'Status must be TEST_SAMPLE');
      assert.equal(photo.isPublic, false, 'Public visibility must be false');
      assert.equal(photo.category, 'UNSORTED_PENDING_REVIEW');
      assert.equal(photo.altTextEn, 'Madi SSS photo — pending review');
      assert.ok(photo.fileSizeBytes > 0);
      assert.ok(photo.dimensions?.width);
      assert.ok(photo.dimensions?.height);
      assert.ok(photo.responsiveUrls?.mobile);
      assert.ok(photo.responsiveUrls?.tablet);
      assert.ok(photo.responsiveUrls?.desktop);
    }

    // 2. Public query strictly excludes all unreviewed / private photos
    const publicMedia = await getMediaItems(undefined, 'IMAGE', false);
    const leaked = publicMedia.filter((m) => m.category === 'UNSORTED_PENDING_REVIEW');
    assert.equal(leaked.length, 0, 'No pending review photos must be exposed to public queries');
  });

  it('enforces Draft Invariant: getHomepageHero(false) returns null when hero is DRAFT', async () => {
    // Ensure hero is DRAFT
    await unpublishHomepageHero('admin-test', 'Test Admin');

    const publicHero = await getHomepageHero(false);
    assert.equal(publicHero, null, 'Public homepage query must return null when hero is in DRAFT status');

    // Admin query with includeDraft=true can view draft configuration
    const adminHero = await getHomepageHero(true);
    assert.ok(adminHero, 'Admin query must be able to view draft hero');
    assert.equal(adminHero.status, 'DRAFT');
  });

  it('publishes hero image and makes it accessible to public queries', async () => {
    const published = await publishHomepageHero('admin-super', 'Super Admin');
    assert.ok(published);
    assert.equal(published.status, 'PUBLISHED');
    assert.ok(published.publishedAt);

    // Public query now receives published hero
    const publicHero = await getHomepageHero(false);
    assert.ok(publicHero, 'Public query must return hero once PUBLISHED');
    assert.equal(publicHero.status, 'PUBLISHED');
    assert.ok(publicHero.imageUrl);
    assert.ok(publicHero.altTextNe);
  });

  it('preserves previous hero image in history when replaced', async () => {
    const currentHero = await getHomepageHero(true);
    assert.ok(currentHero);
    const previousImageUrl = currentHero.imageUrl;

    const newHeroData = {
      mediaItemId: 'med-inc-013',
      imageUrl: 'https://ypcrfeufdghpxhhjexja.supabase.co/storage/v1/object/public/media/madi-sss/incoming/deusi nach.jpg',
      mobileImageUrl: '/media/incoming/deusi_nach-mobile.webp',
      tabletImageUrl: '/media/incoming/deusi_nach-tablet.webp',
      desktopImageUrl: '/media/incoming/deusi_nach-desktop.webp',
      altTextNe: 'मादी सांस्कृतिक देउसी नाच',
      altTextEn: 'Traditional Deusi folk dance in Madi',
      headingNe: 'मादी (संखुवासभा) सरोकार समाज, काठमाडौं',
      headingEn: 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu',
      status: 'PUBLISHED' as const,
    };

    const replaced = await replaceHomepageHero(newHeroData, 'admin-super', 'Super Admin');
    assert.equal(replaced.imageUrl, newHeroData.imageUrl);

    // Verify history contains the previous hero
    const history = await getHeroHistory();
    assert.ok(history.length > 0, 'Previous hero must be archived in history');
    const archived = history.find((h) => h.imageUrl === previousImageUrl);
    assert.ok(archived, 'Previous hero image must exist in archived options');
  });

  it('unpublishes hero image, removing it from public homepage instantly', async () => {
    const unpublished = await unpublishHomepageHero('admin-super', 'Super Admin');
    assert.ok(unpublished);
    assert.equal(unpublished.status, 'DRAFT');

    const publicHero = await getHomepageHero(false);
    assert.equal(publicHero, null, 'Unpublished hero must immediately disappear from public view');
  });

  it('publishes verified hero for final launch readiness', async () => {
    // Select Chauki.jpg and publish for production launch readiness
    await saveHomepageHero(
      {
        mediaItemId: 'med-inc-002',
        imageUrl: '/media/incoming/Chauki.jpg',
        mobileImageUrl: '/media/incoming/Chauki-mobile.webp',
        tabletImageUrl: '/media/incoming/Chauki-tablet.webp',
        desktopImageUrl: '/media/incoming/Chauki-desktop.webp',
        altTextNe: 'मादी संखुवासभाको प्राकृतिक सौन्दर्य तथा चौकि बजार',
        altTextEn: 'Scenic landscape of Chauki, Madi, Sankhuwasabha',
        headingNe: 'मादी (संखुवासभा) सरोकार समाज, काठमाडौं',
        headingEn: 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu',
        subheadingNe: '“मादीदेखि काठमाडौंसम्म, एकता, सेवा र सहकार्यको साझा अभियान”',
        subheadingEn: '“From Madi to Kathmandu, a shared initiative for unity, welfare, and collaboration”',
        ctaLabelNe: 'अनलाइन सदस्यता आवेदन',
        ctaLabelEn: 'Apply for Membership',
        ctaLink: '/membership',
        status: 'PUBLISHED',
      },
      'admin-super',
      'Super Admin'
    );

    const publicHero = await getHomepageHero(false);
    assert.ok(publicHero);
    assert.equal(publicHero.status, 'PUBLISHED');
    assert.equal(publicHero.altTextNe, 'मादी संखुवासभाको प्राकृतिक सौन्दर्य तथा चौकि बजार');
    assert.equal(publicHero.imageUrl, '/media/incoming/Chauki.jpg');
    assert.ok(publicHero.mobileImageUrl);
    assert.ok(publicHero.tabletImageUrl);
    assert.ok(publicHero.desktopImageUrl);
  });

  it('enforces Governance Rule: blocks condolence, patient identification, ward correspondence, and relief handover media from hero selection', async () => {
    // 1. Attempt to save Samabedana.jpg (med-inc-009) as hero -> MUST FAIL
    await assert.rejects(
      async () => {
        await saveHomepageHero(
          {
            mediaItemId: 'med-inc-009',
            imageUrl: '/media/incoming/Samabedana.jpg',
            altTextEn: 'Samabedana Condolence Notice',
            status: 'DRAFT',
          },
          'admin-test',
          'Test Admin'
        );
      },
      /Prohibited hero media/i,
      'Condolence media (med-inc-009) must be rejected from homepage hero selection'
    );

    // 2. Attempt to save Samabedana Dambar kumari.jpg (med-inc-008) as hero -> MUST FAIL
    await assert.rejects(
      async () => {
        await saveHomepageHero(
          {
            mediaItemId: 'med-inc-008',
            imageUrl: '/media/incoming/Samabedana Dambar kumari.jpg',
            status: 'DRAFT',
          },
          'admin-test',
          'Test Admin'
        );
      },
      /Prohibited hero media/i,
      'Condolence media (med-inc-008) must be rejected from homepage hero selection'
    );

    // 3. Attempt to save Ward Correspondence (med-inc-010 Wada.jpeg) -> MUST FAIL
    await assert.rejects(
      async () => {
        await saveHomepageHero(
          {
            mediaItemId: 'med-inc-010',
            imageUrl: '/media/incoming/Wada.jpeg',
            status: 'DRAFT',
          },
          'admin-test',
          'Test Admin'
        );
      },
      /Prohibited hero media/i,
      'Ward correspondence media (med-inc-010) must be rejected from homepage hero selection'
    );

    // 4. Attempt to save Ward Correspondence (med-inc-014 wada back.jpeg) -> MUST FAIL
    await assert.rejects(
      async () => {
        await saveHomepageHero(
          {
            mediaItemId: 'med-inc-014',
            imageUrl: '/media/incoming/wada back.jpeg',
            status: 'DRAFT',
          },
          'admin-test',
          'Test Admin'
        );
      },
      /Prohibited hero media/i,
      'Ward correspondence media (med-inc-014) must be rejected from homepage hero selection'
    );

    // 5. Attempt to save Relief Handover / Donation (med-inc-004) -> MUST FAIL
    await assert.rejects(
      async () => {
        await saveHomepageHero(
          {
            mediaItemId: 'med-inc-004',
            imageUrl: '/media/incoming/Donation to pradeep lingthep.jpg',
            status: 'DRAFT',
          },
          'admin-test',
          'Test Admin'
        );
      },
      /Prohibited hero media/i,
      'Relief handover/donation media (med-inc-004) must be rejected from homepage hero selection'
    );

    // 6. Direct validation function check across all prohibited categories
    assert.equal(
      validateHeroCandidateEligibility(undefined, '/media/internal/patient-cataract-screening.jpg').eligible,
      false,
      'Patient identification URL must be ineligible'
    );
    assert.equal(
      validateHeroCandidateEligibility(undefined, '/media/internal/condolence-notice.jpg').eligible,
      false,
      'Condolence notice URL must be ineligible'
    );
    assert.equal(
      validateHeroCandidateEligibility(undefined, '/media/internal/ward2-disaster-recommendation.pdf').eligible,
      false,
      'Ward correspondence must be ineligible'
    );
    assert.equal(
      validateHeroCandidateEligibility(undefined, '/media/internal/relief-handover-raw.jpg').eligible,
      false,
      'Relief handover URL must be ineligible'
    );

    // 7. Scenic community landscape is explicitly approved
    const scenicCheck = validateHeroCandidateEligibility(
      'med-inc-002',
      '/media/incoming/Chauki.jpg',
      'Scenic landscape of Chauki, Madi'
    );
    assert.equal(scenicCheck.eligible, true, 'Scenic Chauki landscape must be eligible');
  });

  it('verifies hero candidate filtering excludes Samabedana.jpg and sensitive media items', async () => {
    const candidates = await getHeroCandidateMediaItems();
    const candidateIds = candidates.map((c) => c.id);

    assert.ok(!candidateIds.includes('med-inc-009'), 'Samabedana.jpg (med-inc-009) must NOT be in hero candidates');
    assert.ok(!candidateIds.includes('med-inc-008'), 'Samabedana Dambar kumari (med-inc-008) must NOT be in hero candidates');
    assert.ok(!candidateIds.includes('med-inc-010'), 'Wada.jpeg (med-inc-010) must NOT be in hero candidates');
    assert.ok(!candidateIds.includes('med-inc-014'), 'wada back.jpeg (med-inc-014) must NOT be in hero candidates');
    assert.ok(!candidateIds.includes('med-inc-004'), 'Donation to pradeep lingthep (med-inc-004) must NOT be in hero candidates');

    // Scenic landscape should be present
    assert.ok(candidateIds.includes('med-inc-002'), 'Chauki landscape (med-inc-002) must be present in hero candidates');
  });

  it('guarantees live homepage hero remains Chauki.jpg and Samabedana.jpg remains strictly quarantined', async () => {
    // 1. Check live public hero
    const liveHero = await getHomepageHero(false);
    assert.ok(liveHero, 'Live hero must exist');
    assert.equal(liveHero.status, 'PUBLISHED', 'Live hero status must be PUBLISHED');
    assert.equal(liveHero.mediaItemId, 'med-inc-002', 'Live hero media ID must be Chauki (med-inc-002)');
    assert.equal(liveHero.imageUrl, '/media/incoming/Chauki.jpg', 'Live hero imageUrl must be local Chauki.jpg');

    // 2. Check Samabedana.jpg in media library
    const allMedia = await getMediaItems(undefined, 'IMAGE', true);
    const samabedana = allMedia.find((m) => m.id === 'med-inc-009');
    assert.ok(samabedana, 'Samabedana.jpg must exist in media library');
    assert.equal(samabedana.status, 'TEST_SAMPLE', 'Samabedana.jpg status must remain TEST_SAMPLE');
    assert.equal(samabedana.isPublic, false, 'Samabedana.jpg must NOT be public');
    assert.equal(samabedana.isHeroEligible, false, 'Samabedana.jpg must NOT be hero eligible');
    assert.equal(samabedana.internalCategory, 'CONDOLENCE', 'Samabedana.jpg category must be CONDOLENCE');
    assert.equal(samabedana.sensitivityNotice, 'Sensitive — Internal use only');
    assert.equal(samabedana.sensitivityNoticeNe, 'संवेदनशील — आन्तरिक प्रयोजन मात्र');

    // 3. Confirm public queries do not expose Samabedana.jpg
    const publicMedia = await getMediaItems(undefined, 'IMAGE', false);
    const leakedSamabedana = publicMedia.find((m) => m.id === 'med-inc-009');
    assert.equal(leakedSamabedana, undefined, 'Samabedana.jpg must NEVER appear in public queries');
  });

  it('strictly blocks donation handover media (med-inc-004 Donation to pradeep lingthep) from homepage hero candidacy and staging', async () => {
    // 1. Rejects selection through saveHomepageHero
    await assert.rejects(
      async () => {
        await saveHomepageHero(
          {
            mediaItemId: 'med-inc-004',
            imageUrl: '/media/incoming/Donation to pradeep lingthep.jpg',
            status: 'DRAFT',
          },
          'admin-test',
          'Test Admin'
        );
      },
      /Prohibited hero media/i,
      'Donation handover media (med-inc-004) must be rejected from homepage hero'
    );

    // 2. Rejects any generic donation handover URL or title
    const handoverCheck1 = validateHeroCandidateEligibility(
      undefined,
      '/media/internal/donation-handover-cheque.jpg'
    );
    assert.equal(handoverCheck1.eligible, false, 'Donation handover cheque must be rejected');

    const handoverCheck2 = validateHeroCandidateEligibility(
      undefined,
      '/media/incoming/pradeep-lingthep-support.jpg'
    );
    assert.equal(handoverCheck2.eligible, false, 'Beneficiary named image must be rejected');

    // 3. Excluded from hero candidate media list
    const candidates = await getHeroCandidateMediaItems();
    assert.ok(!candidates.some((c) => c.id === 'med-inc-004'), 'med-inc-004 must not be in candidate list');

    // 4. Verifies original file is preserved in media library and marked as sensitive/internal
    const allMedia = await getMediaItems(undefined, 'IMAGE', true);
    const donationItem = allMedia.find((m) => m.id === 'med-inc-004');
    assert.ok(donationItem, 'Original media item must be preserved, not deleted');
    assert.equal(donationItem.isHeroEligible, false, 'Must not be hero eligible');
    assert.equal(donationItem.internalCategory, 'DONATION_HANDOVER');
    assert.equal(donationItem.status, 'TEST_SAMPLE');
    assert.equal(donationItem.isPublic, false);
    assert.ok(donationItem.sensitivityNotice?.includes('Sensitive'));
  });
});

