'use server';

import { revalidatePath } from 'next/cache';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { requireSuperadmin } from '@/lib/auth/admin-session';
import { validateUploadFile, sanitizeFilename } from '@/lib/storage/supabase-storage';
import { checkRateLimit } from '@/lib/security/rate-limit';
import {
  submitMembershipApplicationToSupabase,
  submitContactMessageToSupabase,
} from '@/lib/supabase/data-service';
import {
  submitMembershipApplication,
  submitFeedback,
  saveSocialActivity,
  deleteSocialActivity,
  advanceActivityWorkflow,
  type ActivityWorkflowStage,
  saveReliefProgram,
  deleteReliefProgram,
  saveEvent,
  deleteEvent,
  saveCommitteeMember,
  deleteCommitteeMember,
  saveReport,
  deleteReport,
  updateApplicationStatus,
  updateFeedbackStatus,
  savePartner,
  deletePartner,
  saveBanner,
  deleteBanner,
  saveGalleryAlbum,
  deleteGalleryAlbum,
  saveMediaItem,
  deleteMediaItem,
  saveNotice,
  deleteNotice,
  updateSiteSettings,
  logCMSActivity,
  getMembershipApplications,
  verifyRegistrationCertificate,
  updateCertificateVisibility,
  getRegistrationCertificates,
  saveHomepageHero,
  publishHomepageHero,
  unpublishHomepageHero,
  replaceHomepageHero,
  getHomepageHero,
  getHeroHistory,
  type HomepageHeroConfig,
  saveMediaConsentRecord,
  approveMediaConsentPublication,
  deleteMediaConsentRecord,
  type MediaConsentRecord,
  saveFinancialTransparencyRecord,
  advanceFinancialWorkflow,
  deleteFinancialTransparencyRecord,
  type FinancialTransparencyRecord,
  type FinancialPublicationStatus,
  savePublicDocument,
  advancePublicDocumentStatus,
  deletePublicDocument,
  getPublicDocuments,
  type PublicDocument,
  type DocumentLibraryType,
  type DocumentPublicationStatus,
  saveEvidenceTrackerRecord,
  updateEvidenceTrackerItemStatus,
  deleteEvidenceTrackerRecord,
  getEvidenceTrackerRecords,
  type EvidenceTrackerRecord,
  type EvidenceTrackerCategory,
  type EvidenceCollectionStatus,
  type EvidenceApprovalStatus,
  getGovernanceDashboardOverview,
  type GovernanceDashboardOverview,
  type GovernanceSectionMetrics,
} from '@/lib/cms/cms-service';
import {
  sendMembershipReceivedEmail,
  sendMembershipStatusEmail,
  sendAdminMembershipAlert,
  sendFeedbackReceivedEmail,
  sendAdminFeedbackAlert,
} from '@/lib/email/email-service';

// --- Zod Schemas for Public Submissions ---

const membershipApplicationSchema = z.object({
  fullNameNe: z.string().min(2, 'पूरा नाम कम्तीमा २ अक्षरको हुनुपर्छ।'),
  fullNameEn: z.string().min(2, 'Full name must be at least 2 characters.'),
  membershipType: z.enum(['ORDINARY', 'LIFE', 'HONORARY']),
  madiAddressNe: z.string().min(2, 'मादीको स्थायी ठेगाना आवश्यक छ।'),
  currentAddressNe: z.string().min(2, 'हालको बसोबास ठेगाना आवश्यक छ।'),
  phone: z.string().min(10, 'सम्पर्क नम्बर कम्तीमा १० अंकको हुनुपर्छ।'),
  email: z.string().email('मान्य इमेल ठेगाना हुनुपर्छ।'),
  occupationNe: z.string().min(2, 'पेशा वा व्यवसाय खुलाउनुहोस्।'),
  reasonForJoiningNe: z.string().min(5, 'सदस्यता लिनुको उद्देश्य खुलाउनुहोस्।'),
  consentGiven: z.boolean().refine((val) => val === true, 'नियम तथा सर्तहरू स्वीकार गर्नुपर्छ।'),
});

const feedbackSchema = z.object({
  fullName: z.string().min(2, 'नाम आवश्यक छ।'),
  phone: z.string().min(7, 'सम्पर्क फोन नम्बर आवश्यक छ।'),
  email: z.string().email('मान्य इमेल आवश्यक छ।'),
  subject: z.string().min(3, 'विषय कम्तीमा ३ अक्षरको हुनुपर्छ।'),
  category: z.enum(['SUGGESTION', 'COMPLAINT', 'RELIEF_REQUEST', 'INQUIRY']),
  message: z.string().min(10, 'सन्देश कम्तीमा १० अक्षरको हुनुपर्छ।'),
  attachmentUrl: z.string().optional(),
});

// --- Public Handlers ---

export async function submitMembershipApplicationAction(formData: any) {
  const rate = checkRateLimit('public:membership_apply', { maxTokens: 5, refillRatePerSecond: 0.1 });
  if (!rate.allowed) {
    return {
      success: false,
      error: `कृपया केही समय पछि पुन: प्रयास गर्नुहोस्। (${rate.retryAfterSeconds}s)`,
    };
  }

  const parsed = membershipApplicationSchema.safeParse(formData);
  if (!parsed.success) {
    const msg = (parsed.error as any).issues?.[0]?.message || 'फारम विवरण मिलेन।';
    return { success: false, error: msg };
  }

  try {
    const res = await submitMembershipApplication(parsed.data);

    // Persist to Supabase database (non-blocking)
    submitMembershipApplicationToSupabase(parsed.data).catch((e) => {
      console.warn('Supabase membership persistence warning:', e.message);
    });

    // Non-blocking Transactional Emails
    sendMembershipReceivedEmail({
      fullName: res.fullNameNe,
      email: res.email,
      membershipType: res.membershipType,
      applicationId: res.id,
    }).catch(() => {});

    sendAdminMembershipAlert({
      fullName: res.fullNameNe,
      membershipType: res.membershipType,
      madiAddress: res.madiAddressNe,
    }).catch(() => {});

    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'आवेदन पेश गर्न सकिएन।' };
  }
}

export async function submitFeedbackAction(formData: any) {
  const rate = checkRateLimit('public:feedback_submit', { maxTokens: 5, refillRatePerSecond: 0.1 });
  if (!rate.allowed) {
    return {
      success: false,
      error: `कृपया केही समय पछि पुन: प्रयास गर्नुहोस्। (${rate.retryAfterSeconds}s)`,
    };
  }

  const parsed = feedbackSchema.safeParse(formData);
  if (!parsed.success) {
    const msg = (parsed.error as any).issues?.[0]?.message || 'विवरण अमान्य छ।';
    return { success: false, error: msg };
  }

  try {
    const res = await submitFeedback(parsed.data);

    // Persist to Supabase database (non-blocking)
    submitContactMessageToSupabase(parsed.data).catch((e) => {
      console.warn('Supabase contact message persistence warning:', e.message);
    });

    // Non-blocking Transactional Emails
    sendFeedbackReceivedEmail({
      fullName: res.fullName,
      email: res.email,
      subjectText: res.subject,
      category: res.category,
    }).catch(() => {});

    sendAdminFeedbackAlert({
      fullName: res.fullName,
      category: res.category,
      subjectText: res.subject,
    }).catch(() => {});

    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'सन्देश पेश गर्न सकिएन।' };
  }
}

// --- Admin CMS Handlers ---

export async function saveSocialActivityAction(data: any) {
  try {
    const admin = await requireSuperadmin();
    const res = await saveSocialActivity(data);
    await logCMSActivity(admin.id, admin.fullName, 'SAVE_ACTIVITY', 'SocialActivity', res.id, { title: res.titleNe });
    revalidatePath('/[lang]/activities', 'page');
    revalidatePath('/[lang]', 'page');
    revalidatePath('/[lang]/admin/activities', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function deleteSocialActivityAction(id: string) {
  try {
    const admin = await requireSuperadmin();
    await deleteSocialActivity(id);
    await logCMSActivity(admin.id, admin.fullName, 'DELETE_ACTIVITY', 'SocialActivity', id);
    revalidatePath('/[lang]/activities', 'page');
    revalidatePath('/[lang]', 'page');
    revalidatePath('/[lang]/admin/activities', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function advanceActivityWorkflowAction(
  id: string,
  targetStage: ActivityWorkflowStage,
  notes?: string
) {
  try {
    const admin = await requireSuperadmin();
    const res = await advanceActivityWorkflow(id, targetStage, admin.fullName, notes);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    await logCMSActivity(admin.id, admin.fullName, 'ADVANCE_ACTIVITY_WORKFLOW', 'SocialActivity', id, {
      targetStage,
      notes,
    });
    revalidatePath('/[lang]/activities', 'page');
    revalidatePath('/[lang]', 'page');
    revalidatePath('/[lang]/admin/activities', 'page');
    return { success: true, data: res.data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function saveReliefProgramAction(data: any) {
  try {
    const admin = await requireSuperadmin();
    const res = await saveReliefProgram(data);
    await logCMSActivity(admin.id, admin.fullName, 'SAVE_RELIEF', 'ReliefProgram', res.id, { title: res.titleNe });
    revalidatePath('/[lang]/relief-support', 'page');
    revalidatePath('/[lang]', 'page');
    revalidatePath('/[lang]/admin/relief', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function deleteReliefProgramAction(id: string) {
  try {
    const admin = await requireSuperadmin();
    await deleteReliefProgram(id);
    await logCMSActivity(admin.id, admin.fullName, 'DELETE_RELIEF', 'ReliefProgram', id);
    revalidatePath('/[lang]/relief-support', 'page');
    revalidatePath('/[lang]', 'page');
    revalidatePath('/[lang]/admin/relief', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function saveEventAction(data: any) {
  try {
    const admin = await requireSuperadmin();
    const res = await saveEvent(data);
    await logCMSActivity(admin.id, admin.fullName, 'SAVE_EVENT', 'EventProgram', res.id, { title: res.titleNe });
    revalidatePath('/[lang]/events', 'page');
    revalidatePath('/[lang]', 'page');
    revalidatePath('/[lang]/admin/events', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function deleteEventAction(id: string) {
  try {
    const admin = await requireSuperadmin();
    await deleteEvent(id);
    await logCMSActivity(admin.id, admin.fullName, 'DELETE_EVENT', 'EventProgram', id);
    revalidatePath('/[lang]/events', 'page');
    revalidatePath('/[lang]', 'page');
    revalidatePath('/[lang]/admin/events', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function saveCommitteeMemberAction(data: any) {
  try {
    const admin = await requireSuperadmin();
    const res = await saveCommitteeMember(data);
    await logCMSActivity(admin.id, admin.fullName, 'SAVE_COMMITTEE', 'CommitteeMember', res.id, {
      name: res.nameNe,
      status: res.status,
      photoConsent: res.photoConsent,
    });
    revalidatePath('/[lang]/committee', 'page');
    revalidatePath('/[lang]/admin/committee', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function deleteCommitteeMemberAction(id: string) {
  try {
    const admin = await requireSuperadmin();
    await deleteCommitteeMember(id);
    await logCMSActivity(admin.id, admin.fullName, 'DELETE_COMMITTEE', 'CommitteeMember', id);
    revalidatePath('/[lang]/committee', 'page');
    revalidatePath('/[lang]/admin/committee', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function toggleCommitteeMemberPublicationAction(id: string, status: 'PUBLISHED' | 'DRAFT') {
  try {
    const admin = await requireSuperadmin();
    const res = await saveCommitteeMember({ id, status, isPublic: status === 'PUBLISHED' } as any);
    await logCMSActivity(admin.id, admin.fullName, 'TOGGLE_COMMITTEE_STATUS', 'CommitteeMember', id, { status });
    revalidatePath('/[lang]/committee', 'page');
    revalidatePath('/[lang]/admin/committee', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function updateCommitteePhotoConsentAction(id: string, photoConsent: 'PENDING' | 'VERIFIED' | 'DECLINED') {
  try {
    const admin = await requireSuperadmin();
    const res = await saveCommitteeMember({ id, photoConsent } as any);
    await logCMSActivity(admin.id, admin.fullName, 'UPDATE_PHOTO_CONSENT', 'CommitteeMember', id, { photoConsent });
    revalidatePath('/[lang]/committee', 'page');
    revalidatePath('/[lang]/admin/committee', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function uploadCommitteePhotoAction(formData: FormData) {
  try {
    const admin = await requireSuperadmin();
    const file = formData.get('file') as File | null;
    if (!file || typeof file === 'string') {
      return { success: false, error: 'कुनै फाइल प्राप्त भएन।' };
    }

    const validation = validateUploadFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.valid || validation.category !== 'IMAGE') {
      return { success: false, error: validation.error || 'अवैध तस्बिर फाइल। केवल JPG, PNG वा WEBP तस्बिर स्वीकार गरिन्छ।' };
    }

    const safeName = sanitizeFilename(file.name);
    const uploadDir = path.join(process.cwd(), 'public', 'media', 'committee');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, safeName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/media/committee/${safeName}`;
    await logCMSActivity(admin.id, admin.fullName, 'UPLOAD_COMMITTEE_PHOTO', 'CommitteeMemberPhoto', safeName, { url: publicUrl });

    return { success: true, url: publicUrl };
  } catch (err: any) {
    return { success: false, error: err.message || 'अपलोड गर्दा त्रुटि भयो।' };
  }
}

export async function saveReportAction(data: any) {
  try {
    const admin = await requireSuperadmin();
    if (data.category === 'CONSTITUTION' && data.status === 'PUBLISHED') {
      if (!data.isOriginalApprovedDocument) {
        return {
          success: false,
          error:
            'प्रकाशन अस्विकृत: संस्थाको आधिकारिक छाप तथा दर्ता भएको सक्कल (Original Approved) विधान मात्र सार्वजनिक गर्न सकिन्छ। सन्दर्भ मस्यौदा प्रकाशित गर्न मिल्दैन। (Publication rejected: only original approved and stamped constitution can be published publicly.)',
        };
      }
      if (!data.noPrivateDataConfirmed) {
        return {
          success: false,
          error:
            'गोपनीयता पुष्टि अनिवार्य छ: कृपया "यो दस्तावेजमा कुनै निजी सदस्य विवरण छैन" भन्ने बाकसमा चिन्ह लगाउनुहोस्। (Privacy confirmation required: document must contain no private member data.)',
        };
      }
    }
    const res = await saveReport(data);
    await logCMSActivity(admin.id, admin.fullName, 'SAVE_REPORT', 'GovernanceReport', res.id, {
      title: res.titleNe,
      category: res.category,
      version: res.version,
      status: res.status,
    });
    revalidatePath('/[lang]/reports', 'page');
    revalidatePath('/[lang]/about', 'page');
    revalidatePath('/[lang]/admin/reports', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function deleteReportAction(id: string) {
  try {
    const admin = await requireSuperadmin();
    await deleteReport(id);
    await logCMSActivity(admin.id, admin.fullName, 'DELETE_REPORT', 'GovernanceReport', id);
    revalidatePath('/[lang]/reports', 'page');
    revalidatePath('/[lang]/admin/reports', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

// --- Registration Certificate Server Actions ---

export async function saveRegistrationCertificateAction(data: any) {
  try {
    const admin = await requireSuperadmin();
    // Enforce Invariant: Category is strictly REGISTRATION_CERTIFICATE and default is Internal Only
    const certPayload = {
      ...data,
      category: 'REGISTRATION_CERTIFICATE',
      isPublic: false, // Invariant: Default to Internal Only!
      uploadedByAdminId: admin.id,
      uploadedByAdminName: admin.fullName,
      uploadedAt: new Date().toISOString(),
    };
    const res = await saveReport(certPayload);
    await logCMSActivity(admin.id, admin.fullName, 'UPLOAD_REGISTRATION_CERTIFICATE', 'RegistrationCertificate', res.id, {
      title: res.titleNe,
      authority: res.issuingAuthorityNe,
      regDate: res.registrationDateNe,
      isInternalOnly: true,
    });
    revalidatePath('/[lang]/reports', 'page');
    revalidatePath('/[lang]/about', 'page');
    revalidatePath('/[lang]/admin/reports', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function verifyRegistrationCertificateAction(
  id: string,
  verificationStatus: 'VERIFIED' | 'REJECTED' | 'PENDING',
  adminNotes?: string
) {
  try {
    const admin = await requireSuperadmin();
    const res = await verifyRegistrationCertificate(id, verificationStatus, admin.id, admin.fullName, adminNotes);
    if (!res) {
      return { success: false, error: 'Registration certificate not found.' };
    }
    await logCMSActivity(admin.id, admin.fullName, 'VERIFY_REGISTRATION_CERTIFICATE', 'RegistrationCertificate', id, {
      verificationStatus,
      adminNotes,
      verifiedBy: admin.fullName,
    });
    revalidatePath('/[lang]', 'layout');
    revalidatePath('/[lang]/reports', 'page');
    revalidatePath('/[lang]/about', 'page');
    revalidatePath('/[lang]/admin/reports', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function updateCertificateVisibilityAction(
  id: string,
  updates: {
    publishRegistrationNumber?: boolean;
    publishRedactedCertificate?: boolean;
  }
) {
  try {
    const admin = await requireSuperadmin();
    const res = await updateCertificateVisibility(id, updates);
    if (!res) {
      return { success: false, error: 'Registration certificate not found.' };
    }
    await logCMSActivity(admin.id, admin.fullName, 'UPDATE_CERTIFICATE_VISIBILITY', 'RegistrationCertificate', id, updates);
    revalidatePath('/[lang]', 'layout');
    revalidatePath('/[lang]/reports', 'page');
    revalidatePath('/[lang]/about', 'page');
    revalidatePath('/[lang]/admin/reports', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function downloadInternalCertificateAction(id: string) {
  try {
    const admin = await requireSuperadmin();
    const certs = await getRegistrationCertificates(true);
    const target = certs.find((c) => c.id === id);
    if (!target) {
      return { success: false, error: 'Certificate record not found.' };
    }
    await logCMSActivity(admin.id, admin.fullName, 'DOWNLOAD_INTERNAL_CERTIFICATE', 'RegistrationCertificate', id, {
      fileUrl: target.fileUrl,
    });
    return { success: true, fileUrl: target.fileUrl };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function updateApplicationStatusAction(
  id: string,
  status: 'APPROVED' | 'REJECTED' | 'MORE_INFO_REQUESTED',
  adminNotes?: string
) {
  try {
    const admin = await requireSuperadmin();
    await updateApplicationStatus(id, status, adminNotes);
    await logCMSActivity(admin.id, admin.fullName, 'UPDATE_APPLICATION_STATUS', 'MembershipApplication', id, { status, adminNotes });

    // Look up applicant details to trigger status notification email
    const apps = await getMembershipApplications();
    const target = apps.find((a) => a.id === id);
    if (target && target.email) {
      sendMembershipStatusEmail({
        fullName: target.fullNameNe,
        email: target.email,
        status,
        adminNotes,
      }).catch(() => {});
    }

    revalidatePath('/[lang]/admin/membership', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function updateFeedbackStatusAction(
  id: string,
  status: 'NEW' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED',
  adminNotes?: string
) {
  try {
    const admin = await requireSuperadmin();
    await updateFeedbackStatus(id, status, adminNotes);
    await logCMSActivity(admin.id, admin.fullName, 'UPDATE_FEEDBACK_STATUS', 'FeedbackSubmission', id, { status, adminNotes });
    revalidatePath('/[lang]/admin/feedback', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function savePartnerAction(data: any) {
  try {
    const admin = await requireSuperadmin();
    const res = await savePartner(data);
    await logCMSActivity(admin.id, admin.fullName, 'SAVE_PARTNER', 'CommunityPartner', res.id, { name: res.nameNe });
    revalidatePath('/[lang]/partners', 'page');
    revalidatePath('/[lang]/admin/partners', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function deletePartnerAction(id: string) {
  try {
    const admin = await requireSuperadmin();
    await deletePartner(id);
    await logCMSActivity(admin.id, admin.fullName, 'DELETE_PARTNER', 'CommunityPartner', id);
    revalidatePath('/[lang]/partners', 'page');
    revalidatePath('/[lang]/admin/partners', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

// --- Banners Server Actions ---

export async function saveBannerAction(data: any) {
  try {
    const admin = await requireSuperadmin();
    const res = await saveBanner(data);
    await logCMSActivity(admin.id, admin.fullName, 'SAVE_BANNER', 'SiteBanner', res.id, { title: res.titleNe });
    revalidatePath('/[lang]', 'page');
    revalidatePath('/[lang]/admin/banners', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function deleteBannerAction(id: string) {
  try {
    const admin = await requireSuperadmin();
    await deleteBanner(id);
    await logCMSActivity(admin.id, admin.fullName, 'DELETE_BANNER', 'SiteBanner', id);
    revalidatePath('/[lang]', 'page');
    revalidatePath('/[lang]/admin/banners', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

// --- Gallery & Media Server Actions ---

export async function saveGalleryAlbumAction(data: any) {
  try {
    const admin = await requireSuperadmin();
    const res = await saveGalleryAlbum(data);
    await logCMSActivity(admin.id, admin.fullName, 'SAVE_GALLERY_ALBUM', 'GalleryAlbum', res.id, { title: res.titleNe });
    revalidatePath('/[lang]/gallery', 'page');
    revalidatePath('/[lang]/admin/gallery', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function deleteGalleryAlbumAction(id: string) {
  try {
    const admin = await requireSuperadmin();
    await deleteGalleryAlbum(id);
    await logCMSActivity(admin.id, admin.fullName, 'DELETE_GALLERY_ALBUM', 'GalleryAlbum', id);
    revalidatePath('/[lang]/gallery', 'page');
    revalidatePath('/[lang]/admin/gallery', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function saveMediaItemAction(data: any) {
  try {
    const admin = await requireSuperadmin();
    const res = await saveMediaItem(data);
    await logCMSActivity(admin.id, admin.fullName, 'SAVE_MEDIA_ITEM', 'MediaItem', res.id, { title: res.titleNe });
    revalidatePath('/[lang]/gallery', 'page');
    revalidatePath('/[lang]/admin/media', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function deleteMediaItemAction(id: string) {
  try {
    const admin = await requireSuperadmin();
    await deleteMediaItem(id);
    await logCMSActivity(admin.id, admin.fullName, 'DELETE_MEDIA_ITEM', 'MediaItem', id);
    revalidatePath('/[lang]/gallery', 'page');
    revalidatePath('/[lang]/admin/media', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

// --- Notices Server Actions ---

export async function saveNoticeAction(data: any) {
  try {
    const admin = await requireSuperadmin();
    const res = await saveNotice(data);
    await logCMSActivity(admin.id, admin.fullName, 'SAVE_NOTICE', 'NoticeItem', res.id, { title: res.titleNe });
    revalidatePath('/[lang]', 'page');
    revalidatePath('/[lang]/admin/notices', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function deleteNoticeAction(id: string) {
  try {
    const admin = await requireSuperadmin();
    await deleteNotice(id);
    await logCMSActivity(admin.id, admin.fullName, 'DELETE_NOTICE', 'NoticeItem', id);
    revalidatePath('/[lang]', 'page');
    revalidatePath('/[lang]/admin/notices', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

// --- Site Settings Server Action ---

export async function updateSiteSettingsAction(updates: any) {
  try {
    const admin = await requireSuperadmin();
    const res = await updateSiteSettings(updates);
    await logCMSActivity(admin.id, admin.fullName, 'UPDATE_SITE_SETTINGS', 'SiteSettings', 'general', updates);
    revalidatePath('/[lang]', 'layout');
    revalidatePath('/[lang]', 'page');
    revalidatePath('/[lang]/about', 'page');
    revalidatePath('/[lang]/admin/settings', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

// --- Homepage Hero Image Server Actions ---

export async function saveHomepageHeroAction(data: Partial<HomepageHeroConfig>) {
  try {
    const admin = await requireSuperadmin();
    const res = await saveHomepageHero(data, admin.id, admin.fullName);
    await logCMSActivity(admin.id, admin.fullName, 'SAVE_HOMEPAGE_HERO', 'HomepageHero', res.id, {
      imageUrl: res.imageUrl,
      status: res.status,
      headingNe: res.headingNe,
    });
    revalidatePath('/[lang]', 'page');
    revalidatePath('/[lang]/admin/banners', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function publishHomepageHeroAction() {
  try {
    const admin = await requireSuperadmin();
    const res = await publishHomepageHero(admin.id, admin.fullName);
    if (!res) throw new Error('Hero configuration not found.');
    await logCMSActivity(admin.id, admin.fullName, 'PUBLISH_HOMEPAGE_HERO', 'HomepageHero', res.id, {
      imageUrl: res.imageUrl,
      publishedAt: res.publishedAt,
    });
    revalidatePath('/[lang]', 'page');
    revalidatePath('/[lang]/admin/banners', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function unpublishHomepageHeroAction() {
  try {
    const admin = await requireSuperadmin();
    const res = await unpublishHomepageHero(admin.id, admin.fullName);
    if (!res) throw new Error('Hero configuration not found.');
    await logCMSActivity(admin.id, admin.fullName, 'UNPUBLISH_HOMEPAGE_HERO', 'HomepageHero', res.id, {
      imageUrl: res.imageUrl,
    });
    revalidatePath('/[lang]', 'page');
    revalidatePath('/[lang]/admin/banners', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}

export async function replaceHomepageHeroAction(newHeroData: Partial<HomepageHeroConfig>) {
  try {
    const admin = await requireSuperadmin();
    const res = await replaceHomepageHero(newHeroData, admin.id, admin.fullName);
    await logCMSActivity(admin.id, admin.fullName, 'REPLACE_HOMEPAGE_HERO', 'HomepageHero', res.id, {
      newImageUrl: res.imageUrl,
      status: res.status,
    });
    revalidatePath('/[lang]', 'page');
    revalidatePath('/[lang]/admin/banners', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized.' };
  }
}


// --- Media Consent & Publication Tracker Server Actions ---

export async function saveMediaConsentRecordAction(data: Partial<MediaConsentRecord> & { mediaType: any; titleNe: string }) {
  try {
    const admin = await requireSuperadmin();
    const res = await saveMediaConsentRecord(data);
    await logCMSActivity(admin.id, admin.fullName, 'SAVE_MEDIA_CONSENT_RECORD', 'MediaConsentRecord', res.id, {
      mediaType: res.mediaType,
      status: res.status,
    });
    revalidatePath('/[lang]/admin/media', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save media consent record.' };
  }
}

export async function approveMediaConsentPublicationAction(
  id: string,
  targetStatus: 'APPROVED_PUBLIC' | 'REDACTED_PUBLIC',
  approvalNotes?: string,
  redactedFileUrl?: string
) {
  try {
    const admin = await requireSuperadmin();
    const res = await approveMediaConsentPublication(
      id,
      admin.fullName,
      targetStatus,
      approvalNotes,
      redactedFileUrl
    );
    if (!res.success) {
      return { success: false, error: res.error };
    }
    await logCMSActivity(admin.id, admin.fullName, 'APPROVE_MEDIA_PUBLICATION', 'MediaConsentRecord', id, {
      targetStatus,
      approver: admin.fullName,
    });
    revalidatePath('/[lang]/admin/media', 'page');
    return { success: true, data: res.data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to approve media publication.' };
  }
}

export async function deleteMediaConsentRecordAction(id: string) {
  try {
    const admin = await requireSuperadmin();
    const success = await deleteMediaConsentRecord(id);
    await logCMSActivity(admin.id, admin.fullName, 'DELETE_MEDIA_CONSENT_RECORD', 'MediaConsentRecord', id);
    revalidatePath('/[lang]/admin/media', 'page');
    return { success };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete media consent record.' };
  }
}

// --- Financial Transparency Checklist & Publication Workflow Server Actions ---

export async function saveFinancialTransparencyRecordAction(
  data: Partial<FinancialTransparencyRecord> & { recordType: any; amount: number }
) {
  try {
    const admin = await requireSuperadmin();
    const res = await saveFinancialTransparencyRecord(data);
    await logCMSActivity(admin.id, admin.fullName, 'SAVE_FINANCIAL_TRANSPARENCY_RECORD', 'FinancialTransparencyRecord', res.id, {
      recordType: res.recordType,
      amount: res.amount,
      status: res.status,
    });
    revalidatePath('/[lang]/admin/reports', 'page');
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save financial record.' };
  }
}

export async function advanceFinancialWorkflowAction(
  id: string,
  targetStatus: FinancialPublicationStatus,
  notes?: string
) {
  try {
    const admin = await requireSuperadmin();
    const res = await advanceFinancialWorkflow(id, targetStatus, admin.fullName, notes);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    await logCMSActivity(admin.id, admin.fullName, 'ADVANCE_FINANCIAL_WORKFLOW', 'FinancialTransparencyRecord', id, {
      targetStatus,
      actor: admin.fullName,
    });
    revalidatePath('/[lang]/admin/reports', 'page');
    return { success: true, data: res.data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to advance financial workflow.' };
  }
}

export async function deleteFinancialTransparencyRecordAction(id: string) {
  try {
    const admin = await requireSuperadmin();
    const success = await deleteFinancialTransparencyRecord(id);
    await logCMSActivity(admin.id, admin.fullName, 'DELETE_FINANCIAL_TRANSPARENCY_RECORD', 'FinancialTransparencyRecord', id);
    revalidatePath('/[lang]/admin/reports', 'page');
    return { success };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete financial record.' };
  }
}

export async function savePublicDocumentAction(
  data: Partial<PublicDocument> & {
    titleNe: string;
    titleEn: string;
    documentType: DocumentLibraryType;
    filePath: string;
  }
) {
  try {
    const admin = await requireSuperadmin();
    const res = await savePublicDocument(data);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    await logCMSActivity(admin.id, admin.fullName, 'SAVE_PUBLIC_DOCUMENT', 'PublicDocument', res.data!.id, {
      titleNe: res.data!.titleNe,
      status: res.data!.status,
    });
    revalidatePath('/[lang]/reports', 'page');
    revalidatePath('/[lang]/admin/reports', 'page');
    return { success: true, data: res.data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save public document.' };
  }
}

export async function advancePublicDocumentStatusAction(
  id: string,
  targetStatus: DocumentPublicationStatus,
  notes?: string,
  verificationFlags?: { hasSignedStampedPdf?: boolean; isApprovedForPublic?: boolean }
) {
  try {
    const admin = await requireSuperadmin();
    const res = await advancePublicDocumentStatus(id, targetStatus, {
      adminId: admin.id,
      adminName: admin.fullName,
      notes,
      ...verificationFlags,
    });
    if (!res.success) {
      return { success: false, error: res.error };
    }
    await logCMSActivity(admin.id, admin.fullName, 'ADVANCE_PUBLIC_DOCUMENT_STATUS', 'PublicDocument', id, {
      targetStatus,
      actor: admin.fullName,
    });
    revalidatePath('/[lang]/reports', 'page');
    revalidatePath('/[lang]/admin/reports', 'page');
    return { success: true, data: res.data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to advance document status.' };
  }
}

export async function deletePublicDocumentAction(id: string) {
  try {
    const admin = await requireSuperadmin();
    const success = await deletePublicDocument(id);
    await logCMSActivity(admin.id, admin.fullName, 'DELETE_PUBLIC_DOCUMENT', 'PublicDocument', id);
    revalidatePath('/[lang]/reports', 'page');
    revalidatePath('/[lang]/admin/reports', 'page');
    return { success };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete public document.' };
  }
}

export async function saveEvidenceTrackerRecordAction(
  data: Partial<EvidenceTrackerRecord> & {
    category: EvidenceTrackerCategory;
    itemKey: string;
    titleNe: string;
    titleEn: string;
  }
) {
  try {
    const admin = await requireSuperadmin();
    const res = await saveEvidenceTrackerRecord(data);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    await logCMSActivity(admin.id, admin.fullName, 'SAVE_EVIDENCE_TRACKER_RECORD', 'EvidenceTrackerRecord', res.data!.id, {
      category: res.data!.category,
      itemKey: res.data!.itemKey,
    });
    revalidatePath('/[lang]/admin', 'page');
    return { success: true, data: res.data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save evidence tracker record.' };
  }
}

export async function updateEvidenceTrackerItemStatusAction(
  id: string,
  updates: {
    collectionStatus?: EvidenceCollectionStatus;
    approvalStatus?: EvidenceApprovalStatus;
    verifiedBy?: string;
    verificationDate?: string;
    approvedBy?: string;
    approvedAt?: string;
    privateNotes?: string;
    documentRefOrPath?: string;
    collectedBy?: string;
  }
) {
  try {
    const admin = await requireSuperadmin();
    const res = await updateEvidenceTrackerItemStatus(id, updates);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    await logCMSActivity(admin.id, admin.fullName, 'UPDATE_EVIDENCE_TRACKER_STATUS', 'EvidenceTrackerRecord', id, {
      updates,
      actor: admin.fullName,
    });
    revalidatePath('/[lang]/admin', 'page');
    return { success: true, data: res.data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update evidence tracker status.' };
  }
}

export async function deleteEvidenceTrackerRecordAction(id: string) {
  try {
    const admin = await requireSuperadmin();
    const success = await deleteEvidenceTrackerRecord(id);
    await logCMSActivity(admin.id, admin.fullName, 'DELETE_EVIDENCE_TRACKER_RECORD', 'EvidenceTrackerRecord', id);
    revalidatePath('/[lang]/admin', 'page');
    return { success };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete evidence tracker record.' };
  }
}

export async function getGovernanceDashboardOverviewAction() {
  try {
    const admin = await requireSuperadmin();
    const overview = await getGovernanceDashboardOverview(true);
    return { success: true, data: overview, adminRole: admin.role, adminName: admin.fullName };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized: Superadmin access required.' };
  }
}
