'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  type EvidenceTrackerRecord,
  type EvidenceCollectionStatus,
  type EvidenceApprovalStatus,
  type RealContentCollectionTrackersOverview,
} from '@/lib/cms/cms-service';
import { updateEvidenceTrackerItemStatusAction } from '@/app/actions/cms-actions';

interface EvidenceTrackerManagerProps {
  initialData: RealContentCollectionTrackersOverview;
  lang: string;
  adminRole: string;
}

type TrackerTab = 'COMMITTEE' | 'ACTIVITY' | 'SCHOOL_SUPPORT' | 'RELIEF_MEDICAL_ASSISTANCE';

export function EvidenceTrackerManager({
  initialData,
  lang,
  adminRole,
}: EvidenceTrackerManagerProps) {
  const [data, setData] = useState<RealContentCollectionTrackersOverview>(initialData);
  const [activeTab, setActiveTab] = useState<TrackerTab>('COMMITTEE');
  const [selectedItem, setSelectedItem] = useState<EvidenceTrackerRecord | null>(null);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State for Editing an Evidence Item
  const [collectionStatus, setCollectionStatus] = useState<EvidenceCollectionStatus>('NOT_COLLECTED');
  const [documentRefOrPath, setDocumentRefOrPath] = useState('');
  const [collectedBy, setCollectedBy] = useState('');
  const [verifiedBy, setVerifiedBy] = useState('');
  const [verificationDate, setVerificationDate] = useState('');
  const [approvalStatus, setApprovalStatus] = useState<EvidenceApprovalStatus>('PENDING');
  const [privateNotes, setPrivateNotes] = useState('');

  const handleOpenEdit = (item: EvidenceTrackerRecord) => {
    setSelectedItem(item);
    setCollectionStatus(item.collectionStatus);
    setDocumentRefOrPath(item.documentRefOrPath || '');
    setCollectedBy(item.collectedBy || '');
    setVerifiedBy(item.verifiedBy || '');
    setVerificationDate(item.verificationDate || '');
    setApprovalStatus(item.approvalStatus);
    setPrivateNotes(item.privateNotes || '');
    setFeedback(null);
  };

  const handleCloseEdit = () => {
    setSelectedItem(null);
    setFeedback(null);
  };

  const handleSave = () => {
    if (!selectedItem) return;

    startTransition(async () => {
      const res = await updateEvidenceTrackerItemStatusAction(selectedItem.id, {
        collectionStatus,
        documentRefOrPath: documentRefOrPath.trim() || undefined,
        collectedBy: collectedBy.trim() || undefined,
        verifiedBy: verifiedBy.trim() || undefined,
        verificationDate: verificationDate.trim() || undefined,
        approvalStatus,
        privateNotes: privateNotes.trim() || undefined,
      });

      if (!res.success || !res.data) {
        setFeedback({
          type: 'error',
          message: res.error || (lang === 'ne' ? 'अपडेट असफल भयो।' : 'Update failed.'),
        });
        return;
      }

      // Update local state without mutating CMS content
      const updatedItem = res.data;
      const updateList = (list: EvidenceTrackerRecord[]) =>
        list.map((it) => (it.id === updatedItem.id ? updatedItem : it));

      const updatedCommittee = updateList(data.committee);
      const updatedActivity = updateList(data.activity);
      const updatedSchool = updateList(data.schoolSupport);
      const updatedRelief = updateList(data.reliefMedicalAssistance);

      const allItems = [...updatedCommittee, ...updatedActivity, ...updatedSchool, ...updatedRelief];

      setData({
        committee: updatedCommittee,
        activity: updatedActivity,
        schoolSupport: updatedSchool,
        reliefMedicalAssistance: updatedRelief,
        stats: {
          totalItems: allItems.length,
          notCollected: allItems.filter((i) => i.collectionStatus === 'NOT_COLLECTED').length,
          collected: allItems.filter((i) => i.collectionStatus === 'COLLECTED').length,
          verified: allItems.filter((i) => i.collectionStatus === 'VERIFIED').length,
          rejected: allItems.filter((i) => i.collectionStatus === 'REJECTED').length,
          approved: allItems.filter((i) => i.approvalStatus === 'APPROVED').length,
          pending: allItems.filter((i) => i.approvalStatus === 'PENDING').length,
        },
      });

      setFeedback({
        type: 'success',
        message:
          lang === 'ne'
            ? 'प्रमाण विवरण सुरक्षित रूपमा अध्यावधिक गरियो (आन्तरिक मात्र)।'
            : 'Evidence item successfully updated (internal only).',
      });

      setTimeout(() => {
        handleCloseEdit();
      }, 900);
    });
  };

  const getActiveList = (): EvidenceTrackerRecord[] => {
    switch (activeTab) {
      case 'COMMITTEE':
        return data.committee;
      case 'ACTIVITY':
        return data.activity;
      case 'SCHOOL_SUPPORT':
        return data.schoolSupport;
      case 'RELIEF_MEDICAL_ASSISTANCE':
        return data.reliefMedicalAssistance;
      default:
        return [];
    }
  };

  const activeItems = getActiveList();

  const tabs: Array<{ key: TrackerTab; titleNe: string; titleEn: string; icon: string; count: number }> = [
    {
      key: 'COMMITTEE',
      titleNe: '१. कार्यसमिति प्रमाण',
      titleEn: '1. Committee Evidence',
      icon: '👥',
      count: data.committee.length,
    },
    {
      key: 'ACTIVITY',
      titleNe: '२. गतिविधि प्रमाण',
      titleEn: '2. Activity Evidence',
      icon: '🎯',
      count: data.activity.length,
    },
    {
      key: 'SCHOOL_SUPPORT',
      titleNe: '३. विद्यालय सहयोग प्रमाण',
      titleEn: '3. School Support Evidence',
      icon: '🏫',
      count: data.schoolSupport.length,
    },
    {
      key: 'RELIEF_MEDICAL_ASSISTANCE',
      titleNe: '४. राहत तथा उपचार सहायता प्रमाण',
      titleEn: '4. Relief/Medical Assistance Evidence',
      icon: '🤝',
      count: data.reliefMedicalAssistance.length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#01366E] to-[#002244] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-blue-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#FB6C01] text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                {lang === 'ne' ? 'आन्तरिक प्रमाण ट्र्याकर' : 'Internal Content Tracker'}
              </span>
              <span className="bg-white/10 text-blue-100 text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-white/20">
                🔒 {lang === 'ne' ? 'गोप्य आन्तरिक अभिलेख' : 'Strictly Private & Internal'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {lang === 'ne'
                ? 'वास्तविक सामग्री संकलन तथा प्रमाण ट्र्याकर'
                : 'Real-Content Collection & Evidence Tracker'}
            </h1>
            <p className="text-blue-100/90 text-sm mt-1 max-w-2xl">
              {lang === 'ne'
                ? 'कार्यसमिति, गतिविधि, विद्यालय शैक्षिक पूर्वाधार र राहत/उपचार सहायताका आधिकारिक प्रमाणहरूको संकलन, रुजु र अनुमोदन स्थिति व्यवस्थापन गर्नुहोस्।'
                : 'Track, inspect, and record collection status, file references, verifiers, and private notes across the four core institutional pillars.'}
            </p>
          </div>

          <div className="shrink-0 flex gap-2">
            <Link
              href={`/${lang}/admin/governance`}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-white/20 transition flex items-center gap-1.5"
            >
              <span>🛡️</span>
              <span>{lang === 'ne' ? 'सुशासन ओभरभ्यू' : 'Governance Overview'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Governance & Zero Auto-Publish Policy Card */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3.5 text-amber-950 text-xs sm:text-sm">
        <span className="text-xl shrink-0">⚠️</span>
        <div className="space-y-1">
          <p className="font-extrabold">
            {lang === 'ne'
              ? 'गोपनीयता तथा शून्य स्वतः-प्रकाशन नीति (Zero Auto-Publish Policy):'
              : 'Privacy & Zero Auto-Publish Policy:'}
          </p>
          <p className="text-amber-900 leading-relaxed text-xs">
            {lang === 'ne'
              ? 'प्रमाण ट्र्याकरमा स्थिति अध्यावधिक गर्दा कुनै पनि सार्वजनिक CMS सामग्री स्वतः प्रकाशित हुँदैन। प्रमाण सन्दर्भ, रुजु गर्ने पदाधिकारीको नाम, मिति र निजी टिप्पणीहरू कहिल्यै सार्वजनिक हुँदैनन् र आन्तरिक सुरक्षामै रहन्छन्। प्रत्येक खण्डका अनिवार्य सर्त, सहमति र कार्यसमिति अनुमोदन पूर्ण नभएसम्म सार्वजनिक प्रकाशन रोक्का रहनेछ।'
              : 'Updating this tracker records internal governance telemetry only. Document references, verifier names, dates, and private notes are strictly suppressed in public APIs. Tracker updates do NOT automatically change CMS publication statuses. Content remains quarantined until all statutory gates pass.'}
          </p>
        </div>
      </div>

      {/* Overall Progress Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
          <span className="text-2xl font-black text-slate-800">{data.stats.totalItems}</span>
          <span className="block text-xs text-slate-500 font-medium mt-0.5">
            {lang === 'ne' ? 'कुल प्रमाण बुँदा' : 'Total Items'}
          </span>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm text-center">
          <span className="text-2xl font-black text-slate-600">{data.stats.notCollected}</span>
          <span className="block text-xs text-slate-500 font-medium mt-0.5">
            {lang === 'ne' ? 'संकलन बाँकी' : 'Not Collected'}
          </span>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 shadow-sm text-center">
          <span className="text-2xl font-black text-amber-700">{data.stats.collected}</span>
          <span className="block text-xs text-amber-700 font-medium mt-0.5">
            {lang === 'ne' ? 'संकलित' : 'Collected'}
          </span>
        </div>

        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 shadow-sm text-center">
          <span className="text-2xl font-black text-emerald-700">{data.stats.verified}</span>
          <span className="block text-xs text-emerald-700 font-medium mt-0.5">
            {lang === 'ne' ? 'प्रमाणित (Verified)' : 'Verified'}
          </span>
        </div>

        <div className="bg-rose-50 rounded-xl p-4 border border-rose-200 shadow-sm text-center">
          <span className="text-2xl font-black text-rose-700">{data.stats.rejected}</span>
          <span className="block text-xs text-rose-700 font-medium mt-0.5">
            {lang === 'ne' ? 'अस्वीकृत (Rejected)' : 'Rejected'}
          </span>
        </div>
      </div>

      {/* Four Tracker Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2 gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              handleCloseEdit();
            }}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === tab.key
                ? 'border-[#01366E] text-[#01366E] bg-blue-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{lang === 'ne' ? tab.titleNe : tab.titleEn}</span>
            <span className="bg-slate-200/80 text-slate-700 text-[11px] px-2 py-0.5 rounded-full font-mono">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="bg-white rounded-b-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {activeItems.map((item) => (
          <div
            key={item.id}
            className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-slate-900">
                  {lang === 'ne' ? item.titleNe : item.titleEn}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {item.itemKey}
                </span>
              </div>

              {/* Status and Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {/* Collection Status Pill */}
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    item.collectionStatus === 'VERIFIED'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : item.collectionStatus === 'COLLECTED'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : item.collectionStatus === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {lang === 'ne'
                    ? item.collectionStatus === 'VERIFIED'
                      ? '✓ प्रमाणित (Verified)'
                      : item.collectionStatus === 'COLLECTED'
                      ? '⏳ संकलित (Collected)'
                      : item.collectionStatus === 'REJECTED'
                      ? '✗ अस्वीकृत (Rejected)'
                      : '○ संकलन बाँकी (Not collected)'
                    : item.collectionStatus}
                </span>

                {/* Approval Status */}
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                    item.approvalStatus === 'APPROVED'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : item.approvalStatus === 'REJECTED'
                      ? 'bg-red-50 text-red-800 border-red-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Approval: {item.approvalStatus}
                </span>

                <span className="text-[10px] text-slate-400 font-medium">
                  🔒 Private (isPublic: false)
                </span>
              </div>

              {/* Recorded Meta Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                {item.documentRefOrPath && (
                  <div className="truncate">
                    <span className="font-semibold text-slate-500">📁 File/Ref:</span>{' '}
                    <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] text-blue-700">
                      {item.documentRefOrPath}
                    </code>
                  </div>
                )}
                {item.collectedBy && (
                  <div>
                    <span className="font-semibold text-slate-500">📥 Collected by:</span> {item.collectedBy}
                  </div>
                )}
                {item.verifiedBy && (
                  <div>
                    <span className="font-semibold text-slate-500">🛡️ Verified by:</span> {item.verifiedBy}{' '}
                    {item.verificationDate && `(${item.verificationDate})`}
                  </div>
                )}
                {item.privateNotes && (
                  <div className="sm:col-span-2 italic text-slate-600 bg-slate-50 p-2 rounded border border-slate-200/60 mt-1">
                    📝 Note: {item.privateNotes}
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={() => handleOpenEdit(item)}
                className="bg-[#01366E] hover:bg-blue-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm"
              >
                ✏️ {lang === 'ne' ? 'प्रमाण रेकर्ड / सम्पादन' : 'Record / Edit Evidence'}
              </button>
            </div>
          </div>
        ))}

        {activeItems.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">
            {lang === 'ne' ? 'यस खण्डमा हाल कुनै प्रमाण रेकर्ड छैन।' : 'No evidence items in this category.'}
          </div>
        )}
      </div>

      {/* Edit Drawer Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between gap-4 border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-50 px-2 py-0.5 rounded">
                  {selectedItem.category}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {lang === 'ne' ? selectedItem.titleNe : selectedItem.titleEn}
                </h3>
                <p className="text-xs text-slate-500">Item Key: {selectedItem.itemKey}</p>
              </div>
              <button
                onClick={handleCloseEdit}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  feedback.type === 'success'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {feedback.message}
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* 1. Collection Status */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  १. संकलन स्थिति (Collection Status) *
                </label>
                <select
                  value={collectionStatus}
                  onChange={(e) => setCollectionStatus(e.target.value as EvidenceCollectionStatus)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-white text-xs font-medium focus:ring-2 focus:ring-[#01366E]"
                >
                  <option value="NOT_COLLECTED">Not collected (संकलन बाँकी)</option>
                  <option value="COLLECTED">Collected (संकलित)</option>
                  <option value="VERIFIED">Verified (प्रमाणित)</option>
                  <option value="REJECTED">Rejected (अस्वीकृत)</option>
                </select>
              </div>

              {/* 2. Document reference or local file path */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  २. कागजात सन्दर्भ वा स्थानीय फाइल पथ (Document Ref / Local File Path)
                </label>
                <input
                  type="text"
                  placeholder="उदा. internal-docs/minutes/minute-2082.pdf"
                  value={documentRefOrPath}
                  onChange={(e) => setDocumentRefOrPath(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-xs focus:ring-2 focus:ring-[#01366E]"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  * यो पथ आन्तरिक सुरक्षामै रहन्छ, सार्वजनिक रूपमा कहिल्यै देखाइँदैन।
                </span>
              </div>

              {/* 3. Collected by */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ३. संकलन गर्ने पदाधिकारी (Collected By)
                </label>
                <input
                  type="text"
                  placeholder="उदा. General Secretary, Secretariat Admin"
                  value={collectedBy}
                  onChange={(e) => setCollectedBy(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#01366E]"
                />
              </div>

              {/* 4. Verified by & Verification date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ४. रुजु गर्ने पदाधिकारी (Verified By)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. Legal Advisor, Treasurer, President"
                    value={verifiedBy}
                    onChange={(e) => setVerifiedBy(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#01366E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ५. रुजु मिति (Verification Date)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. २०८२-०४-२१ BS"
                    value={verificationDate}
                    onChange={(e) => setVerificationDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#01366E]"
                  />
                </div>
              </div>

              {/* 6. Approval status */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ६. अनुमोदन स्थिति (Approval Status) *
                </label>
                <select
                  value={approvalStatus}
                  onChange={(e) => setApprovalStatus(e.target.value as EvidenceApprovalStatus)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-white text-xs font-medium focus:ring-2 focus:ring-[#01366E]"
                >
                  <option value="PENDING">Pending (प्रतीक्षामा)</option>
                  <option value="APPROVED">Approved (कार्यसमितिबाट स्वीकृत)</option>
                  <option value="REJECTED">Rejected (अस्वीकृत)</option>
                </select>
              </div>

              {/* 7. Private notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ७. आन्तरिक गोपनीय टिप्पणी (Private Notes)
                </label>
                <textarea
                  rows={3}
                  placeholder="आन्तरिक कार्यसूची, आवश्यक कागजात वा रुजु प्रक्रिया सम्बन्धी टिप्पणी..."
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#01366E]"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={handleCloseEdit}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                {lang === 'ne' ? 'रद्द गर्नुहोस्' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="bg-[#01366E] hover:bg-blue-900 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
              >
                {isPending
                  ? lang === 'ne'
                    ? 'सुरक्षित गर्दै...'
                    : 'Saving...'
                  : lang === 'ne'
                  ? 'अध्यावधिक गर्नुहोस्'
                  : 'Update Evidence Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

