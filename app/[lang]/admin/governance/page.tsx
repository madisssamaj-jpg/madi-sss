import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin-session';
import { getGovernanceDashboardOverview } from '@/lib/cms/cms-service';

export default async function GovernanceDashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const admin = await getCurrentAdmin();

  // Strict Superadmin Access Control
  if (!admin || admin.role !== 'SUPERADMIN' || !admin.isActive) {
    redirect(`/${lang}/admin/login?next=/${lang}/admin/governance`);
  }

  const overview = await getGovernanceDashboardOverview(true);

  const sections = [
    {
      data: overview.committee,
      icon: '👥',
      accentColor: 'border-purple-200 bg-purple-50/40 text-purple-900',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      data: overview.activities,
      icon: '🎯',
      accentColor: 'border-blue-200 bg-blue-50/40 text-blue-900',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      data: overview.documents,
      icon: '📄',
      accentColor: 'border-emerald-200 bg-emerald-50/40 text-emerald-900',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      data: overview.financial,
      icon: '💰',
      accentColor: 'border-amber-200 bg-amber-50/40 text-amber-900',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#01366E] to-[#002244] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-blue-900 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#FB6C01] text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                {lang === 'ne' ? 'सुपरएडमिन नियन्त्रण' : 'Superadmin Telemetry'}
              </span>
              <span className="bg-white/10 text-blue-100 text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-white/20">
                🔒 {lang === 'ne' ? 'गोप्य आन्तरिक टेलिमेट्री' : 'Strictly Internal'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {lang === 'ne' ? 'संस्थागत सुशासन तथा प्रकाशन तत्परता ड्यासबोर्ड' : 'Governance & Publication Readiness Dashboard'}
            </h1>
            <p className="text-blue-100/90 text-sm mt-1 max-w-2xl">
              {lang === 'ne'
                ? 'वेबसाइटमा सामग्री प्रकाशन गर्नुपूर्व आवश्यक प्रमाण, तस्बिर सहमति, र कार्यसमिति अनुमोदनको स्थिति अनुगमन गर्ने आधिकारिक टेलिमेट्री कक्ष।'
                : 'Central executive overview tracking documentary evidence, consents, and required approvals before any section is published.'}
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-start sm:items-end gap-1.5 bg-white/10 px-4 py-3 rounded-xl border border-white/15">
            <span className="text-[11px] text-blue-200 font-medium">
              {lang === 'ne' ? 'प्रमाणीकृत सुपरएडमिन:' : 'Authenticated Superadmin:'}
            </span>
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>🛡️</span>
              <span>{admin.fullName}</span>
            </span>
            <span className="text-[10px] text-orange-200 font-mono">
              Role: {admin.role}
            </span>
          </div>
        </div>
      </div>

      {/* Zero Auto-Publish Policy Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
        <span className="text-lg shrink-0">⚠️</span>
        <div className="space-y-1">
          <p className="font-bold">
            {lang === 'ne'
              ? 'आन्तरिक अवलोकन नीति (Read-Only Telemetry Policy):'
              : 'Read-Only Telemetry Policy:'}
          </p>
          <p className="text-amber-800 leading-relaxed text-xs">
            {lang === 'ne'
              ? 'यो ड्यासबोर्ड केवल प्रमाण र सुशासन अनुगमनका लागि हो। यहाँबाट सीधै कुनै पनि सामग्री सार्वजनिक गर्न पाइँदैन। प्रत्येक सामग्री सम्बन्धित खण्डको बहु-स्तरीय प्रमाण जाँच र कार्यसमिति निर्णय पश्चात मात्र विधिवत रूपमा प्रकाशित हुनेछ।'
              : 'This dashboard provides telemetry and evidence verification tracking only. Direct publication cannot be triggered from this overview. Each section must complete its required evidence checklist, reviews, and executive minute approvals individually.'}
          </p>
        </div>
      </div>

      {/* Overall Publication Readiness Status */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center text-2xl font-bold">
            🔒
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {lang === 'ne' ? 'समग्र गृहपृष्ठ प्रकाशन स्थिति' : 'Overall Portal Publication Readiness'}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'ne'
                ? 'चरण २ देखि ५ सम्मका सबै खण्डहरू प्रमाणिकरण नभएसम्म सार्वजनिक हुन रोक्का गरिएको छ।'
                : 'All sections from Phase 2 through Phase 5 remain locked and quarantined until 100% evidence verification.'}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-red-50 text-red-800 border border-red-200 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
          <span>
            {lang === 'ne' ? 'प्रकाशनका लागि तयार छैन (Zero Premature Release)' : 'Not ready for publication (Zero Premature Release)'}
          </span>
        </div>
      </div>

      {/* Four Governance Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map(({ data, icon, accentColor, badgeColor }) => (
          <div
            key={data.sectionKey}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
          >
            {/* Section Header */}
            <div className={`p-5 border-b ${accentColor} flex items-center justify-between gap-3`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {lang === 'ne' ? data.titleNe : data.titleEn}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Key: {data.sectionKey}
                  </span>
                </div>
              </div>

              {/* Readiness Indicator Pill */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                  data.publicationReadiness === 'READY_FOR_PUBLICATION'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                <span>{data.publicationReadiness === 'READY_FOR_PUBLICATION' ? '✓' : '✗'}</span>
                <span>{lang === 'ne' ? data.readinessLabelNe : data.readinessLabelEn}</span>
              </div>
            </div>

            <div className="p-5 space-y-6 flex-1">
              {/* Record Metrics Counters */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  {lang === 'ne' ? 'अभिलेख संख्या स्थिति' : 'Record Counts & Publication States'}
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                    <div className="text-lg font-black text-slate-800">{data.totalRecords}</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {lang === 'ne' ? 'कुल' : 'Total'}
                    </div>
                  </div>

                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5">
                    <div className="text-lg font-black text-amber-700">{data.draftInternalRecords}</div>
                    <div className="text-[10px] text-amber-700 font-medium mt-0.5">
                      {lang === 'ne' ? 'DRAFT' : 'Draft'}
                    </div>
                  </div>

                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-2.5">
                    <div className="text-lg font-black text-blue-700">{data.pendingReviewRecords}</div>
                    <div className="text-[10px] text-blue-700 font-medium mt-0.5">
                      {lang === 'ne' ? 'समीक्षा' : 'Pending'}
                    </div>
                  </div>

                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5">
                    <div className="text-lg font-black text-emerald-700">{data.approvedPublicRecords}</div>
                    <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                      {lang === 'ne' ? 'सार्वजनिक' : 'Public'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidence Items Breakdown */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  {lang === 'ne' ? 'प्रमाण संकलन स्थिति (Checklist Telemetry)' : 'Evidence Collection Breakdown'}
                </span>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-slate-100 rounded-lg p-2 border border-slate-200">
                    <span className="text-xs font-bold text-slate-700 block">
                      {data.evidenceItems.notCollected}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {lang === 'ne' ? 'बाँकी' : 'Not Done'}
                    </span>
                  </div>

                  <div className="bg-amber-100 rounded-lg p-2 border border-amber-200">
                    <span className="text-xs font-bold text-amber-800 block">
                      {data.evidenceItems.collected}
                    </span>
                    <span className="text-[10px] text-amber-700">
                      {lang === 'ne' ? 'संकलित' : 'Collected'}
                    </span>
                  </div>

                  <div className="bg-emerald-100 rounded-lg p-2 border border-emerald-200">
                    <span className="text-xs font-bold text-emerald-800 block">
                      {data.evidenceItems.verified}
                    </span>
                    <span className="text-[10px] text-emerald-700">
                      {lang === 'ne' ? 'प्रमाणित' : 'Verified'}
                    </span>
                  </div>

                  <div className="bg-rose-100 rounded-lg p-2 border border-rose-200">
                    <span className="text-xs font-bold text-rose-800 block">
                      {data.evidenceItems.rejected}
                    </span>
                    <span className="text-[10px] text-rose-700">
                      {lang === 'ne' ? 'अस्वीकृत' : 'Rejected'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Missing Requirements Block */}
              <div>
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-2">
                  {lang === 'ne' ? 'प्रकाशन पूर्व अपुग सर्तहरू (Missing Requirements)' : 'Missing Pre-Publication Requirements'}
                </span>
                <ul className="space-y-1.5 bg-rose-50/60 border border-rose-200/80 rounded-xl p-3 text-xs text-rose-900">
                  {(lang === 'ne' ? data.missingRequirementsNe : data.missingRequirementsEn).map(
                    (req, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-rose-500 font-bold shrink-0 mt-0.5">⚠️</span>
                        <span>{req}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Detailed Evidence Checklist Log (Superadmin Only) */}
              {data.detailedEvidence && data.detailedEvidence.length > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <details className="group">
                    <summary className="text-xs font-bold text-blue-700 cursor-pointer hover:underline flex items-center justify-between">
                      <span>{lang === 'ne' ? '🔎 आन्तरिक प्रमाण अभिलेख सूची हेर्नुहोस्' : '🔎 View Internal Evidence Audit Log'}</span>
                      <span className="text-[10px] font-normal text-slate-400 group-open:rotate-180 transition">▼</span>
                    </summary>
                    <div className="mt-2.5 space-y-2 max-h-48 overflow-y-auto pr-1">
                      {data.detailedEvidence.map((item, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-800">
                              {lang === 'ne' ? item.titleNe : item.titleEn}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                item.collectionStatus === 'VERIFIED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.collectionStatus === 'COLLECTED'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {item.collectionStatus}
                            </span>
                          </div>
                          {item.documentRefOrPath && (
                            <div className="text-[10px] text-blue-700 font-mono truncate">
                              📁 Ref: {item.documentRefOrPath}
                            </div>
                          )}
                          {item.verifiedBy && (
                            <div className="text-[10px] text-emerald-700">
                              ✓ Verified by: {item.verifiedBy} ({item.verificationDate || 'N/A'})
                            </div>
                          )}
                          {item.privateNotes && (
                            <div className="text-[10px] text-slate-600 italic">
                              📝 Note: {item.privateNotes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>

            {/* Read-Only Status Bar Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400 font-medium">
              🔒 {lang === 'ne' ? 'प्रकाशन स्थिति सुरक्षित रोक्का गरिएको छ' : 'Publication Status Locked & Quarantined'}
            </div>
          </div>
        ))}
      </div>

      {/* Return to Dashboard CTA */}
      <div className="flex justify-between items-center text-xs text-slate-500 pt-4">
        <span>
          {lang === 'ne' ? 'मादी (संखुवासभा) सरोकार समाज, काठमाडौं — प्रशासनिक सुशासन प्रणाली' : 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu — Admin Governance System'}
        </span>
        <Link
          href={`/${lang}/admin`}
          className="text-[#01366E] font-bold hover:underline flex items-center gap-1"
        >
          <span>←</span>
          <span>{lang === 'ne' ? 'मुख्य प्रशासनिक ड्यासबोर्ड' : 'Back to Main Dashboard'}</span>
        </Link>
      </div>
    </div>
  );
}

