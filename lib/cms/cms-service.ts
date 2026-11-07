// Madi Sankhuwasabha Sarokar Samaj (Kathmandu)
// Community CMS Service & Repository Layer

import fs from 'node:fs';
import path from 'node:path';

export type ActivityWorkflowStage = 'DRAFT' | 'TREASURER_REVIEW' | 'PRESIDENT_APPROVAL' | 'PUBLISHED' | 'REJECTED';

export interface ZeroExpenseDeclaration {
  declared: boolean;
  declaredByAdminName?: string;
  declaredAt?: string;
  treasurerReviewed: boolean;
  treasurerReviewedBy?: string;
  treasurerReviewedAt?: string;
  treasurerNotes?: string;
}

export interface ActivityEvidenceChecklist {
  hasAttendanceSheet: boolean;
  attendanceSheetRef?: string;
  hasEventPhotos: boolean;
  eventPhotosRef?: string;
  hasReceiptsVouchers: boolean;
  receiptsVouchersRef?: string;
  noExpenseIncurred?: boolean;
  zeroExpenseDeclaration?: ZeroExpenseDeclaration;
  hasActivityReport: boolean;
  activityReportRef?: string;
  hasExecutiveCommitteeApproval: boolean;
  approvalMinuteRef?: string;
}

export interface SocialActivity {
  id: string;
  slug: string;
  // 1. Title in Nepali and English
  titleNe: string;
  titleEn: string;
  // 2. Activity date
  date: string;
  dateEn?: string;
  // 3. Location
  locationNe: string;
  locationEn: string;
  // 4. Short public-safe description in Nepali and English
  descriptionNe: string;
  descriptionEn: string;
  summaryNe?: string;
  summaryEn?: string;
  category: 'CULTURAL' | 'HEALTH' | 'COMMUNITY' | 'EDUCATION' | 'ENVIRONMENT';
  // 5. Organizer or implementing unit
  organizerNe?: string;
  organizerEn?: string;
  // 6. Beneficiary/participant count with official record
  participantCount?: number;
  hasBeneficiaryRecord?: boolean;
  beneficiaryRecordRef?: string;
  // 7. Photo album link with verified consent
  albumId?: string;
  albumLink?: string;
  photoConsentVerified?: boolean;
  photos: string[];
  videoUrl?: string;
  // 8. Related public document (PDF exists & approved)
  relatedDocumentUrl?: string;
  relatedDocumentTitleNe?: string;
  relatedDocumentTitleEn?: string;
  relatedDocumentApproved?: boolean;
  // 9. Display status
  status: 'PUBLISHED' | 'DRAFT';
  isFeatured: boolean;
  isPublic?: boolean;
  // 10. Internal evidence checklist
  evidenceChecklist: ActivityEvidenceChecklist;
  // 11. Publication workflow
  workflowStage: ActivityWorkflowStage;
  reviewedByTreasurerName?: string;
  reviewedByTreasurerAt?: string;
  approvedByPresidentName?: string;
  approvedByPresidentAt?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReliefProgram {
  id: string;
  slug: string;
  titleNe: string;
  titleEn: string;
  type: 'DISASTER_RELIEF' | 'HEALTH_ASSISTANCE' | 'SCHOLARSHIP' | 'COMMUNITY_WELFARE';
  beneficiaryGroupNe: string;
  beneficiaryGroupEn: string;
  date: string;
  locationNe: string;
  locationEn: string;
  amountNpr: number;
  materialsProvidedNe: string;
  materialsProvidedEn: string;
  descriptionNe: string;
  descriptionEn: string;
  photos: string[];
  reportAttachmentUrl?: string;
  status: 'COMPLETED' | 'ONGOING';
  createdAt: string;
}

export interface EventProgram {
  id: string;
  slug: string;
  titleNe: string;
  titleEn: string;
  eventDateTime: string;
  venueNe: string;
  venueEn: string;
  agendaNe: string;
  agendaEn: string;
  registrationLink?: string;
  organizerNe: string;
  organizerEn: string;
  featuredImage: string;
  descriptionNe: string;
  descriptionEn: string;
  status: 'UPCOMING' | 'COMPLETED' | 'DRAFT';
  isPublic?: boolean;
  createdAt: string;
}

export interface MembershipApplication {
  id: string;
  fullNameNe: string;
  fullNameEn: string;
  membershipType: 'ORDINARY' | 'LIFE' | 'HONORARY';
  madiAddressNe: string; // ward/village in Madi Municipality
  currentAddressNe: string; // in Kathmandu Valley
  phone: string;
  email: string;
  occupationNe: string;
  reasonForJoiningNe: string;
  consentGiven: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MORE_INFO_REQUESTED';
  adminNotes?: string;
  submittedAt: string;
}

export interface MembershipTier {
  id: string;
  tierKey: string;
  nameNe: string;
  nameEn: string;
  feeNpr: number;
  validityNe: string;
  validityEn: string;
  descriptionNe: string;
  descriptionEn: string;
  requirementsNe: string[];
}

export interface CommitteeMember {
  id: string;
  nameNe: string;
  nameEn: string;
  designationNe: string;
  designationEn: string;
  category: 'EXECUTIVE' | 'ADVISORY' | 'SUB_COMMITTEE';
  departmentNe: string;
  departmentEn: string;
  photoUrl: string;
  termStartDateNe?: string;
  termStartDateEn?: string;
  termEndDateNe?: string;
  termEndDateEn?: string;
  term?: string;
  bioNe?: string;
  bioEn?: string;
  displayOrder: number;
  status: 'PUBLISHED' | 'DRAFT';
  isPublic?: boolean;
  photoConsent: 'PENDING' | 'VERIFIED' | 'DECLINED';
  adminNotes?: string;
  contactPhone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GovernanceReport {
  id: string;
  titleNe: string;
  titleEn: string;
  fiscalYear: string;
  category: 'ANNUAL_REPORT' | 'AUDIT_FINANCIAL' | 'CONSTITUTION' | 'MINUTES' | 'POLICY' | 'REGISTRATION_CERTIFICATE';
  publishedDate: string;
  fileUrl: string; // For original certificate, strictly internal/private!
  fileSizeMb: string;
  isPublic: boolean;
  version?: string;
  effectiveDate?: string;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  descriptionNe?: string;
  descriptionEn?: string;
  noPrivateDataConfirmed?: boolean;
  isOriginalApprovedDocument?: boolean;

  // CDO/DAO Registration Certificate Specific Fields
  issuingAuthorityNe?: string;
  issuingAuthorityEn?: string;
  registrationDateNe?: string;
  registrationDateEn?: string;
  registrationNumber?: string;
  decisionDateNe?: string;
  registeredOrgNameNe?: string;
  registeredOrgNameEn?: string;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  redactedFileUrl?: string; // Optional redacted public version
  publishRegistrationNumber?: boolean; // Only if Madi SSS approves publishing registration number
  publishRedactedCertificate?: boolean; // Only downloadable publicly if explicit superadmin approval
  adminNotes?: string;
  uploadedByAdminId?: string;
  uploadedByAdminName?: string;
  uploadedAt?: string;
  verifiedByAdminId?: string;
  verifiedByAdminName?: string;
  verifiedAt?: string;
}

export interface FeedbackSubmission {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  subject: string;
  category: 'SUGGESTION' | 'COMPLAINT' | 'RELIEF_REQUEST' | 'INQUIRY';
  message: string;
  attachmentUrl?: string;
  status: 'NEW' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
  adminNotes?: string;
  submittedAt: string;
}

export interface CommunityPartner {
  id: string;
  nameNe: string;
  nameEn: string;
  partnerType: 'LOCAL_GOVERNMENT' | 'NGO_INGO' | 'SPONSOR' | 'COMMUNITY_GROUP';
  logoUrl?: string;
  websiteUrl?: string;
  contributionSummaryNe: string;
  contributionSummaryEn: string;
  displayOrder: number;
}

export interface NoticeItem {
  id: string;
  titleNe: string;
  titleEn: string;
  date: string;
  summaryNe: string;
  summaryEn: string;
  isUrgent: boolean;
  status?: 'DRAFT' | 'PUBLISHED';
  isPublic?: boolean;
  relatedEventId?: string;
}

export interface SiteBanner {
  id: string;
  titleNe: string;
  titleEn: string;
  subtitleNe?: string;
  subtitleEn?: string;
  imageDesktopUrl: string;
  imageMobileUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  buttonTextNe?: string;
  buttonTextEn?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface GalleryAlbum {
  id: string;
  slug: string;
  titleNe: string;
  titleEn: string;
  descriptionNe?: string;
  descriptionEn?: string;
  coverPhotoUrl: string;
  eventDate: string;
  category: 'HEALTH' | 'CULTURAL' | 'RELIEF' | 'COMMUNITY' | 'GENERAL';
  isFeatured: boolean;
  isPublic?: boolean;
  status?: 'PUBLISHED' | 'DRAFT';
  displayOrder: number;
}

export interface MediaItem {
  id: string;
  albumId?: string;
  titleNe: string;
  titleEn: string;
  originalFilename?: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  fileUrl: string;
  thumbnailUrl?: string;
  videoThumbnailUrl?: string;
  videoCaptionNe?: string;
  videoCaptionEn?: string;
  videoDurationSeconds?: number;
  fileSizeBytes: number;
  mimeType: string;
  dimensions?: { width: number; height: number };
  responsiveUrls?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  altTextNe?: string;
  altTextEn?: string;
  captionNe?: string;
  captionEn?: string;
  status?: 'TEST_SAMPLE' | 'PENDING_REVIEW' | 'INTERNAL_ONLY' | 'APPROVED_PUBLIC' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isPublic?: boolean;
  category?: 'UNSORTED_PENDING_REVIEW' | 'HERO' | 'GALLERY' | 'GENERAL';
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
  isHeroEligible?: boolean;
  internalCategory?: 'CONDOLENCE' | 'WARD_CORRESPONDENCE' | 'PATIENT_IDENTIFICATION' | 'RELIEF_HANDOVER' | 'DONATION_HANDOVER' | 'EVENT' | 'SCENIC' | 'GENERAL';
  sensitivityNotice?: string;
  sensitivityNoticeNe?: string;
  identifiablePeopleConsent?: 'NOT_APPLICABLE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
}

// -------------------------------------------------------------
// Media Consent & Publication Governance Tracker
// -------------------------------------------------------------

export type MediaConsentType =
  | 'condolence'
  | 'ward_correspondence'
  | 'relief_handover'
  | 'donation_handover'
  | 'patient_identification'
  | 'event_photo'
  | 'other';

export type MediaConsentStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'INTERNAL_ONLY'
  | 'REDACTED_PUBLIC'
  | 'APPROVED_PUBLIC';

export type MediaConsentScope =
  | 'internal_use'
  | 'redacted_public_use'
  | 'full_public_use';

export interface MediaConsentRecord {
  // 1. Media ID
  id: string;
  titleNe: string;
  titleEn: string;
  fileUrl: string;
  redactedFileUrl?: string;
  // 2. Media type
  mediaType: MediaConsentType;
  // 3. Current status
  status: MediaConsentStatus;
  // 4. Whether written consent exists
  hasWrittenConsent: boolean;
  // 5. Consent date
  consentDate?: string;
  // 6. Consent scope
  consentScope: MediaConsentScope;
  // 7. Redaction requirement
  redactionRequirement: string;
  // 8. Approver name and approval date
  approverName?: string;
  approvalDate?: string;
  // 9. Private admin notes
  adminNotes?: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// -------------------------------------------------------------
// Financial Transparency Checklist & Publication Workflow Types
// -------------------------------------------------------------

export type FinancialRecordType =
  | 'RELIEF_FUND_CONTRIBUTION'
  | 'RELIEF_FUND_EXPENDITURE'
  | 'ACTIVITY_EXPENSE'
  | 'AUDIT_REPORT'
  | 'ANNUAL_FINANCIAL_STATEMENT'
  | 'OTHER_FINANCIAL_DOCUMENT';

export type FinancialPartyCategory =
  | 'COMMUNITY_MEMBER'
  | 'INSTITUTIONAL_DONOR'
  | 'SERVICE_PROVIDER'
  | 'GOVERNMENT_BODY'
  | 'VENDOR'
  | 'OTHER';

export type FinancialPublicationStatus =
  | 'DRAFT'
  | 'INTERNAL_ONLY'
  | 'PENDING_TREASURER_REVIEW'
  | 'PENDING_PRESIDENT_APPROVAL'
  | 'APPROVED_PUBLIC';

export interface FinancialSupportingEvidence {
  bankStatementRef?: string;
  voucherRef?: string;
  invoiceRef?: string;
  receiptRef?: string;
  approvalMinuteRef?: string;
  auditReportRef?: string;
  signedStatementRef?: string;
}

export interface FinancialEvidenceVerification {
  bankStatementVerified: boolean;
  voucherVerified: boolean;
  invoiceVerified: boolean;
  receiptVerified: boolean;
  approvalMinuteVerified: boolean;
  auditReportVerified: boolean;
  signedStatementVerified?: boolean;
}

export interface FinancialPublicSummary {
  descriptionNe: string;
  descriptionEn: string;
  isAmountVisible: boolean;
  approvedDocumentUrl?: string;
}

export interface FinancialTransparencyRecord {
  // 1. Financial record ID
  id: string;
  // 2. Record type
  recordType: FinancialRecordType;
  // 3. Amount
  amount: number;
  // 4. Currency
  currency: string;
  // 5. Transaction date
  transactionDate: string;
  // 6. Payer or payee category — strictly anonymized category
  payerPayeeCategory: FinancialPartyCategory;
  // 7. Supporting evidence references
  supportingEvidence: FinancialSupportingEvidence;
  // 8. Verification status for each evidence item
  evidenceVerification: FinancialEvidenceVerification;
  // 9. Publication status
  status: FinancialPublicationStatus;
  // 10. Public summary fields
  publicSummary: FinancialPublicSummary;
  // 11. Private admin notes
  adminNotes?: string;

  // Reviewer and approval workflow details (strictly private)
  reviewedByTreasurerName?: string;
  reviewedByTreasurerAt?: string;
  treasurerNotes?: string;
  approvedByPresidentName?: string;
  approvedByPresidentAt?: string;
  presidentNotes?: string;

  isPublic?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ==========================================
// Public Document Library Governance System
// ==========================================
export type DocumentLibraryType =
  | 'AUDIT_REPORT'
  | 'ANNUAL_PROGRESS_REPORT'
  | 'DISASTER_FUND_POLICY'
  | 'CONSTITUTION'
  | 'REGISTRATION_CERTIFICATE'
  | 'OTHER_PUBLIC_DOCUMENT';

export type DocumentPublicationStatus =
  | 'DRAFT'
  | 'INTERNAL_ONLY'
  | 'PENDING_REVIEW'
  | 'APPROVED_PUBLIC';

export interface PublicDocument {
  // 1. Document ID
  id: string;
  // 2. Document title in Nepali and English
  titleNe: string;
  titleEn: string;
  // 3. Document type
  documentType: DocumentLibraryType;
  // 4. Document file path — local media only
  filePath: string;
  // 5. Document status
  status: DocumentPublicationStatus;
  // 6. Whether the final signed/stamped PDF exists
  hasSignedStampedPdf: boolean;
  // 7. Whether the document is approved for public release
  isApprovedForPublic: boolean;
  // 8. Public-safe description in Nepali and English
  descriptionNe: string;
  descriptionEn: string;
  // 9. Publication date
  publicationDate: string;
  // 10. Private admin notes
  adminNotes?: string;

  // Internal review & approval workflow metadata (strictly private)
  reviewedByTreasurerName?: string;
  reviewedByTreasurerAt?: string;
  approvedByPresidentName?: string;
  approvedByPresidentAt?: string;
  internalReviewNotes?: string;
  createdAt: string;
  updatedAt?: string;
  isPublic?: boolean;
}

// ==========================================
// Internal Evidence Collection Tracker
// ==========================================
export type EvidenceTrackerCategory =
  | 'COMMITTEE'
  | 'ACTIVITY'
  | 'SCHOOL_SUPPORT'
  | 'RELIEF_MEDICAL_ASSISTANCE'
  | 'DOCUMENT'
  | 'FINANCIAL'
  | 'EDUCATION_INFRASTRUCTURE_SUPPORT';

export interface EducationInfrastructureSupportRecord {
  id: string;
  schoolNameNe: string;
  schoolNameEn: string;
  supportPurposeNe: string;
  supportPurposeEn: string;
  amountNpr: number;
  voucherReceiptRef: string; // Required voucher/receipt
  approvalMinuteRef: string; // Required approval minute
  publicSafeSummaryNe: string;
  publicSafeSummaryEn: string;
  fiscalYear: string;
  status: 'DRAFT' | 'VERIFIED' | 'PUBLISHED';
  isPublic: boolean; // Strictly false for now
  createdAt: string;
  updatedAt?: string;
}
export type EvidenceCollectionStatus = 'NOT_COLLECTED' | 'COLLECTED' | 'VERIFIED' | 'REJECTED';
export type EvidenceApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface EvidenceTrackerRecord {
  id: string;
  category: EvidenceTrackerCategory;
  itemKey: string;
  titleNe: string;
  titleEn: string;
  targetEntityId?: string;
  collectionStatus: EvidenceCollectionStatus;
  documentRefOrPath?: string;
  collectedBy?: string;
  collectedAt?: string;
  verifiedBy?: string;
  verificationDate?: string;
  approvalStatus: EvidenceApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  privateNotes?: string;
  isPublic: boolean; // Strictly false
  createdAt: string;
  updatedAt?: string;
}

// ==========================================
// Governance Dashboard Overview
// ==========================================
export interface GovernanceSectionMetrics {
  sectionKey: 'COMMITTEE' | 'ACTIVITIES' | 'DOCUMENTS' | 'FINANCIAL';
  titleNe: string;
  titleEn: string;
  totalRecords: number;
  draftInternalRecords: number;
  pendingReviewRecords: number;
  approvedPublicRecords: number;
  evidenceItems: {
    notCollected: number;
    collected: number;
    verified: number;
    rejected: number;
  };
  missingRequirementsNe: string[];
  missingRequirementsEn: string[];
  publicationReadiness: 'READY_FOR_PUBLICATION' | 'NOT_READY_FOR_PUBLICATION';
  readinessLabelNe: string;
  readinessLabelEn: string;
  detailedEvidence?: Array<{
    itemKey: string;
    titleNe: string;
    titleEn: string;
    collectionStatus: EvidenceCollectionStatus;
    approvalStatus: EvidenceApprovalStatus;
    documentRefOrPath?: string;
    verifiedBy?: string;
    verificationDate?: string;
    privateNotes?: string;
  }>;
}

export interface GovernanceDashboardOverview {
  committee: GovernanceSectionMetrics;
  activities: GovernanceSectionMetrics;
  documents: GovernanceSectionMetrics;
  financial: GovernanceSectionMetrics;
  overallReadiness: 'READY_FOR_PUBLICATION' | 'NOT_READY_FOR_PUBLICATION';
  generatedAt: string;
}

export interface HomepageHeroConfig {
  id: string;
  mediaItemId?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  tabletImageUrl?: string;
  desktopImageUrl?: string;
  altTextNe: string;
  altTextEn: string;
  headingNe?: string;
  headingEn?: string;
  subheadingNe?: string;
  subheadingEn?: string;
  ctaLabelNe?: string;
  ctaLabelEn?: string;
  ctaLink?: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
  updatedAt: string;
  selectedByAdminId?: string;
  selectedByAdminName?: string;
  adminNotes?: string;
}

export interface StatutoryObjective {
  id: string;
  numNe: string;
  numEn: string;
  titleNe: string;
  titleEn: string;
  descNe: string;
  descEn: string;
  icon: string;
  isVerified: boolean; // false until stamped constitution is reviewed
}

export interface MembershipTierConfig {
  id: string;
  tierKey: 'ORDINARY' | 'LIFE' | 'HONORARY';
  nameNe: string;
  nameEn: string;
  feeNe: string;
  feeEn: string;
  descNe: string;
  descEn: string;
  isPopular?: boolean;
  isVerified: boolean; // false until stamped constitution is reviewed
}

export interface SiteSettings {
  orgNameNe: string;
  orgNameEn: string;
  orgLogoUrl?: string;
  sloganNe: string;
  sloganEn: string;
  contactPhone?: string; // Optional - strictly no unverified placeholders
  contactEmail: string;
  officeAddressNe: string;
  officeAddressEn: string;
  originalOrganizationNameNe?: string;
  originalOrganizationNameEn?: string;
  originalEstablishmentYear?: string;
  currentOrganizationNameNe?: string;
  currentOrganizationNameEn?: string;
  renamingHistoryNe?: string;
  renamingHistoryEn?: string;
  formalRegistrationYear?: string;
  registrationAuthorityNe?: string;
  registrationAuthorityEn?: string;
  registrationDateNe?: string;
  registrationDateEn?: string;
  formalRegistrationDateNe?: string;
  formalRegistrationDateEn?: string;
  communityStartYear?: string;
  communityStartDescriptionNe?: string;
  communityStartDescriptionEn?: string;
  organizationHistoryNe?: string;
  organizationHistoryEn?: string;
  isFoundingYearConfirmed?: boolean;
  daoRegistrationNumber?: string; // Optional - empty until real number is officially provided
  centralOfficeNe?: string;
  centralOfficeEn?: string;
  jurisdictionNe?: string;
  jurisdictionEn?: string;
  aboutBackgroundTitleNe?: string;
  aboutBackgroundTitleEn?: string;
  aboutBackgroundP1Ne?: string;
  aboutBackgroundP1En?: string;
  aboutBackgroundP2Ne?: string;
  aboutBackgroundP2En?: string;
  constitutionEmptyStateNe?: string;
  constitutionEmptyStateEn?: string;
  objectives?: StatutoryObjective[];
  membershipTiers?: MembershipTierConfig[];
  facebookUrl?: string;
  youtubeUrl?: string;
  emailNotificationsEnabled: boolean;
  defaultMetaTitleNe: string;
  defaultMetaTitleEn: string;
  defaultMetaDescNe: string;
  defaultMetaDescEn: string;
  ogImageUrl: string;
}

export interface CMSActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: any;
  createdAt: string;
}

// -------------------------------------------------------------
// Pre-seeded Authentic Madi SSS Community Data
// -------------------------------------------------------------

const initialActivities: SocialActivity[] = [];

const initialReliefPrograms: ReliefProgram[] = [];

const initialEvents: EventProgram[] = [
  {
    id: 'evt-001',
    slug: 'annual-general-assembly-2083',
    titleNe: 'मादी सरोकार समाज, काठमाण्डौंको ११औं वार्षिक साधारण सभा',
    titleEn: '11th Annual General Assembly of Madi Sarokar Samaj',
    eventDateTime: '२०८३-०३-१५ गते शनिबार बिहान ११:०० बजे',
    venueNe: 'कार्की ब्याङ्क्वेट, बबरमहल, काठमाण्डौं',
    venueEn: 'Karki Banquet, Babarmahal, Kathmandu',
    agendaNe:
      '१. वार्षिक कार्यप्रगति प्रतिवेदन पेश र पारित\n२. लेखापरीक्षण तथा आर्थिक प्रतिवेदन अनुमोदन\n३. आगामी वर्षको रणनीति तथा बजेट तर्जुमा\n४. नयाँ कार्यसमिति निर्वाचन',
    agendaEn:
      '1. Review & endorsement of Annual Progress Report\n2. Approval of Audited Financial Statements\n3. Strategic Plan & Budget Formulation\n4. Executive Committee Elections',
    registrationLink: 'https://madisss.org.np/ne/membership',
    organizerNe: 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं',
    organizerEn: 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu',
    featuredImage:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    descriptionNe:
      'काठमाण्डौं उपत्यकामा रहनुभएका सम्पूर्ण मादीवासी आमाबुबा, दाजुभाइ तथा दिदीबहिनीहरूमा ११औं वार्षिक साधारण सभामा उपस्थितिका लागि हार्दिक निमन्त्रणा गर्दछौं।',
    descriptionEn:
      'Cordially inviting all community members, advisors, and well-wishers to participate in our 11th Annual General Assembly.',
    status: 'DRAFT',
    isPublic: false,
    createdAt: '2026-04-10T00:00:00Z',
  },
  {
    id: 'evt-002',
    slug: 'cultural-deusi-bhailo-celebration-2083',
    titleNe: 'शुभ दीपावली तथा छठ पर्वको उपलक्ष्यमा बृहत् देउसी–भैलो तथा सांस्कृतिक साँझ',
    titleEn: 'Grand Deusi-Bhailo & Cultural Evening on Tihar Festival',
    eventDateTime: '२०८३-०७-१२ गते साँझ ५:०० बजे',
    venueNe: 'राष्ट्रिया नाचघर, जमल, काठमाण्डौं',
    venueEn: 'Rastriya Naachghar, Jamal, Kathmandu',
    agendaNe: 'मौलिक देउसी–भैलो प्रस्तुति, सांस्कृतिक झाँकी, तथा परोपकारी कोष संकलन।',
    agendaEn: 'Traditional folk performance, charity fundraising, and youth cultural showcases.',
    organizerNe: 'युवा तथा सांस्कृतिक उपसमिति, मादी सरोकार समाज',
    organizerEn: 'Youth & Cultural Sub-committee, Madi SSS',
    featuredImage:
      'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&w=1200&q=80',
    descriptionNe:
      'हाम्रो मौलिक परम्परा जोगाउन र मादी आपतकालीन एम्बुलेन्स सेवा कोष सहयोगार्थ देउसी–भैलो कार्यक्रम आयोजना गरिँदैछ।',
    descriptionEn:
      'Cultural event celebrating Nepali festivals while raising funds for the Madi Community Emergency Ambulance Project.',
    status: 'DRAFT',
    isPublic: false,
    createdAt: '2026-05-01T00:00:00Z',
  },
];

const initialMembershipTiers: MembershipTier[] = [
  {
    id: 'tier-1',
    tierKey: 'ORDINARY',
    nameNe: 'साधारण सदस्यता',
    nameEn: 'General Membership',
    feeNpr: 500,
    validityNe: '२ वर्ष (नवीकरण योग्य)',
    validityEn: '2 Years (Renewable)',
    descriptionNe: 'संस्थाको साधारण सभामा भाग लिन तथा मताधिकार प्रयोग गर्न पाउने।',
    descriptionEn: 'Full voting rights in general assembly and social activities participation.',
    requirementsNe: ['मादी नगरपालिका स्थायी वा पुर्ख्यौली ठेगाना', 'हाल काठमाण्डौं उपत्यकामा बसोबास', 'नागरिकता वा परिचयपत्र'],
  },
  {
    id: 'tier-2',
    tierKey: 'LIFE',
    nameNe: 'आजीवन सदस्यता',
    nameEn: 'Life Membership',
    feeNpr: 5000,
    validityNe: 'आजीवन',
    validityEn: 'Lifetime',
    descriptionNe: 'आजीवन सदस्य प्रमाणपत्र, संस्थागत निर्णयहरूमा विशेष उपस्थिति तथा योगदानको अभिलेख।',
    descriptionEn: 'Lifetime recognition, honorary inclusion in executive consultations, and certificate.',
    requirementsNe: ['मादी नगरपालिका स्थायी वा पुर्ख्यौली ठेगाना', 'नागरिकता प्रतिलिपि', '२ प्रति पासपोर्ट फोटो'],
  },
  {
    id: 'tier-3',
    tierKey: 'HONORARY',
    nameNe: 'विशिष्ट / संरक्षक सदस्यता',
    nameEn: 'Patron / Honorary Membership',
    feeNpr: 25000,
    validityNe: 'आजीवन / संरक्षक',
    validityEn: 'Patron Status',
    descriptionNe: 'संस्थाको सल्लाहकार परिषदमा सहभागिता तथा विकास अभियानमा नेतृत्वदायी भूमिका।',
    descriptionEn: 'Advisory council seat, permanent patron plaque, and philanthropic oversight.',
    requirementsNe: ['सामाजिक, शैक्षिक वा आर्थिक क्षेत्रमा विशिष्ट योगदान पुर्याएका व्यक्तित्वहरू'],
  },
];

const initialCommitteeMembers: CommitteeMember[] = [
  {
    id: 'com-001',
    nameNe: 'डम्बर बहादुर श्रेष्ठ',
    nameEn: 'Dambar Bahadur Shrestha',
    designationNe: 'अध्यक्ष',
    designationEn: 'President',
    category: 'EXECUTIVE',
    departmentNe: 'केन्द्रीय कार्यसमिति',
    departmentEn: 'Central Executive Committee',
    photoUrl: '', // Redacted: local/verified photos only upon photoConsent=VERIFIED
    displayOrder: 1,
    termStartDateNe: '२०८२-०४-२१',
    termStartDateEn: '2082/04/21 BS',
    termEndDateNe: '२०८४-०४-२०',
    termEndDateEn: '2084/04/20 BS',
    term: '२०८२ - २०८४',
    bioNe: 'संस्थाको स्थापना कालदेखि नै सामुदायिक एकता तथा सामाजिक विकासमा सक्रिय नेतृत्व।',
    bioEn: 'Active community leader dedicated to social cohesion and regional development.',
    status: 'DRAFT', // STRICTLY DRAFT per launch governance
    isPublic: false,
    photoConsent: 'PENDING',
    adminNotes: 'Verification pending: awaiting signed photo consent form and citizenship/DAO verification sheet.',
  },
  {
    id: 'com-002',
    nameNe: 'शान्ता दाहाल (कटुवाल)',
    nameEn: 'Shanta Dahal (Katuwal)',
    designationNe: 'वरिष्ठ उपाध्यक्ष',
    designationEn: 'Senior Vice President',
    category: 'EXECUTIVE',
    departmentNe: 'केन्द्रीय कार्यसमिति',
    departmentEn: 'Central Executive Committee',
    photoUrl: '',
    displayOrder: 2,
    termStartDateNe: '२०८२-०४-२१',
    termStartDateEn: '2082/04/21 BS',
    termEndDateNe: '२०८४-०४-२०',
    termEndDateEn: '2084/04/20 BS',
    term: '२०८२ - २०८४',
    bioNe: 'महिला सशक्तीकरण, सामाजिक कल्याण तथा संस्थागत समन्वयमा समर्पित।',
    bioEn: 'Dedicated to women empowerment, community welfare, and institutional coordination.',
    status: 'DRAFT', // STRICTLY DRAFT
    isPublic: false,
    photoConsent: 'PENDING',
    adminNotes: 'Verification pending: awaiting signed photo consent form and verification sheet.',
  },
  {
    id: 'com-003',
    nameNe: 'ई. रमेश घिमिरे',
    nameEn: 'Er. Ramesh Ghimire',
    designationNe: 'महासचिव',
    designationEn: 'General Secretary',
    category: 'EXECUTIVE',
    departmentNe: 'केन्द्रीय कार्यसमिति',
    departmentEn: 'Central Executive Committee',
    photoUrl: '',
    displayOrder: 3,
    termStartDateNe: '२०८२-०४-२१',
    termStartDateEn: '2082/04/21 BS',
    termEndDateNe: '२०८४-०४-२०',
    termEndDateEn: '2084/04/20 BS',
    term: '२०८२ - २०८४',
    bioNe: 'संस्थागत सुशासन, सचिवालय व्यवस्थापन तथा योजना तर्जुमामा क्रियाशील।',
    bioEn: 'Focused on organizational governance, secretarial administration, and project planning.',
    status: 'DRAFT', // STRICTLY DRAFT
    isPublic: false,
    photoConsent: 'PENDING',
    adminNotes: 'Verification pending: awaiting signed photo consent form and verification sheet.',
  },
  {
    id: 'com-004',
    nameNe: 'सीए. मनिष कार्की',
    nameEn: 'CA. Manish Karki',
    designationNe: 'कोषाध्यक्ष',
    designationEn: 'Treasurer',
    category: 'EXECUTIVE',
    departmentNe: 'आर्थिक तथा लेखा विभाग',
    departmentEn: 'Finance & Treasury Department',
    photoUrl: '',
    displayOrder: 4,
    termStartDateNe: '२०८२-०४-२१',
    termStartDateEn: '2082/04/21 BS',
    termEndDateNe: '२०८४-०४-२०',
    termEndDateEn: '2084/04/20 BS',
    term: '२०८२ - २०८४',
    bioNe: 'पारदर्शी आर्थिक व्यवस्थापन, लेखापरीक्षण तथा राहत कोष परिचालनमा विशेषज्ञता।',
    bioEn: 'Specialist in transparent financial governance, auditing, and relief fund management.',
    status: 'DRAFT', // STRICTLY DRAFT
    isPublic: false,
    photoConsent: 'PENDING',
    adminNotes: 'Verification pending: awaiting signed photo consent form and verification sheet.',
  },
  {
    id: 'com-005',
    nameNe: 'प्रा.डा. कुलप्रसाद कोइराला',
    nameEn: 'Prof. Dr. Kul Prasad Koirala',
    designationNe: 'प्रमुख सल्लाहकार',
    designationEn: 'Chief Advisor',
    category: 'ADVISORY',
    departmentNe: 'सल्लाहकार मण्डल',
    departmentEn: 'Advisory Board',
    photoUrl: '',
    displayOrder: 5,
    termStartDateNe: '२०८२-०४-२१',
    termStartDateEn: '2082/04/21 BS',
    termEndDateNe: '२०८४-०४-२०',
    termEndDateEn: '2084/04/20 BS',
    term: '२०८२ - २०८४',
    bioNe: 'शिक्षा, अनुसन्धान तथा नीतिगत मार्गदर्शनमा विशिष्ट प्राज्ञिक योगदान।',
    bioEn: 'Distinguished academic contribution in education, research, and policy guidance.',
    status: 'DRAFT', // STRICTLY DRAFT
    isPublic: false,
    photoConsent: 'PENDING',
    adminNotes: 'Verification pending: advisory consent review.',
  },
  {
    id: 'com-006',
    nameNe: 'अञ्जना तामाङ',
    nameEn: 'Anjana Tamang',
    designationNe: 'संयोजक',
    designationEn: 'Coordinator',
    category: 'SUB_COMMITTEE',
    departmentNe: 'युवा, खेलकुद तथा सांस्कृतिक उपसमिति',
    departmentEn: 'Youth, Sports & Cultural Sub-committee',
    photoUrl: '',
    displayOrder: 6,
    termStartDateNe: '२०८२-०४-२१',
    termStartDateEn: '2082/04/21 BS',
    termEndDateNe: '२०८४-०४-२०',
    termEndDateEn: '2084/04/20 BS',
    term: '२०८२ - २०८४',
    bioNe: 'युवा सहभागिता, खेलकुद तथा सांस्कृतिक संरक्षण कार्यक्रमहरूको नेतृत्व।',
    bioEn: 'Leading youth engagement, sports tournaments, and cultural preservation.',
    status: 'DRAFT', // STRICTLY DRAFT
    isPublic: false,
    photoConsent: 'PENDING',
    adminNotes: 'Verification pending: youth sub-committee roster verification.',
  },
];

const initialReports: GovernanceReport[] = [
  {
    id: 'cert-cdo-2082',
    titleNe: 'जिल्ला प्रशासन कार्यालय, काठमाण्डौं दर्ता प्रमाणपत्र',
    titleEn: 'District Administration Office, Kathmandu Registration Certificate',
    fiscalYear: '२०८२ (2025)',
    category: 'REGISTRATION_CERTIFICATE',
    publishedDate: '२०८२-०४-२१',
    fileUrl: 'internal-docs/certificates/cdo-registration-certificate-2082.jpeg', // Original internal document strictly protected
    redactedFileUrl: '/documents/cdo-registration-certificate-redacted.jpeg',
    fileSizeMb: '0.22 MB',
    isPublic: false, // Default to Internal Only! Original is NEVER exposed publicly
    status: 'PUBLISHED',
    issuingAuthorityNe: 'जिल्ला प्रशासन कार्यालय, काठमाण्डौं',
    issuingAuthorityEn: 'District Administration Office, Kathmandu',
    registrationDateNe: '२०८२/०४/२१',
    registrationDateEn: '2082/04/21 BS',
    registrationNumber: '१६',
    decisionDateNe: '२०८२/०४/२१',
    registeredOrgNameNe: 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं',
    registeredOrgNameEn: 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu',
    verificationStatus: 'VERIFIED',
    publishRegistrationNumber: true, // Approved by Madi SSS officials
    publishRedactedCertificate: false, // Controlled by explicit SUPERADMIN approval
    adminNotes: 'जिल्ला प्रशासन कार्यालय, काठमाण्डौं बबरमहलबाट जारी आधिकारिक दर्ता प्रमाणपत्र (दर्ता नं. १६, निर्णय मिति २०८२/०४/२१)। सक्कल कागजात आन्तरिक अभिलेखमा सुरक्षित।',
    uploadedByAdminId: 'admin-001',
    uploadedByAdminName: 'Superadmin',
    uploadedAt: '2026-11-03T14:15:00Z',
    verifiedByAdminId: 'admin-001',
    verifiedByAdminName: 'Superadmin',
    verifiedAt: '2026-11-03T14:15:00Z',
    noPrivateDataConfirmed: true,
    isOriginalApprovedDocument: true,
  },
  {
    id: 'rep-const-2082',
    titleNe: 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौंको विधान (सन्दर्भ मस्यौदा)',
    titleEn: 'Constitution of Madi (Sankhuwasabha) Sarokar Samaj (Reference Draft)',
    fiscalYear: '२०८२ (2025)',
    category: 'CONSTITUTION',
    version: '१.० (२०८२)',
    effectiveDate: '२०८२-०६-२९',
    publishedDate: '२०८२-०६-२९',
    fileUrl: 'internal-documents/reference-drafts/madi-sss-constitution-2082-reference-draft.pdf',
    fileSizeMb: '9.9 MB',
    isPublic: false,
    status: 'ARCHIVED',
    isOriginalApprovedDocument: false,
    descriptionNe: '[Non-original / Reference Draft — Do Not Publish] प्रारम्भिक सन्दर्भ मस्यौदा — संस्थाको आधिकारिक छाप तथा दर्ता भएको सक्कल प्रति नभएकाले सार्वजनिक पहुँच निषेध गरिएको छ।',
    descriptionEn: '[Non-original / Reference Draft — Do Not Publish] Internal reference draft only — Not the stamped original document. Public access restricted.',
    noPrivateDataConfirmed: true,
  },
  {
    id: 'rep-001',
    titleNe: 'आर्थिक वर्ष २०८१/८२ को अन्तिम लेखापरीक्षण (Audit) प्रतिवेदन',
    titleEn: 'Final Independent Audit Report FY 2081/82',
    fiscalYear: '२०८१/८२ (2024/25)',
    category: 'AUDIT_FINANCIAL',
    publishedDate: '२०८२-०५-१०',
    fileUrl: '/documents/audit-report-2081-82.pdf',
    fileSizeMb: '2.4 MB',
    isPublic: false,
    status: 'ARCHIVED',
  },
  {
    id: 'rep-002',
    titleNe: 'मादी सरोकार समाज, काठमाण्डौंको संशोधित विधान २०८०',
    titleEn: 'Amended Constitution of Madi Sarokar Samaj 2080',
    fiscalYear: '२०८० (2023)',
    category: 'CONSTITUTION',
    version: '०.९ (२०८०)',
    effectiveDate: '२०८०-११-२५',
    publishedDate: '२०८०-११-२५',
    fileUrl: 'internal-documents/reference-drafts/madi-sss-constitution-2080.pdf',
    fileSizeMb: '1.8 MB',
    isPublic: false,
    status: 'ARCHIVED',
    isOriginalApprovedDocument: false,
    descriptionNe: '[Non-original / Reference Draft — Do Not Publish] २०८२ को आधिकारिक दर्ता पूर्वको प्रारम्भिक मस्यौदा विधान (अभिलेख)',
    descriptionEn: '[Non-original / Reference Draft — Do Not Publish] Historical preliminary draft constitution prior to 2082 formal registration (Archived)',
    noPrivateDataConfirmed: true,
  },
  {
    id: 'rep-003',
    titleNe: 'वार्षिक कार्यप्रगति तथा सामाजिक समीक्षा पुस्तिका २०८१/८२',
    titleEn: 'Annual Progress & Social Impact Review Book 2081/82',
    fiscalYear: '२०८१/८२ (2024/25)',
    category: 'ANNUAL_REPORT',
    publishedDate: '२०८२-०६-०१',
    fileUrl: '/documents/annual-progress-book-2081.pdf',
    fileSizeMb: '4.6 MB',
    isPublic: false,
    status: 'ARCHIVED',
  },
  {
    id: 'rep-004',
    titleNe: 'विपद् व्यवस्थापन तथा आकस्मिक कोष सञ्चालन कार्यविधि २०८२',
    titleEn: 'Disaster Relief Fund Standard Operating Policy 2082',
    fiscalYear: '२०८२ (2025)',
    category: 'POLICY',
    publishedDate: '२०८२-०१-१५',
    fileUrl: '/documents/disaster-fund-policy-2082.pdf',
    fileSizeMb: '1.1 MB',
    isPublic: false,
    status: 'ARCHIVED',
  },
];

const initialPartners: CommunityPartner[] = [
  {
    id: 'part-001',
    nameNe: 'मादी नगरपालिका नगर कार्यपालिकाको कार्यालय',
    nameEn: 'Madi Municipality, Office of Municipal Executive',
    partnerType: 'LOCAL_GOVERNMENT',
    websiteUrl: 'https://madimunsankhuwasabha.gov.np',
    contributionSummaryNe: 'कोरोना महामारीको समयमा राहत वितरण तथा विपद् व्यवस्थापनमा स्थानीय तहगत सहकार्य।',
    contributionSummaryEn: 'Local municipal cooperation in disaster management and relief distribution during the COVID-19 pandemic.',
    displayOrder: 1,
  },
];

const initialNotices: NoticeItem[] = [
  {
    id: 'not-001',
    titleNe: '११औं वार्षिक साधारण सभा सम्बन्धी अत्यन्त जरुरी सूचना',
    titleEn: 'Important Notice regarding 11th Annual General Assembly',
    date: '२०८३-०३-०१',
    summaryNe: 'सम्पूर्ण आजीवन तथा साधारण सदस्य महानुभावहरूलाई तोकिएको मितिमा उपस्थितिका लागि अनुरोध।',
    summaryEn: 'Requesting all valued general and life members to attend the annual assembly.',
    isUrgent: true,
    status: 'DRAFT',
    isPublic: false,
    relatedEventId: 'evt-001',
  },
];

const initialMembershipApplications: MembershipApplication[] = [];

const initialFeedbacks: FeedbackSubmission[] = [
  {
    id: 'fb-001',
    fullName: 'प्रकाश श्रेष्ठ',
    phone: '9842000000',
    email: 'prakash@example.com',
    subject: 'काठमाण्डौंमा ज्येष्ठ नागरिक स्वास्थ्य परामर्श सम्बन्धी सुझाव',
    category: 'SUGGESTION',
    message: 'काठमाण्डौंमा बसोबास गर्ने मादीका ज्येष्ठ नागरिकहरूका लागि महिनामा एक दिन निःशुल्क परामर्श कार्यक्रम आयोजना गरिएमा धेरै राम्रो हुने थियो।',
    status: 'IN_REVIEW',
    adminNotes: 'कार्यसमिति बैठकमा छलफलको लागि पेश गरिएको छ।',
    submittedAt: '2026-04-20T11:00:00Z',
  },
];

// In-Memory Storage Singletons (Persists throughout the server instance)
let activitiesStore = [...initialActivities];
let reliefStore = [...initialReliefPrograms];
let eventsStore = [...initialEvents];
let membershipTiersStore = [...initialMembershipTiers];
let committeeStore = [...initialCommitteeMembers];
let reportsStore = [...initialReports];
let partnersStore = [...initialPartners];
let noticesStore = [...initialNotices];
let applicationsStore = [...initialMembershipApplications];
let feedbacksStore = [...initialFeedbacks];

// -------------------------------------------------------------
// Data Access Methods
// -------------------------------------------------------------

// 1. Social Activities
export async function getSocialActivities(category?: string, includePrivate = false): Promise<SocialActivity[]> {
  let list = activitiesStore;
  if (!includePrivate) {
    // Public view: strictly PUBLISHED, isPublic=true, and workflowStage=PUBLISHED
    list = list.filter((a) => a.status === 'PUBLISHED' && a.isPublic !== false && a.workflowStage === 'PUBLISHED');
  }
  if (category && category !== 'ALL') {
    list = list.filter((a) => a.category === category);
  }

  if (!includePrivate) {
    // Sanitize public payload: strictly verified metrics, consented media & approved documents
    // Strictly exclude all internal evidence, zero-expense declarations, and reviewer details
    return list.map((a) => ({
      ...a,
      participantCount: a.hasBeneficiaryRecord ? a.participantCount : undefined,
      photos: a.photoConsentVerified ? (a.photos || []).filter((p) => !p.includes('unsplash.com')) : [],
      albumLink: a.photoConsentVerified ? a.albumLink : undefined,
      relatedDocumentUrl: a.relatedDocumentApproved ? a.relatedDocumentUrl : undefined,
      evidenceChecklist: {
        hasAttendanceSheet: false,
        hasEventPhotos: false,
        hasReceiptsVouchers: false,
        noExpenseIncurred: false,
        hasActivityReport: false,
        hasExecutiveCommitteeApproval: false,
      },
      reviewedByTreasurerName: undefined,
      reviewedByTreasurerAt: undefined,
      approvedByPresidentName: undefined,
      approvedByPresidentAt: undefined,
      adminNotes: undefined,
    }));
  }

  return list;
}

export async function getSocialActivityBySlug(slug: string, includePrivate = false): Promise<SocialActivity | null> {
  const item = activitiesStore.find((a) => a.slug === slug);
  if (!item) return null;
  if (!includePrivate && (item.status !== 'PUBLISHED' || item.isPublic === false || item.workflowStage !== 'PUBLISHED')) {
    return null;
  }
  if (!includePrivate) {
    return {
      ...item,
      participantCount: item.hasBeneficiaryRecord ? item.participantCount : undefined,
      photos: item.photoConsentVerified ? (item.photos || []).filter((p) => !p.includes('unsplash.com')) : [],
      albumLink: item.photoConsentVerified ? item.albumLink : undefined,
      relatedDocumentUrl: item.relatedDocumentApproved ? item.relatedDocumentUrl : undefined,
      evidenceChecklist: {
        hasAttendanceSheet: false,
        hasEventPhotos: false,
        hasReceiptsVouchers: false,
        noExpenseIncurred: false,
        hasActivityReport: false,
        hasExecutiveCommitteeApproval: false,
      },
      reviewedByTreasurerName: undefined,
      reviewedByTreasurerAt: undefined,
      approvedByPresidentName: undefined,
      approvedByPresidentAt: undefined,
      adminNotes: undefined,
    };
  }
  return item;
}

export async function saveSocialActivity(data: Partial<SocialActivity> & { titleNe: string }): Promise<SocialActivity> {
  const timestamp = new Date().toISOString();
  const slug = data.slug || `activity-${Date.now()}`;

  // Process Zero Expense Declaration Option
  const noExpense = Boolean(data.evidenceChecklist?.noExpenseIncurred);
  const zeroDecl: ZeroExpenseDeclaration | undefined = noExpense
    ? {
        declared: true,
        declaredByAdminName: data.evidenceChecklist?.zeroExpenseDeclaration?.declaredByAdminName || 'Admin Officer',
        declaredAt: data.evidenceChecklist?.zeroExpenseDeclaration?.declaredAt || timestamp,
        treasurerReviewed: Boolean(data.evidenceChecklist?.zeroExpenseDeclaration?.treasurerReviewed || data.reviewedByTreasurerName),
        treasurerReviewedBy: data.evidenceChecklist?.zeroExpenseDeclaration?.treasurerReviewedBy || data.reviewedByTreasurerName,
        treasurerReviewedAt: data.evidenceChecklist?.zeroExpenseDeclaration?.treasurerReviewedAt || (data.reviewedByTreasurerName ? timestamp : undefined),
        treasurerNotes: data.evidenceChecklist?.zeroExpenseDeclaration?.treasurerNotes || 'Not applicable — zero expense',
      }
    : undefined;

  // Build evidence checklist
  const evidence: ActivityEvidenceChecklist = {
    hasAttendanceSheet: Boolean(data.evidenceChecklist?.hasAttendanceSheet),
    attendanceSheetRef: data.evidenceChecklist?.attendanceSheetRef || '',
    hasEventPhotos: Boolean(data.evidenceChecklist?.hasEventPhotos),
    eventPhotosRef: data.evidenceChecklist?.eventPhotosRef || '',
    hasReceiptsVouchers: noExpense ? false : Boolean(data.evidenceChecklist?.hasReceiptsVouchers),
    receiptsVouchersRef: noExpense ? 'Not applicable — zero expense' : (data.evidenceChecklist?.receiptsVouchersRef || ''),
    noExpenseIncurred: noExpense,
    zeroExpenseDeclaration: zeroDecl,
    hasActivityReport: Boolean(data.evidenceChecklist?.hasActivityReport),
    activityReportRef: data.evidenceChecklist?.activityReportRef || '',
    hasExecutiveCommitteeApproval: Boolean(data.evidenceChecklist?.hasExecutiveCommitteeApproval),
    approvalMinuteRef: data.evidenceChecklist?.approvalMinuteRef || '',
  };

  // Requirement 4: Voucher Condition Gate:
  // Must either have verified voucher reference, or a treasurer-reviewed zero-expense declaration
  const voucherConditionSatisfied =
    (evidence.hasReceiptsVouchers && Boolean(evidence.receiptsVouchersRef?.trim()) && evidence.receiptsVouchersRef !== 'Not applicable — zero expense') ||
    (evidence.noExpenseIncurred &&
     evidence.zeroExpenseDeclaration?.declared === true &&
     evidence.zeroExpenseDeclaration?.treasurerReviewed === true);

  // Publication Gate Check
  let status = data.status || 'DRAFT';
  let workflowStage = data.workflowStage || 'DRAFT';

  if (status === 'PUBLISHED' || workflowStage === 'PUBLISHED') {
    const allEvidencePresent =
      evidence.hasAttendanceSheet &&
      evidence.hasEventPhotos &&
      voucherConditionSatisfied &&
      evidence.hasActivityReport &&
      evidence.hasExecutiveCommitteeApproval;

    const hasRequiredApprovals =
      Boolean(data.reviewedByTreasurerName) && Boolean(data.approvedByPresidentName);

    // If gating criteria fail, force DRAFT to prevent accidental publication
    if (!allEvidencePresent || !hasRequiredApprovals) {
      status = 'DRAFT';
      workflowStage = data.workflowStage === 'PUBLISHED' ? 'PRESIDENT_APPROVAL' : (data.workflowStage || 'DRAFT');
    } else {
      status = 'PUBLISHED';
      workflowStage = 'PUBLISHED';
    }
  }

  // Filter out any external Unsplash URLs from photos
  const safePhotos = (data.photos || []).filter((p) => !p.includes('unsplash.com'));

  if (data.id) {
    const idx = activitiesStore.findIndex((a) => a.id === data.id);
    if (idx !== -1) {
      const existing = activitiesStore[idx];
      activitiesStore[idx] = {
        ...existing,
        ...data,
        titleEn: data.titleEn || existing.titleEn || data.titleNe,
        date: data.date || existing.date,
        locationNe: data.locationNe || existing.locationNe,
        locationEn: data.locationEn || existing.locationEn || data.locationNe || '',
        category: data.category || existing.category || 'COMMUNITY',
        descriptionNe: data.descriptionNe || existing.descriptionNe,
        descriptionEn: data.descriptionEn || existing.descriptionEn || data.descriptionNe || '',
        summaryNe: data.summaryNe ?? existing.summaryNe,
        summaryEn: data.summaryEn ?? existing.summaryEn,
        organizerNe: data.organizerNe || existing.organizerNe || 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं',
        organizerEn: data.organizerEn || existing.organizerEn || 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu',
        participantCount: data.participantCount !== undefined ? data.participantCount : existing.participantCount,
        hasBeneficiaryRecord: data.hasBeneficiaryRecord !== undefined ? data.hasBeneficiaryRecord : existing.hasBeneficiaryRecord,
        beneficiaryRecordRef: data.beneficiaryRecordRef !== undefined ? data.beneficiaryRecordRef : existing.beneficiaryRecordRef,
        albumId: data.albumId !== undefined ? data.albumId : existing.albumId,
        albumLink: data.albumLink !== undefined ? data.albumLink : existing.albumLink,
        photoConsentVerified: data.photoConsentVerified !== undefined ? data.photoConsentVerified : existing.photoConsentVerified,
        photos: safePhotos,
        relatedDocumentUrl: data.relatedDocumentUrl !== undefined ? data.relatedDocumentUrl : existing.relatedDocumentUrl,
        relatedDocumentTitleNe: data.relatedDocumentTitleNe ?? existing.relatedDocumentTitleNe,
        relatedDocumentTitleEn: data.relatedDocumentTitleEn ?? existing.relatedDocumentTitleEn,
        relatedDocumentApproved: data.relatedDocumentApproved !== undefined ? data.relatedDocumentApproved : existing.relatedDocumentApproved,
        status,
        workflowStage,
        isPublic: status === 'PUBLISHED',
        isFeatured: data.isFeatured !== undefined ? data.isFeatured : existing.isFeatured,
        evidenceChecklist: evidence,
        reviewedByTreasurerName: data.reviewedByTreasurerName || existing.reviewedByTreasurerName,
        reviewedByTreasurerAt: data.reviewedByTreasurerAt || existing.reviewedByTreasurerAt,
        approvedByPresidentName: data.approvedByPresidentName || existing.approvedByPresidentName,
        approvedByPresidentAt: data.approvedByPresidentAt || existing.approvedByPresidentAt,
        adminNotes: data.adminNotes !== undefined ? data.adminNotes : existing.adminNotes,
        updatedAt: timestamp,
      };
      return activitiesStore[idx];
    }
  }

  const newActivity: SocialActivity = {
    id: data.id || `act-${Date.now()}`,
    slug,
    titleNe: data.titleNe,
    titleEn: data.titleEn || data.titleNe,
    date: data.date || '२०८२-०४-२१',
    dateEn: data.dateEn,
    locationNe: data.locationNe || 'मादी, संखुवासभा',
    locationEn: data.locationEn || 'Madi, Sankhuwasabha',
    category: data.category || 'COMMUNITY',
    descriptionNe: data.descriptionNe || '',
    descriptionEn: data.descriptionEn || data.descriptionNe || '',
    summaryNe: data.summaryNe,
    summaryEn: data.summaryEn,
    organizerNe: data.organizerNe || 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं',
    organizerEn: data.organizerEn || 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu',
    participantCount: data.participantCount,
    hasBeneficiaryRecord: Boolean(data.hasBeneficiaryRecord),
    beneficiaryRecordRef: data.beneficiaryRecordRef || '',
    albumId: data.albumId,
    albumLink: data.albumLink,
    photoConsentVerified: Boolean(data.photoConsentVerified),
    photos: safePhotos,
    relatedDocumentUrl: data.relatedDocumentUrl,
    relatedDocumentTitleNe: data.relatedDocumentTitleNe,
    relatedDocumentTitleEn: data.relatedDocumentTitleEn,
    relatedDocumentApproved: Boolean(data.relatedDocumentApproved),
    status,
    workflowStage,
    isPublic: status === 'PUBLISHED',
    isFeatured: Boolean(data.isFeatured),
    evidenceChecklist: evidence,
    reviewedByTreasurerName: data.reviewedByTreasurerName,
    reviewedByTreasurerAt: data.reviewedByTreasurerAt,
    approvedByPresidentName: data.approvedByPresidentName,
    approvedByPresidentAt: data.approvedByPresidentAt,
    adminNotes: data.adminNotes,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  activitiesStore.unshift(newActivity);
  return newActivity;
}

export async function advanceActivityWorkflow(
  id: string,
  targetStage: ActivityWorkflowStage,
  actorName: string,
  actorNotes?: string
): Promise<{ success: boolean; data?: SocialActivity; error?: string }> {
  const idx = activitiesStore.findIndex((a) => a.id === id);
  if (idx === -1) {
    return { success: false, error: 'गतिविधि फेला परेन।' };
  }

  const act = activitiesStore[idx];
  const timestamp = new Date().toISOString();

  if (targetStage === 'TREASURER_REVIEW') {
    act.workflowStage = 'TREASURER_REVIEW';
    act.reviewedByTreasurerName = actorName;
    act.reviewedByTreasurerAt = timestamp;

    // If "No expense incurred" is selected, record treasurer review on the declaration
    if (act.evidenceChecklist.noExpenseIncurred) {
      act.evidenceChecklist.zeroExpenseDeclaration = {
        declared: true,
        declaredByAdminName: act.evidenceChecklist.zeroExpenseDeclaration?.declaredByAdminName || actorName,
        declaredAt: act.evidenceChecklist.zeroExpenseDeclaration?.declaredAt || timestamp,
        treasurerReviewed: true,
        treasurerReviewedBy: actorName,
        treasurerReviewedAt: timestamp,
        treasurerNotes: actorNotes || 'Verified: No institutional expenditure incurred.',
      };
      act.evidenceChecklist.receiptsVouchersRef = 'Not applicable — zero expense';
    }

    if (actorNotes) act.adminNotes = `${act.adminNotes || ''}\n[Treasurer Review]: ${actorNotes}`;
  } else if (targetStage === 'PRESIDENT_APPROVAL') {
    if (!act.reviewedByTreasurerName) {
      return { success: false, error: 'पहिले कोषाध्यक्ष/प्रशासनबाट परीक्षण (Treasurer Review) हुनु आवश्यक छ।' };
    }
    act.workflowStage = 'PRESIDENT_APPROVAL';
    act.approvedByPresidentName = actorName;
    act.approvedByPresidentAt = timestamp;
    if (actorNotes) act.adminNotes = `${act.adminNotes || ''}\n[President Approval]: ${actorNotes}`;
  } else if (targetStage === 'PUBLISHED') {
    const ev = act.evidenceChecklist;

    // Requirement 4: Voucher Condition check
    const voucherValid =
      (ev?.hasReceiptsVouchers && Boolean(ev?.receiptsVouchersRef?.trim()) && ev?.receiptsVouchersRef !== 'Not applicable — zero expense') ||
      (ev?.noExpenseIncurred &&
       ev?.zeroExpenseDeclaration?.declared === true &&
       ev?.zeroExpenseDeclaration?.treasurerReviewed === true);

    const allEvidence =
      ev &&
      ev.hasAttendanceSheet &&
      ev.hasEventPhotos &&
      voucherValid &&
      ev.hasActivityReport &&
      ev.hasExecutiveCommitteeApproval;

    if (!allEvidence) {
      if (!voucherValid) {
        return {
          success: false,
          error: 'लेखा प्रमाण अपुग: बिल/भौचर प्रमाणित हुनुपर्छ वा कोषाध्यक्षबाट शून्य खर्च (No expense incurred) घोषणा प्रमाणित हुनुपर्छ।',
        };
      }
      return {
        success: false,
        error: 'प्रकाशन अघि सबै ५ वटा आन्तरिक प्रमाणहरू (उपस्थिति, तस्बिर, लेखा/शून्य खर्च, प्रतिवेदन, कार्यसमिति निर्णय) प्रमाणित हुनुपर्छ।',
      };
    }

    if (!act.reviewedByTreasurerName || !act.approvedByPresidentName) {
      return {
        success: false,
        error: 'प्रकाशन अघि कोषाध्यक्ष परीक्षण र अध्यक्षको अन्तिम प्रमाणीकरण दुवै सम्पन्न भएको हुनुपर्छ।',
      };
    }

    act.workflowStage = 'PUBLISHED';
    act.status = 'PUBLISHED';
    act.isPublic = true;
    if (actorNotes) act.adminNotes = `${act.adminNotes || ''}\n[Published]: ${actorNotes}`;
  } else if (targetStage === 'DRAFT' || targetStage === 'REJECTED') {
    act.workflowStage = 'DRAFT';
    act.status = 'DRAFT';
    act.isPublic = false;
    if (actorNotes) act.adminNotes = `${act.adminNotes || ''}\n[Sent to Draft]: ${actorNotes}`;
  }

  act.updatedAt = timestamp;
  return { success: true, data: act };
}

export async function deleteSocialActivity(id: string): Promise<boolean> {
  activitiesStore = activitiesStore.filter((a) => a.id !== id);
  return true;
}

// 2. Relief and Welfare Support
export async function getReliefPrograms(type?: string): Promise<ReliefProgram[]> {
  if (type && type !== 'ALL') {
    return reliefStore.filter((r) => r.type === type);
  }
  return reliefStore;
}

export async function getReliefProgramBySlug(slug: string): Promise<ReliefProgram | null> {
  return reliefStore.find((r) => r.slug === slug) || null;
}

export async function saveReliefProgram(data: Omit<ReliefProgram, 'id' | 'createdAt'> & { id?: string }): Promise<ReliefProgram> {
  if (data.id) {
    const idx = reliefStore.findIndex((r) => r.id === data.id);
    if (idx !== -1) {
      reliefStore[idx] = { ...reliefStore[idx], ...data };
      return reliefStore[idx];
    }
  }
  const newRelief: ReliefProgram = {
    ...data,
    id: `rel-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  reliefStore.unshift(newRelief);
  return newRelief;
}

export async function deleteReliefProgram(id: string): Promise<boolean> {
  reliefStore = reliefStore.filter((r) => r.id !== id);
  return true;
}

// 3. Events and Programs
export async function getEvents(status?: 'UPCOMING' | 'COMPLETED' | 'DRAFT', includePrivate = false): Promise<EventProgram[]> {
  let list = eventsStore;
  if (!includePrivate) {
    list = list.filter((e) => e.status !== 'DRAFT' && e.isPublic !== false);
  }
  if (status) {
    list = list.filter((e) => e.status === status);
  }
  return list;
}

export async function getEventBySlug(slug: string, includePrivate = false): Promise<EventProgram | null> {
  const item = eventsStore.find((e) => e.slug === slug);
  if (!item) return null;
  if (!includePrivate && (item.status === 'DRAFT' || item.isPublic === false)) {
    return null;
  }
  return item;
}

export async function saveEvent(data: Omit<EventProgram, 'id' | 'createdAt'> & { id?: string }): Promise<EventProgram> {
  if (data.id) {
    const idx = eventsStore.findIndex((e) => e.id === data.id);
    if (idx !== -1) {
      eventsStore[idx] = { ...eventsStore[idx], ...data };
      return eventsStore[idx];
    }
  }
  const newEvent: EventProgram = {
    ...data,
    id: `evt-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  eventsStore.unshift(newEvent);
  return newEvent;
}

export async function deleteEvent(id: string): Promise<boolean> {
  eventsStore = eventsStore.filter((e) => e.id !== id);
  return true;
}

// 4. Membership
export async function getMembershipTiers(): Promise<MembershipTier[]> {
  return membershipTiersStore;
}

export async function saveMembershipTier(tier: MembershipTier): Promise<MembershipTier> {
  const idx = membershipTiersStore.findIndex((t) => t.id === tier.id);
  if (idx !== -1) {
    membershipTiersStore[idx] = tier;
    return tier;
  }
  membershipTiersStore.push(tier);
  return tier;
}

export async function submitMembershipApplication(
  data: Omit<MembershipApplication, 'id' | 'status' | 'submittedAt'>
): Promise<MembershipApplication> {
  const newApp: MembershipApplication = {
    ...data,
    id: `app-${Date.now()}`,
    status: 'PENDING',
    submittedAt: new Date().toISOString(),
  };
  applicationsStore.unshift(newApp);
  return newApp;
}

export async function getMembershipApplications(status?: string): Promise<MembershipApplication[]> {
  if (status && status !== 'ALL') {
    return applicationsStore.filter((a) => a.status === status);
  }
  return applicationsStore;
}

export async function updateApplicationStatus(
  id: string,
  status: 'APPROVED' | 'REJECTED' | 'MORE_INFO_REQUESTED',
  adminNotes?: string
): Promise<boolean> {
  const idx = applicationsStore.findIndex((a) => a.id === id);
  if (idx !== -1) {
    applicationsStore[idx].status = status;
    if (adminNotes !== undefined) {
      applicationsStore[idx].adminNotes = adminNotes;
    }
    return true;
  }
  return false;
}

// 5. Committee
export async function getCommitteeMembers(category?: string, includePrivate = false): Promise<CommitteeMember[]> {
  let list = [...committeeStore];
  if (!includePrivate) {
    // Public view: strictly PUBLISHED and isPublic=true members only
    list = list.filter((c) => c.status === 'PUBLISHED' && c.isPublic !== false);
  }
  if (category && category !== 'ALL') {
    list = list.filter((c) => c.category === category);
  }

  // Sort by display order
  list.sort((a, b) => a.displayOrder - b.displayOrder);

  if (!includePrivate) {
    // Strict privacy boundary: sanitize for public output
    return list.map((m) => ({
      id: m.id,
      nameNe: m.nameNe,
      nameEn: m.nameEn,
      designationNe: m.designationNe,
      designationEn: m.designationEn,
      category: m.category,
      departmentNe: m.departmentNe,
      departmentEn: m.departmentEn,
      // Photo is rendered ONLY if photoConsent is explicitly VERIFIED
      photoUrl: m.photoConsent === 'VERIFIED' ? (m.photoUrl || '') : '',
      photoConsent: m.photoConsent,
      termStartDateNe: m.termStartDateNe,
      termStartDateEn: m.termStartDateEn,
      termEndDateNe: m.termEndDateNe,
      termEndDateEn: m.termEndDateEn,
      term: m.term || (m.termStartDateNe && m.termEndDateNe ? `${m.termStartDateNe} — ${m.termEndDateNe}` : undefined),
      bioNe: m.bioNe,
      bioEn: m.bioEn,
      displayOrder: m.displayOrder,
      status: m.status,
      isPublic: true,
      // contactPhone, email, adminNotes are strictly excluded from public responses
    }));
  }

  return list;
}

export async function saveCommitteeMember(data: Partial<CommitteeMember> & { nameNe: string; designationNe: string }): Promise<CommitteeMember> {
  const timestamp = new Date().toISOString();

  if (data.id) {
    const idx = committeeStore.findIndex((c) => c.id === data.id);
    if (idx !== -1) {
      const existing = committeeStore[idx];
      const status = data.status || existing.status || 'DRAFT';
      const photoConsent = data.photoConsent || existing.photoConsent || 'PENDING';
      const isPublic = data.isPublic !== undefined ? data.isPublic : status === 'PUBLISHED';

      committeeStore[idx] = {
        ...existing,
        ...data,
        nameEn: data.nameEn || existing.nameEn || data.nameNe,
        designationEn: data.designationEn || existing.designationEn || data.designationNe,
        category: data.category || existing.category || 'EXECUTIVE',
        departmentNe: data.departmentNe || existing.departmentNe || 'केन्द्रीय कार्यसमिति',
        departmentEn: data.departmentEn || existing.departmentEn || 'Central Executive Committee',
        photoUrl: data.photoUrl !== undefined ? data.photoUrl : existing.photoUrl,
        displayOrder: data.displayOrder !== undefined ? data.displayOrder : existing.displayOrder,
        status,
        isPublic,
        photoConsent,
        adminNotes: data.adminNotes !== undefined ? data.adminNotes : existing.adminNotes,
        updatedAt: timestamp,
      };
      return committeeStore[idx];
    }
  }

  const status = data.status || 'DRAFT';
  const photoConsent = data.photoConsent || 'PENDING';
  const isPublic = data.isPublic !== undefined ? data.isPublic : status === 'PUBLISHED';

  const newMember: CommitteeMember = {
    id: data.id || `com-${Date.now()}`,
    nameNe: data.nameNe,
    nameEn: data.nameEn || data.nameNe,
    designationNe: data.designationNe,
    designationEn: data.designationEn || data.designationNe,
    category: data.category || 'EXECUTIVE',
    departmentNe: data.departmentNe || 'केन्द्रीय कार्यसमिति',
    departmentEn: data.departmentEn || 'Central Executive Committee',
    photoUrl: data.photoUrl || '',
    termStartDateNe: data.termStartDateNe || '२०८२-०४-२१',
    termStartDateEn: data.termStartDateEn || '2082/04/21 BS',
    termEndDateNe: data.termEndDateNe || '२०८४-०४-२०',
    termEndDateEn: data.termEndDateEn || '2084/04/20 BS',
    term: data.term || '२०८२ - २०८४',
    bioNe: data.bioNe || '',
    bioEn: data.bioEn || '',
    displayOrder: data.displayOrder || committeeStore.length + 1,
    status,
    isPublic,
    photoConsent,
    adminNotes: data.adminNotes || '',
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  committeeStore.push(newMember);
  return newMember;
}

export async function deleteCommitteeMember(id: string): Promise<boolean> {
  committeeStore = committeeStore.filter((c) => c.id !== id);
  return true;
}

// 6. Reports & Transparency
export async function getReports(
  category?: string,
  year?: string,
  includeArchived = false
): Promise<GovernanceReport[]> {
  let list = [...reportsStore];
  if (!includeArchived) {
    list = list
      .filter((r) => {
        if (r.category === 'CONSTITUTION') {
          return r.isPublic !== false && r.status !== 'ARCHIVED' && r.status !== 'DRAFT' && r.isOriginalApprovedDocument === true;
        }
        if (r.category === 'REGISTRATION_CERTIFICATE') {
          // Public only sees verified certificates
          return r.verificationStatus === 'VERIFIED';
        }
        return r.isPublic !== false && r.status !== 'ARCHIVED' && r.status !== 'DRAFT';
      })
      .map((r) => {
        if (r.category === 'REGISTRATION_CERTIFICATE') {
          return {
            ...r,
            // Strictly protect internal scan: raw fileUrl is never returned publicly
            fileUrl: r.publishRedactedCertificate ? (r.redactedFileUrl || '') : '',
            registrationNumber: r.publishRegistrationNumber ? r.registrationNumber : undefined,
          };
        }
        return r;
      });
  }
  if (category && category !== 'ALL') {
    list = list.filter((r) => r.category === category);
  }
  if (year && year !== 'ALL') {
    list = list.filter((r) => r.fiscalYear.includes(year));
  }
  return list;
}

export async function getLatestConstitution(publishedOnly = true): Promise<GovernanceReport | null> {
  const constitutions = reportsStore.filter(
    (r) =>
      r.category === 'CONSTITUTION' &&
      (!publishedOnly || (r.status === 'PUBLISHED' && r.isPublic !== false && r.isOriginalApprovedDocument === true))
  );
  return constitutions.length > 0 ? constitutions[0] : null;
}

export async function getConstitutionVersions(): Promise<GovernanceReport[]> {
  return reportsStore.filter((r) => r.category === 'CONSTITUTION');
}

export async function getLatestVerifiedCertificate(): Promise<GovernanceReport | null> {
  const certs = reportsStore.filter(
    (r) => r.category === 'REGISTRATION_CERTIFICATE' && r.verificationStatus === 'VERIFIED'
  );
  if (certs.length === 0) return null;
  const cert = certs[0];
  return {
    ...cert,
    fileUrl: cert.publishRedactedCertificate ? (cert.redactedFileUrl || '') : '',
    registrationNumber: cert.publishRegistrationNumber ? cert.registrationNumber : undefined,
  };
}

export async function getRegistrationCertificates(includeInternal = true): Promise<GovernanceReport[]> {
  const list = reportsStore.filter((r) => r.category === 'REGISTRATION_CERTIFICATE');
  if (!includeInternal) {
    return list
      .filter((r) => r.verificationStatus === 'VERIFIED')
      .map((r) => ({
        ...r,
        fileUrl: r.publishRedactedCertificate ? (r.redactedFileUrl || '') : '',
        registrationNumber: r.publishRegistrationNumber ? r.registrationNumber : undefined,
      }));
  }
  return list;
}

export async function verifyRegistrationCertificate(
  id: string,
  verificationStatus: 'VERIFIED' | 'REJECTED' | 'PENDING',
  adminId: string,
  adminName: string,
  adminNotes?: string
): Promise<GovernanceReport | null> {
  const idx = reportsStore.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  reportsStore[idx] = {
    ...reportsStore[idx],
    verificationStatus,
    verifiedByAdminId: adminId,
    verifiedByAdminName: adminName,
    verifiedAt: new Date().toISOString(),
    adminNotes: adminNotes ?? reportsStore[idx].adminNotes,
  };

  if (verificationStatus === 'VERIFIED' && reportsStore[idx].publishRegistrationNumber && reportsStore[idx].registrationNumber) {
    siteSettingsStore.daoRegistrationNumber = reportsStore[idx].registrationNumber;
  }

  return reportsStore[idx];
}

export async function updateCertificateVisibility(
  id: string,
  updates: {
    publishRegistrationNumber?: boolean;
    publishRedactedCertificate?: boolean;
  }
): Promise<GovernanceReport | null> {
  const idx = reportsStore.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  reportsStore[idx] = {
    ...reportsStore[idx],
    ...updates,
  };

  if (reportsStore[idx].publishRegistrationNumber && reportsStore[idx].registrationNumber) {
    siteSettingsStore.daoRegistrationNumber = reportsStore[idx].registrationNumber;
  } else if (reportsStore[idx].publishRegistrationNumber === false) {
    siteSettingsStore.daoRegistrationNumber = '';
  }

  return reportsStore[idx];
}

export async function saveReport(data: Omit<GovernanceReport, 'id'> & { id?: string }): Promise<GovernanceReport> {
  const targetCategory = data.category || 'AUDIT_FINANCIAL';
  let targetStatus = data.status || 'PUBLISHED';
  let isPublic = data.isPublic !== false;

  // Strict Security Rule for Registration Certificate:
  // Default original certificate to Internal Only (isPublic = false)
  if (targetCategory === 'REGISTRATION_CERTIFICATE') {
    isPublic = false;
  }

  // Strict Security Rule for Constitution:
  // A non-original reference document can NEVER be published or made public.
  if (targetCategory === 'CONSTITUTION') {
    if (!data.isOriginalApprovedDocument) {
      targetStatus = 'ARCHIVED';
      isPublic = false;
    }
  }

  // Automatic version archiving for Constitution:
  // When saving or publishing a new official original version with status 'PUBLISHED',
  // all existing published versions are automatically transitioned to 'ARCHIVED'
  if (targetCategory === 'CONSTITUTION' && targetStatus === 'PUBLISHED') {
    for (let i = 0; i < reportsStore.length; i++) {
      if (reportsStore[i].category === 'CONSTITUTION' && reportsStore[i].id !== data.id) {
        if (reportsStore[i].status === 'PUBLISHED') {
          reportsStore[i] = {
            ...reportsStore[i],
            status: 'ARCHIVED',
          };
        }
      }
    }
  }

  if (data.id) {
    const idx = reportsStore.findIndex((r) => r.id === data.id);
    if (idx !== -1) {
      reportsStore[idx] = {
        ...reportsStore[idx],
        ...data,
        category: targetCategory,
        status: targetStatus,
        isPublic,
      };
      return reportsStore[idx];
    }
  }

  const newReport: GovernanceReport = {
    ...data,
    category: targetCategory,
    status: targetStatus,
    isPublic,
    id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
  };
  reportsStore.unshift(newReport);
  return newReport;
}

export async function deleteReport(id: string): Promise<boolean> {
  reportsStore = reportsStore.filter((r) => r.id !== id);
  return true;
}

// 7. Suggestions & Complaints (Feedback)
export async function submitFeedback(
  data: Omit<FeedbackSubmission, 'id' | 'status' | 'submittedAt' | 'adminNotes'>
): Promise<FeedbackSubmission> {
  const newFeedback: FeedbackSubmission = {
    ...data,
    id: `fb-${Date.now()}`,
    status: 'NEW',
    submittedAt: new Date().toISOString(),
  };
  feedbacksStore.unshift(newFeedback);
  return newFeedback;
}

export async function getFeedbacks(status?: string): Promise<FeedbackSubmission[]> {
  if (status && status !== 'ALL') {
    return feedbacksStore.filter((f) => f.status === status);
  }
  return feedbacksStore;
}

export async function updateFeedbackStatus(
  id: string,
  status: 'NEW' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED',
  adminNotes?: string
): Promise<boolean> {
  const idx = feedbacksStore.findIndex((f) => f.id === id);
  if (idx !== -1) {
    feedbacksStore[idx].status = status;
    if (adminNotes !== undefined) feedbacksStore[idx].adminNotes = adminNotes;
    return true;
  }
  return false;
}

// 8. Partners & Supporters
export async function getPartners(): Promise<CommunityPartner[]> {
  return [...partnersStore].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function savePartner(data: Omit<CommunityPartner, 'id'> & { id?: string }): Promise<CommunityPartner> {
  if (data.id) {
    const idx = partnersStore.findIndex((p) => p.id === data.id);
    if (idx !== -1) {
      partnersStore[idx] = { ...partnersStore[idx], ...data };
      return partnersStore[idx];
    }
  }
  const newPartner: CommunityPartner = {
    ...data,
    id: `part-${Date.now()}`,
  };
  partnersStore.push(newPartner);
  return newPartner;
}

export async function deletePartner(id: string): Promise<boolean> {
  partnersStore = partnersStore.filter((p) => p.id !== id);
  return true;
}

// 9. Notices
export async function getNotices(isPublic = false): Promise<NoticeItem[]> {
  if (isPublic) {
    return noticesStore.filter((n) => {
      // 1. Must be explicitly published and public
      if (n.status === 'DRAFT' || n.isPublic === false) return false;
      // 2. If related to an event, event must not be DRAFT
      if (n.relatedEventId) {
        const ev = eventsStore.find((e) => e.id === n.relatedEventId);
        if (ev && (ev.status === 'DRAFT' || !ev.isPublic)) return false;
      }
      // 3. Quarantine check: 11th AGM or any draft event mentions must never appear publicly
      if (
        n.titleEn.toLowerCase().includes('11th') ||
        n.titleNe.includes('११औं') ||
        n.summaryEn.toLowerCase().includes('11th') ||
        n.summaryNe.includes('११औं')
      ) {
        return false;
      }
      return true;
    });
  }
  return noticesStore;
}

export async function saveNotice(data: Omit<NoticeItem, 'id'> & { id?: string }): Promise<NoticeItem> {
  if (data.id) {
    const idx = noticesStore.findIndex((n) => n.id === data.id);
    if (idx !== -1) {
      noticesStore[idx] = { ...noticesStore[idx], ...data };
      return noticesStore[idx];
    }
  }
  const newNotice: NoticeItem = {
    ...data,
    id: `not-${Date.now()}`,
  };
  noticesStore.unshift(newNotice);
  return newNotice;
}

export async function deleteNotice(id: string): Promise<boolean> {
  noticesStore = noticesStore.filter((n) => n.id !== id);
  return true;
}

// 10. Site Banners
let bannersStore: SiteBanner[] = [
  {
    id: 'ban-001',
    titleNe: 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं',
    titleEn: 'Madi Sankhuwasabha Sarokar Samaj, Kathmandu',
    subtitleNe: 'मादीदेखि काठमाण्डौंसम्म, एकता, सेवा र सहकार्यको साझा अभियान',
    subtitleEn: 'Connecting Madi Diaspora in Kathmandu with Community Welfare & Mutual Aid',
    imageDesktopUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1920&q=80',
    imageMobileUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    linkUrl: '/membership',
    buttonTextNe: 'सदस्यता लिनुहोस्',
    buttonTextEn: 'Join Us',
    isActive: false,
    displayOrder: 1,
  },
  {
    id: 'ban-002',
    titleNe: 'मादी राहत तथा कल्याणकारी कोष',
    titleEn: 'Madi Disaster Relief & Welfare Fund',
    subtitleNe: 'बाढी–पहिरो पीडित तथा विपन्न बिरामीहरूका लागि पारदर्शी सहयोग',
    subtitleEn: 'Transparent Humanitarian Aid for Landslide Survivors and Underprivileged Families',
    imageDesktopUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1920&q=80',
    imageMobileUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
    linkUrl: '/relief-support',
    buttonTextNe: 'राहत विवरण हेर्नुहोस्',
    buttonTextEn: 'Explore Relief',
    isActive: false,
    displayOrder: 2,
  },
];

export async function getBanners(activeOnly = true): Promise<SiteBanner[]> {
  let list = [...bannersStore];
  if (activeOnly) {
    list = list.filter((b) => b.isActive);
  }
  return list.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function saveBanner(data: Omit<SiteBanner, 'id'> & { id?: string }): Promise<SiteBanner> {
  if (data.id) {
    const idx = bannersStore.findIndex((b) => b.id === data.id);
    if (idx !== -1) {
      bannersStore[idx] = { ...bannersStore[idx], ...data };
      return bannersStore[idx];
    }
  }
  const newBanner: SiteBanner = {
    ...data,
    id: `ban-${Date.now()}`,
  };
  bannersStore.push(newBanner);
  return newBanner;
}

export async function deleteBanner(id: string): Promise<boolean> {
  bannersStore = bannersStore.filter((b) => b.id !== id);
  return true;
}

// 11. Gallery Albums & Media
let albumsStore: GalleryAlbum[] = [
  {
    id: 'alb-001',
    slug: 'madi-health-camp-photos',
    titleNe: 'मादी निःशुल्क स्वास्थ्य शिविर २०८३ का तस्बिरहरू',
    titleEn: 'Madi Free Health Camp 2083 Photo Gallery',
    descriptionNe: 'मादी–४ ओखरबोटेमा सञ्चालित बृहत् स्वास्थ्य तथा आँखा शिविरका झलकहरू।',
    descriptionEn: 'Glimpses from the two-day health and eye clinic in Okharbote, Madi.',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
    eventDate: '२०८३-०१-१५',
    category: 'HEALTH',
    isFeatured: true,
    isPublic: false,
    status: 'DRAFT',
    displayOrder: 1,
  },
  {
    id: 'alb-002',
    slug: 'madi-cultural-picnic-2082',
    titleNe: 'मादी सांस्कृतिक वनभोज २०८२ स्मृति सँगालो',
    titleEn: 'Madi Cultural Picnic 2082 Memories',
    descriptionNe: 'गोदावरीमा आयोजित पारिवारिक वनभोज तथा सांस्कृतिक प्रस्तुतिहरू।',
    descriptionEn: 'Folklore, sports, and community reunion at Godawari Botanical Gardens.',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
    eventDate: '२०८२-फागुन-१२',
    category: 'CULTURAL',
    isFeatured: true,
    isPublic: false,
    status: 'DRAFT',
    displayOrder: 2,
  },
];

let mediaItemsStore: MediaItem[] = [
  {
    id: 'med-001',
    albumId: 'alb-001',
    titleNe: 'आँखा जाँच तथा मोतियाबिन्दु छनोट',
    titleEn: 'Eye Examination & Screening',
    mediaType: 'IMAGE',
    fileUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=80',
    fileSizeBytes: 2450000,
    mimeType: 'image/jpeg',
    altTextNe: 'मादीमा आँखा जाँच गराउँदै नागरिकहरू',
    altTextEn: 'Local residents undergoing eye examinations in Madi',
    captionNe: 'ओखरबोटे स्वास्थ्य शिविरमा बिरामीहरूको जाँच',
    captionEn: 'Patients undergoing checkups at Okharbote clinic',
    isFeatured: true,
    displayOrder: 1,
    createdAt: '2026-04-28T10:00:00Z',
  },
  {
    id: 'med-002',
    albumId: 'alb-001',
    titleNe: 'निःशुल्क औषधि वितरण डेस्क',
    titleEn: 'Free Medicine Dispensation Desk',
    mediaType: 'IMAGE',
    fileUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80',
    fileSizeBytes: 1850000,
    mimeType: 'image/jpeg',
    altTextNe: 'औषधि वितरण डेस्क',
    altTextEn: 'Medicine dispensing desk',
    isFeatured: false,
    displayOrder: 2,
    createdAt: '2026-04-28T11:00:00Z',
  },
  {
    id: 'med-003',
    albumId: 'alb-002',
    titleNe: 'रैथाने सांस्कृतिक झाँकी नृत्य',
    titleEn: 'Traditional Folklore Dance',
    mediaType: 'IMAGE',
    fileUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=400&q=80',
    fileSizeBytes: 3100000,
    mimeType: 'image/jpeg',
    altTextNe: 'सांस्कृतिक झाँकी नृत्य प्रस्तुति',
    altTextEn: 'Cultural folk performance',
    isFeatured: true,
    displayOrder: 1,
    createdAt: '2026-02-25T14:00:00Z',
  },
  // --- Incoming Real Madi SSS Photos (Quarantined as Draft/Pending Review) ---
  {
    id: 'med-inc-001',
    titleNe: "470179792_1261291071579573_7225397207303800632_n.jpg",
    titleEn: "470179792_1261291071579573_7225397207303800632_n.jpg",
    originalFilename: "470179792_1261291071579573_7225397207303800632_n.jpg",
    mediaType: 'IMAGE',
    fileUrl: "https://ypcrfeufdghpxhhjexja.supabase.co/storage/v1/object/public/media/madi-sss/incoming/470179792_1261291071579573_7225397207303800632_n.jpg",
    thumbnailUrl: "/media/incoming/470179792_1261291071579573_7225397207303800632_n-mobile.webp",
    fileSizeBytes: 127583,
    mimeType: "image/jpeg",
    dimensions: { width: 1080, height: 717 },
    responsiveUrls: {
      mobile: "/media/incoming/470179792_1261291071579573_7225397207303800632_n-mobile.webp",
      tablet: "/media/incoming/470179792_1261291071579573_7225397207303800632_n-tablet.webp",
      desktop: "/media/incoming/470179792_1261291071579573_7225397207303800632_n-desktop.webp",
    },
    altTextNe: 'Madi SSS photo — pending review',
    altTextEn: 'Madi SSS photo — pending review',
    status: 'TEST_SAMPLE',
    isPublic: false,
    category: 'UNSORTED_PENDING_REVIEW',
    isFeatured: false,
    isHeroEligible: false,
    internalCategory: 'WARD_CORRESPONDENCE',
    sensitivityNotice: 'Sensitive — Internal use only',
    sensitivityNoticeNe: 'संवेदनशील — आन्तरिक प्रयोजन मात्र',
    displayOrder: 101,
    createdAt: '2026-11-03T14:45:00Z',
  },
  {
    id: 'med-inc-002',
    titleNe: "Chauki.jpg",
    titleEn: "Chauki.jpg",
    originalFilename: "Chauki.jpg",
    mediaType: 'IMAGE',
    fileUrl: "https://ypcrfeufdghpxhhjexja.supabase.co/storage/v1/object/public/media/madi-sss/incoming/Chauki.jpg",
    thumbnailUrl: "/media/incoming/Chauki-mobile.webp",
    fileSizeBytes: 147991,
    mimeType: "image/jpeg",
    dimensions: { width: 1200, height: 795 },
    responsiveUrls: {
      mobile: "/media/incoming/Chauki-mobile.webp",
      tablet: "/media/incoming/Chauki-tablet.webp",
      desktop: "/media/incoming/Chauki-desktop.webp",
    },
    altTextNe: 'Madi SSS photo — pending review',
    altTextEn: 'Madi SSS photo — pending review',
    status: 'TEST_SAMPLE',
    isPublic: false,
    category: 'UNSORTED_PENDING_REVIEW',
    isFeatured: false,
    isHeroEligible: true,
    internalCategory: 'SCENIC',
    displayOrder: 102,
    createdAt: '2026-11-03T14:45:00Z',
  },
  {
    id: 'med-inc-003',
    titleNe: "Deusi taiyari.jpg",
    titleEn: "Deusi taiyari.jpg",
    originalFilename: "Deusi taiyari.jpg",
    mediaType: 'IMAGE',
    fileUrl: "https://ypcrfeufdghpxhhjexja.supabase.co/storage/v1/object/public/media/madi-sss/incoming/Deusi taiyari.jpg",
    thumbnailUrl: "/media/incoming/Deusi_taiyari-mobile.webp",
    fileSizeBytes: 359172,
    mimeType: "image/jpeg",
    dimensions: { width: 2048, height: 1360 },
    responsiveUrls: {
      mobile: "/media/incoming/Deusi_taiyari-mobile.webp",
      tablet: "/media/incoming/Deusi_taiyari-tablet.webp",
      desktop: "/media/incoming/Deusi_taiyari-desktop.webp",
    },
    altTextNe: 'Madi SSS photo — pending review',
    altTextEn: 'Madi SSS photo — pending review',
    status: 'TEST_SAMPLE',
    isPublic: false,
    category: 'UNSORTED_PENDING_REVIEW',
    isFeatured: false,
    isHeroEligible: true,
    internalCategory: 'EVENT',
    sensitivityNotice: 'Sensitive — Internal use only',
    sensitivityNoticeNe: 'संवेदनशील — आन्तरिक प्रयोजन मात्र',
    displayOrder: 103,
    createdAt: '2026-11-03T14:45:00Z',
  },
  {
    id: 'med-inc-004',
    titleNe: "Donation to pradeep lingthep.jpg",
    titleEn: "Donation to pradeep lingthep.jpg",
    originalFilename: "Donation to pradeep lingthep.jpg",
    mediaType: 'IMAGE',
    fileUrl: "https://ypcrfeufdghpxhhjexja.supabase.co/storage/v1/object/public/media/madi-sss/incoming/Donation to pradeep lingthep.jpg",
    thumbnailUrl: "/media/incoming/Donation_to_pradeep_lingthep-mobile.webp",
    fileSizeBytes: 44411,
    mimeType: "image/jpeg",
    dimensions: { width: 960, height: 540 },
    responsiveUrls: {
      mobile: "/media/incoming/Donation_to_pradeep_lingthep-mobile.webp",
      tablet: "/media/incoming/Donation_to_pradeep_lingthep-tablet.webp",
      desktop: "/media/incoming/Donation_to_pradeep_lingthep-desktop.webp",
    },
    altTextNe: 'Madi SSS photo — pending review',
    altTextEn: 'Madi SSS photo — pending review',
    status: 'TEST_SAMPLE',
    isPublic: false,
    category: 'UNSORTED_PENDING_REVIEW',
    isFeatured: false,
    isHeroEligible: false,
    internalCategory: 'DONATION_HANDOVER',
    sensitivityNotice: 'Sensitive — Internal use only (Donation handover / Beneficiary personal identity protected)',
    sensitivityNoticeNe: 'संवेदनशील — आन्तरिक प्रयोजन मात्र (सहयोग हस्तान्तरण / व्यक्तिगत पहिचान सुरक्षित)',
    displayOrder: 104,
    createdAt: '2026-11-03T14:45:00Z',
  },
  {
    id: 'med-inc-005',
    titleNe: "Madi.jpg",
    titleEn: "Madi.jpg",
    originalFilename: "Madi.jpg",
    mediaType: 'IMAGE',
    fileUrl: "https://ypcrfeufdghpxhhjexja.supabase.co/storage/v1/object/public/media/madi-sss/incoming/Madi.jpg",
    thumbnailUrl: "/media/incoming/Madi-mobile.webp",
    fileSizeBytes: 26421,
    mimeType: "image/jpeg",
    dimensions: { width: 432, height: 431 },
    responsiveUrls: {
      mobile: "/media/incoming/Madi-mobile.webp",
      tablet: "/media/incoming/Madi-tablet.webp",
      desktop: "/media/incoming/Madi-desktop.webp",
    },
    altTextNe: 'Madi SSS photo — pending review',
    altTextEn: 'Madi SSS photo — pending review',
    status: 'TEST_SAMPLE',
    isPublic: false,
    category: 'UNSORTED_PENDING_REVIEW',
    isFeatured: false,
    isHeroEligible: true,
    internalCategory: 'SCENIC',
    displayOrder: 105,
    createdAt: '2026-11-03T14:45:00Z',
  },
  {
    id: 'med-inc-006',
    titleNe: "Picnic 2076.jpg",
    titleEn: "Picnic 2076.jpg",
    originalFilename: "Picnic 2076.jpg",
    mediaType: 'IMAGE',
    fileUrl: "https://ypcrfeufdghpxhhjexja.supabase.co/storage/v1/object/public/media/madi-sss/incoming/Picnic 2076.jpg",
    thumbnailUrl: "/media/incoming/Picnic_2076-mobile.webp",
    fileSizeBytes: 72795,
    mimeType: "image/jpeg",
    dimensions: { width: 960, height: 441 },
    responsiveUrls: {
      mobile: "/media/incoming/Picnic_2076-mobile.webp",
      tablet: "/media/incoming/Picnic_2076-tablet.webp",
      desktop: "/media/incoming/Picnic_2076-desktop.webp",
    },
    altTextNe: 'Madi SSS photo — pending review',
    altTextEn: 'Madi SSS photo — pending review',
    status: 'TEST_SAMPLE',
    isPublic: false,
    category: 'UNSORTED_PENDING_REVIEW',
    isFeatured: false,
    isHeroEligible: true,
    internalCategory: 'EVENT',
    displayOrder: 106,
    createdAt: '2026-11-03T14:45:00Z',
  },
  {
    id: 'med-inc-007',
    titleNe: "Picnic balaju 2076.jpg",
    titleEn: "Picnic balaju 2076.jpg",
    originalFilename: "Picnic balaju 2076.jpg",
    mediaType: 'IMAGE',
    fileUrl: "https://ypcrfeufdghpxhhjexja.supabase.co/storage/v1/object/public/media/madi-sss/incoming/Picnic balaju 2076.jpg",
    thumbnailUrl: "/media/incoming/Picnic_balaju_2076-mobile.webp",
    fileSizeBytes: 47111,
    mimeType: "image/jpeg",
    dimensions: { width: 720, height: 480 },
    responsiveUrls: {
      mobile: "/media/incoming/Picnic_balaju_2076-mobile.webp",
      tablet: "/media/incoming/Picnic_balaju_2076-tablet.webp",
      desktop: "/media/incoming/Picnic_balaju_2076-desktop.webp",
    },
    altTextNe: 'Madi SSS photo — pending review',
    altTextEn: 'Madi SSS photo — pending review',
    status: 'TEST_SAMPLE',
    isPublic: false,
    category: 'UNSORTED_PENDING_REVIEW',
    isFeatured: false,
    isHeroEligible: true,
    internalCategory: 'EVENT',
    sensitivityNotice: 'Sensitive — Internal use only',
    sensitivityNoticeNe: 'संवेदनशील — आन्तरिक प्रयोजन मात्र',
    displayOrder: 107,
    createdAt: '2026-11-03T14:45:00Z',
  },
  {
    id: 'med-inc-008',
    titleNe: "Samabedana Dambar kumari.jpg",
    titleEn: "Samabedana Dambar kumari.jpg",
    originalFilename: "Samabedana Dambar kumari.jpg",
    mediaType: 'IMAGE',
    fileUrl: "https://ypcrfeufdghpxhhjexja.supabase.co/storage/v1/object/public/media/madi-sss/incoming/Samabedana Dambar kumari.jpg",
    thumbnailUrl: "/media/incoming/Samabedana_Dambar_kumari-mobile.webp",
    fileSizeBytes: 354445,
    mimeType: "image/jpeg",
    dimensions: { width: 1448, height: 2048 },
    responsiveUrls: {
      mobile: "/media/incoming/Samabedana_Dambar_kumari-mobile.webp",
      tablet: "/media/incoming/Samabedana_Dambar_kumari-tablet.webp",
      desktop: "/media/incoming/Samabedana_Dambar_kumari-desktop.webp",
    },
    altTextNe: 'Madi SSS photo — pending review',
    altTextEn: 'Madi SSS photo — pending review',
    status: 'TEST_SAMPLE',
    isPublic: false,
    category: 'UNSORTED_PENDING_REVIEW',
    isFeatured: false,
    isHeroEligible: false,
    internalCategory: 'CONDOLENCE',
    sensitivityNotice: 'Sensitive — Internal use only',
    sensitivityNoticeNe: 'संवेदनशील — आन्तरिक प्रयोजन मात्र',
    displayOrder: 108,
    createdAt: '2026-11-03T14:45:00Z',
  },
  {
    id: 'med-inc-009',
    titleNe: "Samabedana.jpg",
    titleEn: "Samabedana.jpg",
    originalFilename: "Samabedana.jpg",
    mediaType: 'IMAGE',
    fileUrl: "https://ypcrfeufdghpxhhjexja.supabase.co/storage/v1/object/public/media/madi-sss/incoming/Samabedana.jpg",
    thumbnailUrl: "/media/incoming/Samabedana-mobile.webp",
    fileSizeBytes: 45195,
    mimeType: "image/jpeg",
    dimensions: { width: 843, height: 474 },
    responsiveUrls: {
      mobile: "/media/incoming/Samabedana-mobile.webp",
      tablet: "/media/incoming/Samabedana-tablet.webp",
      desktop: "/media/incoming/Samabedana-desktop.webp",
    },
    altTextNe: 'Madi SSS photo — pending review',
    altTextEn: 'Madi SSS photo — pending review',
    status: 'TEST_SAMPLE',
    isPublic: false,
    category: 'UNSORTED_PENDING_REVIEW',
    isFeatured: false,
    isHeroEligible: false,
    internalCategory: 'CONDOLENCE',
    sensitivityNotice: 'Sensitive — Internal use only',
    sensitivityNoticeNe: 'संवेदनशील — आन्तरिक प्रयोजन मात्र',
    displayOrder: 109,
    createdAt: '2026-11-03T14:45:00Z',
  },
  {
    id: 'med-inc-010',
    titleNe: "Wada.jpeg",
    titleEn: "Wada.jpeg",
    originalFilename: "Wada.jpeg",
    mediaType: 'IMAGE',
    fileUrl: "https://ypcrfeufdghpxhhjexja.supabase.co/storage/v1/object/public/media/madi-sss/incoming/Wada.jpeg",
    thumbnailUrl: "/media/incoming/Wada-mobile.webp",
    fileSizeBytes: 176461,
    mimeType: "image/jpeg",
    dimensions: { width: 751, height: 1015 },
    responsiveUrls: {
      mobile: "/media/incoming/Wada-mobile.webp",
      tablet: "/media/incoming/Wada-tablet.webp",
      desktop: "/media/incoming/Wada-desktop.webp",
    },
    altTextNe: 'Madi SSS photo — pending review',
    altTextEn: 'Madi SSS photo — pending review',
    status: 'TEST_SAMPLE',
    isPublic: false,
    category: 'UNSORTED_PENDING_REVIEW',
    isFeatured: false,
    isHeroEligible: false,
    internalCategory: 'WARD_CORRESPONDENCE',
    sensitivityNotice: 'Sensitive — Internal use only',
    sensitivityNoticeNe: 'संवेदनशील — आन्तरिक प्रयोजन मात्र',
    displayOrder: 110,
    createdAt: '2026-11-03T14:45:00Z',
  },
  {
    id: 'med-inc-011',
    titleNe: "WhatsApp Image 2026-11-02 at 09.19.04.jpeg",
    titleEn: "WhatsApp Image 2026-11-02 at 09.19.04.jpeg",
    originalFilename: "WhatsApp Image 2026-11-02 at 09.19.04.jpeg",
    mediaType: 'IMAGE',
    fileUrl: "https://ypcrfeufdghpxhhjexja.supabase.co/storage/v1/object/public/media/madi-sss/incoming/WhatsApp Image 2026-11-02 at 09.19.04.jpeg",
    thumbnailUrl: "/media/incoming/WhatsApp_Image_2026-11-02_at_09_19_04-mobile.webp",
    fileSizeBytes: 166384,
    mimeType: "image/jpeg",
    dimensions: { width: 960, height: 1280 },
    responsiveUrls: {
      mobile: "/media/incoming/WhatsApp_Image_2026-11-02_at_09_19_04-mobile.webp",
      tablet: "/media/incoming/WhatsApp_Image_2026-11-02_at_09_19_04-tablet.webp",
      desktop: "/media/incoming/WhatsApp_Image_2026-11-02_at_09_19_04-desktop.webp",
    },
    altTextNe: 'Madi SSS photo — pending review',
    altTextEn: 'Madi SSS photo — pending review',
    status: 'TEST_SAMPLE',
    isPublic: false,
    category: 'UNSORTED_PENDING_REVIEW',
    isFeatured: false,
    isHeroEligible: false,
    internalCategory: 'WARD_CORRESPONDENCE',
    sensitivityNotice: 'Sensitive — Internal use only',
    sensitivityNoticeNe: 'संवेदनशील — आन्तरिक प्रयोजन मात्र',
    displayOrder: 111,
    createdAt: '2026-11-03T14:45:00Z',
  },
  {
    id: 'med-inc-012',
    titleNe: "WhatsApp Image 2026-11-02 at 20.07.38.jpeg",
    titleEn: "WhatsApp Image 2026-11-02 at 20.07.38.jpeg",
    originalFilename: "WhatsApp Image 2026-11-02 at 20.07.38.jpeg",
    mediaType: 'IMAGE',
    fileUrl: "https://ypcrfeufdghpxhhjexja.supabase.co/storage/v1/object/public/media/madi-sss/incoming/WhatsApp Image 2026-11-02 at 20.07.38.jpeg",
    thumbnailUrl: "/media/incoming/WhatsApp_Image_2026-11-02_at_20_07_38-mobile.webp",
    fileSizeBytes: 133541,
    mimeType: "image/jpeg",
    dimensions: { width: 960, height: 1280 },
    responsiveUrls: {
      mobile: "/media/incoming/WhatsApp_Image_2026-11-02_at_20_07_38-mobile.webp",
      tablet: "/media/incoming/WhatsApp_Image_2026-11-02_at_20_07_38-tablet.webp",
      desktop: "/media/incoming/WhatsApp_Image_2026-11-02_at_20_07_38-desktop.webp",
    },
    altTextNe: 'Madi SSS photo — pending review',
    altTextEn: 'Madi SSS photo — pending review',
    status: 'TEST_SAMPLE',
    isPublic: false,
    category: 'UNSORTED_PENDING_REVIEW',
    isFeatured: false,
    isHeroEligible: false,
    internalCategory: 'WARD_CORRESPONDENCE',
    sensitivityNotice: 'Sensitive — Internal use only',
    sensitivityNoticeNe: 'संवेदनशील — आन्तरिक प्रयोजन मात्र',
    displayOrder: 112,
    createdAt: '2026-11-03T14:45:00Z',
  },
  {
    id: 'med-inc-013',
    titleNe: "deusi nach.jpg",
    titleEn: "deusi nach.jpg",
    originalFilename: "deusi nach.jpg",
    mediaType: 'IMAGE',
    fileUrl: "https://ypcrfeufdghpxhhjexja.supabase.co/storage/v1/object/public/media/madi-sss/incoming/deusi nach.jpg",
    thumbnailUrl: "/media/incoming/deusi_nach-mobile.webp",
    fileSizeBytes: 344230,
    mimeType: "image/jpeg",
    dimensions: { width: 2048, height: 1360 },
    responsiveUrls: {
      mobile: "/media/incoming/deusi_nach-mobile.webp",
      tablet: "/media/incoming/deusi_nach-tablet.webp",
      desktop: "/media/incoming/deusi_nach-desktop.webp",
    },
    altTextNe: 'Madi SSS photo — pending review',
    altTextEn: 'Madi SSS photo — pending review',
    status: 'TEST_SAMPLE',
    isPublic: false,
    category: 'UNSORTED_PENDING_REVIEW',
    isFeatured: false,
    isHeroEligible: true,
    internalCategory: 'EVENT',
    displayOrder: 113,
    createdAt: '2026-11-03T14:45:00Z',
  },
  {
    id: 'med-inc-014',
    titleNe: "wada back.jpeg",
    titleEn: "wada back.jpeg",
    originalFilename: "wada back.jpeg",
    mediaType: 'IMAGE',
    fileUrl: "https://ypcrfeufdghpxhhjexja.supabase.co/storage/v1/object/public/media/madi-sss/incoming/wada back.jpeg",
    thumbnailUrl: "/media/incoming/wada_back-mobile.webp",
    fileSizeBytes: 155576,
    mimeType: "image/jpeg",
    dimensions: { width: 758, height: 1051 },
    responsiveUrls: {
      mobile: "/media/incoming/wada_back-mobile.webp",
      tablet: "/media/incoming/wada_back-tablet.webp",
      desktop: "/media/incoming/wada_back-desktop.webp",
    },
    altTextNe: 'Madi SSS photo — pending review',
    altTextEn: 'Madi SSS photo — pending review',
    status: 'TEST_SAMPLE',
    isPublic: false,
    category: 'UNSORTED_PENDING_REVIEW',
    isFeatured: false,
    isHeroEligible: false,
    internalCategory: 'WARD_CORRESPONDENCE',
    sensitivityNotice: 'Sensitive — Internal use only',
    sensitivityNoticeNe: 'संवेदनशील — आन्तरिक प्रयोजन मात्र',
    displayOrder: 114,
    createdAt: '2026-11-03T14:45:00Z',
  },
];

export async function getGalleryAlbums(featuredOnly = false, includePrivate = false): Promise<GalleryAlbum[]> {
  let list = [...albumsStore];
  if (!includePrivate) {
    list = list.filter((a) => a.isPublic !== false && a.status !== 'DRAFT');
  }
  if (featuredOnly) list = list.filter((a) => a.isFeatured);
  return list.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getGalleryAlbumBySlug(slug: string): Promise<GalleryAlbum | null> {
  return albumsStore.find((a) => a.slug === slug) || null;
}

export async function saveGalleryAlbum(data: Omit<GalleryAlbum, 'id'> & { id?: string }): Promise<GalleryAlbum> {
  if (data.id) {
    const idx = albumsStore.findIndex((a) => a.id === data.id);
    if (idx !== -1) {
      albumsStore[idx] = { ...albumsStore[idx], ...data };
      return albumsStore[idx];
    }
  }
  const newAlbum: GalleryAlbum = {
    ...data,
    id: `alb-${Date.now()}`,
  };
  albumsStore.push(newAlbum);
  return newAlbum;
}

export async function deleteGalleryAlbum(id: string): Promise<boolean> {
  albumsStore = albumsStore.filter((a) => a.id !== id);
  return true;
}

export async function getMediaItems(albumId?: string, type?: string, includePrivate = true): Promise<MediaItem[]> {
  let list = [...mediaItemsStore];
  if (!includePrivate) {
    list = list.filter(
      (m) =>
        m.isPublic === true &&
        m.status !== 'DRAFT' &&
        m.status !== 'PENDING_REVIEW' &&
        m.status !== 'TEST_SAMPLE' &&
        m.status !== 'INTERNAL_ONLY'
    );
  }
  if (albumId) list = list.filter((m) => m.albumId === albumId);
  if (type && type !== 'ALL') list = list.filter((m) => m.mediaType === type);
  return list.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function saveMediaItem(data: Omit<MediaItem, 'id' | 'createdAt'> & { id?: string }): Promise<MediaItem> {
  if (data.id) {
    const idx = mediaItemsStore.findIndex((m) => m.id === data.id);
    if (idx !== -1) {
      mediaItemsStore[idx] = { ...mediaItemsStore[idx], ...data };
      return mediaItemsStore[idx];
    }
  }
  const newItem: MediaItem = {
    ...data,
    id: `med-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  mediaItemsStore.unshift(newItem);
  return newItem;
}

export async function deleteMediaItem(id: string): Promise<boolean> {
  mediaItemsStore = mediaItemsStore.filter((m) => m.id !== id);
  return true;
}

// -------------------------------------------------------------
// 11B-1. CMS & Social Media Outreach Workflow Roles
// -------------------------------------------------------------

export interface CMSWorkflowRole {
  roleKey: 'CONTENT_CREATOR' | 'COMMUNICATIONS_COORDINATOR' | 'GENERAL_SECRETARY' | 'PRESIDENT';
  titleNe: string;
  titleEn: string;
  stageNumber: number;
  responsibilities: string[];
  isPublicFacing: boolean;
  allowPublicContactDisplay: boolean;
}

export const CMS_WORKFLOW_ROLES: CMSWorkflowRole[] = [
  {
    roleKey: 'CONTENT_CREATOR',
    titleNe: 'सामग्री सिर्जनाकर्ता (स्वयंसेवक)',
    titleEn: 'Content Creator (Volunteer)',
    stageNumber: 1,
    responsibilities: ['Draft copy in Nepali & English', 'Select local CMS media ID', 'Attach consent proof'],
    isPublicFacing: false,
    allowPublicContactDisplay: false,
  },
  {
    roleKey: 'COMMUNICATIONS_COORDINATOR',
    titleNe: 'सञ्चार तथा प्रचारप्रसार संयोजक',
    titleEn: 'Media & Communications Coordinator',
    stageNumber: 2,
    responsibilities: [
      'Screen media against privacy and consent rules',
      'Enforce 80/20 non-commercial content balance',
      'Verify Devanagari Unicode and English phrasing',
      'Verify local CMS asset resolution and redactions',
      'Forward compliant draft to General Secretary',
    ],
    isPublicFacing: false,
    allowPublicContactDisplay: false, // Strict privacy invariant: personal phone/email never exposed
  },
  {
    roleKey: 'GENERAL_SECRETARY',
    titleNe: 'महासचिव',
    titleEn: 'General Secretary',
    stageNumber: 3,
    responsibilities: ['Factual and dates verification', 'Organizational protocol & minutes alignment'],
    isPublicFacing: true,
    allowPublicContactDisplay: false,
  },
  {
    roleKey: 'PRESIDENT',
    titleNe: 'अध्यक्ष',
    titleEn: 'President',
    stageNumber: 4,
    responsibilities: ['Final executive sanction', 'Partnership and policy authorization'],
    isPublicFacing: true,
    allowPublicContactDisplay: false,
  },
];

// 11B. Homepage Hero Image Management
let homepageHeroStore: HomepageHeroConfig | null = {
  id: 'hero-current',
  mediaItemId: 'med-inc-002',
  imageUrl: '/media/incoming/Chauki.jpg',
  mobileImageUrl: '/media/incoming/Chauki-mobile.webp',
  tabletImageUrl: '/media/incoming/Chauki-tablet.webp',
  desktopImageUrl: '/media/incoming/Chauki-desktop.webp',
  altTextNe: 'मादी संखुवासभाको प्राकृतिक सौन्दर्य तथा चौकि बजार',
  altTextEn: 'Scenic landscape of Chauki, Madi, Sankhuwasabha',
  headingNe: 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं',
  headingEn: 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu',
  subheadingNe: 'मादीदेखि काठमाण्डौंसम्म — एकता, सद्भाव र सामाजिक सेवाको साझा थलो',
  subheadingEn: 'From Madi to Kathmandu — A shared platform for unity, solidarity, and community welfare',
  ctaLabelNe: 'सदस्यता आवेदन',
  ctaLabelEn: 'Apply for Membership',
  ctaLink: '/membership',
  status: 'PUBLISHED', // Officially Published per user command
  publishedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  selectedByAdminId: 'admin-001',
  selectedByAdminName: 'Super Admin',
};

let homepageHeroHistoryStore: HomepageHeroConfig[] = [];

export async function getHomepageHero(includeDraft = false): Promise<HomepageHeroConfig | null> {
  if (!homepageHeroStore) return null;
  if (!includeDraft && homepageHeroStore.status !== 'PUBLISHED') {
    return null;
  }
  return homepageHeroStore;
}

export async function getHeroHistory(): Promise<HomepageHeroConfig[]> {
  return [...homepageHeroHistoryStore];
}

export async function saveHomepageHero(
  data: Partial<HomepageHeroConfig>,
  adminId: string,
  adminName: string
): Promise<HomepageHeroConfig> {
  // Enforce Governance Rule: Homepage hero candidates must be scenic/community landscape or approved public event images with verified consent.
  // Prohibit condolence, bereavement, patient identification, relief handover, and ward correspondence.
  const validation = validateHeroCandidateEligibility(
    data.mediaItemId,
    data.imageUrl,
    `${data.altTextEn || ''} ${data.altTextNe || ''} ${data.headingEn || ''}`
  );
  if (!validation.eligible) {
    throw new Error(validation.error || 'Media item is ineligible for homepage hero selection.');
  }

  // If replacing an existing hero with a new image, archive the previous one
  if (homepageHeroStore && data.imageUrl && data.imageUrl !== homepageHeroStore.imageUrl) {
    homepageHeroHistoryStore.unshift({ ...homepageHeroStore, status: 'DRAFT' });
  }

  const updated: HomepageHeroConfig = {
    id: homepageHeroStore?.id || `hero-${Date.now()}`,
    mediaItemId: data.mediaItemId ?? homepageHeroStore?.mediaItemId,
    imageUrl: data.imageUrl || homepageHeroStore?.imageUrl || '/media/incoming/Chauki.jpg',
    mobileImageUrl: data.mobileImageUrl ?? homepageHeroStore?.mobileImageUrl,
    tabletImageUrl: data.tabletImageUrl ?? homepageHeroStore?.tabletImageUrl,
    desktopImageUrl: data.desktopImageUrl ?? homepageHeroStore?.desktopImageUrl,
    altTextNe: data.altTextNe || homepageHeroStore?.altTextNe || 'Madi SSS photo — pending review',
    altTextEn: data.altTextEn || homepageHeroStore?.altTextEn || 'Madi SSS photo — pending review',
    headingNe: data.headingNe ?? homepageHeroStore?.headingNe,
    headingEn: data.headingEn ?? homepageHeroStore?.headingEn,
    subheadingNe: data.subheadingNe ?? homepageHeroStore?.subheadingNe,
    subheadingEn: data.subheadingEn ?? homepageHeroStore?.subheadingEn,
    ctaLabelNe: data.ctaLabelNe ?? homepageHeroStore?.ctaLabelNe,
    ctaLabelEn: data.ctaLabelEn ?? homepageHeroStore?.ctaLabelEn,
    ctaLink: data.ctaLink ?? homepageHeroStore?.ctaLink,
    status: data.status || homepageHeroStore?.status || 'DRAFT',
    publishedAt: data.status === 'PUBLISHED' ? (homepageHeroStore?.publishedAt || new Date().toISOString()) : undefined,
    updatedAt: new Date().toISOString(),
    selectedByAdminId: adminId,
    selectedByAdminName: adminName,
    adminNotes: data.adminNotes ?? homepageHeroStore?.adminNotes,
  };

  homepageHeroStore = updated;
  return updated;
}

export async function publishHomepageHero(adminId: string, adminName: string): Promise<HomepageHeroConfig | null> {
  if (!homepageHeroStore) return null;
  homepageHeroStore = {
    ...homepageHeroStore,
    status: 'PUBLISHED',
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    selectedByAdminId: adminId,
    selectedByAdminName: adminName,
  };
  return homepageHeroStore;
}

export async function unpublishHomepageHero(adminId: string, adminName: string): Promise<HomepageHeroConfig | null> {
  if (!homepageHeroStore) return null;
  homepageHeroStore = {
    ...homepageHeroStore,
    status: 'DRAFT',
    updatedAt: new Date().toISOString(),
    selectedByAdminId: adminId,
    selectedByAdminName: adminName,
  };
  return homepageHeroStore;
}

export async function replaceHomepageHero(
  newHeroData: Partial<HomepageHeroConfig>,
  adminId: string,
  adminName: string
): Promise<HomepageHeroConfig> {
  if (homepageHeroStore) {
    homepageHeroHistoryStore.unshift({ ...homepageHeroStore, status: 'DRAFT' });
  }
  return saveHomepageHero(newHeroData, adminId, adminName);
}

// -------------------------------------------------------------
// 11C. Internal Media Consent and Publication Tracker
// -------------------------------------------------------------

const SENSITIVE_MEDIA_TYPES: MediaConsentType[] = [
  'condolence',
  'ward_correspondence',
  'relief_handover',
  'donation_handover',
  'patient_identification',
];

let mediaConsentStore: MediaConsentRecord[] = [
  {
    id: 'mct-001',
    titleNe: 'मादी–४ शोक प्रस्ताव पत्र तथा परिवार समवेदना',
    titleEn: 'Condolence Resolution Letter & Family Sympathy — Madi-4',
    fileUrl: '/media/internal/condolence-madi4.pdf',
    mediaType: 'condolence',
    status: 'INTERNAL_ONLY',
    hasWrittenConsent: false,
    consentScope: 'internal_use',
    redactionRequirement: 'Strictly internal: Bereaved family names, signatures, and personal residences protected.',
    adminNotes: 'Archived condolence correspondence. Not approved for public broadcast or social media.',
    isPublic: false,
    createdAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'mct-002',
    titleNe: 'मादी नगरपालिका वडा नं. २ विपद् राहत सिफारिस पत्र',
    titleEn: 'Madi Municipality Ward No. 2 Disaster Relief Recommendation Document',
    fileUrl: '/media/internal/ward2-disaster-recommendation.pdf',
    mediaType: 'ward_correspondence',
    status: 'INTERNAL_ONLY',
    hasWrittenConsent: false,
    consentScope: 'internal_use',
    redactionRequirement: 'Ward citizen ID number, mobile contact, and land ownership details must be redacted.',
    adminNotes: 'Official government correspondence held under internal audit archive only.',
    isPublic: false,
    createdAt: '2026-10-18T11:30:00Z',
  },
  {
    id: 'mct-003',
    titleNe: 'ओखरबोटे स्वास्थ्य शिविर – मोतियाबिन्दु शल्यक्रिया बिरामी पहिचान तस्बिर',
    titleEn: 'Okharbote Health Camp – Cataract Patient Identification & Diagnostic Photo',
    fileUrl: '/media/internal/patient-cataract-screening.jpg',
    mediaType: 'patient_identification',
    status: 'INTERNAL_ONLY',
    hasWrittenConsent: false,
    consentScope: 'internal_use',
    redactionRequirement: 'Patient face blur, hospital admission token, and diagnosis report masking strictly required.',
    adminNotes: 'Medical privacy protected. Never expose patient face or diagnosis without verified written consent.',
    isPublic: false,
    createdAt: '2026-10-20T14:15:00Z',
  },
  {
    id: 'mct-004',
    titleNe: 'बाढीपीडित परिवार खाद्यान्न तथा राहत सामग्री हस्तान्तरण तस्बिर',
    titleEn: 'Flood Relief Food & Shelter Material Handover Distribution Photo',
    fileUrl: '/media/internal/flood-relief-handover-raw.jpg',
    redactedFileUrl: '/media/internal/flood-relief-handover-redacted.jpg',
    mediaType: 'relief_handover',
    status: 'PENDING_REVIEW',
    hasWrittenConsent: true,
    consentDate: '२०८२-०५-०२',
    consentScope: 'redacted_public_use',
    redactionRequirement: 'Beneficiary minor faces and voucher monetary amounts must be obscured before any publication.',
    adminNotes: 'Preliminary field consent gathered by relief team. Pending executive committee review.',
    isPublic: false,
    createdAt: '2026-10-22T09:00:00Z',
  },
  {
    id: 'mct-005',
    titleNe: 'काठमाण्डौं बृहत् रक्तदान कार्यक्रम समूह तस्बिर',
    titleEn: 'Kathmandu Blood Donation Drive General Group Photo',
    fileUrl: '/media/internal/blood-donation-group.jpg',
    mediaType: 'event_photo',
    status: 'DRAFT',
    hasWrittenConsent: false,
    consentScope: 'internal_use',
    redactionRequirement: 'General crowd photo; review required prior to publication.',
    adminNotes: 'Draft event photograph awaiting formal cataloging.',
    isPublic: false,
    createdAt: '2026-10-25T16:00:00Z',
  },
];

export async function getMediaConsentRecords(
  type?: string,
  status?: string,
  includePrivate = true
): Promise<MediaConsentRecord[]> {
  let list = [...mediaConsentStore];

  if (!includePrivate) {
    list = list.filter((m) => m.status === 'APPROVED_PUBLIC' || m.status === 'REDACTED_PUBLIC');
  }

  if (type && type !== 'ALL') {
    list = list.filter((m) => m.mediaType === type);
  }

  if (status && status !== 'ALL') {
    list = list.filter((m) => m.status === status);
  }

  if (!includePrivate) {
    return list.map((m) => ({
      ...m,
      fileUrl: m.status === 'REDACTED_PUBLIC' && m.redactedFileUrl ? m.redactedFileUrl : (m.status === 'REDACTED_PUBLIC' ? '' : m.fileUrl),
      hasWrittenConsent: false,
      consentDate: undefined,
      consentScope: 'internal_use',
      redactionRequirement: '',
      approverName: undefined,
      approvalDate: undefined,
      adminNotes: undefined,
    }));
  }

  return list;
}

export async function getMediaConsentRecordById(
  id: string,
  includePrivate = false
): Promise<MediaConsentRecord | null> {
  const item = mediaConsentStore.find((m) => m.id === id);
  if (!item) return null;

  if (!includePrivate) {
    if (item.status !== 'APPROVED_PUBLIC' && item.status !== 'REDACTED_PUBLIC') {
      return null;
    }
    return {
      ...item,
      fileUrl: item.status === 'REDACTED_PUBLIC' && item.redactedFileUrl ? item.redactedFileUrl : (item.status === 'REDACTED_PUBLIC' ? '' : item.fileUrl),
      hasWrittenConsent: false,
      consentDate: undefined,
      consentScope: 'internal_use',
      redactionRequirement: '',
      approverName: undefined,
      approvalDate: undefined,
      adminNotes: undefined,
    };
  }

  return item;
}

// -------------------------------------------------------------
// 11D. Homepage Hero Eligibility Governance Gate
// -------------------------------------------------------------

export const PROHIBITED_HERO_MEDIA_TYPES = [
  'condolence',
  'bereavement',
  'patient_identification',
  'relief_handover',
  'donation_handover',
  'ward_correspondence',
] as const;

export function validateHeroCandidateEligibility(
  mediaItemId?: string,
  imageUrl?: string,
  altOrTitle?: string
): { eligible: boolean; error?: string } {
  // 1. Check against mediaItemsStore if mediaItemId is provided
  if (mediaItemId) {
    const item = mediaItemsStore.find((m) => m.id === mediaItemId);
    if (item) {
      if (item.isHeroEligible === false) {
        return {
          eligible: false,
          error: `Prohibited hero media: "${item.titleEn || item.id}" is classified as ${item.internalCategory || 'sensitive'} (Sensitive — Internal use only). Homepage hero candidates must be scenic/community landscape or approved public event images with verified consent.`,
        };
      }
      const fname = (item.originalFilename || item.titleEn || item.titleNe || '').toLowerCase();
      if (
        fname.includes('samabedana') ||
        fname.includes('condolence') ||
        fname.includes('wada') ||
        fname.includes('donation') ||
        fname.includes('lingthep') ||
        fname.includes('pradeep') ||
        fname.includes('handover') ||
        fname.includes('patient') ||
        fname.includes('bereavement')
      ) {
        return {
          eligible: false,
          error: `Prohibited hero media: Sensitive media (condolence, bereavement, patient identification, relief handover, donation handover, or ward correspondence) cannot be selected as homepage hero.`,
        };
      }
    }
  }

  // 2. Check against mediaConsentStore (by id or fileUrl)
  const consentItem = mediaConsentStore.find(
    (c) => (mediaItemId && c.id === mediaItemId) || (imageUrl && c.fileUrl === imageUrl)
  );
  if (consentItem) {
    if ((PROHIBITED_HERO_MEDIA_TYPES as readonly string[]).includes(consentItem.mediaType)) {
      return {
        eligible: false,
        error: `Prohibited hero media: Media type '${consentItem.mediaType}' cannot be selected as homepage hero.`,
      };
    }
    if (
      consentItem.mediaType === 'event_photo' &&
      !consentItem.hasWrittenConsent &&
      consentItem.status !== 'APPROVED_PUBLIC'
    ) {
      return {
        eligible: false,
        error: `Prohibited hero media: Event photo requires verified written consent or public approval before selection as homepage hero.`,
      };
    }
  }

  // 3. Check imageUrl and alt/title text against sensitive keywords
  const searchStr = `${imageUrl || ''} ${altOrTitle || ''}`.toLowerCase();
  for (const prohibited of PROHIBITED_HERO_MEDIA_TYPES) {
    const normalizedProhibited = prohibited.replace('_', ' ');
    if (searchStr.includes(prohibited) || searchStr.includes(normalizedProhibited)) {
      return {
        eligible: false,
        error: `Prohibited hero media: Sensitive media (${prohibited}) cannot be selected as homepage hero.`,
      };
    }
  }

  if (
    searchStr.includes('samabedana') ||
    searchStr.includes('समवेदना') ||
    searchStr.includes('condolence') ||
    searchStr.includes('bereavement') ||
    searchStr.includes('शोक') ||
    searchStr.includes('wada') ||
    searchStr.includes('वडा') ||
    searchStr.includes('ward') ||
    searchStr.includes('donation') ||
    searchStr.includes('lingthep') ||
    searchStr.includes('pradeep') ||
    searchStr.includes('handover') ||
    searchStr.includes('हस्तान्तरण') ||
    searchStr.includes('relief') ||
    searchStr.includes('राहत') ||
    searchStr.includes('patient') ||
    searchStr.includes('बिरामी')
  ) {
    return {
      eligible: false,
      error: `Prohibited hero media: Sensitive media (condolence, bereavement, patient identification, relief handover, donation handover, or ward correspondence) cannot be selected as homepage hero.`,
    };
  }

  return { eligible: true };
}

export async function getHeroCandidateMediaItems(): Promise<MediaItem[]> {
  const allMedia = await getMediaItems(undefined, 'IMAGE', true);
  return allMedia.filter((m) => {
    const val = validateHeroCandidateEligibility(m.id, m.fileUrl, m.titleEn);
    return val.eligible;
  });
}

export async function saveMediaConsentRecord(
  data: Partial<MediaConsentRecord> & { id?: string; mediaType: MediaConsentType; titleNe: string }
): Promise<MediaConsentRecord> {
  const isSensitive = SENSITIVE_MEDIA_TYPES.includes(data.mediaType);
  const timestamp = new Date().toISOString();

  let status: MediaConsentStatus = data.status || (isSensitive ? 'INTERNAL_ONLY' : 'DRAFT');

  if (status === 'APPROVED_PUBLIC' || status === 'REDACTED_PUBLIC') {
    const hasConsent = Boolean(data.hasWrittenConsent);
    const hasApprover = Boolean(data.approverName?.trim());
    const hasApprovalDate = Boolean(data.approvalDate?.trim());
    const scope = data.consentScope || 'internal_use';

    const validForApproved =
      hasConsent &&
      hasApprover &&
      hasApprovalDate &&
      scope === 'full_public_use' &&
      data.mediaType !== 'patient_identification';

    const validForRedacted =
      hasConsent &&
      hasApprover &&
      hasApprovalDate &&
      (scope === 'redacted_public_use' || scope === 'full_public_use') &&
      Boolean(data.redactionRequirement?.trim() && data.redactionRequirement !== 'None required');

    if (status === 'APPROVED_PUBLIC' && !validForApproved) {
      status = isSensitive ? 'INTERNAL_ONLY' : 'PENDING_REVIEW';
    } else if (status === 'REDACTED_PUBLIC' && !validForRedacted) {
      status = isSensitive ? 'INTERNAL_ONLY' : 'PENDING_REVIEW';
    }
  }

  const isPublic = status === 'APPROVED_PUBLIC' || status === 'REDACTED_PUBLIC';

  if (data.id) {
    const idx = mediaConsentStore.findIndex((m) => m.id === data.id);
    if (idx !== -1) {
      const existing = mediaConsentStore[idx];
      mediaConsentStore[idx] = {
        ...existing,
        ...data,
        status,
        isPublic,
        updatedAt: timestamp,
      };
      return mediaConsentStore[idx];
    }
  }

  const newRecord: MediaConsentRecord = {
    id: data.id || `mct-${Date.now()}`,
    titleNe: data.titleNe,
    titleEn: data.titleEn || data.titleNe,
    fileUrl: data.fileUrl || '',
    redactedFileUrl: data.redactedFileUrl,
    mediaType: data.mediaType,
    status,
    hasWrittenConsent: Boolean(data.hasWrittenConsent),
    consentDate: data.consentDate,
    consentScope: data.consentScope || 'internal_use',
    redactionRequirement: data.redactionRequirement || (isSensitive ? 'Redaction required for sensitive data' : 'None required'),
    approverName: data.approverName,
    approvalDate: data.approvalDate,
    adminNotes: data.adminNotes,
    isPublic,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  mediaConsentStore.unshift(newRecord);
  return newRecord;
}

export async function approveMediaConsentPublication(
  id: string,
  approverName: string,
  targetStatus: 'APPROVED_PUBLIC' | 'REDACTED_PUBLIC',
  approvalNotes?: string,
  redactedFileUrl?: string
): Promise<{ success: boolean; data?: MediaConsentRecord; error?: string }> {
  const idx = mediaConsentStore.findIndex((m) => m.id === id);
  if (idx === -1) {
    return { success: false, error: 'मिडिया रेकर्ड फेला परेन।' };
  }

  const record = mediaConsentStore[idx];

  if (!approverName?.trim()) {
    return { success: false, error: 'स्वीकृति दिन आधिकारिक पदाधिकारीको नाम अनिवार्य छ।' };
  }

  if (!record.hasWrittenConsent) {
    return {
      success: false,
      error: `प्रकाशन अस्वीकृत: ${record.mediaType} प्रकारको मिडियाका लागि लिखित सहमति (Written consent) अनिवार्य छ।`,
    };
  }

  if (targetStatus === 'APPROVED_PUBLIC') {
    if (record.consentScope !== 'full_public_use') {
      return {
        success: false,
        error: 'सार्वजनिक स्वीकृतिका लागि सहमतिको दायरा पूर्ण सार्वजनिक (full_public_use) हुनुपर्दछ।',
      };
    }
    if (record.mediaType === 'patient_identification') {
      return {
        success: false,
        error: 'बिरामी पहिचान (patient_identification) केवल सम्पादित/गोप्य (REDACTED_PUBLIC) रूपमा मात्र सीमित प्रकाशन गर्न सकिन्छ।',
      };
    }
  }

  if (targetStatus === 'REDACTED_PUBLIC') {
    if (record.consentScope === 'internal_use') {
      return {
        success: false,
        error: 'आन्तरिक प्रयोग (internal_use) मात्र दायरा भएको मिडिया सम्पादित रूपमा पनि सार्वजनिक गर्न मिल्दैन।',
      };
    }
    if (!record.redactionRequirement || record.redactionRequirement === 'None required') {
      return {
        success: false,
        error: 'सम्पादित प्रकाशनका लागि गोपनीयता आवश्यकता (Redaction requirement) निर्दिष्ट हुनुपर्छ।',
      };
    }
  }

  const timestamp = new Date().toISOString();
  record.status = targetStatus;
  record.isPublic = true;
  record.approverName = approverName;
  record.approvalDate = timestamp;
  if (redactedFileUrl) {
    record.redactedFileUrl = redactedFileUrl;
  }
  if (approvalNotes) {
    record.adminNotes = `${record.adminNotes || ''}\n[Approved ${targetStatus} by ${approverName} at ${timestamp}]: ${approvalNotes}`;
  }
  record.updatedAt = timestamp;

  return { success: true, data: record };
}

export async function deleteMediaConsentRecord(id: string): Promise<boolean> {
  mediaConsentStore = mediaConsentStore.filter((m) => m.id !== id);
  return true;
}

// -------------------------------------------------------------
// 11D. Internal Financial Transparency Checklist & Publication Workflow
// -------------------------------------------------------------

export interface FinancialEvidenceValidationResult {
  valid: boolean;
  error?: string;
}

export function validateMinimumFinancialEvidence(
  recordType: FinancialRecordType,
  evidence?: FinancialSupportingEvidence,
  verification?: FinancialEvidenceVerification
): FinancialEvidenceValidationResult {
  if (!evidence || !verification) {
    return {
      valid: false,
      error: 'प्रमाणीकरण अपुग: लेखा प्रमाण तथा प्रमाणीकरण सूची विवरण प्राप्त भएन।',
    };
  }

  const hasMinute = Boolean(evidence.approvalMinuteRef?.trim() && verification.approvalMinuteVerified);
  const hasVoucher = Boolean(evidence.voucherRef?.trim() && verification.voucherVerified);
  const hasReceipt = Boolean(evidence.receiptRef?.trim() && verification.receiptVerified);
  const hasBankStatement = Boolean(evidence.bankStatementRef?.trim() && verification.bankStatementVerified);
  const hasAuditReport = Boolean(evidence.auditReportRef?.trim() && verification.auditReportVerified);
  const hasInvoice = Boolean(evidence.invoiceRef?.trim() && verification.invoiceVerified);
  const hasSignedStatement = Boolean(
    (evidence.signedStatementRef?.trim() && verification.signedStatementVerified) ||
    (evidence.auditReportRef?.trim() && verification.auditReportVerified)
  );

  // Requirement: Every single record type strictly requires verified approval minute
  if (!hasMinute) {
    return {
      valid: false,
      error: `प्रमाणीकरण अपुग (${recordType}): संस्थाको प्रमाणित निर्णय पुस्तिका (Verified Approval Minute) अनिवार्य छ।`,
    };
  }

  switch (recordType) {
    case 'RELIEF_FUND_EXPENDITURE':
      if (!hasVoucher && !hasReceipt) {
        return {
          valid: false,
          error: 'प्रमाणीकरण अपुग (राहत कोष खर्च): प्रमाणित भौचर वा रसिद (Verified voucher or receipt) र निर्णय पुस्तिका दुवै अनिवार्य छ।',
        };
      }
      break;

    case 'ACTIVITY_EXPENSE':
      if (!hasVoucher && !hasReceipt) {
        return {
          valid: false,
          error: 'प्रमाणीकरण अपुग (गतिविधि खर्च): प्रमाणित भौचर वा रसिद (Verified voucher or receipt) र निर्णय पुस्तिका दुवै अनिवार्य छ।',
        };
      }
      break;

    case 'AUDIT_REPORT':
      if (!hasAuditReport) {
        return {
          valid: false,
          error: 'प्रमाणीकरण अपुग (लेखापरीक्षण प्रतिवेदन): प्रमाणित हस्ताक्षरसहितको अडिट प्रतिवेदन (Signed audit report) र निर्णय पुस्तिका दुवै अनिवार्य छ।',
        };
      }
      break;

    case 'ANNUAL_FINANCIAL_STATEMENT':
      if (!hasSignedStatement) {
        return {
          valid: false,
          error: 'प्रमाणीकरण अपुग (वार्षिक वित्तीय विवरण): प्रमाणित हस्ताक्षरसहितको वित्तीय विवरण (Signed statement) र निर्णय पुस्तिका दुवै अनिवार्य छ।',
        };
      }
      break;

    case 'RELIEF_FUND_CONTRIBUTION':
      if (!hasBankStatement && !hasReceipt) {
        return {
          valid: false,
          error: 'प्रमाणीकरण अपुग (राहत कोष योगदान): प्रमाणित बैंक स्टेटमेन्ट वा रसिद (Bank statement or receipt) र निर्णय पुस्तिका दुवै अनिवार्य छ।',
        };
      }
      break;

    case 'OTHER_FINANCIAL_DOCUMENT':
      const hasAnyDoc = hasVoucher || hasReceipt || hasBankStatement || hasAuditReport || hasInvoice || hasSignedStatement;
      if (!hasAnyDoc) {
        return {
          valid: false,
          error: 'प्रमाणीकरण अपुग (अन्य वित्तीय कागजात): कम्तीमा एक प्रमाणित सहायक कागजात र निर्णय पुस्तिका दुवै अनिवार्य छ।',
        };
      }
      break;
  }

  return { valid: true };
}

export function hasVerifiedFinancialEvidence(
  evidence?: FinancialSupportingEvidence,
  verification?: FinancialEvidenceVerification,
  recordType?: FinancialRecordType
): boolean {
  if (!evidence || !verification) return false;
  if (recordType) {
    return validateMinimumFinancialEvidence(recordType, evidence, verification).valid;
  }
  return Boolean(
    (evidence.bankStatementRef?.trim() && verification.bankStatementVerified) ||
    (evidence.voucherRef?.trim() && verification.voucherVerified) ||
    (evidence.invoiceRef?.trim() && verification.invoiceVerified) ||
    (evidence.receiptRef?.trim() && verification.receiptVerified) ||
    (evidence.approvalMinuteRef?.trim() && verification.approvalMinuteVerified) ||
    (evidence.auditReportRef?.trim() && verification.auditReportVerified) ||
    (evidence.signedStatementRef?.trim() && verification.signedStatementVerified)
  );
}

let financialTransparencyStore: FinancialTransparencyRecord[] = [
  {
    id: 'fin-rec-001',
    recordType: 'RELIEF_FUND_CONTRIBUTION',
    amount: 50000,
    currency: 'NPR',
    transactionDate: '२०८२-०४-२५',
    payerPayeeCategory: 'COMMUNITY_MEMBER',
    supportingEvidence: {
      bankStatementRef: 'TXN-BANK-89211',
      receiptRef: 'REC-RELIEF-001',
    },
    evidenceVerification: {
      bankStatementVerified: true,
      receiptVerified: true,
      voucherVerified: false,
      invoiceVerified: false,
      approvalMinuteVerified: false,
      auditReportVerified: false,
    },
    status: 'DRAFT',
    publicSummary: {
      descriptionNe: 'मादी बाढीपहिरो राहत कोषका लागि प्राप्त सामुदायिक सहयोग',
      descriptionEn: 'Community relief contribution for Madi flood victims fund',
      isAmountVisible: true,
    },
    adminNotes: 'Anonymous community donor contribution deposit verified in institutional account.',
    isPublic: false,
    createdAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 'fin-rec-002',
    recordType: 'RELIEF_FUND_EXPENDITURE',
    amount: 75000,
    currency: 'NPR',
    transactionDate: '२०८२-०५-०१',
    payerPayeeCategory: 'VENDOR',
    supportingEvidence: {
      voucherRef: 'VOUCH-RELIEF-012',
      invoiceRef: 'INV-SUPPLY-901',
      approvalMinuteRef: 'MIN-EXEC-15',
    },
    evidenceVerification: {
      voucherVerified: true,
      invoiceVerified: true,
      approvalMinuteVerified: true,
      bankStatementVerified: false,
      receiptVerified: false,
      auditReportVerified: false,
    },
    status: 'INTERNAL_ONLY',
    publicSummary: {
      descriptionNe: 'बाढीपीडित परिवारहरूका लागि खाद्यान्न तथा त्रिपाल खरिद',
      descriptionEn: 'Procurement of emergency dry rations and tarpaulins for flood-affected families',
      isAmountVisible: true,
    },
    adminNotes: 'Relief distribution logistics purchase voucher and tax invoice verified.',
    isPublic: false,
    createdAt: '2026-08-17T11:30:00Z',
  },
  {
    id: 'fin-rec-003',
    recordType: 'ACTIVITY_EXPENSE',
    amount: 42000,
    currency: 'NPR',
    transactionDate: '२०८२-०५-१२',
    payerPayeeCategory: 'SERVICE_PROVIDER',
    supportingEvidence: {
      voucherRef: 'VOUCH-MED-044',
      invoiceRef: 'INV-PHARM-311',
    },
    evidenceVerification: {
      voucherVerified: false,
      invoiceVerified: false,
      bankStatementVerified: false,
      receiptVerified: false,
      approvalMinuteVerified: false,
      auditReportVerified: false,
    },
    status: 'DRAFT',
    publicSummary: {
      descriptionNe: 'निःशुल्क स्वास्थ्य शिविर औषधि व्यवस्थापन खर्च',
      descriptionEn: 'Free medical camp pharmaceutical support expenses',
      isAmountVisible: false,
    },
    adminNotes: 'Preliminary bills submitted by field team. Pending voucher audit.',
    isPublic: false,
    createdAt: '2026-08-28T14:15:00Z',
  },
  {
    id: 'fin-rec-004',
    recordType: 'AUDIT_REPORT',
    amount: 0,
    currency: 'NPR',
    transactionDate: '२०८२-०४-२१',
    payerPayeeCategory: 'INSTITUTIONAL_DONOR',
    supportingEvidence: {
      auditReportRef: 'AUDIT-FY2081-82-DRAFT.pdf',
      approvalMinuteRef: 'MIN-AGM-01',
    },
    evidenceVerification: {
      auditReportVerified: false,
      approvalMinuteVerified: false,
      bankStatementVerified: false,
      voucherVerified: false,
      invoiceVerified: false,
      receiptVerified: false,
    },
    status: 'INTERNAL_ONLY',
    publicSummary: {
      descriptionNe: 'आर्थिक वर्ष २०८१/८२ को स्वतन्त्र लेखापरीक्षकको प्रतिवेदन',
      descriptionEn: 'Independent Auditor Report for Fiscal Year 2081/82',
      isAmountVisible: false,
    },
    adminNotes: 'Draft statutory audit under review by registered auditor and treasurer.',
    isPublic: false,
    createdAt: '2026-08-06T09:00:00Z',
  },
  {
    id: 'fin-rec-005',
    recordType: 'ANNUAL_FINANCIAL_STATEMENT',
    amount: 350000,
    currency: 'NPR',
    transactionDate: '२०८२-०४-२१',
    payerPayeeCategory: 'GOVERNMENT_BODY',
    supportingEvidence: {
      approvalMinuteRef: 'MIN-EXEC-14',
    },
    evidenceVerification: {
      approvalMinuteVerified: true,
      bankStatementVerified: false,
      voucherVerified: false,
      invoiceVerified: false,
      receiptVerified: false,
      auditReportVerified: false,
    },
    status: 'DRAFT',
    publicSummary: {
      descriptionNe: 'वार्षिक आय–व्यय तथा आर्थिक विवरण',
      descriptionEn: 'Annual Income, Expenditure and Financial Summary',
      isAmountVisible: true,
    },
    adminNotes: 'Draft statement prepared for general assembly presentation.',
    isPublic: false,
    createdAt: '2026-08-06T16:00:00Z',
  },
];

export async function getFinancialTransparencyRecords(
  type?: string,
  status?: string,
  includePrivate = true
): Promise<FinancialTransparencyRecord[]> {
  let list = [...financialTransparencyStore];

  if (!includePrivate) {
    list = list.filter((r) => r.status === 'APPROVED_PUBLIC' && r.isPublic === true);
  }

  if (type && type !== 'ALL') {
    list = list.filter((r) => r.recordType === type);
  }

  if (status && status !== 'ALL') {
    list = list.filter((r) => r.status === status);
  }

  if (!includePrivate) {
    return list.map((r) => ({
      id: r.id,
      recordType: r.recordType,
      amount: r.publicSummary?.isAmountVisible ? r.amount : 0,
      currency: r.currency,
      transactionDate: r.transactionDate,
      payerPayeeCategory: undefined as any,
      supportingEvidence: {} as any,
      evidenceVerification: {} as any,
      status: 'APPROVED_PUBLIC',
      publicSummary: {
        descriptionNe: r.publicSummary?.descriptionNe || '',
        descriptionEn: r.publicSummary?.descriptionEn || '',
        isAmountVisible: Boolean(r.publicSummary?.isAmountVisible),
        approvedDocumentUrl: r.publicSummary?.approvedDocumentUrl,
      },
      reviewedByTreasurerName: undefined,
      reviewedByTreasurerAt: undefined,
      treasurerNotes: undefined,
      approvedByPresidentName: undefined,
      approvedByPresidentAt: undefined,
      presidentNotes: undefined,
      adminNotes: undefined,
      isPublic: true,
      createdAt: r.createdAt,
    }));
  }

  return list;
}

export async function getFinancialRecordById(
  id: string,
  includePrivate = false
): Promise<FinancialTransparencyRecord | null> {
  const item = financialTransparencyStore.find((r) => r.id === id);
  if (!item) return null;

  if (!includePrivate) {
    if (item.status !== 'APPROVED_PUBLIC' || item.isPublic !== true) {
      return null;
    }
    return {
      id: item.id,
      recordType: item.recordType,
      amount: item.publicSummary?.isAmountVisible ? item.amount : 0,
      currency: item.currency,
      transactionDate: item.transactionDate,
      payerPayeeCategory: undefined as any,
      supportingEvidence: {} as any,
      evidenceVerification: {} as any,
      status: 'APPROVED_PUBLIC',
      publicSummary: {
        descriptionNe: item.publicSummary?.descriptionNe || '',
        descriptionEn: item.publicSummary?.descriptionEn || '',
        isAmountVisible: Boolean(item.publicSummary?.isAmountVisible),
        approvedDocumentUrl: item.publicSummary?.approvedDocumentUrl,
      },
      reviewedByTreasurerName: undefined,
      reviewedByTreasurerAt: undefined,
      treasurerNotes: undefined,
      approvedByPresidentName: undefined,
      approvedByPresidentAt: undefined,
      presidentNotes: undefined,
      adminNotes: undefined,
      isPublic: true,
      createdAt: item.createdAt,
    };
  }

  return item;
}

export async function saveFinancialTransparencyRecord(
  data: Partial<FinancialTransparencyRecord> & { recordType: FinancialRecordType; amount: number }
): Promise<FinancialTransparencyRecord> {
  const timestamp = new Date().toISOString();

  let status: FinancialPublicationStatus = data.status || 'DRAFT';

  const hasEvidence = validateMinimumFinancialEvidence(data.recordType, data.supportingEvidence, data.evidenceVerification).valid;
  const hasTreasurer = Boolean(data.reviewedByTreasurerName?.trim());
  const hasPresident = Boolean(data.approvedByPresidentName?.trim());

  if (status === 'APPROVED_PUBLIC') {
    if (!hasEvidence || !hasTreasurer || !hasPresident) {
      status = hasTreasurer ? 'PENDING_PRESIDENT_APPROVAL' : 'DRAFT';
    }
  } else if (status === 'PENDING_PRESIDENT_APPROVAL') {
    if (!hasEvidence || !hasTreasurer) {
      status = 'PENDING_TREASURER_REVIEW';
    }
  }

  const isPublic = status === 'APPROVED_PUBLIC';

  if (data.id) {
    const idx = financialTransparencyStore.findIndex((r) => r.id === data.id);
    if (idx !== -1) {
      const existing = financialTransparencyStore[idx];
      financialTransparencyStore[idx] = {
        ...existing,
        ...data,
        status,
        isPublic,
        updatedAt: timestamp,
      };
      return financialTransparencyStore[idx];
    }
  }

  const newRecord: FinancialTransparencyRecord = {
    id: data.id || `fin-${Date.now()}`,
    recordType: data.recordType,
    amount: Number(data.amount) || 0,
    currency: data.currency || 'NPR',
    transactionDate: data.transactionDate || '२०८२-०४-२१',
    payerPayeeCategory: data.payerPayeeCategory || 'COMMUNITY_MEMBER',
    supportingEvidence: {
      bankStatementRef: data.supportingEvidence?.bankStatementRef || '',
      voucherRef: data.supportingEvidence?.voucherRef || '',
      invoiceRef: data.supportingEvidence?.invoiceRef || '',
      receiptRef: data.supportingEvidence?.receiptRef || '',
      approvalMinuteRef: data.supportingEvidence?.approvalMinuteRef || '',
      auditReportRef: data.supportingEvidence?.auditReportRef || '',
    },
    evidenceVerification: {
      bankStatementVerified: Boolean(data.evidenceVerification?.bankStatementVerified),
      voucherVerified: Boolean(data.evidenceVerification?.voucherVerified),
      invoiceVerified: Boolean(data.evidenceVerification?.invoiceVerified),
      receiptVerified: Boolean(data.evidenceVerification?.receiptVerified),
      approvalMinuteVerified: Boolean(data.evidenceVerification?.approvalMinuteVerified),
      auditReportVerified: Boolean(data.evidenceVerification?.auditReportVerified),
    },
    status,
    publicSummary: {
      descriptionNe: data.publicSummary?.descriptionNe || '',
      descriptionEn: data.publicSummary?.descriptionEn || '',
      isAmountVisible: data.publicSummary?.isAmountVisible !== undefined ? data.publicSummary.isAmountVisible : true,
      approvedDocumentUrl: data.publicSummary?.approvedDocumentUrl,
    },
    adminNotes: data.adminNotes,
    reviewedByTreasurerName: data.reviewedByTreasurerName,
    reviewedByTreasurerAt: data.reviewedByTreasurerAt,
    treasurerNotes: data.treasurerNotes,
    approvedByPresidentName: data.approvedByPresidentName,
    approvedByPresidentAt: data.approvedByPresidentAt,
    presidentNotes: data.presidentNotes,
    isPublic,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  financialTransparencyStore.unshift(newRecord);
  return newRecord;
}

export async function advanceFinancialWorkflow(
  id: string,
  targetStatus: FinancialPublicationStatus,
  actorName: string,
  actorNotes?: string
): Promise<{ success: boolean; data?: FinancialTransparencyRecord; error?: string }> {
  const idx = financialTransparencyStore.findIndex((r) => r.id === id);
  if (idx === -1) {
    return { success: false, error: 'आर्थिक रेकर्ड फेला परेन।' };
  }

  const record = financialTransparencyStore[idx];
  const timestamp = new Date().toISOString();

  if (targetStatus === 'PENDING_TREASURER_REVIEW') {
    const hasAnyRef = Boolean(
      record.supportingEvidence?.bankStatementRef?.trim() ||
      record.supportingEvidence?.voucherRef?.trim() ||
      record.supportingEvidence?.invoiceRef?.trim() ||
      record.supportingEvidence?.receiptRef?.trim() ||
      record.supportingEvidence?.approvalMinuteRef?.trim() ||
      record.supportingEvidence?.auditReportRef?.trim()
    );
    if (!hasAnyRef) {
      return {
        success: false,
        error: 'कोषाध्यक्ष समीक्षामा पठाउन कम्तीमा एक प्रमाण सन्दर्भ (Evidence reference) हुनु अनिवार्य छ।',
      };
    }
    record.status = 'PENDING_TREASURER_REVIEW';
    if (actorNotes) {
      record.adminNotes = `${record.adminNotes || ''}\n[Sent to Treasurer Review by ${actorName} at ${timestamp}]: ${actorNotes}`;
    }
  } else if (targetStatus === 'PENDING_PRESIDENT_APPROVAL') {
    if (!actorName?.trim()) {
      return { success: false, error: 'कोषाध्यक्ष परीक्षणका लागि आधिकारिक नाम आवश्यक छ।' };
    }

    const validation = validateMinimumFinancialEvidence(
      record.recordType,
      record.supportingEvidence,
      record.evidenceVerification
    );
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'प्रमाणीकरण अपुग: आवश्यक न्यूनतम लेखा प्रमाण अपूरो छ।',
      };
    }

    record.reviewedByTreasurerName = actorName;
    record.reviewedByTreasurerAt = timestamp;
    record.treasurerNotes = actorNotes || 'Verified financial evidence';
    record.status = 'PENDING_PRESIDENT_APPROVAL';
    if (actorNotes) {
      record.adminNotes = `${record.adminNotes || ''}\n[Treasurer Review Completed by ${actorName} at ${timestamp}]: ${actorNotes}`;
    }
  } else if (targetStatus === 'APPROVED_PUBLIC') {
    if (!record.reviewedByTreasurerName) {
      return {
        success: false,
        error: 'कार्यप्रवाह त्रुटि: सार्वजनिक प्रकाशन अघि कोषाध्यक्षबाट परीक्षण (Treasurer Review) सम्पन्न भएको हुनुपर्दछ।',
      };
    }

    const validation = validateMinimumFinancialEvidence(
      record.recordType,
      record.supportingEvidence,
      record.evidenceVerification
    );
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'प्रकाशन अस्वीकृत: आवश्यक न्यूनतम लेखा प्रमाण अपूरो छ।',
      };
    }

    if (!actorName?.trim()) {
      return {
        success: false,
        error: 'सार्वजनिक प्रकाशनका लागि संस्थाको अध्यक्षको अन्तिम स्वीकृति अनिवार्य छ।',
      };
    }

    if (!record.publicSummary?.descriptionNe?.trim()) {
      return {
        success: false,
        error: 'सार्वजनिक प्रकाशनका लागि स्वीकृत सार्वजनिक-सुरक्षित विवरण (Public-safe description) अनिवार्य छ।',
      };
    }

    record.approvedByPresidentName = actorName;
    record.approvedByPresidentAt = timestamp;
    record.presidentNotes = actorNotes || 'Approved for public release';
    record.status = 'APPROVED_PUBLIC';
    record.isPublic = true;
    if (actorNotes) {
      record.adminNotes = `${record.adminNotes || ''}\n[Approved Public by President ${actorName} at ${timestamp}]: ${actorNotes}`;
    }
  } else if (targetStatus === 'INTERNAL_ONLY' || targetStatus === 'DRAFT') {
    record.status = targetStatus;
    record.isPublic = false;
    if (actorNotes) {
      record.adminNotes = `${record.adminNotes || ''}\n[Status set to ${targetStatus} by ${actorName} at ${timestamp}]: ${actorNotes}`;
    }
  }

  record.updatedAt = timestamp;
  return { success: true, data: record };
}

export async function deleteFinancialTransparencyRecord(id: string): Promise<boolean> {
  financialTransparencyStore = financialTransparencyStore.filter((r) => r.id !== id);
  return true;
}

// ==========================================
// Public Document Library Governance System
// ==========================================

export function validateLocalDocumentPath(filePath: string): {
  valid: boolean;
  error?: string;
  cleanPath?: string;
} {
  if (!filePath || typeof filePath !== 'string' || !filePath.trim()) {
    return { valid: false, error: 'कागजात फाइल मार्ग (File path) अनिवार्य छ।' };
  }
  const trimmed = filePath.trim();

  // Reject external URLs, remote protocols, and data URIs
  if (/^(https?:|\/\/|data:|blob:|file:|ftp:)/i.test(trimmed)) {
    return {
      valid: false,
      error:
        'बाह्य URL, डेटा URI वा रिमोट लिंक प्रयोग गर्न पाइँदैन। स्थानीय फाइल मात्र मान्य छ। (External URLs and data URIs are strictly prohibited)',
    };
  }

  // Reject path traversal attacks
  if (trimmed.includes('..') || trimmed.includes('\\..') || trimmed.includes('/..')) {
    return {
      valid: false,
      error: 'अमान्य फाइल मार्ग (Path traversal is prohibited)',
    };
  }

  // Check placeholder file patterns
  const lower = trimmed.toLowerCase();
  if (
    lower.includes('placeholder') ||
    lower.includes('sample') ||
    lower.includes('dummy') ||
    lower.includes('temp') ||
    (lower.includes('draft') && !lower.includes('redacted'))
  ) {
    return {
      valid: false,
      error:
        'प्रारम्भिक वा प्लेसहोल्डर फाइल सार्वजनिक प्रकाशनका लागि अमान्य छ। (Placeholder or draft files cannot be published)',
    };
  }

  // Normalize path to start with /
  let normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (normalized.startsWith('/public/')) {
    normalized = normalized.replace('/public/', '/');
  }

  // Check approved directories: /documents/ or /media/
  const isApprovedDir = normalized.startsWith('/documents/') || normalized.startsWith('/media/');
  if (!isApprovedDir) {
    return {
      valid: false,
      error: 'फाइल मार्ग स्वीकृत स्थानीय निर्देशिका (/documents/ वा /media/) भित्र हुनुपर्छ।',
    };
  }

  return { valid: true, cleanPath: normalized };
}

export function checkLocalDocumentExists(filePath: string): boolean {
  const pathValidation = validateLocalDocumentPath(filePath);
  if (!pathValidation.valid || !pathValidation.cleanPath) return false;

  try {
    const cleanRel = pathValidation.cleanPath.replace(/^\/+/, '');
    const absolutePath = path.join(process.cwd(), 'public', cleanRel);
    return fs.existsSync(absolutePath);
  } catch {
    return false;
  }
}

export function validateDocumentForPublication(doc: Partial<PublicDocument>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!doc.filePath) {
    errors.push('फाइल मार्ग अनिवार्य छ।');
  } else {
    const pathCheck = validateLocalDocumentPath(doc.filePath);
    if (!pathCheck.valid) {
      errors.push(pathCheck.error || 'अमान्य फाइल मार्ग।');
    }
  }

  if (!doc.hasSignedStampedPdf) {
    errors.push('अन्तिम हस्ताक्षर तथा छाप भएको (Signed/Stamped) PDF अनिवार्य छ।');
  }

  if (!doc.isApprovedForPublic) {
    errors.push('सार्वजनिक प्रकाशनका लागि कार्यसमिति/अध्यक्षको स्वीकृति अनिवार्य छ।');
  }

  if (doc.filePath && !checkLocalDocumentExists(doc.filePath)) {
    errors.push('कागजात फाइल स्थानीय सर्भरमा फेला परेन (Missing file)। केवल वास्तविक स्थानीय फाइल मात्र प्रकाशन गर्न सकिन्छ।');
  }

  if (!doc.titleNe?.trim() || !doc.titleEn?.trim()) {
    errors.push('कागजातको शीर्षक (नेपाली र अंग्रेजी) अनिवार्य छ।');
  }

  if (!doc.descriptionNe?.trim() || !doc.descriptionEn?.trim()) {
    errors.push('सार्वजनिक विवरण (नेपाली र अंग्रेजी) अनिवार्य छ।');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

let publicDocumentStore: PublicDocument[] = [
  {
    id: 'doc-audit-2081-82',
    titleNe: 'आर्थिक वर्ष २०८१/८२ को अन्तिम लेखापरीक्षण प्रतिवेदन',
    titleEn: 'Annual Independent Audit Report FY 2081/82',
    documentType: 'AUDIT_REPORT',
    filePath: '/documents/audit-report-2081-82.pdf',
    status: 'INTERNAL_ONLY',
    hasSignedStampedPdf: false,
    isApprovedForPublic: false,
    descriptionNe: 'संस्थाको आ.व. २०८१/८२ को आधिकारिक लेखापरीक्षण विवरण।',
    descriptionEn: 'Statutory independent audit report of the society for FY 2081/82.',
    publicationDate: '२०८२-०५-१०',
    adminNotes: 'अन्तिम हस्ताक्षर भएको सक्कल अडिट प्रति आन्तरिक अभिलेखमा प्रमाणिकरणको प्रक्रियामा छ।',
    isPublic: false,
    createdAt: '2026-11-04T08:00:00Z',
  },
  {
    id: 'doc-progress-2081-82',
    titleNe: 'वार्षिक कार्यप्रगति तथा सामाजिक प्रभाव समीक्षा पुस्तिका २०८१/८२',
    titleEn: 'Annual Progress & Community Welfare Review FY 2081/82',
    documentType: 'ANNUAL_PROGRESS_REPORT',
    filePath: '/documents/annual-progress-book-2081.pdf',
    status: 'DRAFT',
    hasSignedStampedPdf: false,
    isApprovedForPublic: false,
    descriptionNe: 'संस्थाले सञ्चालन गरेका राहत, स्वास्थ्य तथा सामुदायिक गतिविधिहरूको वार्षिक समीक्षा।',
    descriptionEn: 'Annual review of relief, healthcare, and community activities conducted by the society.',
    publicationDate: '२०८२-०६-०१',
    adminNotes: 'मस्यौदा समीक्षा जारी; साधारण सभामा अनुमोदन पश्चात मात्र प्रमाणीकरण गरिने।',
    isPublic: false,
    createdAt: '2026-11-04T08:05:00Z',
  },
  {
    id: 'doc-disaster-policy-2082',
    titleNe: 'प्राकृतिक विपद् तथा आपतकालीन राहत कोष सञ्चालन कार्यविधि २०८२',
    titleEn: 'Disaster Relief Fund Operational Policy & Guideline 2082',
    documentType: 'DISASTER_FUND_POLICY',
    filePath: '/documents/disaster-fund-policy-2082.pdf',
    status: 'INTERNAL_ONLY',
    hasSignedStampedPdf: false,
    isApprovedForPublic: false,
    descriptionNe: 'बाढी, पहिरो तथा दैवी प्रकोपका समयमा राहत वितरणलाई पारदर्शी र व्यवस्थित बनाउने नीति।',
    descriptionEn: 'Policy framework ensuring transparent allocation of emergency disaster relief funds.',
    publicationDate: '२०८२-०६-१५',
    adminNotes: 'कार्यसमितिबाट छलफल भई कानुनी सल्लाहकारसँग परामर्शको क्रममा।',
    isPublic: false,
    createdAt: '2026-11-04T08:10:00Z',
  },
  {
    id: 'doc-const-draft-2082',
    titleNe: 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौंको विधान २०८२ (सन्दर्भ मस्यौदा)',
    titleEn: 'Constitution of Madi (Sankhuwasabha) Sarokar Samaj 2082 (Reference Draft)',
    documentType: 'CONSTITUTION',
    filePath: '/documents/madi-sss-constitution-2082.pdf',
    status: 'DRAFT',
    hasSignedStampedPdf: false,
    isApprovedForPublic: false,
    descriptionNe: 'जिल्ला प्रशासन कार्यालय, काठमाण्डौंमा दर्ता प्रक्रियाको प्रारम्भिक विधान मस्यौदा प्रतिलिपि।',
    descriptionEn: 'Statutory constitution draft submitted during registration proceedings.',
    publicationDate: '२०८२-०६-२९',
    adminNotes: 'सक्कल छाप भएको आधिकारिक प्रति स्क्यान गरी प्रमाणीकरण नभएसम्म सार्वजनिक नगर्ने।',
    isPublic: false,
    createdAt: '2026-11-04T08:15:00Z',
  },
  {
    id: 'doc-cert-cdo-2082',
    titleNe: 'जिल्ला प्रशासन कार्यालय, काठमाण्डौं दर्ता प्रमाणपत्र (दर्ता नं. १६)',
    titleEn: 'District Administration Office, Kathmandu Registration Certificate (Reg. No. 16)',
    documentType: 'REGISTRATION_CERTIFICATE',
    filePath: '/documents/cdo-registration-certificate-redacted.jpeg',
    status: 'INTERNAL_ONLY',
    hasSignedStampedPdf: false,
    isApprovedForPublic: false,
    descriptionNe: 'वि.सं. २०८२ मा संस्था विधिवत दर्ता भएको आधिकारिक प्रमाणपत्र (दर्ता नं. १६)।',
    descriptionEn: 'Official statutory registration certificate issued by DAO Kathmandu (Registration No. 16).',
    publicationDate: '२०८२-०४-२१',
    adminNotes: 'सक्कल दर्ता प्रमाणपत्र आन्तरिक अभिलेखमा सुरक्षित। सार्वजनिक रूपमा केवल प्रमाणीकरण पश्चात मात्र प्रकाशन गरिने।',
    isPublic: false,
    createdAt: '2026-11-04T08:20:00Z',
  },
];

function sanitizePublicDocument(doc: PublicDocument): PublicDocument {
  const {
    adminNotes,
    reviewedByTreasurerName,
    reviewedByTreasurerAt,
    approvedByPresidentName,
    approvedByPresidentAt,
    internalReviewNotes,
    createdAt,
    updatedAt,
    ...rest
  } = doc;
  return rest as unknown as PublicDocument;
}

export async function getPublicDocuments(
  type?: DocumentLibraryType | string,
  status?: DocumentPublicationStatus | string,
  includePrivate = true
): Promise<PublicDocument[]> {
  let list = [...publicDocumentStore];

  if (!includePrivate) {
    list = list.filter((d) => {
      if (d.status !== 'APPROVED_PUBLIC') return false;
      if (d.isApprovedForPublic !== true) return false;
      if (d.hasSignedStampedPdf !== true) return false;
      // Missing-file protection: ensure physical local file exists
      if (!checkLocalDocumentExists(d.filePath)) return false;
      return true;
    });
  } else if (status) {
    list = list.filter((d) => d.status === status);
  }

  if (type && type !== 'ALL') {
    list = list.filter((d) => d.documentType === type);
  }

  if (!includePrivate) {
    return list.map((d) => sanitizePublicDocument(d));
  }

  return list;
}

export async function getPublicDocumentById(
  id: string,
  includePrivate = true
): Promise<PublicDocument | null> {
  const doc = publicDocumentStore.find((d) => d.id === id);
  if (!doc) return null;

  if (!includePrivate) {
    if (
      doc.status !== 'APPROVED_PUBLIC' ||
      doc.isApprovedForPublic !== true ||
      doc.hasSignedStampedPdf !== true ||
      !checkLocalDocumentExists(doc.filePath)
    ) {
      return null;
    }
    return sanitizePublicDocument(doc);
  }

  return doc;
}

export async function savePublicDocument(
  data: Partial<PublicDocument> & {
    titleNe: string;
    titleEn: string;
    documentType: DocumentLibraryType;
    filePath: string;
  }
): Promise<{ success: boolean; data?: PublicDocument; error?: string }> {
  const pathValidation = validateLocalDocumentPath(data.filePath);
  if (!pathValidation.valid) {
    return { success: false, error: pathValidation.error };
  }

  const timestamp = new Date().toISOString();
  let status: DocumentPublicationStatus = data.status || 'DRAFT';
  let hasSignedStampedPdf = Boolean(data.hasSignedStampedPdf);
  let isApprovedForPublic = Boolean(data.isApprovedForPublic);

  // Quarantine invariant: Default every document to DRAFT or INTERNAL_ONLY unless full verification passes
  if (status === 'APPROVED_PUBLIC') {
    const pubValidation = validateDocumentForPublication({
      ...data,
      filePath: pathValidation.cleanPath || data.filePath,
      hasSignedStampedPdf,
      isApprovedForPublic,
    });
    if (!pubValidation.valid) {
      return { success: false, error: pubValidation.errors.join('; ') };
    }
  } else if (!data.status) {
    status = 'DRAFT';
  }

  const isPublic = status === 'APPROVED_PUBLIC' && isApprovedForPublic && hasSignedStampedPdf;

  if (data.id) {
    const idx = publicDocumentStore.findIndex((d) => d.id === data.id);
    if (idx !== -1) {
      const existing = publicDocumentStore[idx];
      publicDocumentStore[idx] = {
        ...existing,
        ...data,
        filePath: pathValidation.cleanPath || data.filePath,
        status,
        hasSignedStampedPdf,
        isApprovedForPublic,
        isPublic,
        updatedAt: timestamp,
      };
      return { success: true, data: publicDocumentStore[idx] };
    }
  }

  const newDoc: PublicDocument = {
    id: data.id || `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    titleNe: data.titleNe,
    titleEn: data.titleEn,
    documentType: data.documentType,
    filePath: pathValidation.cleanPath || data.filePath,
    status,
    hasSignedStampedPdf,
    isApprovedForPublic,
    descriptionNe: data.descriptionNe || '',
    descriptionEn: data.descriptionEn || '',
    publicationDate: data.publicationDate || new Date().toISOString().split('T')[0],
    adminNotes: data.adminNotes,
    reviewedByTreasurerName: data.reviewedByTreasurerName,
    reviewedByTreasurerAt: data.reviewedByTreasurerAt,
    approvedByPresidentName: data.approvedByPresidentName,
    approvedByPresidentAt: data.approvedByPresidentAt,
    internalReviewNotes: data.internalReviewNotes,
    isPublic,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  publicDocumentStore.unshift(newDoc);
  return { success: true, data: newDoc };
}

export async function advancePublicDocumentStatus(
  id: string,
  targetStatus: DocumentPublicationStatus,
  approverDetails?: {
    adminName: string;
    adminId?: string;
    notes?: string;
    hasSignedStampedPdf?: boolean;
    isApprovedForPublic?: boolean;
  }
): Promise<{ success: boolean; data?: PublicDocument; error?: string }> {
  const idx = publicDocumentStore.findIndex((d) => d.id === id);
  if (idx === -1) {
    return { success: false, error: 'दस्तावेज फेला परेन।' };
  }

  const doc = publicDocumentStore[idx];
  const timestamp = new Date().toISOString();

  if (targetStatus === 'APPROVED_PUBLIC') {
    const hasSigned =
      approverDetails?.hasSignedStampedPdf !== undefined
        ? approverDetails.hasSignedStampedPdf
        : doc.hasSignedStampedPdf;
    const isApproved =
      approverDetails?.isApprovedForPublic !== undefined
        ? approverDetails.isApprovedForPublic
        : doc.isApprovedForPublic;

    const pubValidation = validateDocumentForPublication({
      ...doc,
      hasSignedStampedPdf: hasSigned,
      isApprovedForPublic: isApproved,
    });

    if (!pubValidation.valid) {
      return { success: false, error: pubValidation.errors.join('; ') };
    }

    publicDocumentStore[idx] = {
      ...doc,
      status: 'APPROVED_PUBLIC',
      hasSignedStampedPdf: hasSigned,
      isApprovedForPublic: isApproved,
      isPublic: true,
      approvedByPresidentName: approverDetails?.adminName || 'President',
      approvedByPresidentAt: timestamp,
      internalReviewNotes: approverDetails?.notes || doc.internalReviewNotes,
      updatedAt: timestamp,
    };
    return { success: true, data: publicDocumentStore[idx] };
  }

  if (targetStatus === 'PENDING_REVIEW') {
    publicDocumentStore[idx] = {
      ...doc,
      status: 'PENDING_REVIEW',
      isPublic: false,
      reviewedByTreasurerName: approverDetails?.adminName,
      reviewedByTreasurerAt: timestamp,
      internalReviewNotes: approverDetails?.notes || doc.internalReviewNotes,
      updatedAt: timestamp,
    };
    return { success: true, data: publicDocumentStore[idx] };
  }

  // DRAFT or INTERNAL_ONLY
  publicDocumentStore[idx] = {
    ...doc,
    status: targetStatus,
    isPublic: false,
    internalReviewNotes: approverDetails?.notes || doc.internalReviewNotes,
    updatedAt: timestamp,
  };
  return { success: true, data: publicDocumentStore[idx] };
}

export async function deletePublicDocument(id: string): Promise<boolean> {
  publicDocumentStore = publicDocumentStore.filter((d) => d.id !== id);
  return true;
}

// ==========================================
// Internal Evidence Collection Tracker
// ==========================================

let evidenceTrackerStore: EvidenceTrackerRecord[] = [
  // 1. Committee Evidence
  {
    id: 'ev-com-01',
    category: 'COMMITTEE',
    itemKey: 'ELECTION_MINUTES',
    titleNe: 'साधारण सभा निर्वाचन / गठन माइन्युट',
    titleEn: 'General Assembly Election / Formation Minutes',
    collectionStatus: 'COLLECTED',
    documentRefOrPath: 'internal-docs/minutes/election-assembly-2082.pdf',
    collectedBy: 'General Secretary',
    collectedAt: '2026-11-04T08:00:00Z',
    approvalStatus: 'PENDING',
    privateNotes: 'सक्कल माइन्युट पुस्तिकाबाट प्रतिलिपि प्रमाणित हुन बाँकी।',
    isPublic: false,
    createdAt: '2026-11-04T08:00:00Z',
  },
  {
    id: 'ev-com-02',
    category: 'COMMITTEE',
    itemKey: 'DAO_ROSTER_MATCH',
    titleNe: 'जि.प्र.का. काठमाण्डौं दर्ता प्रमाणित नामावली सूची',
    titleEn: 'DAO Kathmandu Registered Committee Roster',
    collectionStatus: 'VERIFIED',
    documentRefOrPath: 'internal-docs/certificates/cdo-registration-certificate-2082.jpeg',
    collectedBy: 'Secretariat',
    collectedAt: '2026-11-04T08:05:00Z',
    verifiedBy: 'Legal Advisor',
    verificationDate: '२०८२-०४-२१',
    approvalStatus: 'APPROVED',
    approvedBy: 'President',
    approvedAt: '2026-11-04T08:05:00Z',
    privateNotes: 'दर्ता नं. १६ सँग कार्यसमिति नामावली शतप्रतिशत मिलान भएको।',
    isPublic: false,
    createdAt: '2026-11-04T08:05:00Z',
  },
  {
    id: 'ev-com-03',
    category: 'COMMITTEE',
    itemKey: 'PHOTO_CONSENT_FORMS',
    titleNe: 'पदाधिकारी तथा सदस्य लिखित तस्बिर सहमति फारमहरू',
    titleEn: 'Committee Members Written Photo Consent Forms',
    collectionStatus: 'NOT_COLLECTED',
    approvalStatus: 'PENDING',
    privateNotes: '६ जना सदस्यहरूको फारम वितरण गरिएको, हस्ताक्षर संकलन बाँकी।',
    isPublic: false,
    createdAt: '2026-11-04T08:10:00Z',
  },
  {
    id: 'ev-com-04',
    category: 'COMMITTEE',
    itemKey: 'FORMAL_PORTRAITS',
    titleNe: 'पदाधिकारी औपचारिक पोर्ट्रेट तस्बिरहरू',
    titleEn: 'Committee Formal Portrait Photographs',
    collectionStatus: 'NOT_COLLECTED',
    approvalStatus: 'PENDING',
    privateNotes: 'स्थानीय क्यामेराबाट खिचिएका प्रमाणित तस्बिर संकलन कार्य भइरहेको।',
    isPublic: false,
    createdAt: '2026-11-04T08:15:00Z',
  },

  // 2. Activity Evidence
  {
    id: 'ev-act-01',
    category: 'ACTIVITY',
    itemKey: 'ATTENDANCE_SHEETS',
    titleNe: 'सहभागी तथा स्वयंसेवक उपस्थिति पुस्तिका',
    titleEn: 'Participant & Volunteer Attendance Sheets',
    collectionStatus: 'NOT_COLLECTED',
    approvalStatus: 'PENDING',
    privateNotes: 'विगतका राहत तथा स्वास्थ्य शिविर उपस्थिति फाइलहरू अभिलेखीकरण हुँदै।',
    isPublic: false,
    createdAt: '2026-11-04T08:20:00Z',
  },
  {
    id: 'ev-act-02',
    category: 'ACTIVITY',
    itemKey: 'EVENT_MEDIA_CONSENTS',
    titleNe: 'कार्यक्रम तस्बिर तथा मिडिया सहमति अभिलेख',
    titleEn: 'Event Photos & Sensitive Media Consent Log',
    collectionStatus: 'COLLECTED',
    documentRefOrPath: 'internal-docs/media/consent-log-2082.pdf',
    collectedBy: 'Media Coordinator',
    collectedAt: '2026-11-04T08:25:00Z',
    approvalStatus: 'PENDING',
    privateNotes: 'बिरामी र राहतग्राहीको अनुहार सम्पादन (Blur/Redact) गर्नुपर्ने।',
    isPublic: false,
    createdAt: '2026-11-04T08:25:00Z',
  },
  {
    id: 'ev-act-03',
    category: 'ACTIVITY',
    itemKey: 'RECEIPTS_AND_ZERO_EXPENSE',
    titleNe: 'सक्कल बिल/भौचर वा शून्य खर्च घोषणा पत्र',
    titleEn: 'Activity Vouchers / Zero-Expense Declarations',
    collectionStatus: 'NOT_COLLECTED',
    approvalStatus: 'PENDING',
    privateNotes: 'कोषाध्यक्ष समक्ष पेस भई भौचर रुजु प्रक्रियामा।',
    isPublic: false,
    createdAt: '2026-11-04T08:30:00Z',
  },
  {
    id: 'ev-act-04',
    category: 'ACTIVITY',
    itemKey: 'EXECUTIVE_ACTIVITY_MINUTES',
    titleNe: 'कार्यक्रम समीक्षा तथा अनुमोदन माइन्युट',
    titleEn: 'Executive Committee Activity Approval Minutes',
    collectionStatus: 'NOT_COLLECTED',
    approvalStatus: 'PENDING',
    privateNotes: 'कार्यसमिति बैठकमा प्रस्तुत भई अनुमोदन हुन बाँकी।',
    isPublic: false,
    createdAt: '2026-11-04T08:35:00Z',
  },

  // 3. Document Evidence
  {
    id: 'ev-doc-01',
    category: 'DOCUMENT',
    itemKey: 'DAO_REGISTRATION_CERTIFICATE',
    titleNe: 'सक्कल दर्ता प्रमाणपत्र (सम्पादित/रेडक्टेड प्रति)',
    titleEn: 'DAO Kathmandu Registration Certificate (Redacted Scan)',
    collectionStatus: 'VERIFIED',
    documentRefOrPath: '/documents/cdo-registration-certificate-redacted.jpeg',
    collectedBy: 'Superadmin',
    collectedAt: '2026-11-04T08:40:00Z',
    verifiedBy: 'President',
    verificationDate: '२०८२-०४-२१',
    approvalStatus: 'APPROVED',
    approvedBy: 'President',
    approvedAt: '2026-11-04T08:40:00Z',
    privateNotes: 'सक्कल प्रति आन्तरिक अभिलेखमा; रेडक्टेड प्रति स्थानीय डिस्कमा प्रमाणीकृत।',
    isPublic: false,
    createdAt: '2026-11-04T08:40:00Z',
  },
  {
    id: 'ev-doc-02',
    category: 'DOCUMENT',
    itemKey: 'STAMPED_CONSTITUTION_PDF',
    titleNe: 'जि.प्र.का. छाप लागेको आधिकारिक मूल विधान PDF',
    titleEn: 'DAO Stamped Official Constitution PDF',
    collectionStatus: 'COLLECTED',
    documentRefOrPath: 'internal-docs/reference-drafts/madi-sss-constitution-2082.pdf',
    collectedBy: 'General Secretary',
    collectedAt: '2026-11-04T08:45:00Z',
    approvalStatus: 'PENDING',
    privateNotes: 'अन्तिम हस्ताक्षर भएको स्क्यान प्रति स्थानीय /documents/ मा अपलोड हुन बाँकी।',
    isPublic: false,
    createdAt: '2026-11-04T08:45:00Z',
  },
  {
    id: 'ev-doc-03',
    category: 'DOCUMENT',
    itemKey: 'DISASTER_POLICY_DOCUMENT',
    titleNe: 'विपद् तथा राहत कोष सञ्चालन कार्यविधि २०८२',
    titleEn: 'Disaster Relief Fund Operational Policy 2082',
    collectionStatus: 'COLLECTED',
    documentRefOrPath: 'internal-docs/policies/disaster-fund-policy-draft.pdf',
    collectedBy: 'Policy Sub-committee',
    collectedAt: '2026-11-04T08:50:00Z',
    approvalStatus: 'PENDING',
    privateNotes: 'कानुनी सल्लाहकारको अन्तिम सुझाव पश्चात् प्रमाणीकरण हुने।',
    isPublic: false,
    createdAt: '2026-11-04T08:50:00Z',
  },

  // 4. Financial Transparency Evidence
  {
    id: 'ev-fin-01',
    category: 'FINANCIAL',
    itemKey: 'AUDIT_REPORT_SIGNED',
    titleNe: 'दर्तावाला लेखापरीक्षकको अन्तिम हस्ताक्षरित प्रतिवेदन',
    titleEn: 'Registered Auditor Final Signed Audit Report',
    collectionStatus: 'NOT_COLLECTED',
    approvalStatus: 'PENDING',
    privateNotes: 'आ.व. २०८१/८२ को लेखापरीक्षण कार्य सम्पन्न भई प्रतिवेदन संकलनको क्रममा।',
    isPublic: false,
    createdAt: '2026-11-04T08:55:00Z',
  },
  {
    id: 'ev-fin-02',
    category: 'FINANCIAL',
    itemKey: 'ANNUAL_FINANCIAL_STATEMENTS',
    titleNe: 'हस्ताक्षरित वार्षिक वित्तीय विवरण (आय-व्यय हिसाब)',
    titleEn: 'Signed Annual Financial Statements (Income & Expenditure)',
    collectionStatus: 'NOT_COLLECTED',
    approvalStatus: 'PENDING',
    privateNotes: 'कोषाध्यक्ष र लेखापालबाट बहीखाता हिसाब मिलान भइरहेको।',
    isPublic: false,
    createdAt: '2026-11-04T09:00:00Z',
  },
  {
    id: 'ev-fin-03',
    category: 'FINANCIAL',
    itemKey: 'RELIEF_FUND_BANK_STATEMENTS',
    titleNe: 'राहत कोष बैंक स्टेटमेन्ट तथा सक्कल भौचरहरू',
    titleEn: 'Relief Fund Bank Statements & Original Vouchers',
    collectionStatus: 'NOT_COLLECTED',
    approvalStatus: 'PENDING',
    privateNotes: 'बैंक मौज्दात र रसिद भिडाउने कार्य प्रगतिमा।',
    isPublic: false,
    createdAt: '2026-11-04T09:05:00Z',
  },
  {
    id: 'ev-fin-04',
    category: 'FINANCIAL',
    itemKey: 'EXPENSE_APPROVAL_MINUTES',
    titleNe: 'आर्थिक खर्च तथा राहत वितरण अनुमोदन माइन्युट',
    titleEn: 'Financial Expenditure & Relief Approval Minutes',
    collectionStatus: 'COLLECTED',
    documentRefOrPath: 'internal-docs/minutes/finance-approval-minute-2082.pdf',
    collectedBy: 'Treasurer',
    collectedAt: '2026-11-04T09:10:00Z',
    approvalStatus: 'PENDING',
    privateNotes: 'राहत वितरण निर्णयको प्रमाणित निर्णय प्रतिलिपि।',
    isPublic: false,
    createdAt: '2026-11-04T09:10:00Z',
  },

  // 5. School Support Evidence (Educational Infrastructure Support)
  {
    id: 'ev-sch-01',
    category: 'SCHOOL_SUPPORT',
    itemKey: 'SCHOOL_IMPROVEMENT_REQUEST',
    titleNe: 'स्थानीय विद्यालय पूर्वाधार तथा शैक्षिक सामग्री सुधार माग/निवेदन',
    titleEn: 'Local School Infrastructure & Educational Improvement Request Letter',
    collectionStatus: 'NOT_COLLECTED',
    approvalStatus: 'PENDING',
    privateNotes: 'सम्बन्धित स्थानीय विद्यालय व्यवस्थापन समिति वा प्र.अ.बाट प्राप्त माग पत्र।',
    isPublic: false,
    createdAt: '2026-11-04T09:15:00Z',
  },
  {
    id: 'ev-sch-02',
    category: 'SCHOOL_SUPPORT',
    itemKey: 'EXECUTIVE_ALLOCATION_MINUTE',
    titleNe: 'कार्यसमिति विद्यालय शैक्षिक पूर्वाधार सहयोग निर्णय माइन्युट',
    titleEn: 'Executive Committee Educational Infrastructure Fund Allocation Minute',
    collectionStatus: 'COLLECTED',
    documentRefOrPath: 'internal-docs/minutes/school-support-minute-2082.pdf',
    collectedBy: 'General Secretary',
    collectedAt: '2026-11-04T09:20:00Z',
    approvalStatus: 'PENDING',
    privateNotes: 'कार्यसमिति बैठकको निर्णय अनुसार विद्यालय पूर्वाधार सहयोग पारित।',
    isPublic: false,
    createdAt: '2026-11-04T09:20:00Z',
  },
  {
    id: 'ev-sch-03',
    category: 'SCHOOL_SUPPORT',
    itemKey: 'BANK_TRANSFER_VOUCHER',
    titleNe: 'विद्यालय खातामा रकम हस्तान्तरण सक्कल बैंक भौचर / रसिद',
    titleEn: 'Bank Transfer Voucher / Official Payment Slip to School Account',
    collectionStatus: 'NOT_COLLECTED',
    approvalStatus: 'PENDING',
    privateNotes: 'कोषाध्यक्षद्वारा बैंक भौचर रुजु प्रक्रियामा।',
    isPublic: false,
    createdAt: '2026-11-04T09:25:00Z',
  },
  {
    id: 'ev-sch-04',
    category: 'SCHOOL_SUPPORT',
    itemKey: 'SCHOOL_RECEIPT_ACKNOWLEDGEMENT',
    titleNe: 'विद्यालयको आधिकारिक नगदी भरपाई तथा धन्यवाद पत्र',
    titleEn: 'Official School Cash Receipt & Institutional Acknowledgment',
    collectionStatus: 'NOT_COLLECTED',
    approvalStatus: 'PENDING',
    privateNotes: 'प्रधानाध्यापक तथा विद्यालय व्यवस्थापन समितिको आधिकारिक हस्ताक्षरयुक्त पत्र।',
    isPublic: false,
    createdAt: '2026-11-04T09:30:00Z',
  },
  {
    id: 'ev-sch-05',
    category: 'SCHOOL_SUPPORT',
    itemKey: 'UTILIZATION_REPORT_AND_PHOTOS',
    titleNe: 'पूर्वाधार उपयोग/निर्माण कार्य सम्पन्न प्रतिवेदन तथा तस्बिर',
    titleEn: 'Infrastructure Utilization / Completion Report & Work Photos',
    collectionStatus: 'NOT_COLLECTED',
    approvalStatus: 'PENDING',
    privateNotes: 'विद्यालयमा शैक्षिक पूर्वाधार निर्माण सम्पन्न भएको स्थलगत प्रतिवेदन।',
    isPublic: false,
    createdAt: '2026-11-04T09:35:00Z',
  },

  // 6. Relief & Emergency Medical Assistance Evidence
  {
    id: 'ev-rel-01',
    category: 'RELIEF_MEDICAL_ASSISTANCE',
    itemKey: 'COVID_STUDENT_FAMILY_RELIEF_ROSTER',
    titleNe: 'कोरोना महामारी राहत वितरण लगत सूची (विपन्न विद्यार्थी तथा परिवार)',
    titleEn: 'COVID-19 Relief Distribution Roster (Needy Students & Families)',
    collectionStatus: 'COLLECTED',
    documentRefOrPath: 'internal-docs/relief/covid-student-family-roster.pdf',
    collectedBy: 'Relief Sub-committee',
    collectedAt: '2026-11-04T09:40:00Z',
    approvalStatus: 'PENDING',
    privateNotes: 'कोरोना महामारीका बेला वितरण गरिएको खाद्यान्न तथा राहत लगत (व्यक्तिगत विवरण गोप्य)।',
    isPublic: false,
    createdAt: '2026-11-04T09:40:00Z',
  },
  {
    id: 'ev-rel-02',
    category: 'RELIEF_MEDICAL_ASSISTANCE',
    itemKey: 'EMERGENCY_MEDICAL_AID_APPLICATION',
    titleNe: 'आकस्मिक उपचार तथा चिकित्सा सहयोग निवेदन र अस्पताल कागजात',
    titleEn: 'Emergency Medical Treatment Assistance Application & Hospital Records',
    collectionStatus: 'COLLECTED',
    documentRefOrPath: 'internal-docs/medical/emergency-medical-application.pdf',
    collectedBy: 'Secretariat',
    collectedAt: '2026-11-04T09:45:00Z',
    approvalStatus: 'PENDING',
    privateNotes: 'गम्भीर बिरामी मादीवासीको आकस्मिक उपचार सहायता सिफारिस र डिस्चार्ज/बिल कागजात।',
    isPublic: false,
    createdAt: '2026-11-04T09:45:00Z',
  },
  {
    id: 'ev-rel-03',
    category: 'RELIEF_MEDICAL_ASSISTANCE',
    itemKey: 'EXECUTIVE_RELIEF_MINUTE',
    titleNe: 'कार्यसमिति राहत तथा आकस्मिक उपचार सहयोग निर्णय माइन्युट',
    titleEn: 'Executive Committee Relief & Medical Assistance Decision Minute',
    collectionStatus: 'COLLECTED',
    documentRefOrPath: 'internal-docs/minutes/relief-decision-minute-2082.pdf',
    collectedBy: 'General Secretary',
    collectedAt: '2026-11-04T09:50:00Z',
    approvalStatus: 'PENDING',
    privateNotes: 'राहत कोषबाट विपन्न तथा बिरामीलाई सहायता उपलब्ध गराउने औपचारिक निर्णय।',
    isPublic: false,
    createdAt: '2026-11-04T09:50:00Z',
  },
  {
    id: 'ev-rel-04',
    category: 'RELIEF_MEDICAL_ASSISTANCE',
    itemKey: 'DISBURSEMENT_VOUCHERS_AND_RECEIPTS',
    titleNe: 'राहत तथा उपचार रकम भुक्तानी रसिद तथा बैंक भौचरहरू',
    titleEn: 'Disbursement Receipts & Bank Transfer Vouchers',
    collectionStatus: 'NOT_COLLECTED',
    approvalStatus: 'PENDING',
    privateNotes: 'सम्बन्धित खाता वा नगदी हस्तान्तरण सक्कल भरपाई।',
    isPublic: false,
    createdAt: '2026-11-04T09:55:00Z',
  },
  {
    id: 'ev-rel-05',
    category: 'RELIEF_MEDICAL_ASSISTANCE',
    itemKey: 'CONSENT_AND_ANONYMIZATION_RECORD',
    titleNe: 'राहतग्राही तथा बिरामी मर्यादा/गोपनीयता सहमति अभिलेख',
    titleEn: 'Beneficiary & Patient Dignity/Privacy Anonymization Record',
    collectionStatus: 'NOT_COLLECTED',
    approvalStatus: 'PENDING',
    privateNotes: 'सार्वजनिक विवरणमा बिरामी तथा राहतग्राहीको अनुहार, रोग वा व्यक्तिगत परिचय कहिल्यै नखुलाउने ग्यारेन्टी।',
    isPublic: false,
    createdAt: '2026-11-04T10:00:00Z',
  },
];

export async function getEvidenceTrackerRecords(
  category?: EvidenceTrackerCategory,
  status?: EvidenceCollectionStatus,
  includePrivate = true
): Promise<EvidenceTrackerRecord[]> {
  // STRICT GOVERNANCE RULE:
  // Evidence Tracker records are strictly internal planning & tracking assets.
  // Public requests (includePrivate = false) MUST return empty list.
  if (!includePrivate) {
    return [];
  }

  let list = [...evidenceTrackerStore];
  if (category) {
    list = list.filter((r) => r.category === category);
  }
  if (status) {
    list = list.filter((r) => r.collectionStatus === status);
  }
  return list;
}

export async function getEvidenceTrackerRecordById(
  id: string,
  includePrivate = true
): Promise<EvidenceTrackerRecord | null> {
  if (!includePrivate) {
    return null;
  }
  const item = evidenceTrackerStore.find((r) => r.id === id);
  return item || null;
}

export async function getCommitteeEvidenceTracker(includePrivate = true): Promise<EvidenceTrackerRecord[]> {
  return getEvidenceTrackerRecords('COMMITTEE', undefined, includePrivate);
}

export async function getActivityEvidenceTracker(includePrivate = true): Promise<EvidenceTrackerRecord[]> {
  return getEvidenceTrackerRecords('ACTIVITY', undefined, includePrivate);
}

export async function getDocumentEvidenceTracker(includePrivate = true): Promise<EvidenceTrackerRecord[]> {
  return getEvidenceTrackerRecords('DOCUMENT', undefined, includePrivate);
}

export async function getFinancialEvidenceTracker(includePrivate = true): Promise<EvidenceTrackerRecord[]> {
  return getEvidenceTrackerRecords('FINANCIAL', undefined, includePrivate);
}

export async function getSchoolSupportEvidenceTracker(includePrivate = true): Promise<EvidenceTrackerRecord[]> {
  return getEvidenceTrackerRecords('SCHOOL_SUPPORT', undefined, includePrivate);
}

export async function getReliefMedicalAssistanceEvidenceTracker(includePrivate = true): Promise<EvidenceTrackerRecord[]> {
  return getEvidenceTrackerRecords('RELIEF_MEDICAL_ASSISTANCE', undefined, includePrivate);
}

export interface RealContentCollectionTrackersOverview {
  committee: EvidenceTrackerRecord[];
  activity: EvidenceTrackerRecord[];
  schoolSupport: EvidenceTrackerRecord[];
  reliefMedicalAssistance: EvidenceTrackerRecord[];
  stats: {
    totalItems: number;
    notCollected: number;
    collected: number;
    verified: number;
    rejected: number;
    approved: number;
    pending: number;
  };
}

export async function getRealContentCollectionTrackers(
  includePrivate = true
): Promise<RealContentCollectionTrackersOverview> {
  // STRICT GOVERNANCE RULE:
  // Public calls MUST return completely empty trackers and 0 counts.
  if (!includePrivate) {
    return {
      committee: [],
      activity: [],
      schoolSupport: [],
      reliefMedicalAssistance: [],
      stats: {
        totalItems: 0,
        notCollected: 0,
        collected: 0,
        verified: 0,
        rejected: 0,
        approved: 0,
        pending: 0,
      },
    };
  }

  const committee = await getCommitteeEvidenceTracker(true);
  const activity = await getActivityEvidenceTracker(true);
  const schoolSupport = await getSchoolSupportEvidenceTracker(true);
  const reliefMedicalAssistance = await getReliefMedicalAssistanceEvidenceTracker(true);

  const all = [...committee, ...activity, ...schoolSupport, ...reliefMedicalAssistance];

  return {
    committee,
    activity,
    schoolSupport,
    reliefMedicalAssistance,
    stats: {
      totalItems: all.length,
      notCollected: all.filter((i) => i.collectionStatus === 'NOT_COLLECTED').length,
      collected: all.filter((i) => i.collectionStatus === 'COLLECTED').length,
      verified: all.filter((i) => i.collectionStatus === 'VERIFIED').length,
      rejected: all.filter((i) => i.collectionStatus === 'REJECTED').length,
      approved: all.filter((i) => i.approvalStatus === 'APPROVED').length,
      pending: all.filter((i) => i.approvalStatus === 'PENDING').length,
    },
  };
}

export interface PublicSanitizedEvidenceItem {
  id: string;
  category: EvidenceTrackerCategory;
  itemKey: string;
  titleNe: string;
  titleEn: string;
  collectionStatus: EvidenceCollectionStatus;
  approvalStatus: EvidenceApprovalStatus;
  isPublic: false;
}

export function sanitizeEvidenceTrackerRecordForPublic(
  record: EvidenceTrackerRecord
): PublicSanitizedEvidenceItem {
  // Strips documentRefOrPath, collectedBy, collectedAt, verifiedBy, verificationDate, approvedBy, approvedAt, privateNotes
  return {
    id: record.id,
    category: record.category,
    itemKey: record.itemKey,
    titleNe: record.titleNe,
    titleEn: record.titleEn,
    collectionStatus: record.collectionStatus,
    approvalStatus: record.approvalStatus,
    isPublic: false,
  };
}

export async function saveEvidenceTrackerRecord(
  data: Partial<EvidenceTrackerRecord> & {
    category: EvidenceTrackerCategory;
    itemKey: string;
    titleNe: string;
    titleEn: string;
  }
): Promise<{ success: boolean; data?: EvidenceTrackerRecord; error?: string }> {
  const timestamp = new Date().toISOString();

  if (data.id) {
    const idx = evidenceTrackerStore.findIndex((r) => r.id === data.id);
    if (idx !== -1) {
      const existing = evidenceTrackerStore[idx];
      evidenceTrackerStore[idx] = {
        ...existing,
        ...data,
        isPublic: false, // Invariant: ALWAYS private
        updatedAt: timestamp,
      };
      return { success: true, data: evidenceTrackerStore[idx] };
    }
  }

  const newRecord: EvidenceTrackerRecord = {
    id: data.id || `ev-${data.category.toLowerCase().substring(0, 3)}-${Date.now()}`,
    category: data.category,
    itemKey: data.itemKey,
    titleNe: data.titleNe,
    titleEn: data.titleEn,
    targetEntityId: data.targetEntityId,
    collectionStatus: data.collectionStatus || 'NOT_COLLECTED',
    documentRefOrPath: data.documentRefOrPath,
    collectedBy: data.collectedBy,
    collectedAt: data.collectedBy ? timestamp : undefined,
    verifiedBy: data.verifiedBy,
    verificationDate: data.verificationDate,
    approvalStatus: data.approvalStatus || 'PENDING',
    approvedBy: data.approvedBy,
    approvedAt: data.approvedBy ? timestamp : undefined,
    privateNotes: data.privateNotes,
    isPublic: false, // Invariant: ALWAYS private
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  evidenceTrackerStore.unshift(newRecord);
  return { success: true, data: newRecord };
}

export async function updateEvidenceTrackerItemStatus(
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
): Promise<{ success: boolean; data?: EvidenceTrackerRecord; error?: string }> {
  const idx = evidenceTrackerStore.findIndex((r) => r.id === id);
  if (idx === -1) {
    return { success: false, error: 'प्रमाण ट्र्याकर रेकर्ड फेला परेन।' };
  }

  const timestamp = new Date().toISOString();
  const existing = evidenceTrackerStore[idx];

  evidenceTrackerStore[idx] = {
    ...existing,
    ...updates,
    isPublic: false, // Invariant: ALWAYS private
    updatedAt: timestamp,
  };

  return { success: true, data: evidenceTrackerStore[idx] };
}

export async function deleteEvidenceTrackerRecord(id: string): Promise<boolean> {
  evidenceTrackerStore = evidenceTrackerStore.filter((r) => r.id !== id);
  return true;
}

// -------------------------------------------------------------
// Education Infrastructure Support Records (School Improvement)
// -------------------------------------------------------------
let educationInfrastructureStore: EducationInfrastructureSupportRecord[] = [];

export async function saveEducationInfrastructureSupportRecord(
  data: Omit<EducationInfrastructureSupportRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<{ success: boolean; data?: EducationInfrastructureSupportRecord; error?: string }> {
  // Required 6 fields validation
  if (!data.schoolNameNe?.trim() || !data.schoolNameEn?.trim()) {
    return { success: false, error: 'School name in Nepali & English is mandatory.' };
  }
  if (!data.supportPurposeNe?.trim() || !data.supportPurposeEn?.trim()) {
    return { success: false, error: 'Support purpose in Nepali & English is mandatory.' };
  }
  if (!data.amountNpr || data.amountNpr <= 0) {
    return { success: false, error: 'Positive contribution amount in NPR is mandatory.' };
  }
  if (!data.voucherReceiptRef?.trim()) {
    return { success: false, error: 'Voucher or official receipt reference is mandatory.' };
  }
  if (!data.approvalMinuteRef?.trim()) {
    return { success: false, error: 'Executive committee approval minute reference is mandatory.' };
  }
  if (!data.publicSafeSummaryNe?.trim() || !data.publicSafeSummaryEn?.trim()) {
    return { success: false, error: 'Public-safe summary in Nepali & English is mandatory.' };
  }

  const timestamp = new Date().toISOString();
  // Invariant: Do not publish any school support record yet
  const record: EducationInfrastructureSupportRecord = {
    ...data,
    id: data.id || `edu-infra-${Date.now()}`,
    status: 'DRAFT', // Strictly DRAFT
    isPublic: false, // Strictly private
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const existingIdx = educationInfrastructureStore.findIndex((r) => r.id === record.id);
  if (existingIdx !== -1) {
    educationInfrastructureStore[existingIdx] = record;
  } else {
    educationInfrastructureStore.push(record);
  }

  return { success: true, data: record };
}

export async function getEducationInfrastructureSupportRecords(
  includePrivate = false
): Promise<EducationInfrastructureSupportRecord[]> {
  if (!includePrivate) {
    // Invariant: Zero records published yet
    return educationInfrastructureStore.filter((r) => r.isPublic === true && r.status === 'PUBLISHED');
  }
  return educationInfrastructureStore;
}

export async function getGovernanceDashboardOverview(
  isSuperadmin = false
): Promise<GovernanceDashboardOverview> {
  if (!isSuperadmin) {
    throw new Error('UNAUTHORIZED: Superadmin authentication required to access governance dashboard overview.');
  }

  const timestamp = new Date().toISOString();

  // 1. Committee Metrics
  const comMembers = committeeStore;
  const comTracker = evidenceTrackerStore.filter((i) => i.category === 'COMMITTEE');
  const comDraftCount = comMembers.filter((m) => m.status === 'DRAFT').length;
  const comPendingCount = comMembers.filter((m) => m.photoConsent === 'PENDING').length;
  const comApprovedCount = comMembers.filter((m) => m.status === 'PUBLISHED' && m.photoConsent === 'VERIFIED').length;

  const comMissingNe: string[] = [];
  const comMissingEn: string[] = [];
  if (comApprovedCount === 0) {
    comMissingNe.push(`सबै ${comMembers.length} कार्यसमिति सदस्यहरू हाल DRAFT स्थितिमा सुरक्षित छन् (प्रकाशन अनुमति छैन)`);
    comMissingEn.push(`All ${comMembers.length} committee members are quarantined in DRAFT status`);
  }
  const comUnconsented = comMembers.filter((m) => m.photoConsent !== 'VERIFIED').length;
  if (comUnconsented > 0) {
    comMissingNe.push(`${comUnconsented} जना सदस्यहरूको लिखित तस्बिर सहमति (Photo Consent) प्रमाणीकरण बाँकी`);
    comMissingEn.push(`${comUnconsented} members pending formal written photo consent verification`);
  }
  const comNotCollectedEvidence = comTracker.filter((i) => i.collectionStatus === 'NOT_COLLECTED').length;
  if (comNotCollectedEvidence > 0) {
    comMissingNe.push(`${comNotCollectedEvidence} वटा आन्तरिक प्रमाण संकलन कार्यसूची बाँकी (माइन्युट / तस्बिरहरू)`);
    comMissingEn.push(`${comNotCollectedEvidence} internal evidence checklist items not yet collected`);
  }

  const comReady =
    comMembers.length > 0 &&
    comApprovedCount === comMembers.length &&
    comTracker.every((i) => i.collectionStatus === 'VERIFIED');

  const committeeMetrics: GovernanceSectionMetrics = {
    sectionKey: 'COMMITTEE',
    titleNe: 'कार्यसमिति खण्ड (Phase 2)',
    titleEn: 'Executive Committee (Phase 2)',
    totalRecords: comMembers.length,
    draftInternalRecords: comDraftCount,
    pendingReviewRecords: comPendingCount,
    approvedPublicRecords: comApprovedCount,
    evidenceItems: {
      notCollected: comTracker.filter((i) => i.collectionStatus === 'NOT_COLLECTED').length,
      collected: comTracker.filter((i) => i.collectionStatus === 'COLLECTED').length,
      verified: comTracker.filter((i) => i.collectionStatus === 'VERIFIED').length,
      rejected: comTracker.filter((i) => i.collectionStatus === 'REJECTED').length,
    },
    missingRequirementsNe: comMissingNe,
    missingRequirementsEn: comMissingEn,
    publicationReadiness: comReady ? 'READY_FOR_PUBLICATION' : 'NOT_READY_FOR_PUBLICATION',
    readinessLabelNe: comReady ? 'प्रकाशनका लागि तयार' : 'प्रकाशनका लागि तयार छैन',
    readinessLabelEn: comReady ? 'Ready for publication' : 'Not ready for publication',
    detailedEvidence: comTracker.map((i) => ({
      itemKey: i.itemKey,
      titleNe: i.titleNe,
      titleEn: i.titleEn,
      collectionStatus: i.collectionStatus,
      approvalStatus: i.approvalStatus,
      documentRefOrPath: i.documentRefOrPath,
      verifiedBy: i.verifiedBy,
      verificationDate: i.verificationDate,
      privateNotes: i.privateNotes,
    })),
  };

  // 2. Activities Metrics
  const actItems = activitiesStore;
  const actTracker = evidenceTrackerStore.filter((i) => i.category === 'ACTIVITY');
  const actDraftCount = actItems.filter((a) => a.workflowStage === 'DRAFT' || a.status === 'DRAFT').length;
  const actPendingCount = actItems.filter(
    (a) => a.workflowStage === 'TREASURER_REVIEW' || a.workflowStage === 'PRESIDENT_APPROVAL'
  ).length;
  const actApprovedCount = actItems.filter((a) => a.workflowStage === 'PUBLISHED' && a.status === 'PUBLISHED').length;

  const actMissingNe: string[] = [];
  const actMissingEn: string[] = [];
  if (actItems.length === 0) {
    actMissingNe.push('हाल कुनै सामाजिक गतिविधि रेकर्ड सिर्जना गरिएको छैन (शून्य प्रकाशित)');
    actMissingEn.push('No activity records currently exist (Zero published)');
  } else if (actApprovedCount === 0) {
    actMissingNe.push(`सबै ${actItems.length} सामाजिक गतिविधिहरू DRAFT क्वारेन्टाइनमा छन् (शून्य प्रकाशित)`);
    actMissingEn.push(`All ${actItems.length} activities are quarantined in DRAFT status (Zero published)`);
  }
  actMissingNe.push('५-बुँदे प्रमाण चेकलिस्ट (उपस्थिति, तस्बिर/सहमति, भौचर/शून्य खर्च, प्रतिवेदन, माइन्युट) पूर्ण हुन बाँकी');
  actMissingEn.push('Mandatory 5-point evidence checklist (attendance, photos, vouchers, report, minutes) incomplete');
  actMissingNe.push('कोषाध्यक्ष समीक्षा तथा अध्यक्षको औपचारिक स्वीकृति प्रक्रिया बाँकी');
  actMissingEn.push('Treasurer review and President formal workflow approval pending');

  const actReady =
    actItems.length > 0 &&
    actApprovedCount === actItems.length &&
    actTracker.every((i) => i.collectionStatus === 'VERIFIED');

  const activitiesMetrics: GovernanceSectionMetrics = {
    sectionKey: 'ACTIVITIES',
    titleNe: 'सामाजिक गतिविधि खण्ड (Phase 3)',
    titleEn: 'Social Activities (Phase 3)',
    totalRecords: actItems.length,
    draftInternalRecords: actDraftCount,
    pendingReviewRecords: actPendingCount,
    approvedPublicRecords: actApprovedCount,
    evidenceItems: {
      notCollected: actTracker.filter((i) => i.collectionStatus === 'NOT_COLLECTED').length,
      collected: actTracker.filter((i) => i.collectionStatus === 'COLLECTED').length,
      verified: actTracker.filter((i) => i.collectionStatus === 'VERIFIED').length,
      rejected: actTracker.filter((i) => i.collectionStatus === 'REJECTED').length,
    },
    missingRequirementsNe: actMissingNe,
    missingRequirementsEn: actMissingEn,
    publicationReadiness: actReady ? 'READY_FOR_PUBLICATION' : 'NOT_READY_FOR_PUBLICATION',
    readinessLabelNe: actReady ? 'प्रकाशनका लागि तयार' : 'प्रकाशनका लागि तयार छैन',
    readinessLabelEn: actReady ? 'Ready for publication' : 'Not ready for publication',
    detailedEvidence: actTracker.map((i) => ({
      itemKey: i.itemKey,
      titleNe: i.titleNe,
      titleEn: i.titleEn,
      collectionStatus: i.collectionStatus,
      approvalStatus: i.approvalStatus,
      documentRefOrPath: i.documentRefOrPath,
      verifiedBy: i.verifiedBy,
      verificationDate: i.verificationDate,
      privateNotes: i.privateNotes,
    })),
  };

  // 3. Documents Metrics
  const docItems = publicDocumentStore;
  const docTracker = evidenceTrackerStore.filter((i) => i.category === 'DOCUMENT');
  const docDraftCount = docItems.filter((d) => d.status === 'DRAFT' || d.status === 'INTERNAL_ONLY').length;
  const docPendingCount = docItems.filter((d) => d.status === 'PENDING_REVIEW').length;
  const docApprovedCount = docItems.filter(
    (d) => d.status === 'APPROVED_PUBLIC' && d.isApprovedForPublic === true && d.hasSignedStampedPdf === true
  ).length;

  const docMissingNe: string[] = [];
  const docMissingEn: string[] = [];
  if (docApprovedCount === 0) {
    docMissingNe.push(`सबै ${docItems.length} दस्तावेजहरू DRAFT वा INTERNAL_ONLY मा सुरक्षित छन्`);
    docMissingEn.push(`All ${docItems.length} statutory documents are quarantined in DRAFT / INTERNAL_ONLY`);
  }
  docMissingNe.push('जि.प्र.का. छाप तथा हस्ताक्षर भएको मूल विधान (Signed/Stamped PDF) स्थानीय निर्देशिकामा संकलन बाँकी');
  docMissingEn.push('DAO stamped constitution final signed PDF pending local file verification');
  docMissingNe.push('कार्यसमितिबाट सार्वजनिक वितरण अनुमोदन (Public Release Approval) निर्णय बाँकी');
  docMissingEn.push('Executive committee public release resolution pending');

  const docReady =
    docItems.length > 0 &&
    docApprovedCount === docItems.length &&
    docTracker.every((i) => i.collectionStatus === 'VERIFIED');

  const documentsMetrics: GovernanceSectionMetrics = {
    sectionKey: 'DOCUMENTS',
    titleNe: 'दस्तावेज पुस्तकालय खण्ड (Phase 4)',
    titleEn: 'Document Library (Phase 4)',
    totalRecords: docItems.length,
    draftInternalRecords: docDraftCount,
    pendingReviewRecords: docPendingCount,
    approvedPublicRecords: docApprovedCount,
    evidenceItems: {
      notCollected: docTracker.filter((i) => i.collectionStatus === 'NOT_COLLECTED').length,
      collected: docTracker.filter((i) => i.collectionStatus === 'COLLECTED').length,
      verified: docTracker.filter((i) => i.collectionStatus === 'VERIFIED').length,
      rejected: docTracker.filter((i) => i.collectionStatus === 'REJECTED').length,
    },
    missingRequirementsNe: docMissingNe,
    missingRequirementsEn: docMissingEn,
    publicationReadiness: docReady ? 'READY_FOR_PUBLICATION' : 'NOT_READY_FOR_PUBLICATION',
    readinessLabelNe: docReady ? 'प्रकाशनका लागि तयार' : 'प्रकाशनका लागि तयार छैन',
    readinessLabelEn: docReady ? 'Ready for publication' : 'Not ready for publication',
    detailedEvidence: docTracker.map((i) => ({
      itemKey: i.itemKey,
      titleNe: i.titleNe,
      titleEn: i.titleEn,
      collectionStatus: i.collectionStatus,
      approvalStatus: i.approvalStatus,
      documentRefOrPath: i.documentRefOrPath,
      verifiedBy: i.verifiedBy,
      verificationDate: i.verificationDate,
      privateNotes: i.privateNotes,
    })),
  };

  // 4. Financial Metrics
  const finItems = financialTransparencyStore;
  const finTracker = evidenceTrackerStore.filter((i) => i.category === 'FINANCIAL');
  const finDraftCount = finItems.filter((f) => f.status === 'DRAFT' || f.status === 'INTERNAL_ONLY').length;
  const finPendingCount = finItems.filter(
    (f) => f.status === 'PENDING_TREASURER_REVIEW' || f.status === 'PENDING_PRESIDENT_APPROVAL'
  ).length;
  const finApprovedCount = finItems.filter((f) => f.status === 'APPROVED_PUBLIC' && f.isPublic === true).length;

  const finMissingNe: string[] = [];
  const finMissingEn: string[] = [];
  if (finApprovedCount === 0) {
    finMissingNe.push(`सबै ${finItems.length} आर्थिक कारोबारहरू DRAFT / INTERNAL_ONLY मा क्वारेन्टाइनमा छन्`);
    finMissingEn.push(`All ${finItems.length} financial records are quarantined in DRAFT / INTERNAL_ONLY`);
  }
  finMissingNe.push('आ.व. २०८१/८२ को दर्तावाला लेखापरीक्षकको अन्तिम हस्ताक्षरित प्रतिवेदन प्राप्त हुन बाँकी');
  finMissingEn.push('Registered independent auditor final report pending submission');
  finMissingNe.push('सक्कल भौचर तथा बैंक हिसाब मिलान (Zero Reconciliation Discrepancy) बाँकी');
  finMissingEn.push('Bank statement and voucher reconciliation pending');
  finMissingNe.push('कोषाध्यक्ष तथा अध्यक्षको दोहोरो हस्ताक्षर अनुमोदन बाँकी');
  finMissingEn.push('Dual Treasurer review and President sign-off pending');

  const finReady =
    finItems.length > 0 &&
    finApprovedCount === finItems.length &&
    finTracker.every((i) => i.collectionStatus === 'VERIFIED');

  const financialMetrics: GovernanceSectionMetrics = {
    sectionKey: 'FINANCIAL',
    titleNe: 'आर्थिक पारदर्शीता खण्ड (Phase 5)',
    titleEn: 'Financial Transparency (Phase 5)',
    totalRecords: finItems.length,
    draftInternalRecords: finDraftCount,
    pendingReviewRecords: finPendingCount,
    approvedPublicRecords: finApprovedCount,
    evidenceItems: {
      notCollected: finTracker.filter((i) => i.collectionStatus === 'NOT_COLLECTED').length,
      collected: finTracker.filter((i) => i.collectionStatus === 'COLLECTED').length,
      verified: finTracker.filter((i) => i.collectionStatus === 'VERIFIED').length,
      rejected: finTracker.filter((i) => i.collectionStatus === 'REJECTED').length,
    },
    missingRequirementsNe: finMissingNe,
    missingRequirementsEn: finMissingEn,
    publicationReadiness: finReady ? 'READY_FOR_PUBLICATION' : 'NOT_READY_FOR_PUBLICATION',
    readinessLabelNe: finReady ? 'प्रकाशनका लागि तयार' : 'प्रकाशनका लागि तयार छैन',
    readinessLabelEn: finReady ? 'Ready for publication' : 'Not ready for publication',
    detailedEvidence: finTracker.map((i) => ({
      itemKey: i.itemKey,
      titleNe: i.titleNe,
      titleEn: i.titleEn,
      collectionStatus: i.collectionStatus,
      approvalStatus: i.approvalStatus,
      documentRefOrPath: i.documentRefOrPath,
      verifiedBy: i.verifiedBy,
      verificationDate: i.verificationDate,
      privateNotes: i.privateNotes,
    })),
  };

  const overallReady = comReady && actReady && docReady && finReady;

  return {
    committee: committeeMetrics,
    activities: activitiesMetrics,
    documents: documentsMetrics,
    financial: financialMetrics,
    overallReadiness: overallReady ? 'READY_FOR_PUBLICATION' : 'NOT_READY_FOR_PUBLICATION',
    generatedAt: timestamp,
  };
}

// 12. Site Settings
let siteSettingsStore: SiteSettings = {
  orgNameNe: 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं',
  orgNameEn: 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu',
  orgLogoUrl: '/media/madi-sss-logo.jpg',
  sloganNe: 'मादीदेखि काठमाण्डौंसम्म, एकता, सेवा र सहकार्यको साझा अभियान',
  sloganEn: 'From Madi to Kathmandu, a shared initiative for unity, welfare, and collaboration',
  contactPhone: '', // Strictly no unverified placeholder phone numbers in production
  contactEmail: 'info@madisss.org.np',
  officeAddressNe: 'काठमाण्डौं महानगरपालिका वडा नं. ४, सुकेधारा, काठमाण्डौं',
  officeAddressEn: 'Ward No. 4, Sukedhara, Kathmandu, Nepal',
  originalOrganizationNameNe: 'मादी सरोकार केन्द्र, काठमाण्डौं',
  originalOrganizationNameEn: 'Madi Sarokar Kendra, Kathmandu',
  originalEstablishmentYear: '२०७६',
  currentOrganizationNameNe: 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं',
  currentOrganizationNameEn: 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu',
  renamingHistoryNe:
    'संस्थाको कार्यक्षेत्र, सदस्यता र संगठनात्मक संरचना विस्तार हुँदै जाँदा पूर्व संस्थाको नाम परिवर्तन गरी हालको ‘मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं’ राखिएको हो। संस्थालाई विधिवत रूपमा जिल्ला प्रशासन कार्यालय, काठमाण्डौंमा वि.सं. २०८२ साल साउन २१ गते (२०८२/०४/२१ BS) दर्ता तथा प्रमाणीकरण गरियो।',
  renamingHistoryEn:
    'As the organization’s scope, membership, and institutional structure expanded, its former name was changed to the current name, ‘Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu’. The organization was formally registered with the District Administration Office, Kathmandu on 2082/04/21 BS.',
  formalRegistrationYear: '२०८२',
  registrationAuthorityNe: 'जिल्ला प्रशासन कार्यालय, काठमाण्डौं',
  registrationAuthorityEn: 'District Administration Office, Kathmandu',
  registrationDateNe: '२०८२/०४/२१',
  registrationDateEn: '2082/04/21 BS (Aug 06, 2025)',
  formalRegistrationDateNe: 'वि.सं. २०८२ साल साउन २१ गते (२०८२/०४/२१ BS)',
  formalRegistrationDateEn: '2082/04/21 BS (Aug 06, 2025)',
  communityStartYear: '२०७६',
  communityStartDescriptionNe:
    'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौंको सुरुवात वि.सं. २०७६ सालमा ‘मादी सरोकार केन्द्र, काठमाण्डौं’ का रूपमा भएको हो। स्थापनादेखि नै मादीवासीहरूबीच सहयोग, भेटघाट, सांस्कृतिक आदानप्रदान र सामाजिक सहकार्यलाई अगाडि बढाइएको छ।',
  communityStartDescriptionEn:
    'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu began in Bikram Sambat 2076 as ‘Madi Sarokar Kendra, Kathmandu’. Since its establishment, it has promoted mutual support, networking, cultural exchange, and social collaboration among Madi residents.',
  organizationHistoryNe:
    'दर्तापछि संस्थाले सदस्यता, राहत तथा कल्याणकारी कार्यक्रम, सांस्कृतिक गतिविधि र सामाजिक सहकार्यलाई थप पारदर्शी र संगठित रूपमा अगाडि बढाएको छ।',
  organizationHistoryEn:
    'Following registration, the organization has continued its membership, relief and welfare programs, cultural activities, and social collaboration in a more transparent and organized manner.',
  isFoundingYearConfirmed: true, // Confirmed organizational history: established in 2076 BS as Madi Sarokar Kendra, formally registered in 2082 BS as Madi (Sankhuwasabha) Sarokar Samaj
  daoRegistrationNumber: '१६', // Officially verified from CDO registration certificate (दर्ता नं. १६)
  centralOfficeNe: 'काठमाण्डौं महानगरपालिका वडा नं. ४, सुकेधारा',
  centralOfficeEn: 'Kathmandu Ward 4, Sukedhara',
  jurisdictionNe: 'मादी नगरपालिका र काठमाण्डौं उपत्यका',
  jurisdictionEn: 'Madi Municipality & Kathmandu Valley',
  aboutBackgroundTitleNe: 'मादीवासीहरूको साझा थलो, सेवा र सहकार्यको केन्द्र',
  aboutBackgroundTitleEn: 'A Shared Home for Unity, Service & Community Well-being',
  aboutBackgroundP1Ne:
    'संखुवासभा जिल्लाको ऐतिहासिक र प्राकृतिक रूपमा समृद्ध मादी नगरपालिका (वडा नं. १ देखि ९ सम्म) बाट विभिन्न सिलसिलामा राजधानी काठमाण्डौं उपत्यकामा बसोबास गरिरहेका नगरवासीहरूलाई एउटै सूत्रमा बाँध्न वि.सं. २०८२ सालमा यो संस्था विधिवत् दर्ता भएको हो।',
  aboutBackgroundP1En:
    'Founded in 2082 BS, Madi (Sankhuwasabha) Sarokar Samaj brings together residents and diaspora hailing from all nine wards of Madi Municipality residing in Kathmandu Valley into a unified platform of mutual welfare, cultural continuity, and community solidarity.',
  aboutBackgroundP2Ne:
    'संस्थाले विपद् राहत, आर्थिक रूपले विपन्न विद्यार्थी तथा परिवारलाई राहत, आकस्मिक चिकित्सा सहयोग तथा स्थानीय विद्यालय सुधार तथा शैक्षिक पूर्वाधार सहयोग पुर्‍याउँदै आएको छ।',
  aboutBackgroundP2En:
    'The society provides humanitarian relief, support for needy students and families, emergency medical treatment aid, and educational infrastructure support for local schools.',
  constitutionEmptyStateNe: 'विधान डाउनलोडका लागि तयारी भइरहेको छ।',
  constitutionEmptyStateEn: 'The constitution document is being prepared for download.',
  objectives: [
    {
      id: 'obj-1',
      numNe: '१',
      numEn: '1',
      titleNe: 'आपसी एकता र सामाजिक सद्भाव',
      titleEn: 'Social Unity & Mutual Harmony',
      descNe:
        'संखुवासभा जिल्ला मादी नगरपालिकाबाट काठमाण्डौं उपत्यकामा बसोबास, अध्ययन, पेशा वा व्यवसाय गर्ने सम्पूर्ण दाजुभाइ तथा दिदीबहिनीहरूबीच भ्रातृत्व, सद्भाव र सहकार्य अभिवृद्धि गर्ने।',
      descEn:
        'Fostering fraternal unity, mutual collaboration, and shared solidarity among all residents hailing from Madi Municipality currently residing, studying, or working in Kathmandu Valley.',
      icon: '🤝',
      isVerified: false,
    },
    {
      id: 'obj-2',
      numNe: '२',
      numEn: '2',
      titleNe: 'विपद् व्यवस्थापन तथा आकस्मिक कल्याणकारी राहत',
      titleEn: 'Disaster Relief & Emergency Welfare',
      descNe:
        'प्राकृतिक विपत्ति (पहिरो, बाढी, आगलागी), महामारी वा भैपरी आउने विपद्मा तत्काल आकस्मिक उद्धार, राहत, स्वास्थ्य सहायता तथा वित्तीय पुनर्स्थापना कोष सञ्चालन गर्ने।',
      descEn:
        'Operating an emergency welfare and relief reserve fund providing rapid-response humanitarian aid, medical rescue, and rebuilding grants during disasters.',
      icon: '🛡️',
      isVerified: false,
    },
    {
      id: 'obj-3',
      numNe: '३',
      numEn: '3',
      titleNe: 'मादीको विकास तथा शैक्षिक–स्वास्थ्य सहजीकरण',
      titleEn: 'Municipal Development, Education & Healthcare',
      descNe:
        'मादी नगरपालिका क्षेत्रको सामाजिक, शैक्षिक, वातावरणीय विकास र स्वास्थ्य सुधारका लागि विशेषज्ञ परामर्श, स्वयंसेवी सहयोग र विकास साझेदारहरूसँग सहजीकरण गर्ने।',
      descEn:
        'Facilitating developmental projects, environmental stewardship, specialist technical advisory, and health access in partnership with local authorities in Madi.',
      icon: '🌱',
      isVerified: false,
    },
    {
      id: 'obj-4',
      numNe: '४',
      numEn: '4',
      titleNe: 'कला, भाषा, मौलिक संस्कृति र सम्पदा संरक्षण',
      titleEn: 'Cultural Preservation & Heritage Promotion',
      descNe:
        'मादी क्षेत्रका मौलिक परम्परा, चाडपर्व, ऐतिहासिक दस्तावेज र सांस्कृतिक धरोहरहरूको संरक्षण तथा नयाँ पुस्तामा हस्तान्तरणका लागि विभिन्न सांस्कृतिक कार्यक्रमहरू आयोजना गर्ने।',
      descEn:
        'Preserving and celebrating the distinct cultural identities, historical relics, indigenous festivities, and traditions of Madi for future generations.',
      icon: '🎭',
      isVerified: false,
    },
    {
      id: 'obj-5',
      numNe: '५',
      numEn: '5',
      titleNe: 'शैक्षिक पूर्वाधार तथा विद्यालय सुधार सहयोग',
      titleEn: 'Educational Infrastructure & School Support',
      descNe:
        'स्थानीय विद्यालयहरूको भौतिक तथा शैक्षिक पूर्वाधार सुधारका लागि कोष सहयोग पुर्‍याउने।',
      descEn:
        'Providing fund support for local school improvements and educational infrastructure.',
      icon: '🏫',
      isVerified: false,
    },
    {
      id: 'obj-6',
      numNe: '६',
      numEn: '6',
      titleNe: 'आकस्मिक उपचार तथा चिकित्सा सहायता',
      titleEn: 'Emergency Medical Treatment Assistance',
      descNe:
        'विपद् तथा आकस्मिक रोगव्याधीको अवस्थामा मादीवासीहरूलाई आवश्यक उपचार तथा चिकित्सा सहयोग पुर्‍याउने।',
      descEn:
        'Providing necessary urgent healthcare and medical treatment assistance to community members during emergencies.',
      icon: '🏥',
      isVerified: false,
    },
  ],
  membershipTiers: [
    {
      id: 'tier-ord',
      tierKey: 'ORDINARY',
      nameNe: 'साधारण सदस्यता',
      nameEn: 'Ordinary Membership',
      feeNe: 'निर्णयपछि प्रकाशित गरिने',
      feeEn: 'To be published after decision',
      descNe: 'मादी नगरपालिकाबाट काठमाण्डौं उपत्यकामा बसोबास गर्ने १८ वर्ष उमेर पुगेका नेपाली नागरिक।',
      descEn: 'Eligible for all Madi residents 18+ years of age residing in Kathmandu Valley.',
      isVerified: false,
    },
    {
      id: 'tier-life',
      tierKey: 'LIFE',
      nameNe: 'आजीवन सदस्यता',
      nameEn: 'Life Membership',
      feeNe: 'निर्णयपछि प्रकाशित गरिने',
      feeEn: 'To be published after decision',
      descNe: 'आजीवन सदस्यता प्राप्त गरी संस्थाको नीति निर्माण र साधारण सभामा स्थायी मताधिकार।',
      descEn: 'Lifetime member status with permanent voting franchise at general assemblies.',
      isPopular: true,
      isVerified: false,
    },
    {
      id: 'tier-hon',
      tierKey: 'HONORARY',
      nameNe: 'मानार्थ सदस्यता',
      nameEn: 'Honorary Membership',
      feeNe: 'सम्मान स्वरूप (निःशुल्क)',
      feeEn: 'Conferred Honoris Causa',
      descNe: 'मादी क्षेत्र वा राष्ट्रिय स्तरमा विशिष्ट योगदान पुर्याएका प्रतिष्ठित व्यक्तित्वलाई कार्यसमितिको निर्णयले प्रदान।',
      descEn: 'Conferred by the Executive Committee to distinguished patrons and eminent contributors.',
      isVerified: false,
    },
  ],
  facebookUrl: 'https://facebook.com/madisss',
  youtubeUrl: 'https://youtube.com/@madisss',
  emailNotificationsEnabled: true,
  defaultMetaTitleNe: 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं | सामाजिक तथा कल्याणकारी संस्था',
  defaultMetaTitleEn: 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu | Social Organization',
  defaultMetaDescNe: 'संखुवासभाको मादीबाट काठमाण्डौंमा बसोबास गर्ने नागरिकहरूको सामाजिक एकता, राहत तथा कल्याणकारी सहयोग, शैक्षिक पूर्वाधार सुधार तथा सांस्कृतिक प्रवर्द्धन संस्था।',
  defaultMetaDescEn: 'Connecting and supporting the community from Madi Municipality, Sankhuwasabha residing in Kathmandu Valley.',
  ogImageUrl: '/media/incoming/Chauki.jpg',
};

export async function getSiteSettings(): Promise<SiteSettings> {
  return siteSettingsStore;
}

export async function updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  siteSettingsStore = { ...siteSettingsStore, ...updates };
  return siteSettingsStore;
}

// 13. Audit Activity Logging
let activityLogsStore: CMSActivityLog[] = [
  {
    id: 'log-001',
    adminId: 'admin-1',
    adminName: 'मादी प्रशासक',
    action: 'PUBLISH_ACTIVITY',
    entityType: 'SocialActivity',
    entityId: 'act-001',
    details: { titleNe: 'मादी नगरपालिकामा बृहत् निःशुल्क स्वास्थ्य तथा आँखा शिविर' },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export async function logCMSActivity(
  adminId: string,
  adminName: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: any
): Promise<void> {
  activityLogsStore.unshift({
    id: `log-${Date.now()}`,
    adminId,
    adminName,
    action,
    entityType,
    entityId,
    details,
    createdAt: new Date().toISOString(),
  });
}

export async function getCMSActivityLogs(limit = 50): Promise<CMSActivityLog[]> {
  return activityLogsStore.slice(0, limit);
}

// -------------------------------------------------------------
// 14. Internal Activity & Financial Record-Keeping System
// -------------------------------------------------------------

export type RetentionRule = 'PERMANENT' | 'LONG_TERM';
export type ArchiveCategory = 'activities' | 'relief-fund' | 'audit' | 'documents';
export type InternalRecordPublicationStatus = 'DRAFT' | 'INTERNAL_ONLY' | 'PENDING_REVIEW' | 'APPROVED_PUBLIC';

export interface InternalActivityRecord {
  id: string; // e.g. 'act-rec-208182-001'
  fiscalYear: string; // e.g. '2081-82'
  category: ArchiveCategory; // 'activities'
  archivePath: string; // e.g. '2081-82/activities/act-rec-208182-001'
  titleNe: string;
  titleEn: string;
  date: string;
  location: string;
  organizer: string;
  
  // Internal Evidence & Documents (Strictly Private)
  attendanceSheetRef: string; // Internal attendance sheet reference
  activityReportRef: string; // Internal activity report document
  photoAlbumRef: string; // Internal photo album reference
  photoConsentRefs: string[]; // List of consent form IDs
  hasReceiptsVouchers: boolean;
  voucherRefs: string[]; // Vouchers / receipts
  zeroExpenseDeclaration?: {
    declared: boolean;
    declarationStatement: string;
    declaredBy: string;
    declaredAt: string;
  };
  bankStatementRef?: string; // Bank statement reference
  approvalMinuteRef: string; // Executive committee minute reference
  
  // Governance & Retention
  retentionCategory: RetentionRule; // 'LONG_TERM'
  publicationStatus: InternalRecordPublicationStatus; // Default 'DRAFT' | 'INTERNAL_ONLY'
  
  // Public-Safe Projection
  publicSafeSummary: {
    summaryNe: string;
    summaryEn: string;
    publicReportUrl?: string;
    isApprovedForPublic: boolean;
  };
  
  // Internal Notes
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InternalFinancialRecord {
  id: string; // e.g. 'fin-rec-208182-001'
  fiscalYear: string; // e.g. '2081-82'
  category: ArchiveCategory; // 'activities' | 'relief-fund' | 'audit' | 'documents'
  archivePath: string; // e.g. '2081-82/relief-fund/fin-rec-208182-001'
  transactionType:
    | 'RELIEF_FUND_CONTRIBUTION'
    | 'RELIEF_FUND_EXPENDITURE'
    | 'ACTIVITY_EXPENSE'
    | 'AUDIT_REPORT'
    | 'ANNUAL_FINANCIAL_STATEMENT'
    | 'ADMINISTRATIVE_EXPENSE'
    | 'OTHER';
  date: string;
  amount: number;
  currency: 'NPR';
  
  // Internal Private Financial Data (STRICTLY SUPPRESSED IN PUBLIC)
  payerPayeeCategory: string; // e.g. 'COMMUNITY_WELL_WISHER', 'HEALTH_SUPPLIER', 'AUDIT_FIRM' (NO public personal identity)
  donorBeneficiaryPrivateIdentity?: string; // Internal private donor or beneficiary identity
  bankAccountRef?: string; // Internal bank account reference
  checkNumber?: string; // Check number
  internalLedgerCode?: string; // Internal ledger code
  supportingDocumentRefs: string[]; // Vouchers, invoices, receipts, bills
  bankStatementRef?: string; // Bank statement reference
  
  // Verification & Multi-Stage Gate
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  reviewedByTreasurerName?: string;
  reviewedByTreasurerAt?: string;
  approvedByPresidentName?: string;
  approvedByPresidentAt?: string;
  
  // Governance & Retention
  retentionCategory: RetentionRule; // 'PERMANENT' or 'LONG_TERM'
  publicationStatus: 'DRAFT' | 'INTERNAL_ONLY' | 'PENDING_TREASURER_REVIEW' | 'PENDING_PRESIDENT_APPROVAL' | 'APPROVED_PUBLIC';
  
  // Public-Safe Projection
  publicSafeSummary: {
    descriptionNe: string;
    descriptionEn: string;
    approvedAmountVisibility: boolean;
    approvedDocumentUrl?: string;
    isApprovedForPublic: boolean;
  };
  
  // Private Admin Notes
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export const PERMANENT_RECORD_TYPES = [
  'constitution',
  'registration_certificate',
  'audit_report',
  'annual_financial_statement',
  'executive_minutes',
  'AUDIT_REPORT',
  'ANNUAL_FINANCIAL_STATEMENT',
] as const;

export function resolveRetentionCategory(type: string): RetentionRule {
  const normalized = type.toLowerCase();
  if (
    normalized.includes('constitution') ||
    normalized.includes('registration') ||
    normalized.includes('audit') ||
    normalized.includes('annual_financial') ||
    normalized.includes('minute')
  ) {
    return 'PERMANENT';
  }
  return 'LONG_TERM';
}

export function buildArchivePath(fiscalYear: string, category: ArchiveCategory, recordId: string): string {
  return `${fiscalYear}/${category}/${recordId}`;
}

let internalActivityRecordsStore: InternalActivityRecord[] = [
  {
    id: 'act-rec-208182-001',
    fiscalYear: '2081-82',
    category: 'activities',
    archivePath: '2081-82/activities/act-rec-208182-001',
    titleNe: 'मादी नगरपालिकामा बृहत् निःशुल्क स्वास्थ्य तथा आँखा शिविर',
    titleEn: 'Comprehensive Free Health & Eye Camp in Madi Municipality',
    date: '२०८१-११-१२',
    location: 'मादी नगरपालिका वडा नं. ४, ओखरबोटे, संखुवासभा',
    organizer: 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं',
    attendanceSheetRef: '2081-82/activities/attendance-health-camp-okharbote.pdf',
    activityReportRef: '2081-82/activities/report-health-camp-final.pdf',
    photoAlbumRef: '2081-82/activities/album-okharbote-2081/',
    photoConsentRefs: ['mct-003', 'consent-okharbote-batch-1'],
    hasReceiptsVouchers: true,
    voucherRefs: ['2081-82/activities/voucher-med-supplies-441.pdf', '2081-82/activities/voucher-transport-442.pdf'],
    bankStatementRef: '2081-82/activities/bank-statement-entry-tx9912.pdf',
    approvalMinuteRef: 'minute-ec-meeting-18-decision-4',
    retentionCategory: 'LONG_TERM',
    publicationStatus: 'INTERNAL_ONLY',
    publicSafeSummary: {
      summaryNe: 'मादी नगरपालिकामा विशेषज्ञ चिकित्सकहरूको प्रत्यक्ष उपस्थितिमा स्वास्थ्य शिविर सम्पन्न भई स्थानीय बासिन्दा लाभान्वित।',
      summaryEn: 'Free community medical consultation held in Madi municipality for local residents.',
      isApprovedForPublic: false,
    },
    adminNotes: 'Raw patient diagnostic records, medicine distribution tokens, and attendance signatures strictly sequestered under internal archive.',
    createdAt: '2026-02-24T10:00:00Z',
    updatedAt: '2026-02-24T10:00:00Z',
  },
  {
    id: 'act-rec-208182-002',
    fiscalYear: '2081-82',
    category: 'activities',
    archivePath: '2081-82/activities/act-rec-208182-002',
    titleNe: 'सरोकार समाज काठमाण्डौं खुला अन्तरक्रिया तथा नयाँ वर्ष शुभकामना आदानप्रदान',
    titleEn: 'Sarokar Samaj Open Community Interaction & New Year Greetings Exchange',
    date: '२०८२-०१-०५',
    location: 'सामुदायिक भवन, काठमाण्डौं',
    organizer: 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं',
    attendanceSheetRef: '2081-82/activities/attendance-interaction-2082.pdf',
    activityReportRef: '2081-82/activities/report-interaction-2082.pdf',
    photoAlbumRef: '2081-82/activities/album-interaction-2082/',
    photoConsentRefs: ['consent-group-general-2082'],
    hasReceiptsVouchers: false,
    voucherRefs: [],
    zeroExpenseDeclaration: {
      declared: true,
      declarationStatement: 'स्वयंसेवी योगदान तथा निःशुल्क सामुदायिक भवन प्रयोग भएकाले कुनै संस्थागत खर्च नभएको प्रमाणित गर्दछु।',
      declaredBy: 'Treasurer',
      declaredAt: '2026-04-18T10:00:00Z',
    },
    approvalMinuteRef: 'minute-ec-meeting-19-decision-2',
    retentionCategory: 'LONG_TERM',
    publicationStatus: 'DRAFT',
    publicSafeSummary: {
      summaryNe: 'सामुदायिक अन्तरक्रिया तथा सद्भाव आदानप्रदान कार्यक्रम सम्पन्न।',
      summaryEn: 'Community interaction and fellowship program concluded.',
      isApprovedForPublic: false,
    },
    adminNotes: 'Draft interaction recap. Zero expenses declared by Treasurer.',
    createdAt: '2026-04-18T10:00:00Z',
    updatedAt: '2026-04-18T10:00:00Z',
  },
];

let internalFinancialRecordsStore: InternalFinancialRecord[] = [
  {
    id: 'fin-rec-208182-001',
    fiscalYear: '2081-82',
    category: 'relief-fund',
    archivePath: '2081-82/relief-fund/fin-rec-208182-001',
    transactionType: 'RELIEF_FUND_EXPENDITURE',
    date: '२०८१-०५-०२',
    amount: 50000,
    currency: 'NPR',
    payerPayeeCategory: 'DISASTER_AFFECTED_FAMILY_SUPPORT',
    donorBeneficiaryPrivateIdentity: 'प्रदीप लिङ्थेप तथा प्रभावित परिवार (नागरिकता नं. ०६-०१-७२-०XXXX)',
    bankAccountRef: 'Nabil Bank Acct ****4910',
    checkNumber: 'CHQ-2081-00441',
    internalLedgerCode: 'GL-RELIEF-EXP-501',
    supportingDocumentRefs: [
      '2081-82/relief-fund/voucher-relief-handover-881.pdf',
      '2081-82/relief-fund/ward-recommendation-doc-2.pdf',
    ],
    bankStatementRef: '2081-82/relief-fund/bank-statement-page-4.pdf',
    verificationStatus: 'VERIFIED',
    reviewedByTreasurerName: 'Treasurer',
    reviewedByTreasurerAt: '2026-08-20T11:00:00Z',
    approvedByPresidentName: 'President',
    approvedByPresidentAt: '2026-08-21T14:00:00Z',
    retentionCategory: 'LONG_TERM',
    publicationStatus: 'INTERNAL_ONLY',
    publicSafeSummary: {
      descriptionNe: 'मादी बाढीपहिरो पीडित परिवारका लागि आकस्मिक राहत सहयोग।',
      descriptionEn: 'Emergency disaster humanitarian relief support for affected family.',
      approvedAmountVisibility: true,
      isApprovedForPublic: false,
    },
    adminNotes: 'Personal identity, check number, and ward citizen IDs strictly suppressed from public display.',
    createdAt: '2026-08-20T11:00:00Z',
    updatedAt: '2026-08-21T14:00:00Z',
  },
  {
    id: 'fin-rec-208182-002',
    fiscalYear: '2081-82',
    category: 'audit',
    archivePath: '2081-82/audit/fin-rec-208182-002',
    transactionType: 'AUDIT_REPORT',
    date: '२०८२-०३-१५',
    amount: 25000,
    currency: 'NPR',
    payerPayeeCategory: 'LICENSED_AUDIT_FIRM',
    donorBeneficiaryPrivateIdentity: 'के.सी. एण्ड एसोसिएट्स, चार्टर्ड एकाउन्टेन्ट्स',
    internalLedgerCode: 'GL-AUDIT-FEES-102',
    supportingDocumentRefs: [
      '2081-82/audit/audit-report-signed-stamped-final.pdf',
      '2081-82/audit/audit-fee-invoice-091.pdf',
    ],
    verificationStatus: 'VERIFIED',
    reviewedByTreasurerName: 'Treasurer',
    reviewedByTreasurerAt: '2026-07-02T10:00:00Z',
    approvedByPresidentName: 'President',
    approvedByPresidentAt: '2026-07-03T16:00:00Z',
    retentionCategory: 'PERMANENT',
    publicationStatus: 'INTERNAL_ONLY',
    publicSafeSummary: {
      descriptionNe: 'आर्थिक वर्ष २०८१/८२ को स्वतन्त्र लेखापरीक्षकबाट प्रमाणित अन्तिम लेखापरीक्षण प्रतिवेदन।',
      descriptionEn: 'Statutory Independent Audit Report for Fiscal Year 2081/82.',
      approvedAmountVisibility: false,
      approvedDocumentUrl: '/documents/audit-report-208182-redacted.pdf',
      isApprovedForPublic: false,
    },
    adminNotes: 'Permanent retention archive. Auditor invoice and bank debit records preserved internally.',
    createdAt: '2026-07-02T10:00:00Z',
    updatedAt: '2026-07-03T16:00:00Z',
  },
  {
    id: 'fin-rec-208182-003',
    fiscalYear: '2081-82',
    category: 'documents',
    archivePath: '2081-82/documents/fin-rec-208182-003',
    transactionType: 'OTHER',
    date: '२०८२-०४-२१',
    amount: 0,
    currency: 'NPR',
    payerPayeeCategory: 'STATUTORY_DAO_REGISTRATION',
    supportingDocumentRefs: [
      '2081-82/documents/constitution-madi-sss-2082.pdf',
      '2081-82/documents/cdo-registration-cert.pdf',
    ],
    verificationStatus: 'VERIFIED',
    reviewedByTreasurerName: 'Treasurer',
    reviewedByTreasurerAt: '2026-08-05T09:00:00Z',
    approvedByPresidentName: 'President',
    approvedByPresidentAt: '2026-08-05T09:30:00Z',
    retentionCategory: 'PERMANENT',
    publicationStatus: 'INTERNAL_ONLY',
    publicSafeSummary: {
      descriptionNe: 'मादी (संखुवासभा) सरोकार समाजको स्वीकृत विधान तथा दर्ता अभिलेख।',
      descriptionEn: 'Official Approved Constitution and Statutory Registration Records.',
      approvedAmountVisibility: false,
      isApprovedForPublic: false,
    },
    adminNotes: 'Permanent constitutional archive under executive custody.',
    createdAt: '2026-08-05T09:00:00Z',
    updatedAt: '2026-08-05T09:30:00Z',
  },
];

// Activity Records CRUD & Retrieval
export async function getInternalActivityRecords(fiscalYear?: string): Promise<InternalActivityRecord[]> {
  let list = [...internalActivityRecordsStore];
  if (fiscalYear && fiscalYear !== 'ALL') {
    list = list.filter((r) => r.fiscalYear === fiscalYear);
  }
  return list;
}

export async function getInternalActivityRecordById(id: string): Promise<InternalActivityRecord | null> {
  const record = internalActivityRecordsStore.find((r) => r.id === id);
  return record || null;
}

export async function saveInternalActivityRecord(
  data: Partial<InternalActivityRecord> & { titleNe: string; fiscalYear: string }
): Promise<InternalActivityRecord> {
  const timestamp = new Date().toISOString();
  const id = data.id || `act-rec-${data.fiscalYear.replace('-', '')}-${Date.now()}`;
  const archivePath = data.archivePath || buildArchivePath(data.fiscalYear, 'activities', id);

  const existingIdx = internalActivityRecordsStore.findIndex((r) => r.id === id);
  const newRecord: InternalActivityRecord = {
    id,
    fiscalYear: data.fiscalYear,
    category: 'activities',
    archivePath,
    titleNe: data.titleNe,
    titleEn: data.titleEn || data.titleNe,
    date: data.date || '२०८२-०१-०१',
    location: data.location || 'काठमाण्डौं',
    organizer: data.organizer || 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं',
    attendanceSheetRef: data.attendanceSheetRef || '',
    activityReportRef: data.activityReportRef || '',
    photoAlbumRef: data.photoAlbumRef || '',
    photoConsentRefs: data.photoConsentRefs || [],
    hasReceiptsVouchers: Boolean(data.hasReceiptsVouchers),
    voucherRefs: data.voucherRefs || [],
    zeroExpenseDeclaration: data.zeroExpenseDeclaration,
    bankStatementRef: data.bankStatementRef,
    approvalMinuteRef: data.approvalMinuteRef || '',
    retentionCategory: 'LONG_TERM',
    publicationStatus: data.publicationStatus || 'INTERNAL_ONLY',
    publicSafeSummary: data.publicSafeSummary || {
      summaryNe: '',
      summaryEn: '',
      isApprovedForPublic: false,
    },
    adminNotes: data.adminNotes,
    createdAt: existingIdx !== -1 ? internalActivityRecordsStore[existingIdx].createdAt : timestamp,
    updatedAt: timestamp,
  };

  if (existingIdx !== -1) {
    internalActivityRecordsStore[existingIdx] = newRecord;
  } else {
    internalActivityRecordsStore.push(newRecord);
  }
  return newRecord;
}

// Financial Records CRUD & Retrieval
export async function getInternalFinancialRecords(fiscalYear?: string, category?: ArchiveCategory): Promise<InternalFinancialRecord[]> {
  let list = [...internalFinancialRecordsStore];
  if (fiscalYear && fiscalYear !== 'ALL') {
    list = list.filter((r) => r.fiscalYear === fiscalYear);
  }
  if (category && category !== ('ALL' as any)) {
    list = list.filter((r) => r.category === category);
  }
  return list;
}

export async function getInternalFinancialRecordById(id: string): Promise<InternalFinancialRecord | null> {
  const record = internalFinancialRecordsStore.find((r) => r.id === id);
  return record || null;
}

export async function saveInternalFinancialRecord(
  data: Partial<InternalFinancialRecord> & {
    transactionType: InternalFinancialRecord['transactionType'];
    fiscalYear: string;
    amount: number;
    category: ArchiveCategory;
  }
): Promise<InternalFinancialRecord> {
  const timestamp = new Date().toISOString();
  const id = data.id || `fin-rec-${data.fiscalYear.replace('-', '')}-${Date.now()}`;
  const archivePath = data.archivePath || buildArchivePath(data.fiscalYear, data.category, id);
  const retentionCategory = resolveRetentionCategory(data.transactionType);

  const existingIdx = internalFinancialRecordsStore.findIndex((r) => r.id === id);
  const newRecord: InternalFinancialRecord = {
    id,
    fiscalYear: data.fiscalYear,
    category: data.category,
    archivePath,
    transactionType: data.transactionType,
    date: data.date || '२०८२-०१-०१',
    amount: data.amount,
    currency: 'NPR',
    payerPayeeCategory: data.payerPayeeCategory || 'GENERAL_TRANSACTION',
    donorBeneficiaryPrivateIdentity: data.donorBeneficiaryPrivateIdentity,
    bankAccountRef: data.bankAccountRef,
    checkNumber: data.checkNumber,
    internalLedgerCode: data.internalLedgerCode,
    supportingDocumentRefs: data.supportingDocumentRefs || [],
    bankStatementRef: data.bankStatementRef,
    verificationStatus: data.verificationStatus || 'PENDING',
    reviewedByTreasurerName: data.reviewedByTreasurerName,
    reviewedByTreasurerAt: data.reviewedByTreasurerAt,
    approvedByPresidentName: data.approvedByPresidentName,
    approvedByPresidentAt: data.approvedByPresidentAt,
    retentionCategory,
    publicationStatus: data.publicationStatus || 'INTERNAL_ONLY',
    publicSafeSummary: data.publicSafeSummary || {
      descriptionNe: '',
      descriptionEn: '',
      approvedAmountVisibility: false,
      isApprovedForPublic: false,
    },
    adminNotes: data.adminNotes,
    createdAt: existingIdx !== -1 ? internalFinancialRecordsStore[existingIdx].createdAt : timestamp,
    updatedAt: timestamp,
  };

  if (existingIdx !== -1) {
    internalFinancialRecordsStore[existingIdx] = newRecord;
  } else {
    internalFinancialRecordsStore.push(newRecord);
  }
  return newRecord;
}

// -------------------------------------------------------------
// Public Projection Functions (Strict Zero Data Leakage)
// -------------------------------------------------------------

export interface PublicActivityProjection {
  id: string;
  fiscalYear: string;
  titleNe: string;
  titleEn: string;
  date: string;
  location: string;
  organizer: string;
  publicSummaryNe: string;
  publicSummaryEn: string;
  publicReportUrl?: string;
}

export interface PublicFinancialProjection {
  id: string;
  fiscalYear: string;
  transactionType: string;
  date: string;
  amount?: number; // Excluded if approvedAmountVisibility is false
  currency: 'NPR';
  payerPayeeCategory: string; // High level category only, NEVER personal identity
  publicDescriptionNe: string;
  publicDescriptionEn: string;
  publicDocumentUrl?: string;
}

export async function getPublicActivityRecords(fiscalYear?: string): Promise<PublicActivityProjection[]> {
  let records = internalActivityRecordsStore.filter(
    (r) => r.publicationStatus === 'APPROVED_PUBLIC' && r.publicSafeSummary.isApprovedForPublic === true
  );
  if (fiscalYear && fiscalYear !== 'ALL') {
    records = records.filter((r) => r.fiscalYear === fiscalYear);
  }
  return records.map((r) => ({
    id: r.id,
    fiscalYear: r.fiscalYear,
    titleNe: r.titleNe,
    titleEn: r.titleEn,
    date: r.date,
    location: r.location,
    organizer: r.organizer,
    publicSummaryNe: r.publicSafeSummary.summaryNe,
    publicSummaryEn: r.publicSafeSummary.summaryEn,
    publicReportUrl: r.publicSafeSummary.publicReportUrl,
  }));
}

export async function getPublicFinancialRecords(fiscalYear?: string): Promise<PublicFinancialProjection[]> {
  let records = internalFinancialRecordsStore.filter(
    (r) => r.publicationStatus === 'APPROVED_PUBLIC' && r.publicSafeSummary.isApprovedForPublic === true
  );
  if (fiscalYear && fiscalYear !== 'ALL') {
    records = records.filter((r) => r.fiscalYear === fiscalYear);
  }
  return records.map((r) => ({
    id: r.id,
    fiscalYear: r.fiscalYear,
    transactionType: r.transactionType,
    date: r.date,
    amount: r.publicSafeSummary.approvedAmountVisibility ? r.amount : undefined,
    currency: r.currency,
    payerPayeeCategory: r.payerPayeeCategory,
    publicDescriptionNe: r.publicSafeSummary.descriptionNe,
    publicDescriptionEn: r.publicSafeSummary.descriptionEn,
    publicDocumentUrl: r.publicSafeSummary.approvedDocumentUrl,
  }));
}

// -------------------------------------------------------------
// Admin Search & Filtering API
// -------------------------------------------------------------

export interface ArchiveSearchFilter {
  fiscalYear?: string;
  category?: ArchiveCategory | 'ALL';
  documentType?: string | 'ALL';
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'ALL';
  publicationStatus?: string | 'ALL';
  retentionCategory?: RetentionRule | 'ALL';
  searchTerm?: string;
}

export async function searchInternalArchiveRecords(filters: ArchiveSearchFilter) {
  let activities = [...internalActivityRecordsStore];
  if (filters.fiscalYear && filters.fiscalYear !== 'ALL') {
    activities = activities.filter((a) => a.fiscalYear === filters.fiscalYear);
  }
  if (filters.category && filters.category !== 'ALL') {
    activities = activities.filter((a) => a.category === filters.category);
  }
  if (filters.publicationStatus && filters.publicationStatus !== 'ALL') {
    activities = activities.filter((a) => a.publicationStatus === filters.publicationStatus);
  }
  if (filters.retentionCategory && filters.retentionCategory !== 'ALL') {
    activities = activities.filter((a) => a.retentionCategory === filters.retentionCategory);
  }
  if (filters.searchTerm) {
    const q = filters.searchTerm.toLowerCase();
    activities = activities.filter(
      (a) =>
        a.titleNe.toLowerCase().includes(q) ||
        a.titleEn.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.organizer.toLowerCase().includes(q) ||
        a.archivePath.toLowerCase().includes(q)
    );
  }

  let financials = [...internalFinancialRecordsStore];
  if (filters.fiscalYear && filters.fiscalYear !== 'ALL') {
    financials = financials.filter((f) => f.fiscalYear === filters.fiscalYear);
  }
  if (filters.category && filters.category !== 'ALL') {
    financials = financials.filter((f) => f.category === filters.category);
  }
  if (filters.documentType && filters.documentType !== 'ALL') {
    financials = financials.filter((f) => f.transactionType === filters.documentType);
  }
  if (filters.verificationStatus && filters.verificationStatus !== 'ALL') {
    financials = financials.filter((f) => f.verificationStatus === filters.verificationStatus);
  }
  if (filters.publicationStatus && filters.publicationStatus !== 'ALL') {
    financials = financials.filter((f) => f.publicationStatus === filters.publicationStatus);
  }
  if (filters.retentionCategory && filters.retentionCategory !== 'ALL') {
    financials = financials.filter((f) => f.retentionCategory === filters.retentionCategory);
  }
  if (filters.searchTerm) {
    const q = filters.searchTerm.toLowerCase();
    financials = financials.filter(
      (f) =>
        f.transactionType.toLowerCase().includes(q) ||
        f.payerPayeeCategory.toLowerCase().includes(q) ||
        f.archivePath.toLowerCase().includes(q) ||
        (f.publicSafeSummary.descriptionNe && f.publicSafeSummary.descriptionNe.toLowerCase().includes(q)) ||
        (f.publicSafeSummary.descriptionEn && f.publicSafeSummary.descriptionEn.toLowerCase().includes(q))
    );
  }

  return {
    activities,
    financials,
    totalRecords: activities.length + financials.length,
  };
}


