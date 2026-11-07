import Link from 'next/link';
import { getLatestConstitution, getLatestVerifiedCertificate } from '@/lib/cms/cms-service';
import { getOrganizationProfileFromSupabase as getSiteSettings } from '@/lib/supabase/data-service';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const [constitution, settings, verifiedCert] = await Promise.all([
    getLatestConstitution(true),
    getSiteSettings(),
    getLatestVerifiedCertificate(),
  ]);

  const objectives = settings.objectives || [];
  const membershipTiers = settings.membershipTiers || [];

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 flex flex-col items-center">
          <img
            src="/media/madi-sss-logo.jpg"
            alt={lang === 'ne' ? settings.orgNameNe : settings.orgNameEn}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover bg-white border-4 border-[#01366E]/10 shadow-lg"
          />
          <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-100 px-3.5 py-1 rounded-full">
            {lang === 'ne' ? 'हाम्रो परिचय तथा वैधानिक आधार' : 'Our Identity & Statutory Foundation'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#01366E] tracking-tight">
            {lang === 'ne' ? settings.orgNameNe : settings.orgNameEn}
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            {lang === 'ne'
              ? `“${settings.sloganNe}” — जिल्ला प्रशासन कार्यालय, काठमाण्डौंमा दर्ता भई सञ्चालित गैरनाफामूलक सामाजिक संस्था।`
              : `“${settings.sloganEn}” — A registered non-profit community social organization.`}
          </p>
        </div>

        {/* Overview & Legal Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#FB6C01] uppercase tracking-wider">
                {lang === 'ne' ? 'पृष्ठभूमि तथा स्थापना' : 'Background & Establishment'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug">
                {lang === 'ne'
                  ? (settings.aboutBackgroundTitleNe || 'मादीवासीहरूको साझा थलो, सेवा र सहकार्यको केन्द्र')
                  : (settings.aboutBackgroundTitleEn || 'A Shared Home for Unity, Service & Community Well-being')}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {lang === 'ne'
                  ? (settings.aboutBackgroundP1Ne ||
                    'संखुवासभा जिल्लाको ऐतिहासिक र प्राकृतिक रूपमा समृद्ध मादी नगरपालिका (वडा नं. १ देखि ९ सम्म) बाट विभिन्न सिलसिलामा राजधानी काठमाण्डौं उपत्यकामा बसोबास गरिरहेका नगरवासीहरूलाई एउटै सूत्रमा बाँध्न वि.सं. २०८२ सालमा यो संस्था विधिवत् दर्ता भएको हो।')
                  : (settings.aboutBackgroundP1En ||
                    'Founded in 2082 BS, Madi (Sankhuwasabha) Sarokar Samaj brings together residents and diaspora hailing from all nine wards of Madi Municipality residing in Kathmandu Valley into a unified platform of mutual welfare, cultural continuity, and community solidarity.')}
              </p>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {lang === 'ne'
                  ? (settings.aboutBackgroundP2Ne ||
                    'संस्थाले विपद् राहत, आर्थिक रूपले विपन्न विद्यार्थी तथा परिवार सहयोग, आकस्मिक चिकित्सा सहयोग तथा स्थानीय विद्यालय पूर्वाधार सुधारमा सहयोग पुर्‍याउँदै आएको छ।')
                  : (settings.aboutBackgroundP2En ||
                    'The society provides humanitarian relief, support for needy students and families, emergency medical treatment aid, and educational infrastructure support for local schools.')}
              </p>
            </div>

            {/* Quick Stat / Registration Facts & CDO Trust Badge */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
                  {lang === 'ne' ? 'आधिकारिक दर्ता विवरण' : 'Official Statutory Details'}
                </h3>
                {verifiedCert && verifiedCert.verificationStatus === 'VERIFIED' && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 text-xs font-black px-3 py-1 rounded-full border border-emerald-300 shadow-2xs">
                    <span>🏛️</span>
                    <span>
                      {lang === 'ne'
                        ? 'जिल्ला प्रशासन कार्यालय, काठमाण्डौंमा दर्ता प्रमाणित'
                        : 'DAO Kathmandu Registered & Verified'}
                    </span>
                  </span>
                )}
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <dt className="text-gray-500 font-semibold">
                    {lang === 'ne' ? 'दर्ता निकाय:' : 'Registration Authority:'}
                  </dt>
                  <dd className="font-bold text-gray-900 mt-0.5">
                    {lang === 'ne'
                      ? (settings.registrationAuthorityNe || 'जिल्ला प्रशासन कार्यालय, काठमाण्डौं')
                      : (settings.registrationAuthorityEn || 'District Administration Office, Kathmandu')}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 font-semibold">
                    {lang === 'ne' ? 'दर्ता तथा प्रमाणीकरण मिति:' : 'Registration Date:'}
                  </dt>
                  <dd className="font-bold text-gray-900 mt-0.5">
                    {lang === 'ne'
                      ? (settings.registrationDateNe || '२०८२/०४/२१ BS')
                      : (settings.registrationDateEn || '2082/04/21 BS (Aug 06, 2025)')}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 font-semibold">
                    {lang === 'ne' ? 'केन्द्रीय कार्यालय:' : 'Registered Secretariat:'}
                  </dt>
                  <dd className="font-bold text-gray-900 mt-0.5">
                    {lang === 'ne'
                      ? (settings.centralOfficeNe || 'काठमाण्डौं महानगरपालिका वडा नं. ४, सुकेधारा')
                      : (settings.centralOfficeEn || 'Kathmandu Ward 4, Sukedhara')}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 font-semibold">
                    {lang === 'ne' ? 'कार्यक्षेत्र:' : 'Geographic Jurisdiction:'}
                  </dt>
                  <dd className="font-bold text-gray-900 mt-0.5">
                    {lang === 'ne'
                      ? (settings.jurisdictionNe || 'मादी नगरपालिका र काठमाण्डौं उपत्यका')
                      : (settings.jurisdictionEn || 'Madi Municipality & Kathmandu Valley')}
                  </dd>
                </div>

                {/* Registration Number (shown if approved and verified) */}
                {settings.daoRegistrationNumber && (
                  <div>
                    <dt className="text-gray-500 font-semibold">
                      {lang === 'ne' ? 'दर्ता नम्बर:' : 'Registration No:'}
                    </dt>
                    <dd className="font-bold text-emerald-800 mt-0.5 flex items-center gap-1.5">
                      <span>{settings.daoRegistrationNumber}</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                        {lang === 'ne' ? 'प्रमाणित' : 'Verified'}
                      </span>
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-gray-500 font-semibold">
                    {lang === 'ne' ? 'कानुनी आधार:' : 'Statutory Act:'}
                  </dt>
                  <dd className="font-bold text-gray-900 mt-0.5">
                    {lang === 'ne' ? 'संस्था दर्ता ऐन, २०३४ को दफा (४)' : 'Non-Profit Society Act 2034, Sec 4'}
                  </dd>
                </div>

                {/* Contact Email / Institutional Disclaimer */}
                <div className="sm:col-span-2">
                  <dt className="text-gray-500 font-semibold">
                    {lang === 'ne' ? 'आधिकारिक इमेल:' : 'Official Email:'}
                  </dt>
                  <dd className="text-xs text-amber-900 font-medium mt-1 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                    {settings.contactEmail ? (
                      <a href={`mailto:${settings.contactEmail}`} className="text-[#01366E] font-bold hover:underline">
                        {settings.contactEmail}
                      </a>
                    ) : (
                      <span>
                        {lang === 'ne'
                          ? 'सक्रिय र नियमित हेरिने संस्थागत इमेल पुष्टि भएपछि मात्र सार्वजनिक सम्पर्क विवरण थपिनेछ।'
                          : 'Public contact details will be added once an active and routinely monitored institutional email is confirmed.'}
                      </span>
                    )}
                  </dd>
                </div>

                {/* Contact Phone (only displayed if a verified phone is provided) */}
                {settings.contactPhone && (
                  <div>
                    <dt className="text-gray-500 font-semibold">
                      {lang === 'ne' ? 'सम्पर्क फोन:' : 'Official Phone:'}
                    </dt>
                    <dd className="font-bold text-gray-900 mt-0.5">
                      {settings.contactPhone}
                    </dd>
                  </div>
                )}
              </dl>

              {/* Certificate Transparency & Privacy Safeguard Callout */}
              <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-base text-emerald-600">🛡️</span>
                  <span>
                    {lang === 'ne'
                      ? 'सक्कल प्रमाणपत्र आन्तरिक अभिलेखमा सुरक्षित छ (व्यक्तिगत दस्तखत तथा फोन नम्बर सार्वजनिक गरिएको छैन)।'
                      : 'Original certificate securely preserved in internal registry (private signatures and personal data safeguarded).'}
                  </span>
                </div>

                {/* Optional Public Redacted Download (if approved by Superadmin) */}
                {verifiedCert && verifiedCert.fileUrl && (
                  <a
                    href={verifiedCert.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#01366E] hover:text-[#FB6C01] underline shrink-0"
                  >
                    <span>📥</span>
                    <span>{lang === 'ne' ? 'प्रमाणपत्र (संशोधित प्रति)' : 'Certificate (Redacted Copy)'}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Section: स्थापना तथा दर्ता / Founding and Registration */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-xs font-bold text-[#FB6C01] uppercase tracking-wider">
                {lang === 'ne' ? 'संस्थागत इतिहास तथा माइलस्टोन' : 'Institutional History & Milestones'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#01366E] mt-1">
                {lang === 'ne' ? 'स्थापना तथा दर्ता' : 'Founding and Registration'}
              </h2>
            </div>

            {/* Founding Confirmation Status Badge */}
            <div className="shrink-0">
              {settings.isFoundingYearConfirmed ? (
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs">
                  <span>✓</span>
                  <span>
                    {lang === 'ne'
                      ? 'कार्यसमितिद्वारा प्रमाणित आधिकारिक इतिहास'
                      : 'Officially Confirmed Historical Record'}
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs">
                  <span>⚠️</span>
                  <span>
                    {lang === 'ne'
                      ? 'प्रारम्भिक अभिलेख — कार्यसमितिको समीक्षामा'
                      : 'Preliminary Record — Under Committee Review'}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* 3 Distinct Sequential Milestones: 2076 Original Start -> Renaming -> 2082 Formal Registration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Original Establishment in 2076 BS as Madi Sarokar Kendra */}
            <div className="bg-orange-50/50 border border-orange-200/80 rounded-2xl p-6 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold text-[#FB6C01] uppercase tracking-wider bg-orange-100 px-2.5 py-0.5 rounded-full">
                    {lang === 'ne' ? 'प्रारम्भिक स्थापना' : 'Original Establishment'}
                  </span>
                  <span className="text-sm font-black text-gray-900 bg-white px-2.5 py-0.5 rounded-lg border border-orange-200 shadow-xs">
                    {settings.originalEstablishmentYear || (lang === 'ne' ? '२०७६' : '2076 BS')}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-gray-900">
                    {lang === 'ne' ? '‘मादी सरोकार केन्द्र’' : '‘Madi Sarokar Kendra’'}
                  </h3>
                  <p className="text-xs text-orange-900 font-semibold mt-0.5">
                    {lang === 'ne'
                      ? (settings.originalOrganizationNameNe || 'मादी सरोकार केन्द्र, काठमाण्डौं')
                      : (settings.originalOrganizationNameEn || 'Madi Sarokar Kendra, Kathmandu')}
                  </p>
                </div>

                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                  {lang === 'ne'
                    ? (settings.communityStartDescriptionNe ||
                      'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौंको सुरुवात वि.सं. २०७६ सालमा ‘मादी सरोकार केन्द्र, काठमाण्डौं’ का रूपमा भएको हो। स्थापनादेखि नै मादीवासीहरूबीच सहयोग, भेटघाट, सांस्कृतिक आदानप्रदान र सामाजिक सहकार्यलाई अगाडि बढाइएको छ।')
                    : (settings.communityStartDescriptionEn ||
                      'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu began in Bikram Sambat 2076 as ‘Madi Sarokar Kendra, Kathmandu’. Since its establishment, it has promoted mutual support, networking, cultural exchange, and social collaboration among Madi residents.')}
                </p>
              </div>

              <div className="pt-3 border-t border-orange-200/60 text-[11px] text-orange-950 font-medium flex items-center gap-1.5">
                <span>🌱</span>
                <span>{lang === 'ne' ? 'सामाजिक सहकार्य र भ्रातृत्वको प्रारम्भ' : 'Initial grassroots community movement'}</span>
              </div>
            </div>

            {/* 2. Institutional Expansion & Name Change */}
            <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-6 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider bg-amber-100 px-2.5 py-0.5 rounded-full">
                    {lang === 'ne' ? 'पुनर्संरचना तथा नामकरण' : 'Renaming & Expansion'}
                  </span>
                  <span className="text-xs font-bold text-amber-900 bg-white px-2 py-0.5 rounded-lg border border-amber-200 shadow-xs">
                    {lang === 'ne' ? 'संरचना विस्तार' : 'Restructured'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-gray-900">
                    {lang === 'ne' ? '‘मादी सरोकार समाज’' : '‘Madi Sarokar Samaj’'}
                  </h3>
                  <p className="text-xs text-amber-900 font-semibold mt-0.5">
                    {lang === 'ne'
                      ? (settings.currentOrganizationNameNe || 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं')
                      : (settings.currentOrganizationNameEn || 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu')}
                  </p>
                </div>

                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                  {lang === 'ne'
                    ? (settings.renamingHistoryNe ||
                      'संस्थाको कार्यक्षेत्र, सदस्यता र संगठनात्मक संरचना विस्तार हुँदै जाँदा पूर्व संस्थाको नाम परिवर्तन गरी हालको ‘मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं’ राखिएको हो। संस्थालाई विधिवत रूपमा जिल्ला प्रशासन कार्यालय, काठमाण्डौंमा वि.सं. २०८२ साल साउन २१ गते (२०८२/०४/२१ BS) दर्ता तथा प्रमाणीकरण गरियो।')
                    : (settings.renamingHistoryEn ||
                      'As the organization’s scope, membership, and institutional structure expanded, its former name was changed to the current name, ‘Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu’. The organization was formally registered with the District Administration Office, Kathmandu on 2082/04/21 BS.')}
                </p>
              </div>

              <div className="pt-3 border-t border-amber-200/60 text-[11px] text-amber-950 font-medium flex items-center gap-1.5">
                <span>🔄</span>
                <span>{lang === 'ne' ? 'कार्यक्षेत्र र सदस्यताको संगठित विस्तार' : 'Broader diaspora consolidation'}</span>
              </div>
            </div>

            {/* 3. Formal Statutory DAO Registration (2082 BS) */}
            <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-6 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold text-[#01366E] uppercase tracking-wider bg-blue-100 px-2.5 py-0.5 rounded-full">
                    {lang === 'ne' ? 'वैधानिक दर्ता' : 'Statutory Charter'}
                  </span>
                  <span className="text-sm font-black text-[#01366E] bg-white px-2.5 py-0.5 rounded-lg border border-blue-200 shadow-xs">
                    {settings.formalRegistrationYear || (lang === 'ne' ? '२०८२' : '2082 BS')}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-gray-900">
                    {lang === 'ne' ? 'जिल्ला प्रशासन कार्यालय' : 'DAO Kathmandu Charter'}
                  </h3>
                  <p className="text-xs text-blue-900 font-semibold mt-0.5">
                    {lang === 'ne'
                      ? (settings.formalRegistrationDateNe || 'वि.सं. २०८२ साल साउन २१ गते (२०८२/०४/२१ BS)')
                      : (settings.formalRegistrationDateEn || '2082/04/21 BS (Aug 06, 2025)')}
                  </p>
                </div>

                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                  {lang === 'ne'
                    ? (settings.organizationHistoryNe ||
                      'दर्तापछि संस्थाले सदस्यता, राहत तथा कल्याणकारी कार्यक्रम, सांस्कृतिक गतिविधि र सामाजिक सहकार्यलाई थप पारदर्शी र संगठित रूपमा अगाडि बढाएको छ।')
                    : (settings.organizationHistoryEn ||
                      'Following registration, the organization has continued its membership, relief and welfare programs, cultural activities, and social collaboration in a more transparent and organized manner.')}
                </p>
              </div>

              <div className="pt-3 border-t border-blue-200/60 text-[11px] text-blue-950 font-medium flex items-center gap-1.5">
                <span>🏛️</span>
                <span>
                  {lang === 'ne'
                    ? (settings.registrationAuthorityNe || 'जिल्ला प्रशासन कार्यालय, काठमाण्डौं')
                    : (settings.registrationAuthorityEn || 'District Administration Office, Kathmandu')}
                </span>
              </div>
            </div>
          </div>

          {/* Full Narrative Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
            <h4 className="text-sm font-extrabold text-[#01366E] flex items-center gap-2">
              <span>📖</span>
              <span>{lang === 'ne' ? 'आधिकारिक संगठनात्मक इतिहास विवरण' : 'Official Organizational Narrative'}</span>
            </h4>

            <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
              <p>
                {lang === 'ne'
                  ? (settings.communityStartDescriptionNe ||
                    'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौंको सुरुवात वि.सं. २०७६ सालमा ‘मादी सरोकार केन्द्र, काठमाण्डौं’ का रूपमा भएको हो। स्थापनादेखि नै मादीवासीहरूबीच सहयोग, भेटघाट, सांस्कृतिक आदानप्रदान र सामाजिक सहकार्यलाई अगाडि बढाइएको छ।')
                  : (settings.communityStartDescriptionEn ||
                    'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu began in Bikram Sambat 2076 as ‘Madi Sarokar Kendra, Kathmandu’. Since its establishment, it has promoted mutual support, networking, cultural exchange, and social collaboration among Madi residents.')}
              </p>
              <p>
                {lang === 'ne'
                  ? (settings.renamingHistoryNe ||
                    'संस्थाको कार्यक्षेत्र, सदस्यता र संगठनात्मक संरचना विस्तार हुँदै जाँदा पूर्व संस्थाको नाम परिवर्तन गरी हालको ‘मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं’ राखिएको हो। संस्थालाई विधिवत रूपमा जिल्ला प्रशासन कार्यालय, काठमाण्डौंमा वि.सं. २०८२ साल साउन २१ गते (२०८२/०४/२१ BS) दर्ता तथा प्रमाणीकरण गरियो।')
                  : (settings.renamingHistoryEn ||
                    'As the organization’s scope, membership, and institutional structure expanded, its former name was changed to the current name, ‘Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu’. The organization was formally registered with the District Administration Office, Kathmandu on 2082/04/21 BS.')}
              </p>
              <p>
                {lang === 'ne'
                  ? (settings.organizationHistoryNe ||
                    'दर्तापछि संस्थाले सदस्यता, राहत तथा कल्याणकारी कार्यक्रम, सांस्कृतिक गतिविधि र सामाजिक सहकार्यलाई थप पारदर्शी र संगठित रूपमा अगाडि बढाएको छ।')
                  : (settings.organizationHistoryEn ||
                    'Following registration, the organization has continued its membership, relief and welfare programs, cultural activities, and social collaboration in a more transparent and organized manner.')}
              </p>
            </div>

            {/* Historical Clarity Guarantee */}
            <div className="pt-4 border-t border-slate-200/80 flex items-start gap-3 text-xs text-slate-600">
              <span className="text-base shrink-0">📌</span>
              <p>
                <strong>{lang === 'ne' ? 'ऐतिहासिक यथार्थता सम्बन्धी जानकारी:' : 'Historical Clarification:'}</strong>{' '}
                {lang === 'ne'
                  ? 'वि.सं. २०७६ मा संस्थाको सुरुवात ‘मादी सरोकार केन्द्र’ का रूपमा भएको हो। वर्तमान आधिकारिक संस्थागत नाम ‘मादी (संखुवासभा) सरोकार समाज, काठमाण्डौं’ भने वि.सं. २०८२ सालमा जिल्ला प्रशासन कार्यालय, काठमाण्डौंमा विधिवत दर्ता भएको हो। (२०७६ सालमा वर्तमान नाममा कानुनी दर्ता भएको होइन।)'
                  : 'The initiative was originally founded in 2076 BS as ‘Madi Sarokar Kendra’. The current name, ‘Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu’, was formally and legally registered with the District Administration Office, Kathmandu in 2082 BS (it was not legally registered under the current name in 2076).'}
              </p>
            </div>
          </div>
        </section>

        {/* Official Constitution Showcase Card */}
        <div className="bg-gradient-to-r from-[#01366E] to-[#0a4b91] text-white rounded-3xl p-6 sm:p-10 shadow-lg">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📜</span>
                <span className="bg-[#FB6C01] text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                  {lang === 'ne' ? 'संस्थाको आधिकारिक विधान' : 'Official Constitution'}
                </span>
                {constitution?.version && (
                  <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-md font-semibold">
                    {lang === 'ne' ? `संस्करण: ${constitution.version}` : `v${constitution.version}`}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {constitution
                  ? (lang === 'ne' ? constitution.titleNe : constitution.titleEn)
                  : (lang === 'ne'
                    ? 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौंको विधान'
                    : 'Constitution of Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu')}
              </h2>

              <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                {lang === 'ne'
                  ? 'जिल्ला प्रशासन कार्यालय, काठमाण्डौंमा दर्ता तथा प्रमाणित आधिकारिक मूल विधान। संस्थाको उद्देश्य, सदस्यता मापदण्ड, साधारण सभा र कार्यसमितिका वैधानिक अधिकारहरू यसै दस्तावेजमा लिपिबद्ध छन्।'
                  : 'Official registered and stamped Constitution approved by the District Administration Office, Kathmandu governing organizational objectives, membership rules, and executive governance.'}
              </p>

              {constitution && (
                <div className="text-xs text-blue-200 flex flex-wrap gap-4 pt-1">
                  <span>📅 {lang === 'ne' ? 'प्रमाणित मिति: ' : 'Effective Date: '} {constitution.effectiveDate || '२०८२-०६-२९'}</span>
                  <span>•</span>
                  <span>📦 {lang === 'ne' ? 'फाइल साइज: ' : 'File Size: '} {constitution.fileSizeMb}</span>
                </div>
              )}
            </div>

            <div className="shrink-0 w-full lg:w-auto">
              {constitution ? (
                <a
                  href={constitution.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 bg-[#FB6C01] hover:bg-orange-600 text-white font-extrabold text-sm px-6 py-4 rounded-2xl shadow-md transition transform hover:-translate-y-0.5"
                >
                  <span className="text-lg">📥</span>
                  <span>{lang === 'ne' ? 'विधान डाउनलोड गर्नुहोस् (PDF)' : 'Download Constitution PDF'}</span>
                </a>
              ) : (
                /* Empty state: No working download link until original approved document is uploaded */
                <div className="bg-white/10 rounded-2xl p-5 text-center border border-white/20 space-y-1">
                  <p className="text-sm font-bold text-white">
                    {lang === 'ne'
                      ? (settings.constitutionEmptyStateNe || 'विधान डाउनलोडका लागि तयारी भइरहेको छ।')
                      : (settings.constitutionEmptyStateEn || 'The constitution document is being prepared for download.')}
                  </p>
                  <p className="text-[11px] text-blue-200">
                    {lang === 'ne'
                      ? 'आधिकारिक छाप लागेको सक्कल विधान प्रमाणीकरण भएपछि यहाँ डाउनलोड उपलब्ध हुनेछ।'
                      : 'Download will be enabled once the officially stamped Constitution is verified.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Objectives (उद्देश्यहरू) from the Constitution */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#FB6C01] uppercase tracking-wider">
              {lang === 'ne' ? 'वैधानिक दस्तावेज मस्यौदा' : 'Statutory Document Draft'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {lang === 'ne' ? 'संस्थाका मूल उद्देश्यहरू' : 'Core Statutory Objectives'}
            </h2>
            <p className="text-gray-500 text-sm">
              {lang === 'ne'
                ? 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौंको विधान मस्यौदामा उल्लिखित प्रमुख उद्देश्यहरू:'
                : 'Primary statutory objectives enshrined in the Constitution of Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu:'}
            </p>
          </div>

          {/* Unverified / Draft Disclaimer Banner for Objectives */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <span className="font-bold block">
                {lang === 'ne'
                  ? 'प्रारम्भिक मस्यौदा सूचना (Draft Status Notice):'
                  : 'Preliminary Draft Status Notice:'}
              </span>
              <span>
                {lang === 'ne'
                  ? 'तल उल्लिखित बुँदाहरू संस्थाको आन्तरिक सन्दर्भ मस्यौदा अनुरुपका हुन्। जिल्ला प्रशासन कार्यालयबाट छाप लागेको आधिकारिक सक्कल विधानको अन्तिम प्रमाणीकरण पश्चात् मात्र यो पूर्ण वैधानिक रूपमा अद्यावधिक हुनेछ।'
                  : 'The clauses below reflect the internal reference draft. They remain preliminary until fully verified against the officially stamped and approved Constitution.'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {objectives.map((obj) => (
              <div
                key={obj.id || obj.numEn}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-10 h-10 rounded-xl bg-blue-50 text-[#01366E] flex items-center justify-center text-xl font-bold">
                      {obj.icon}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {lang === 'ne' ? `बुँदा नं. ${obj.numNe}` : `Clause ${obj.numEn}`}
                      </span>
                      {!obj.isVerified && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          {lang === 'ne' ? 'मस्यौदा' : 'Draft'}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base mb-2">
                    {lang === 'ne' ? obj.titleNe : obj.titleEn}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {lang === 'ne' ? obj.descNe : obj.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Membership Structure from Constitution */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-[#FB6C01] uppercase tracking-wider">
                {lang === 'ne' ? 'वैधानिक सदस्यता वर्गीकरण' : 'Membership Classification'}
              </span>
              <h2 className="text-2xl font-extrabold text-gray-900 mt-1">
                {lang === 'ne' ? 'सदस्यताका प्रकार तथा शुल्क संरचना' : 'Membership Tiers & Official Fees'}
              </h2>
            </div>
            <Link
              href={`/${lang}/membership`}
              className="bg-[#01366E] hover:bg-blue-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm self-start sm:self-auto"
            >
              {lang === 'ne' ? 'सदस्यता आवेदन दिनुहोस्' : 'Apply for Membership'}
            </Link>
          </div>

          {/* Official Safe Notice for Membership Fees */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-xs text-amber-950 flex items-start gap-3">
            <span className="text-lg">📢</span>
            <div>
              <span className="font-bold block mb-0.5">
                {lang === 'ne'
                  ? 'सदस्यता शुल्क तथा वर्गीकरण सूचना:'
                  : 'Membership Fee & Classification Notice:'}
              </span>
              <span className="leading-relaxed">
                {lang === 'ne'
                  ? 'सदस्यता शुल्क तथा वर्गीकरणको अन्तिम विवरण कार्यसमितिको आधिकारिक निर्णयपछि प्रकाशित गरिनेछ।'
                  : 'Final details regarding membership fees and classification will be published following the official decision of the Executive Committee.'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {membershipTiers.map((tier) => (
              <div
                key={tier.id || tier.tierKey}
                className={`p-5 rounded-2xl border space-y-2 relative ${tier.isPopular
                    ? 'bg-orange-50/50 border-orange-200'
                    : 'bg-slate-50 border-slate-200'
                  }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-bold uppercase ${tier.isPopular ? 'text-[#FB6C01]' : 'text-[#01366E]'
                      }`}
                  >
                    {lang === 'ne' ? tier.nameNe : tier.nameEn}
                  </span>
                  <div className="flex items-center gap-1">
                    {tier.isPopular && (
                      <span className="text-[10px] font-bold bg-[#FB6C01] text-white px-2 py-0.5 rounded">
                        {lang === 'ne' ? 'लोकप्रिय' : 'Recommended'}
                      </span>
                    )}
                    {!tier.isVerified && (
                      <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                        {lang === 'ne' ? 'मस्यौदा' : 'Draft'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xl font-black text-gray-900">
                  {lang === 'ne' ? tier.feeNe : tier.feeEn}
                </div>

                <p className="text-xs text-gray-600">
                  {lang === 'ne' ? tier.descNe : tier.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Footer Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
          <div>
            <h4 className="font-bold text-gray-900 text-sm">
              {lang === 'ne' ? 'कार्यसमिति विवरण हेर्न चाहनुहुन्छ?' : 'Want to see our Executive Committee?'}
            </h4>
            <p className="text-xs text-gray-500">
              {lang === 'ne'
                ? 'वर्तमान कार्यसमिति, सल्लाहकार तथा पदाधिकारीहरूको नामावली उपलब्ध छ।'
                : 'View designations, portfolios, and leadership team directory.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/${lang}/committee`}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-gray-800 transition"
            >
              {lang === 'ne' ? 'कार्यसमिति हेर्नुहोस्' : 'View Committee'}
            </Link>
            <Link
              href={`/${lang}/reports`}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#01366E] hover:bg-blue-900 text-white transition"
            >
              {lang === 'ne' ? 'प्रतिवेदन तथा दस्तावेज' : 'All Reports'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
