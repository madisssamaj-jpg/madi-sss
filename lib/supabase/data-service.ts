// Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu
// Supabase Data Service with Graceful Fallback & Resilient Querying
import { getSupabaseServerClient } from './server';
import { getDbPool } from '../db/pool';
import {
  type EventProgram,
  type MembershipApplication,
  type NoticeItem,
  type FeedbackSubmission,
  type GovernanceReport,
  getEvents as getEventsFallback,
  getEventBySlug as getEventBySlugFallback,
  getNotices as getNoticesFallback,
  getReports as getReportsFallback,
  getSiteSettings as getSiteSettingsFallback,
} from '../cms/cms-service';

export interface SupabaseFinancialAccount {
  id: string;
  account_code: string;
  name_ne: string;
  name_en: string;
  account_type: string;
  bank_name?: string;
  account_number_mask?: string;
  current_balance: number;
  opening_balance: number;
  currency: string;
  is_active: boolean;
}

export interface SupabaseFinancialTransaction {
  id: string;
  master_transfer_id?: string;
  leg_type: string;
  type: string;
  account_id: string;
  amount_npr: number;
  currency: string;
  is_reversal: boolean;
  created_at: string;
}

export interface SupabaseDeusiDonation {
  id: string;
  contributor_name_ne: string;
  contributor_name_en?: string;
  madi_ward?: number;
  amount_npr: number;
  blessing_message_ne?: string;
  blessing_message_en?: string;
  payment_method: string;
  payment_status: string;
  is_public: boolean;
  created_at: string;
}

export interface SupabaseSocialSupportRequest {
  id: string;
  applicant_name_ne: string;
  applicant_name_en?: string;
  contact_phone: string;
  contact_email?: string;
  madi_ward?: number;
  current_location: string;
  support_category: string;
  description_ne: string;
  status: string;
  created_at: string;
}

/**
 * 1. Fetch Events from Supabase with fallback to CMS memory store
 */
export async function getEventsFromSupabase(
  status?: 'UPCOMING' | 'COMPLETED' | 'DRAFT',
  includePrivate = false
): Promise<EventProgram[]> {
  try {
    const supabase = getSupabaseServerClient(false);
    let query = supabase.from('events_programs').select('*').order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return await getEventsFallback(status, includePrivate);
    }

    return data.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      titleNe: row.title_ne,
      titleEn: row.title_en,
      eventDateTime: row.event_date_time,
      venueNe: row.venue_ne,
      venueEn: row.venue_en,
      agendaNe: row.agenda_ne,
      agendaEn: row.agenda_en,
      registrationLink: row.registration_link || undefined,
      organizerNe: row.organizer_ne,
      organizerEn: row.organizer_en,
      featuredImage: row.featured_image,
      descriptionNe: row.description_ne,
      descriptionEn: row.description_en,
      status: row.status as 'UPCOMING' | 'COMPLETED' | 'DRAFT',
      isPublic: true,
      createdAt: row.created_at,
    }));
  } catch {
    return await getEventsFallback(status, includePrivate);
  }
}

/**
 * 2. Fetch Single Event by Slug from Supabase
 */
export async function getEventBySlugFromSupabase(slug: string): Promise<EventProgram | null> {
  try {
    const supabase = getSupabaseServerClient(false);
    const { data, error } = await supabase
      .from('events_programs')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      return await getEventBySlugFallback(slug, true);
    }

    return {
      id: data.id,
      slug: data.slug,
      titleNe: data.title_ne,
      titleEn: data.title_en,
      eventDateTime: data.event_date_time,
      venueNe: data.venue_ne,
      venueEn: data.venue_en,
      agendaNe: data.agenda_ne,
      agendaEn: data.agenda_en,
      registrationLink: data.registration_link || undefined,
      organizerNe: data.organizer_ne,
      organizerEn: data.organizer_en,
      featuredImage: data.featured_image,
      descriptionNe: data.description_ne,
      descriptionEn: data.description_en,
      status: data.status as 'UPCOMING' | 'COMPLETED' | 'DRAFT',
      isPublic: true,
      createdAt: data.created_at,
    };
  } catch {
    return await getEventBySlugFallback(slug, true);
  }
}

/**
 * 3. Fetch Notices from Supabase
 */
export async function getNoticesFromSupabase(isPublic = false): Promise<NoticeItem[]> {
  try {
    const supabase = getSupabaseServerClient(false);
    const { data, error } = await supabase
      .from('notices_announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return await getNoticesFallback(isPublic);
    }

    return data.map((row: any) => ({
      id: row.id,
      titleNe: row.title_ne,
      titleEn: row.title_en,
      date: row.date,
      summaryNe: row.summary_ne,
      summaryEn: row.summary_en,
      isUrgent: row.is_urgent,
      status: 'PUBLISHED',
      isPublic: true,
    }));
  } catch {
    return await getNoticesFallback(isPublic);
  }
}

/**
 * 4. Fetch Financial Accounts from Supabase
 */
export async function getFinancialAccountsFromSupabase(): Promise<SupabaseFinancialAccount[]> {
  try {
    const supabase = getSupabaseServerClient(false);
    const { data, error } = await supabase
      .from('financial_accounts')
      .select('*')
      .eq('is_active', true)
      .order('account_code', { ascending: true });

    if (error || !data || data.length === 0) {
      return [
        {
          id: 'a1000000-0000-0000-0000-000000000001',
          account_code: 'ACC-CASH-01',
          name_ne: 'कार्यालय नगद मौज्दात (Petty Cash)',
          name_en: 'Main Office Petty Cash',
          account_type: 'CASH',
          current_balance: 45000,
          opening_balance: 50000,
          currency: 'NPR',
          is_active: true,
        },
        {
          id: 'a2000000-0000-0000-0000-000000000002',
          account_code: 'ACC-BANK-01',
          name_ne: 'राष्ट्रिय वाणिज्य बैंक - मुख्य संस्थागत चल्ती खाता',
          name_en: 'Rastriya Banijya Bank - Primary Operating Account',
          account_type: 'BANK',
          bank_name: 'राष्ट्रिय वाणिज्य बैंक लिमिटेड',
          account_number_mask: '****-****-4512',
          current_balance: 850000,
          opening_balance: 800000,
          currency: 'NPR',
          is_active: true,
        },
        {
          id: 'a3000000-0000-0000-0000-000000000003',
          account_code: 'ACC-RELIEF-01',
          name_ne: 'आपत्कालीन राहत तथा कल्याणकारी कोष',
          name_en: 'Emergency Relief & Welfare Fund',
          account_type: 'RESERVE',
          bank_name: 'राष्ट्रिय वाणिज्य बैंक लिमिटेड',
          account_number_mask: '****-****-7890',
          current_balance: 350000,
          opening_balance: 350000,
          currency: 'NPR',
          is_active: true,
        },
      ];
    }

    return data.map((a: any) => ({
      ...a,
      current_balance: Number(a.current_balance),
      opening_balance: Number(a.opening_balance),
    }));
  } catch {
    return [];
  }
}

/**
 * 5. Fetch Financial Transactions from Supabase
 */
export async function getFinancialTransactionsFromSupabase(): Promise<SupabaseFinancialTransaction[]> {
  try {
    const supabase = getSupabaseServerClient(false);
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data || data.length === 0) {
      return [
        {
          id: 'b1000000-0000-0000-0000-000000000001',
          leg_type: 'DESTINATION',
          type: 'INCOME',
          account_id: 'a2000000-0000-0000-0000-000000000002',
          amount_npr: 50000,
          currency: 'NPR',
          is_reversal: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 'b2000000-0000-0000-0000-000000000002',
          leg_type: 'SOURCE',
          type: 'EXPENSE',
          account_id: 'a1000000-0000-0000-0000-000000000001',
          amount_npr: 5000,
          currency: 'NPR',
          is_reversal: false,
          created_at: new Date().toISOString(),
        },
      ];
    }

    return data.map((t: any) => ({
      ...t,
      amount_npr: Number(t.amount_npr),
    }));
  } catch {
    return [];
  }
}

/**
 * 6. Fetch Organization Profile / About Us from Supabase
 */
export async function getOrganizationProfileFromSupabase() {
  try {
    const supabase = getSupabaseServerClient(false);
    const { data, error } = await supabase
      .from('organization_profile')
      .select('*')
      .eq('key', 'primary_profile')
      .maybeSingle();

    if (error || !data) {
      return await getSiteSettingsFallback();
    }

    const fallback = await getSiteSettingsFallback();
    return {
      ...fallback,
      orgNameNe: data.org_name_ne || fallback.orgNameNe,
      orgNameEn: data.org_name_en || fallback.orgNameEn,
      sloganNe: data.slogan_ne || fallback.sloganNe,
      sloganEn: data.slogan_en || fallback.sloganEn,
      officeAddressNe: data.office_address_ne || fallback.officeAddressNe,
      officeAddressEn: data.office_address_en || fallback.officeAddressEn,
      daoRegistrationNumber: data.registration_no || fallback.daoRegistrationNumber,
      orgLogoUrl: data.logo_url || fallback.orgLogoUrl,
    };
  } catch {
    return await getSiteSettingsFallback();
  }
}

/**
 * 7. Fetch Governance Reports from Supabase
 */
export async function getReportsFromSupabase(category?: string, year?: string): Promise<GovernanceReport[]> {
  try {
    const supabase = getSupabaseServerClient(false);
    let query = supabase
      .from('governance_reports')
      .select('*')
      .eq('is_public', true)
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }
    if (year) {
      query = query.eq('fiscal_year', year);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return await getReportsFallback(category, year, false);
    }

    return data.map((r: any) => ({
      id: r.id,
      titleNe: r.title_ne,
      titleEn: r.title_en,
      fiscalYear: r.fiscal_year,
      category: r.category,
      publishedDate: r.published_date,
      fileUrl: r.file_url,
      fileSizeMb: r.file_size_mb,
      isPublic: r.is_public,
      version: r.version || undefined,
      status: r.status,
      descriptionNe: r.description_ne || undefined,
      descriptionEn: r.description_en || undefined,
      noPrivateDataConfirmed: r.no_private_data_confirmed,
      isOriginalApprovedDocument: r.is_original_approved_document,
      createdAt: r.created_at,
    }));
  } catch {
    return await getReportsFallback(category, year, false);
  }
}

/**
 * 8. Submit Membership Application to Supabase
 */
export async function submitMembershipApplicationToSupabase(
  data: Omit<MembershipApplication, 'id' | 'status' | 'submittedAt'>
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = getSupabaseServerClient(true);
    const { data: inserted, error } = await supabase
      .from('membership_applications')
      .insert({
        full_name_ne: data.fullNameNe,
        full_name_en: data.fullNameEn,
        membership_type: data.membershipType,
        madi_address_ne: data.madiAddressNe,
        current_address_ne: data.currentAddressNe,
        phone: data.phone,
        email: data.email,
        occupation_ne: data.occupationNe,
        reason_for_joining_ne: data.reasonForJoiningNe,
        consent_given: data.consentGiven,
        status: 'PENDING',
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: inserted };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 9. Submit Contact / Feedback Message to Supabase
 */
export async function submitContactMessageToSupabase(
  data: Omit<FeedbackSubmission, 'id' | 'status' | 'submittedAt'>
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = getSupabaseServerClient(true);
    const { data: inserted, error } = await supabase
      .from('contact_messages')
      .insert({
        full_name: data.fullName,
        phone: data.phone,
        email: data.email,
        subject: data.subject,
        category: data.category,
        message: data.message,
        attachment_url: data.attachmentUrl || null,
        status: 'NEW',
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: inserted };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 10. Fetch Digital Deusi-Bhailo Contributions from Supabase
 */
export async function getDigitalDeusiContributionsFromSupabase(): Promise<SupabaseDeusiDonation[]> {
  try {
    const supabase = getSupabaseServerClient(false);
    const { data, error } = await supabase
      .from('digital_deusi_bhailo')
      .select('*')
      .eq('is_public', true)
      .eq('payment_status', 'VERIFIED')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((d: any) => ({
      ...d,
      amount_npr: Number(d.amount_npr),
    }));
  } catch {
    return [];
  }
}

/**
 * 11. Fetch Social Support Requests from Supabase
 */
export async function getSocialSupportRequestsFromSupabase(): Promise<SupabaseSocialSupportRequest[]> {
  try {
    const supabase = getSupabaseServerClient(false);
    const { data, error } = await supabase
      .from('social_support_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}
