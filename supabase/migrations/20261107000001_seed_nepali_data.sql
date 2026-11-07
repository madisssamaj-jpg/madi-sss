-- ==============================================================================
-- Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu
-- Migration: 20261107000001_seed_nepali_data.sql
-- Realistic Nepali Sample Data (No Placeholders)
-- ==============================================================================

-- 1. ORGANIZATION PROFILE (About Us)
INSERT INTO public.organization_profile (
    key,
    org_name_ne,
    org_name_en,
    slogan_ne,
    slogan_en,
    registration_dao,
    registration_no,
    registration_date_bs,
    office_address_ne,
    office_address_en,
    logo_url,
    established_bs,
    metadata
) VALUES (
    'primary_profile',
    'मादी (संखुवासभा) सरोकार समाज, काठमाडौं',
    'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu',
    'मादीदेखि काठमाडौंसम्म, एकता, सेवा र सहकार्यको साझा अभियान',
    'From Madi to Kathmandu, a shared initiative for unity, welfare, and collaboration',
    'जिल्ला प्रशासन कार्यालय, काठमाडौं',
    '१६',
    '२०८२/०४/२१',
    'काठमाडौं महानगरपालिका वडा नं. ४, सुकेधारा, काठमाडौं',
    'Ward No. 4, Sukedhara, Kathmandu, Nepal',
    '/media/madi-sss-logo.jpg',
    '२०७६',
    jsonb_build_object(
        'original_name_ne', 'मादी सरोकार केन्द्र, काठमाडौं',
        'registration_history', 'वि.सं. २०७६ मा स्थापित भई वि.सं. २०८२ साउन २१ मा जि.प्र.का. काठमाडौंमा दर्ता प्रमाणित।'
    )
)
ON CONFLICT (key) DO UPDATE SET
    org_name_ne = EXCLUDED.org_name_ne,
    logo_url = EXCLUDED.logo_url,
    updated_at = clock_timestamp();

-- 2. EVENTS AND PROGRAMS (Upcoming & Completed)
INSERT INTO public.events_programs (
    slug,
    title_ne,
    title_en,
    event_date_time,
    venue_ne,
    venue_en,
    agenda_ne,
    agenda_en,
    registration_link,
    organizer_ne,
    organizer_en,
    featured_image,
    description_ne,
    description_en,
    status
) VALUES 
(
    'madi-annual-general-gathering-2082',
    'मादी बृहत् वार्षिक भेला तथा शुभकामना आदानप्रदान कार्यक्रम',
    'Madi Grand Annual Gathering & Greetings Exchange',
    '२०८२-०१-१५ १०:००',
    'सुकेधारा पार्टी प्यालेस, काठमाडौं',
    'Sukedhara Party Palace, Kathmandu',
    'वार्षिक सामाजिक समीक्षा, नयाँ कार्ययोजना र नगरवासी सद्भाव',
    'Annual social review, future roadmap, and community solidarity',
    '/ne/membership',
    'मादी (संखुवासभा) सरोकार समाज, काठमाडौं',
    'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu',
    '/media/incoming/Chauki.jpg',
    'काठमाडौं उपत्यकामा बसोबास गर्नुहुने सम्पूर्ण मादी नगरवासी दाजुभाइ तथा दिदीबहिनीहरूलाई हार्दिक निमन्त्रणा गरिन्छ।',
    'Cordially inviting all residents of Madi Municipality residing across Kathmandu Valley.',
    'UPCOMING'
),
(
    'disaster-risk-reduction-dialogue',
    'विपद् व्यवस्थापन तथा स्थानीय पूर्वाधार विकास अन्तरक्रिया',
    'Disaster Preparedness & Local Infrastructure Dialogue',
    '२०८१-११-२० १३:००',
    'केन्द्रीय कार्यालय, सुकेधारा, काठमाडौं',
    'Central Office, Sukedhara, Kathmandu',
    'मनसुनजन्य विपद् पूर्वतयारी तथा स्थानीय विद्यालय सहयोग समन्वय',
    'Monsoon disaster preparedness and local school infrastructure coordination',
    NULL,
    'मादी सरोकार समाज',
    'Madi Sarokar Samaj',
    '/media/incoming/Madi.jpg',
    'मादी नगरपालिका र काठमाडौंस्थित नगरवासी समाजबीच स्थानीय विकास र आकस्मिक राहतमा प्रभावकारी समन्वय गर्ने उद्देश्यले सम्पन्न अन्तरक्रिया।',
    'Interactive session focused on effective coordination for local development and emergency relief.',
    'COMPLETED'
)
ON CONFLICT (slug) DO UPDATE SET
    title_ne = EXCLUDED.title_ne,
    status = EXCLUDED.status;

-- 3. FINANCIAL ACCOUNTS (Cash, Bank, Welfare)
INSERT INTO public.financial_accounts (
    id,
    account_code,
    name_ne,
    name_en,
    account_type,
    bank_name,
    account_number_mask,
    current_balance,
    opening_balance,
    currency,
    is_active
) VALUES 
(
    'a1000000-0000-0000-0000-000000000001',
    'ACC-CASH-01',
    'कार्यालय नगद मौज्दात (Petty Cash)',
    'Main Office Petty Cash',
    'CASH',
    NULL,
    NULL,
    45000.00,
    50000.00,
    'NPR',
    true
),
(
    'a2000000-0000-0000-0000-000000000002',
    'ACC-BANK-01',
    'राष्ट्रिय वाणिज्य बैंक - मुख्य संस्थागत चल्ती खाता',
    'Rastriya Banijya Bank - Primary Operating Account',
    'BANK',
    'राष्ट्रिय वाणिज्य बैंक लिमिटेड',
    '****-****-4512',
    850000.00,
    800000.00,
    'NPR',
    true
),
(
    'a3000000-0000-0000-0000-000000000003',
    'ACC-RELIEF-01',
    'आपत्कालीन राहत तथा कल्याणकारी कोष',
    'Emergency Relief & Welfare Fund',
    'RESERVE',
    'राष्ट्रिय वाणिज्य बैंक लिमिटेड',
    '****-****-7890',
    350000.00,
    350000.00,
    'NPR',
    true
)
ON CONFLICT (id) DO UPDATE SET
    current_balance = EXCLUDED.current_balance,
    is_active = EXCLUDED.is_active;

-- 4. FINANCIAL TRANSACTIONS (Legs for transparency)
INSERT INTO public.financial_transactions (
    id,
    master_transfer_id,
    leg_type,
    type,
    account_id,
    amount_npr,
    currency,
    is_reversal
) VALUES 
(
    'b1000000-0000-0000-0000-000000000001',
    NULL,
    'DESTINATION',
    'INCOME',
    'a2000000-0000-0000-0000-000000000002',
    50000.00,
    'NPR',
    false
),
(
    'b2000000-0000-0000-0000-000000000002',
    NULL,
    'SOURCE',
    'EXPENSE',
    'a1000000-0000-0000-0000-000000000001',
    5000.00,
    'NPR',
    false
)
ON CONFLICT (id) DO NOTHING;

-- 5. MEMBERSHIP APPLICATIONS (Realistic Submissions)
INSERT INTO public.membership_applications (
    full_name_ne,
    full_name_en,
    membership_type,
    madi_address_ne,
    current_address_ne,
    phone,
    email,
    occupation_ne,
    reason_for_joining_ne,
    consent_given,
    status
) VALUES 
(
    'रामबहादुर दाहाल',
    'Ram Bahadur Dahal',
    'ORDINARY',
    'मादी नगरपालिका वडा नं. २, संखुवासभा',
    'काठमाडौं महानगरपालिका-४, सुकेधारा',
    '9841234567',
    'ram.dahal@example.com',
    'शिक्षण तथा समाजसेवा',
    'काठमाडौंमा रहेका मादीवासीहरूको एकता र आपसी सहयोगलाई प्रभावकारी बनाउन।',
    true,
    'PENDING'
),
(
    'सुनिता श्रेष्ठ',
    'Sunita Shrestha',
    'ORDINARY',
    'मादी नगरपालिका वडा नं. ५, संखुवासभा',
    'चाबहिल, काठमाडौं',
    '9851098765',
    'sunita.shrestha@example.com',
    'स्वास्थ्य सेवा / नर्सिङ',
    'उपत्यकामा उपचारका लागि आउने विपन्न नगरवासीहरूको आकस्मिक सहायता र परामर्शमा हातेमालो गर्न।',
    true,
    'APPROVED'
)
ON CONFLICT DO NOTHING;

-- 6. NOTICES AND ANNOUNCEMENTS
INSERT INTO public.notices_announcements (
    id,
    title_ne,
    title_en,
    date,
    summary_ne,
    summary_en,
    is_urgent
) VALUES 
(
    'c1000000-0000-0000-0000-000000000001',
    'संस्थाको सदस्यता नवीकरण तथा नयाँ आवेदन फारम खुला सम्बन्धी सूचना',
    'Notice Regarding Membership Renewal & New Online Application',
    '२०८२-०१-१०',
    'काठमाडौं उपत्यकामा बसोबास गर्नुहुने सम्पूर्ण मादी नगरवासीहरूलाई अनलाइन पोर्टल वा केन्द्रीय कार्यालयमार्फत सदस्यता फारम भर्न हार्दिक आह्वान गरिन्छ।',
    'All residents of Madi residing across Kathmandu Valley are encouraged to complete the membership application form.',
    true
),
(
    'c2000000-0000-0000-0000-000000000002',
    'जिल्ला प्रशासन कार्यालय, काठमाडौंमा संस्था विधिवत दर्ता भएको सहर्ष जानकारी',
    'Notice of Statutory Registration at District Administration Office, Kathmandu',
    '२०८२-०४-२१',
    'मादी (संखुवासभा) सरोकार समाज, काठमाडौं वि.सं. २०८२ साल साउन २१ गते जिल्ला प्रशासन कार्यालय काठमाडौंमा विधिवत दर्ता (दर्ता नं. १६) भएको सहर्ष जानकारी गराइन्छ।',
    'Formally registered under DAO Registration No. 16 on 2082/04/21 BS.',
    false
)
ON CONFLICT (id) DO UPDATE SET
    title_ne = EXCLUDED.title_ne,
    summary_ne = EXCLUDED.summary_ne;

-- 7. CONTACT / FEEDBACK MESSAGES
INSERT INTO public.contact_messages (
    full_name,
    phone,
    email,
    subject,
    category,
    message,
    status
) VALUES 
(
    'दीपक कार्की',
    '9842112233',
    'deepak.karki@example.com',
    'वेबसाइट तथा अनलाइन सदस्यता प्रणाली सम्बन्धी सुझाव',
    'SUGGESTION',
    'मादी सरोकार समाजको अनलाइन सदस्यता फारम र पारदर्शिता पोर्टल धेरै प्रभावकारी बनेको छ। आगामी दिनमा नगरका उत्पादन बजारीकरणमा पनि सघाउ पुगोस्।',
    'NEW'
),
(
    'कमला लिम्बु',
    '9860445566',
    'kamala.limbu@example.com',
    'आकस्मिक स्वास्थ्य उपचार समन्वय सोधपुछ',
    'INQUIRY',
    'संखुवासभाबाट काठमाडौं शिक्षण अस्पतालमा बिरामी ल्याउँदा समाजबाट आवश्यक सल्लाह वा परामर्श कसरी लिन सकिन्छ?',
    'NEW'
)
ON CONFLICT DO NOTHING;

-- 8. DIGITAL DEUSI-BHAILO CONTRIBUTIONS
INSERT INTO public.digital_deusi_bhailo (
    contributor_name_ne,
    contributor_name_en,
    madi_ward,
    amount_npr,
    blessing_message_ne,
    blessing_message_en,
    payment_method,
    payment_reference,
    payment_status,
    is_public
) VALUES 
(
    'श्याम कुमार राई',
    'Shyam Kumar Rai',
    3,
    5000.00,
    'मादी समाजको सधैं जय होस्, नगरवासीको आपसी एकता र सेवा अझ बलियो बन्दै जाओस्।',
    'May Madi Samaj thrive and strengthen community welfare.',
    'FONEPAY',
    'TXN-FP-2081-891',
    'VERIFIED',
    true
),
(
    'गोविन्द सुवेदी',
    'Govinda Subedi',
    1,
    2500.00,
    'शुभ तिहार तथा देउसी-भैलोको पावन अवसरमा सम्पूर्ण मादीवासीमा सुख, शान्ति र समृद्धिको हार्दिक मंगलमय शुभकामना।',
    'Warm festive greetings and prosperity to all Madi brothers and sisters.',
    'QR_CODE',
    'TXN-QR-2081-442',
    'VERIFIED',
    true
)
ON CONFLICT DO NOTHING;

-- 9. SOCIAL SUPPORT REQUESTS
INSERT INTO public.social_support_requests (
    applicant_name_ne,
    applicant_name_en,
    contact_phone,
    contact_email,
    madi_ward,
    current_location,
    support_category,
    description_ne,
    status
) VALUES 
(
    'हरिमाया खत्री',
    'Harimaya Khatri',
    '9811223344',
    'harimaya.khatri@example.com',
    4,
    'काठमाडौं',
    'MEDICAL_AID',
    'आकस्मिक शल्यक्रिया तथा अस्पताल भर्नाका लागि औषधि उपचार सहयोग समन्वय अनुरोध।',
    'UNDER_REVIEW'
),
(
    'प्रेमबहादुर तामाङ',
    'Prem Bahadur Tamang',
    '9801998877',
    NULL,
    6,
    'जोरपाटी, काठमाडौं',
    'WELFARE_GENERAL',
    'विपन्न परिवारका बालबालिकाको प्रारम्भिक पठनपाठन सामग्री सहयोग सम्बन्धी निवेदन।',
    'PENDING'
)
ON CONFLICT DO NOTHING;
