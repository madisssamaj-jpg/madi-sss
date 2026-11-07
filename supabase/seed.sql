-- ============================================================================
-- MADI SSS — STAGING ENVIRONMENT SEED SCRIPT (TEST / DEMO DATA ONLY)
-- File: supabase/seed.sql
-- All items in this script are for testing and demonstration in staging.
-- ============================================================================

-- 1. ADMIN USERS (Staging Test Passwords hashed with standard bcrypt / argon2)
INSERT INTO public.admin_users (id, email, password_hash, full_name, role, is_active)
VALUES 
    ('11111111-1111-1111-1111-111111111101', 'admin@madisss.org.np', '$2b$10$wB5W.y644e5/f/s6.hZ2hOUwB0kLwNqV9nI.1rV8W5c1K1pG9X6.6', 'मादी प्रशासक (Superadmin)', 'SUPERADMIN', true),
    ('11111111-1111-1111-1111-111111111102', 'editor@madisss.org.np', '$2b$10$wB5W.y644e5/f/s6.hZ2hOUwB0kLwNqV9nI.1rV8W5c1K1pG9X6.6', 'सामग्री सम्पादक (Editor)', 'EDITOR', true),
    ('11111111-1111-1111-1111-111111111103', 'auditor@madisss.org.np', '$2b$10$wB5W.y644e5/f/s6.hZ2hOUwB0kLwNqV9nI.1rV8W5c1K1pG9X6.6', 'लेखापरीक्षक (Auditor)', 'AUDITOR', true)
ON CONFLICT (email) DO NOTHING;

-- 2. FINANCIAL ACCOUNTS (Staging Ledger Seed)
INSERT INTO public.financial_accounts (id, account_code, name_ne, name_en, account_type, bank_name, bank_account_number, current_balance, opening_balance, currency, is_active)
VALUES
    ('22222222-2222-2222-2222-222222222201', 'OP-1001', 'केन्द्रीय साधारण सञ्चालन खाता', 'Central General Operating Account', 'BANK', 'Global IME Bank, Sukedhara', '01201010001234', 500000.00, 500000.00, 'NPR', true),
    ('22222222-2222-2222-2222-222222222202', 'RF-2001', 'मादी आकस्मिक विपद् तथा राहत कोष', 'Madi Emergency Disaster Relief Fund', 'BANK', 'Rastriya Banijya Bank, Teku', '11800100005678', 850000.00, 850000.00, 'NPR', true),
    ('22222222-2222-2222-2222-222222222203', 'SC-3001', 'जेहेन्दार तथा विपन्न छात्रवृत्ति अक्षय कोष', 'Merit & Need Scholarship Endowment', 'BANK', 'Nepal Bank Ltd, New Road', '00201000098765', 350000.00, 350000.00, 'NPR', true),
    ('22222222-2222-2222-2222-222222222204', 'EM-4001', 'सचिवालय भैपरी आउने आकस्मिक नगद', 'Secretariat Emergency Petty Cash', 'CASH', 'Internal Cash Safe', 'N/A', 25000.00, 25000.00, 'NPR', true)
ON CONFLICT (account_code) DO NOTHING;

-- 3. MEMBERSHIP TIERS
INSERT INTO public.membership_tiers (id, tier_key, name_ne, name_en, fee_npr, validity_ne, validity_en, description_ne, description_en, requirements_ne)
VALUES
    ('33333333-3333-3333-3333-333333333301', 'ORDINARY', 'साधारण सदस्यता', 'General Membership', 500.00, '१ वर्ष (वार्षिक नवीकरण)', '1 Year (Annual Renewal)', 'मादी मूल भई काठमाण्डौंमा बसोबास गर्ने १८ वर्ष पूरा भएका नागरिकहरूका लागि।', 'For residents originally from Madi residing in Kathmandu Valley.', ARRAY['मादी स्थायी ठेगाना प्रमाणित कागजात', 'नागरिकताको प्रतिलिपि', '२ प्रति पासपोर्ट साइज फोटो']),
    ('33333333-3333-3333-3333-333333333302', 'LIFE', 'आजीवन सदस्यता', 'Life Membership', 5000.00, 'आजीवन (नवीकरण नपर्ने)', 'Lifetime (No Renewal Required)', 'संस्थाको विधान अनुसार एकमुष्ट शुल्क बुझाएर प्राप्त गरिने आजीवन सदस्यता।', 'Permanent membership with lifetime voting rights and recognition.', ARRAY['नागरिकता प्रतिलिपि', 'मादी वडा सिफारिस वा स्थायी बसोबास खुल्ने प्रमाण', '२ प्रति फोटो']),
    ('33333333-3333-3333-3333-333333333303', 'HONORARY', 'मानार्थ सदस्यता', 'Honorary Membership', 0.00, 'आजीवन', 'Lifetime', 'मादीको शिक्षा, संस्कृति वा विकासमा विशिष्ट योगदान पुर्याउनुभएका प्रतिष्ठित व्यक्तित्वहरूलाई कार्यसमितिले प्रदान गर्ने।', 'Conferred by the Executive Committee to distinguished patrons and scholars.', ARRAY['कार्यसमिति निर्णय तथा सम्मान पत्र'])
ON CONFLICT (tier_key) DO NOTHING;

-- 4. SOCIAL ACTIVITIES
INSERT INTO public.social_activities (id, slug, title_ne, title_en, date, location_ne, location_en, category, description_ne, description_en, photos, video_url, participant_count, status, is_featured)
VALUES
    ('44444444-4444-4444-4444-444444444401', 'madi-health-camp-2083', 'मादी नगरपालिकामा बृहत् निःशुल्क स्वास्थ्य तथा आँखा शिविर', 'Comprehensive Free Health & Eye Camp in Madi Municipality', '२०८३-०१-१५', 'मादी–४, ओखरबोटे, संखुवासभा', 'Madi-4, Okharbote, Sankhuwasabha', 'HEALTH', 'मादी सरोकार समाज, काठमाण्डौंको संयोजन तथा वरिष्ठ चिकित्सकहरूको सहयोगमा मादी–४ ओखरबोटेमा दुई दिने निःशुल्क स्वास्थ्य शिविर सम्पन्न भयो। शिविरमा ८५० जना स्थानीय नागरिकहरूले सेवा प्राप्त गर्नुभयो। ३५ जना मोतियाबिन्दुका बिरामीहरूको निःशुल्क शल्यक्रियाको व्यवस्था गरिएको छ।', 'Organized by Madi Sarokar Samaj, Kathmandu with specialist medical doctors, this two-day comprehensive medical camp benefited 850 local residents in Madi-4, Okharbote. 35 cataract patients received complimentary surgeries.', ARRAY['https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80'], 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 850, 'PUBLISHED', true),
    ('44444444-4444-4444-4444-444444444402', 'blood-donation-ktm-2083', 'काठमाण्डौंमा बृहत् रक्तदान तथा सदस्य भेटघाट कार्यक्रम', 'Grand Blood Donation & Member Gathering in Kathmandu', '२०८३-०२-१२', 'सुकेधारा, काठमाण्डौं', 'Sukedhara, Kathmandu', 'COMMUNITY', 'काठमाण्डौं उपत्यकामा बसोबास गर्ने मादीवासी समुदाय र नेपाल रेडक्रस सोसाइटीको सहकार्यमा आयोजित रक्तदान कार्यक्रममा ११२ पिन्ट रगत संकलन गरियो। आकस्मिक उपचारमा रहेका बिरामीहरूका लागि २४ घण्टे रक्तदाता हेल्पलाइन समेत सुरु गरिएको छ।', 'Organized in Sukedhara, Kathmandu in collaboration with Nepal Red Cross Society, collecting 112 pints of blood. A 24/7 emergency donor helpline was formally launched.', ARRAY['https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&q=80'], NULL, 220, 'PUBLISHED', true),
    ('44444444-4444-4444-4444-444444444403', 'cultural-preservation-youth-dialogue', 'मादीको रैथाने मौलिक संस्कृति तथा पर्यटन प्रवर्द्धन संवाद', 'Indigenous Cultural Heritage & Tourism Dialogue of Madi', '२०८२-११-२०', 'नेपाल प्रज्ञा–प्रतिष्ठान, कमलादी', 'Nepal Academy Hall, Kamaladi, Kathmandu', 'CULTURAL', 'संखुवासभाको मादी क्षेत्रका ऐतिहासिक, सांस्कृतिक तथा पर्यटकीय गन्तव्यहरूको पहिचान र नयाँ पुस्तामा हस्तान्तरण विषयक विशेष अन्तर्क्रिया कार्यक्रम सम्पन्न भयो।', 'An interactive symposium highlighting historical tourism, language, and cultural documentation of Madi region held at Nepal Academy.', ARRAY['https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80'], NULL, 300, 'PUBLISHED', false)
ON CONFLICT (slug) DO NOTHING;

-- 5. RELIEF PROGRAMS
INSERT INTO public.relief_programs (id, slug, title_ne, title_en, type, beneficiary_group_ne, beneficiary_group_en, date, location_ne, location_en, amount_npr, materials_provided_ne, materials_provided_en, description_ne, description_en, photos, report_attachment_url, status)
VALUES
    ('55555555-5555-5555-5555-555555555501', 'monsoon-flood-landslide-relief-2082', 'वर्षाजन्य बाढी–पहिरो पीडित परिवारहरूलाई तत्काल राहत वितरण', 'Immediate Emergency Relief for Monsoon Landslide Victims', 'DISASTER_RELIEF', 'मादी–१, २ र ५ का पहिरो प्रभावित ४५ घरधुरी', '45 displaced families in Madi Wards 1, 2, and 5', '२०८२-०४-२८', 'मादी नगरपालिका, संखुवासभा', 'Madi Municipality, Sankhuwasabha', 1250000.00, 'खाद्यान्न, जस्तापाता, त्रिपाल, प्राथमिक उपचार सामग्री तथा नगद सहयोग', 'Dry rations, zinc sheets, tarpaulins, medical kits, and cash relief', 'पहिरोबाट विस्थापित तथा क्षति व्यहोरेका ४५ परिवारहरूलाई समाजको आकस्मिक विपद् व्यवस्थापन कोष तथा दाताहरूको सहयोगबाट रु. १२,५०,००० बराबरको राहत तथा पुनर्स्थापना सहयोग तत्काल हस्तान्तरण गरियो।', 'Emergency relief pack worth NPR 1,250,000 distributed to 45 displaced families in Madi in coordination with local authorities.', ARRAY['https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80'], '/documents/monsoon-relief-audit-2082.pdf', 'COMPLETED'),
    ('55555555-5555-5555-5555-555555555502', 'scholarships-underprivileged-students-2082', 'जेहेन्दार तथा विपन्न विद्यार्थी शैक्षिक छात्रवृत्ति कोष २०८२/८३', 'Merit-Cum-Need Educational Scholarship Fund 2082/83', 'SCHOLARSHIP', 'मादीका सामुदायिक विद्यालयमा अध्ययनरत २५ जना जेहेन्दार छात्रछात्रा', '25 meritorious students in Madi public schools', '२०८२-०८-१०', 'मादी माध्यमिक विद्यालय प्राङ्गण', 'Madi Secondary School Grounds', 450000.00, 'एक वर्षको शैक्षिक शुल्क, पाठ्यपुस्तक, पोशाक तथा स्टेशनरी सामग्री', '1 year full tuition, textbooks, uniforms, and stationery', 'आर्थिक अभावका कारण विद्यालय छाड्न बाध्य हुने अवस्थाका २५ जना बालबालिकालाई एक वर्षको सम्पूर्ण शैक्षिक खर्च समाजले व्यहोरेको छ।', 'Full-year scholarships awarded to 25 underprivileged students to ensure uninterrupted quality schooling.', ARRAY['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80'], '/documents/scholarship-disbursement-2082.pdf', 'COMPLETED')
ON CONFLICT (slug) DO NOTHING;

-- 6. EVENTS
INSERT INTO public.events_programs (id, slug, title_ne, title_en, event_date_time, venue_ne, venue_en, agenda_ne, agenda_en, registration_link, organizer_ne, organizer_en, featured_image, description_ne, description_en, status)
VALUES
    ('66666666-6666-6666-6666-666666666601', 'annual-general-assembly-2083', 'सातौं वार्षिक साधारण सभा तथा बृहत् मादी भेटघाट २०८३', '7th Annual General Assembly & Grand Madi Gathering 2083', '२०८३ जेठ १५ गते, शनिबार बिहान ११:०० बजे', 'नेपाल प्रज्ञा–प्रतिष्ठान, कमलादी, काठमाण्डौं', 'Nepal Academy Hall, Kamaladi, Kathmandu', '१. वार्षिक नीति तथा कार्यक्रम प्रस्तुति | २. लेखापरीक्षण प्रतिवेदन अनुमोदन | ३. नयाँ कार्यसमिति निर्वाचन | ४. सम्मान तथा शुभकामना चियापान', '1. Annual Policy & Progress Review | 2. Independent Audit Presentation | 3. Executive Committee Elections | 4. Honors & Networking', 'https://forms.gle/sampleMadiReg', 'मादी संखुवासभा सरोकार समाज, काठमाण्डौं', 'Madi Sankhuwasabha Sarokar Samaj, Kathmandu', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80', 'काठमाण्डौं उपत्यकामा रहनुभएका सम्पूर्ण मादीवासी महानुभावहरूलाई वार्षिक साधारण सभामा हार्दिक आमन्त्रण गर्दछौं।', 'Cordially inviting all community members of Madi residing in Kathmandu Valley to attend the 7th Annual General Assembly.', 'UPCOMING'),
    ('66666666-6666-6666-6666-666666666602', 'madi-picnic-cultural-festival-2082', 'मादी वनभोज तथा रैथाने सांस्कृतिक उत्सव २०८२', 'Annual Community Picnic & Cultural Get-Together 2082', '२०८२ फागुन १२ गते, शनिबार बिहान ९:०० बजे', 'गोदावरी वनस्पति उद्यान, ललितपुर', 'Godawari Botanical Garden, Lalitpur', 'पारिवारिक भेटघाट, रैथाने सांस्कृतिक झाँकी, खेलकुद प्रतियोगिता र पुरस्कार वितरण', 'Family gathering, traditional cultural performances, sports, and awards', NULL, 'मादी संखुवासभा सरोकार समाज, काठमाण्डौं', 'Madi Sankhuwasabha Sarokar Samaj, Kathmandu', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80', 'उपत्यकामा रहेका ६०० भन्दा बढी मादीवासी परिवारको सहभागितामा सम्पन्न वार्षिक वनभोज।', 'Over 600 family members celebrated indigenous folklore, music, and cuisine.', 'COMPLETED')
ON CONFLICT (slug) DO NOTHING;

-- 7. COMMITTEE MEMBERS
INSERT INTO public.committee_members (id, name_ne, name_en, designation_ne, designation_en, category, department_ne, department_en, contact_phone, email, photo_url, display_order)
VALUES
    ('77777777-7777-7777-7777-777777777701', 'इ. चन्द्रबहादुर श्रेष्ठ', 'Er. Chandra Bahadur Shrestha', 'अध्यक्ष', 'President', 'EXECUTIVE', 'केन्द्रीय पदाधिकारी', 'Executive Leadership', '9851000001', 'president@madisss.org.np', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 1),
    ('77777777-7777-7777-7777-777777777702', 'सुश्री बिमला दाहाल', 'Ms. Bimala Dahal', 'वरिष्ठ उपाध्यक्ष', 'Senior Vice President', 'EXECUTIVE', 'केन्द्रीय पदाधिकारी', 'Executive Leadership', '9851000002', 'vp@madisss.org.np', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', 2),
    ('77777777-7777-7777-7777-777777777703', 'श्री रामेश्वर कार्की', 'Mr. Rameshwar Karki', 'महासचिव', 'General Secretary', 'EXECUTIVE', 'केन्द्रीय सचिवालय', 'Secretariat', '9851000003', 'gensec@madisss.org.np', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 3),
    ('77777777-7777-7777-7777-777777777704', 'श्रीमती शान्ता तामाङ', 'Mrs. Shanta Tamang', 'कोषाध्यक्ष', 'Treasurer', 'EXECUTIVE', 'आर्थिक प्रशासन', 'Finance & Accounts', '9851000004', 'treasurer@madisss.org.np', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', 4),
    ('77777777-7777-7777-7777-777777777705', 'प्रा.डा. खगेन्द्रप्रसाद नेपाल', 'Prof. Dr. Khagendra Prasad Nepal', 'प्रमुख सल्लाहकार', 'Chief Advisor', 'ADVISORY', 'सल्लाहकार परिषद्', 'Advisory Council', '9851000005', 'advisor@madisss.org.np', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80', 5)
ON CONFLICT (id) DO NOTHING;

-- 8. GOVERNANCE & AUDIT REPORTS
INSERT INTO public.governance_reports (id, title_ne, title_en, fiscal_year, category, published_date, file_url, file_size_mb, is_public)
VALUES
    ('88888888-8888-8888-8888-888888888801', 'आर्थिक वर्ष २०८१/०८२ को वार्षिक प्रगति तथा लेखापरीक्षण प्रतिवेदन', 'Annual Progress & Independent Audit Report FY 2081/082', '२०८१/०८२', 'AUDIT_FINANCIAL', '२०८२-०५-०१', '/documents/audit-report-2081-82.pdf', '3.4 MB', true),
    ('88888888-8888-8888-8888-888888888802', 'मादी संखुवासभा सरोकार समाजको मूल विधान (संशोधनसहित)', 'Official Constitution & By-Laws of Madi SSS (Amended)', '२०७८', 'CONSTITUTION', '२०७८-०३-१५', '/documents/madi-sss-constitution-2078.pdf', '1.8 MB', true),
    ('88888888-8888-8888-8888-888888888803', 'मादी आकस्मिक विपद् राहत तथा कल्याणकारी कोष सञ्चालन कार्यविधि २०८०', 'Emergency Disaster Relief & Welfare Fund Operating Directive 2080', '२०८०/०८१', 'POLICY', '२०८०-०६-२०', '/documents/relief-fund-guideline-2080.pdf', '1.1 MB', true)
ON CONFLICT (id) DO NOTHING;

-- 9. PARTNERS & SUPPORTERS
INSERT INTO public.community_partners (id, name_ne, name_en, partner_type, logo_url, website_url, contribution_summary_ne, contribution_summary_en, display_order)
VALUES
    ('99999999-9999-9999-9999-999999999901', 'मादी नगरपालिका, संखुवासभा', 'Madi Municipality, Sankhuwasabha', 'LOCAL_GOVERNMENT', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Emblem_of_Nepal.svg/300px-Emblem_of_Nepal.svg.png', 'https://madimunsankhuwasabha.gov.np', 'स्थानीय सरकारसँगको सहकार्यमा स्वास्थ्य शिविर, विपद् राहत तथा सामुदायिक विकास कार्यक्रम।', 'Institutional collaboration in public health camps, disaster management, and educational scholarships.', 1),
    ('99999999-9999-9999-9999-999999999902', 'नेपाल रेडक्रस सोसाइटी, संखुवासभा शाखा', 'Nepal Red Cross Society, Sankhuwasabha Branch', 'NGO_INGO', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=200&q=80', 'https://nrcs.org', 'रक्तदान, आकस्मिक उद्धार तालिम तथा पहिरो पीडितलाई आपतकालीन सामग्री सहयोग।', 'Technical partnership in blood donation drives, emergency search & rescue, and relief distribution.', 2),
    ('99999999-9999-9999-9999-999999999903', 'मादी युवा मञ्च, काठमाण्डौं', 'Madi Youth Forum, Kathmandu', 'COMMUNITY_GROUP', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=200&q=80', NULL, 'काठमाण्डौंमा रहेका मादीका युवा विद्यार्थी तथा खेलाडीहरूको प्रतिभा प्रवर्द्धन।', 'Youth networking, sports tournaments, and creative dialogue in Kathmandu.', 3)
ON CONFLICT (id) DO NOTHING;

-- 10. SITE BANNERS & HERO CAROUSEL
INSERT INTO public.site_banners (id, title_ne, title_en, subtitle_ne, subtitle_en, image_desktop_url, image_mobile_url, link_url, button_text_ne, button_text_en, is_active, display_order)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं', 'Madi Sankhuwasabha Sarokar Samaj, Kathmandu', 'मादीदेखि काठमाण्डौंसम्म, एकता, सेवा र सहकार्यको साझा अभियान', 'Connecting Madi Diaspora in Kathmandu with Community Welfare & Mutual Aid', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1920&q=80', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80', '/ne/membership', 'सदस्यता लिनुहोस्', 'Join Us', true, 1),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'मादी राहत तथा कल्याणकारी कोष', 'Madi Disaster Relief & Welfare Fund', 'बाढी–पहिरो पीडित तथा विपन्न बिरामीहरूका लागि पारदर्शी सहयोग', 'Transparent Humanitarian Aid for Landslide Survivors and Underprivileged Families', 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1920&q=80', 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80', '/ne/relief-support', 'राहत विवरण हेर्नुहोस्', 'Explore Relief', true, 2)
ON CONFLICT (id) DO NOTHING;

-- 11. GALLERY ALBUMS & MEDIA ITEMS
INSERT INTO public.gallery_albums (id, slug, title_ne, title_en, description_ne, description_en, cover_photo_url, event_date, category, is_featured, display_order)
VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'madi-health-camp-photos', 'मादी निःशुल्क स्वास्थ्य शिविर २०८३ का तस्बिरहरू', 'Madi Free Health Camp 2083 Photo Gallery', 'मादी–४ ओखरबोटेमा सञ्चालित बृहत् स्वास्थ्य शिविरका झलकहरू।', 'Glimpses from the two-day health and eye clinic in Okharbote, Madi.', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80', '२०८३-०१-१५', 'HEALTH', true, 1),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'madi-cultural-picnic-2082', 'मादी सांस्कृतिक वनभोज २०८२ स्मृति सँगालो', 'Madi Cultural Picnic 2082 Memories', 'गोदावरीमा आयोजित पारिवारिक वनभोज तथा सांस्कृतिक प्रस्तुतिहरू।', 'Folklore, sports, and community reunion at Godawari Botanical Gardens.', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80', '२०८२-फागुन-१२', 'CULTURAL', true, 2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.media_items (id, album_id, title_ne, title_en, media_type, file_url, thumbnail_url, alt_text_ne, alt_text_en, is_featured, display_order)
VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccc01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'आँखा जाँच तथा परामर्श सेवा', 'Eye Examination & Consultation', 'IMAGE', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=80', 'मादीमा आँखा जाँच गराउँदै स्थानीय नागरिकहरू', 'Local citizens undergoing cataract checks in Madi', true, 1),
    ('cccccccc-cccc-cccc-cccc-cccccccccc02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'औषधि निःशुल्क वितरण', 'Free Medicine Dispensation', 'IMAGE', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80', 'औषधि वितरण डेस्क', 'Medicine dispensing desk', false, 2),
    ('cccccccc-cccc-cccc-cccc-cccccccccc03', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'रैथाने सांस्कृतिक झाँकी नृत्य', 'Traditional Indigenous Dance Performance', 'IMAGE', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=400&q=80', 'सांस्कृतिक वनभोजमा नृत्य', 'Cultural dance at community picnic', true, 1)
ON CONFLICT (id) DO NOTHING;

-- 12. NOTICES & ANNOUNCEMENTS
INSERT INTO public.notices_announcements (id, title_ne, title_en, date, summary_ne, summary_en, is_urgent)
VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddd01', 'मादी राहत कोषमा सहयोग गर्न आह्वान', 'Appeal for Contributions to Madi Disaster Relief Fund', '२०८३-०१-१०', 'वर्षायामका सम्भावित प्राकृतिक विपद् व्यवस्थापनका लागि पूर्वतयारी कोषमा ऐक्यबद्धता जनाउनुहोस्।', 'Support our emergency contingency fund for flood and landslide resilience in Madi.', true),
    ('dddddddd-dddd-dddd-dddd-dddddddddd02', 'सातौं वार्षिक साधारण सभाको मिति सम्बन्धी जरूरी सूचना', 'Notice Regarding Date & Venue of 7th Annual General Assembly', '२०८३-०१-०२', '२०८३ जेठ १५ गते शनिबार कमलादीस्थित नेपाल प्रज्ञा–प्रतिष्ठानको सभाहलमा साधारण सभा हुने।', 'The 7th AGM will convene on Saturday, Jestha 15, 2083 at Nepal Academy Hall, Kamaladi.', false)
ON CONFLICT (id) DO NOTHING;

-- 13. SITE SETTINGS & SEO CONFIGURATION
INSERT INTO public.site_settings (key, value_json)
VALUES
    ('general', '{
        "orgNameNe": "मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं",
        "orgNameEn": "Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu",
        "sloganNe": "मादीदेखि काठमाण्डौंसम्म, एकता, सेवा र सहकार्यको साझा अभियान",
        "sloganEn": "From Madi to Kathmandu, a shared initiative for unity, welfare, and collaboration",
        "contactPhone": "+977-1-4423456",
        "contactEmail": "info@madisss.org.np",
        "officeAddressNe": "सुकेधारा, काठमाण्डौं, नेपाल",
        "officeAddressEn": "Sukedhara, Kathmandu, Nepal",
        "facebookUrl": "https://facebook.com/madisss",
        "youtubeUrl": "https://youtube.com/@madisss",
        "emailNotificationsEnabled": true
    }'::jsonb),
    ('seo', '{
        "defaultMetaTitleNe": "मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं | सामाजिक तथा कल्याणकारी संस्था",
        "defaultMetaTitleEn": "Madi Sankhuwasabha Sarokar Samaj, Kathmandu | Social Organization",
        "defaultMetaDescNe": "संखुवासभाको मादीबाट काठमाण्डौंमा बसोबास गर्ने नागरिकहरूको सामाजिक एकता, स्वास्थ्य शिविर, राहत कोष, छात्रवृत्ति तथा सांस्कृतिक प्रवर्द्धन संस्था।",
        "defaultMetaDescEn": "Connecting and supporting the community from Madi Municipality, Sankhuwasabha residing in Kathmandu Valley.",
        "ogImageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
    }'::jsonb)
ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json;

-- 14. SAMPLE TEST MEMBERSHIP APPLICATION & FEEDBACK SUBMISSION
INSERT INTO public.membership_applications (id, full_name_ne, full_name_en, membership_type, madi_address_ne, current_address_ne, phone, email, occupation_ne, reason_for_joining_ne, consent_given, status)
VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'टेकबहादुर गुरुङ (परीक्षण)', 'Tek Bahadur Gurung (Test)', 'LIFE', 'मादी–२, संखुवासभा', 'बौद्ध, काठमाण्डौं', '9841000099', 'tek.gurung@test.example', 'व्यवसाय', 'मादीको सामाजिक विकास तथा राहत कोषमा नियमित सहकार्य गर्न।', true, 'PENDING')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.feedback_submissions (id, full_name, phone, email, subject, category, message, status)
VALUES
    ('ffffffff-ffff-ffff-ffff-ffffffffff01', 'हरिकुमार श्रेष्ठ (परीक्षण)', '9812000088', 'hari.shrestha@test.example', 'आँखा शिविर पुनः सञ्चालन सम्बन्धमा सुझाव', 'SUGGESTION', 'मादी वडा नं ६ मा पनि आँखा शिविर आवश्यक रहेकोले आगामी कार्यक्रममा समावेश गर्न अनुरोध गर्दछु।', 'NEW')
ON CONFLICT (id) DO NOTHING;

