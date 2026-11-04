'use client';

import { useState, useTransition } from 'react';
import { SocialActivity, ActivityWorkflowStage } from '@/lib/cms/cms-service';
import {
  saveSocialActivityAction,
  deleteSocialActivityAction,
  advanceActivityWorkflowAction,
} from '@/app/actions/cms-actions';

export function ActivitiesManager({
  initialActivities,
  lang,
}: {
  initialActivities: SocialActivity[];
  lang: string;
}) {
  const [activities, setActivities] = useState<SocialActivity[]>(initialActivities);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<SocialActivity> | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStage, setFilterStage] = useState<string>('ALL');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleOpenNew = () => {
    setEditingItem({
      slug: `activity-${Date.now()}`,
      titleNe: '',
      titleEn: '',
      date: '२०८२-०४-२१',
      dateEn: '2082/04/21 BS',
      locationNe: 'मादी, संखुवासभा',
      locationEn: 'Madi, Sankhuwasabha',
      category: 'COMMUNITY',
      organizerNe: 'मादी (संखुवासभा) सरोकार समाज, काठमाडौं',
      organizerEn: 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu',
      descriptionNe: '',
      descriptionEn: '',
      summaryNe: '',
      summaryEn: '',
      participantCount: undefined,
      hasBeneficiaryRecord: false,
      beneficiaryRecordRef: '',
      photoConsentVerified: false,
      photos: [],
      albumLink: '',
      relatedDocumentUrl: '',
      relatedDocumentTitleNe: '',
      relatedDocumentApproved: false,
      status: 'DRAFT',
      workflowStage: 'DRAFT',
      evidenceChecklist: {
        hasAttendanceSheet: false,
        attendanceSheetRef: '',
        hasEventPhotos: false,
        eventPhotosRef: '',
        hasReceiptsVouchers: false,
        receiptsVouchersRef: '',
        noExpenseIncurred: false,
        zeroExpenseDeclaration: undefined,
        hasActivityReport: false,
        activityReportRef: '',
        hasExecutiveCommitteeApproval: false,
        approvalMinuteRef: '',
      },
      adminNotes: '',
    });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.titleNe) return;

    setMessage(null);
    startTransition(async () => {
      const res = await saveSocialActivityAction(editingItem);
      if (res.success && res.data) {
        setMessage('गतिविधि सुरक्षित गरियो!');
        setIsEditing(false);
        setActivities((prev) => {
          const idx = prev.findIndex((a) => a.id === res.data.id);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = res.data;
            return next;
          }
          return [res.data, ...prev];
        });
      } else {
        setMessage(`त्रुटि: ${res.error}`);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('के तपाईं यो गतिविधि हटाउन निश्चित हुनुहुन्छ?')) return;
    setMessage(null);
    startTransition(async () => {
      const res = await deleteSocialActivityAction(id);
      if (res.success) {
        setMessage('गतिविधि हटाइयो।');
        setActivities((prev) => prev.filter((a) => a.id !== id));
      } else {
        setMessage(`त्रुटि: ${res.error}`);
      }
    });
  };

  const handleAdvanceWorkflow = (id: string, stage: ActivityWorkflowStage) => {
    let note = '';
    if (stage === 'TREASURER_REVIEW') {
      note = prompt('कोषाध्यक्ष / प्रशासन परीक्षण नोट (ऐच्छिक):') || '';
    } else if (stage === 'PRESIDENT_APPROVAL') {
      note = prompt('अध्यक्ष प्रमाणीकरण नोट (ऐच्छिक):') || '';
    } else if (stage === 'PUBLISHED') {
      if (!confirm('चेतावनी: प्रकाशन गरेपछि यो गतिविधि सार्वजनिक पृष्ठमा देखिनेछ। के सबै ५ प्रमाण प्रमाणित छन्?')) {
        return;
      }
    }

    setMessage(null);
    startTransition(async () => {
      const res = await advanceActivityWorkflowAction(id, stage, note);
      if (res.success && res.data) {
        setMessage(`कार्यप्रवाह चरण अद्यावधिक: ${stage}`);
        const updated = res.data;
        setActivities((prev) => prev.map((a) => (a.id === id ? updated : a)));
      } else {
        setMessage(`कार्यप्रवाह त्रुटि: ${res.error}`);
      }
    });
  };

  const filtered = activities.filter((a) => {
    const matchesCat = filterCategory === 'ALL' || a.category === filterCategory;
    const matchesStage = filterStage === 'ALL' || a.workflowStage === filterStage;
    return matchesCat && matchesStage;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-50 px-2.5 py-1 rounded-full">
            {lang === 'ne' ? 'गतिविधि प्रकाशन प्रणाली' : 'Activity Publishing System'}
          </span>
          <h1 className="text-2xl font-extrabold text-[#01366E] mt-2">
            {lang === 'ne' ? 'सामाजिक गतिविधि तथा सेवा व्यवस्थापन' : 'Social Activities Management'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            {lang === 'ne'
              ? 'प्रमाण-आधारित प्रकाशन प्रणाली: मस्यौदा → कोषाध्यक्ष परीक्षण → अध्यक्ष प्रमाणीकरण → सार्वजनिक प्रकाशन।'
              : 'Evidence-based activity publisher: Draft → Treasurer Review → President Approval → Published.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="bg-[#01366E] hover:bg-blue-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <span>➕</span>
          <span>{lang === 'ne' ? 'नयाँ गतिविधि सिर्जना गर्नुहोस्' : 'Create Activity'}</span>
        </button>
      </div>

      {/* Status Messages */}
      {message && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm font-semibold flex items-center justify-between">
          <span>ℹ️ {message}</span>
          <button type="button" onClick={() => setMessage(null)} className="text-blue-500 hover:text-blue-800 text-xs">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
        <div className="flex flex-wrap gap-2">
          <span className="font-bold text-gray-500 py-1 mr-1">वर्ग:</span>
          {['ALL', 'HEALTH', 'COMMUNITY', 'CULTURAL', 'EDUCATION'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterCategory === cat
                  ? 'bg-[#01366E] text-white'
                  : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL'
                ? 'सबै'
                : cat === 'HEALTH'
                ? 'स्वास्थ्य'
                : cat === 'COMMUNITY'
                ? 'सामुदायिक'
                : cat === 'CULTURAL'
                ? 'संस्कृति'
                : 'शिक्षा'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="font-bold text-gray-500 py-1 mr-1">चरण:</span>
          {[
            { key: 'ALL', label: 'सबै' },
            { key: 'DRAFT', label: '📝 मस्यौदा (Draft)' },
            { key: 'TREASURER_REVIEW', label: '🔍 कोषाध्यक्ष परीक्षण' },
            { key: 'PRESIDENT_APPROVAL', label: '⚖️ अध्यक्ष प्रमाणीकरण' },
            { key: 'PUBLISHED', label: '🟢 प्रकाशित' },
          ].map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setFilterStage(s.key)}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterStage === s.key
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Modal */}
      {isEditing && editingItem && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-blue-300 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {editingItem.id ? 'गतिविधि विवरण सम्पादन' : 'नयाँ गतिविधि सिर्जना (मस्यौदा)'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                सबै आवश्यक सूचना र आन्तरिक प्रमाण भरेर मात्र प्रकाशन प्रक्रियामा लैजानुहोस्।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-gray-400 hover:text-gray-700 text-sm font-bold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
            >
              ✕ बन्द
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* 1. Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  गतिविधि शीर्षक (नेपालीमा) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.titleNe || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, titleNe: e.target.value })}
                  placeholder="उदा: मादी नगरपालिकामा बृहत् निःशुल्क स्वास्थ्य शिविर"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Activity Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.titleEn || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, titleEn: e.target.value })}
                  placeholder="e.g. Comprehensive Free Health Camp in Madi"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            {/* 2. Date, Location & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  मिति (Nepali Date) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.date || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                  placeholder="२०८२-०४-२१"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  स्थान (Nepali Location) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.locationNe || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, locationNe: e.target.value })}
                  placeholder="मादी–४, ओखरबोटे"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Location (English) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.locationEn || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, locationEn: e.target.value })}
                  placeholder="Madi-4, Okharbote"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  वर्ग (Category) *
                </label>
                <select
                  value={editingItem.category || 'COMMUNITY'}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                >
                  <option value="COMMUNITY">सामुदायिक सेवा (COMMUNITY)</option>
                  <option value="HEALTH">स्वास्थ्य शिविर (HEALTH)</option>
                  <option value="CULTURAL">सांस्कृतिक (CULTURAL)</option>
                  <option value="EDUCATION">शिक्षा तथा तालिम (EDUCATION)</option>
                  <option value="ENVIRONMENT">वातावरण तथा सरसफाइ (ENVIRONMENT)</option>
                </select>
              </div>
            </div>

            {/* 3. Organizer / Implementing Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  आयोजक वा कार्यान्वयन इकाई (Nepali)
                </label>
                <input
                  type="text"
                  value={editingItem.organizerNe || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, organizerNe: e.target.value })}
                  placeholder="मादी (संखुवासभा) सरोकार समाज, काठमाडौं"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Organizer or Implementing Unit (English)
                </label>
                <input
                  type="text"
                  value={editingItem.organizerEn || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, organizerEn: e.target.value })}
                  placeholder="Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            {/* 4. Short Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  सार्वजनिक छोटो विवरण (Nepali Description) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.descriptionNe || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, descriptionNe: e.target.value })}
                  placeholder="गतिविधिको उद्देश्य, सम्पन्न कार्यहरू र समुदायमा परेको प्रभाव..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Public Safe Description (English) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.descriptionEn || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, descriptionEn: e.target.value })}
                  placeholder="Objective, completed milestones, and community impact..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            {/* 5. Verified Beneficiary / Participant Count Gate */}
            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasBeneficiaryRecord"
                  checked={editingItem.hasBeneficiaryRecord || false}
                  onChange={(e) => setEditingItem({ ...editingItem, hasBeneficiaryRecord: e.target.checked })}
                  className="w-4 h-4 text-[#01366E] rounded"
                />
                <label htmlFor="hasBeneficiaryRecord" className="text-xs font-bold text-amber-950 cursor-pointer">
                  📊 आधिकारिक सहभागी/लाभार्थी अभिलेख उपलब्ध छ (Official Supporting Record Exists)
                </label>
              </div>

              {editingItem.hasBeneficiaryRecord ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      प्रमाणित संख्या (Verified Count)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={editingItem.participantCount || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, participantCount: parseInt(e.target.value) || undefined })}
                      placeholder="उदा: 150"
                      className="w-full text-xs p-2 rounded-lg bg-white border border-amber-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      अभिलेख / दर्ता प्रमाण सन्दर्भ (Evidence Ref / File Code)
                    </label>
                    <input
                      type="text"
                      value={editingItem.beneficiaryRecordRef || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, beneficiaryRecordRef: e.target.value })}
                      placeholder="उदा: REG-ATTEND-2082/04, उपस्थिति पाना नं. ३"
                      className="w-full text-xs p-2 rounded-lg bg-white border border-amber-300"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-amber-800 italic">
                  नोट: आधिकारिक अभिलेख नभएसम्म अनुमानित वा असत्यापित संख्या सार्वजनिक रूपमा देखाइने छैन।
                </p>
              )}
            </div>

            {/* 6. Media & Document Gates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {/* Photo Album Link */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="photoConsentVerified"
                    checked={editingItem.photoConsentVerified || false}
                    onChange={(e) => setEditingItem({ ...editingItem, photoConsentVerified: e.target.checked })}
                    className="w-4 h-4 text-[#01366E] rounded"
                  />
                  <label htmlFor="photoConsentVerified" className="text-xs font-bold text-gray-800 cursor-pointer">
                    📷 तस्बिर सहमति प्रमाणित (Consented Photos Only)
                  </label>
                </div>
                <input
                  type="text"
                  value={editingItem.albumLink || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, albumLink: e.target.value })}
                  placeholder="आन्तरिक एल्बम लिङ्क (उदा: /gallery/camp-2082)"
                  className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200"
                />
              </div>

              {/* Related Public Approved PDF Document */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="relatedDocumentApproved"
                    checked={editingItem.relatedDocumentApproved || false}
                    onChange={(e) => setEditingItem({ ...editingItem, relatedDocumentApproved: e.target.checked })}
                    className="w-4 h-4 text-[#01366E] rounded"
                  />
                  <label htmlFor="relatedDocumentApproved" className="text-xs font-bold text-gray-800 cursor-pointer">
                    📄 अनुमोदित PDF प्रतिवेदन (Approved PDF Document)
                  </label>
                </div>
                <input
                  type="text"
                  value={editingItem.relatedDocumentUrl || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, relatedDocumentUrl: e.target.value })}
                  placeholder="फाइल मार्ग (उदा: /documents/reports/camp-report.pdf)"
                  className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200"
                />
              </div>
            </div>

            {/* 7. Internal Evidence Checklist */}
            <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-3">
              <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wide flex items-center gap-1.5">
                <span>🛡️</span>
                <span>आन्तरिक प्रमाण परीक्षण सूची (Internal Evidence Checklist) — ५ वटै अनिवार्य</span>
              </h3>
              <p className="text-[11px] text-blue-800">
                सार्वजनिक प्रकाशन हुनु अघि यी ५ वटै प्रमाणहरू अनिवार्य रूपमा प्रमाणित हुनुपर्दछ:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-blue-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.evidenceChecklist?.hasAttendanceSheet || false}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        evidenceChecklist: {
                          ...editingItem.evidenceChecklist!,
                          hasAttendanceSheet: e.target.checked,
                        },
                      })
                    }
                  />
                  <span>१. उपस्थिति पुस्तिका (Attendance sheet)</span>
                </label>

                <label className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-blue-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.evidenceChecklist?.hasEventPhotos || false}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        evidenceChecklist: {
                          ...editingItem.evidenceChecklist!,
                          hasEventPhotos: e.target.checked,
                        },
                      })
                    }
                  />
                  <span>२. कार्यक्रमका प्रमाणित तस्बिर (Event photos)</span>
                </label>

                <div className="bg-white p-3 rounded-lg border border-blue-200 sm:col-span-2 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-gray-800">३. लेखा प्रमाण (Accounting Evidence):</span>
                    <label className="inline-flex items-center gap-1.5 text-xs text-[#01366E] font-medium bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingItem.evidenceChecklist?.noExpenseIncurred || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setEditingItem({
                            ...editingItem,
                            evidenceChecklist: {
                              ...editingItem.evidenceChecklist!,
                              noExpenseIncurred: checked,
                              hasReceiptsVouchers: checked ? false : editingItem.evidenceChecklist?.hasReceiptsVouchers || false,
                              receiptsVouchersRef: checked ? 'Not applicable — zero expense' : (editingItem.evidenceChecklist?.receiptsVouchersRef === 'Not applicable — zero expense' ? '' : editingItem.evidenceChecklist?.receiptsVouchersRef || ''),
                              zeroExpenseDeclaration: checked
                                ? {
                                    declared: true,
                                    declaredByAdminName: editingItem.evidenceChecklist?.zeroExpenseDeclaration?.declaredByAdminName || 'Admin Officer',
                                    declaredAt: editingItem.evidenceChecklist?.zeroExpenseDeclaration?.declaredAt || new Date().toISOString(),
                                    treasurerReviewed: Boolean(editingItem.evidenceChecklist?.zeroExpenseDeclaration?.treasurerReviewed),
                                    treasurerReviewedBy: editingItem.evidenceChecklist?.zeroExpenseDeclaration?.treasurerReviewedBy,
                                    treasurerReviewedAt: editingItem.evidenceChecklist?.zeroExpenseDeclaration?.treasurerReviewedAt,
                                    treasurerNotes: editingItem.evidenceChecklist?.zeroExpenseDeclaration?.treasurerNotes || 'Not applicable — zero expense',
                                  }
                                : undefined,
                            },
                          });
                        }}
                      />
                      <span>कुनै खर्च नभएको घोषणा (No expense incurred)</span>
                    </label>
                  </div>

                  {editingItem.evidenceChecklist?.noExpenseIncurred ? (
                    <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200 text-[11px] text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>ℹ️</span>
                        <span>शून्य खर्च घोषणा (Zero-Expense Declaration):</span>
                      </div>
                      <p>यस गतिविधिमा संस्थाको कुनै खर्च भएको छैन। भौचर आवश्यक छैन (Not applicable — zero expense)।</p>
                      <div className="text-[10px] text-gray-600 bg-white/70 p-1.5 rounded border border-amber-100 flex flex-wrap gap-x-4">
                        <span>घोषक: {editingItem.evidenceChecklist?.zeroExpenseDeclaration?.declaredByAdminName || 'Admin Officer'}</span>
                        <span>
                          कोषाध्यक्ष समीक्षा:{' '}
                          {editingItem.evidenceChecklist?.zeroExpenseDeclaration?.treasurerReviewed
                            ? `✓ प्रमाणित (${editingItem.evidenceChecklist.zeroExpenseDeclaration.treasurerReviewedBy})`
                            : '⏳ समीक्षा बाँकी (Treasurer Review चरणमा प्रमाणित हुनेछ)'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingItem.evidenceChecklist?.hasReceiptsVouchers || false}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              evidenceChecklist: {
                                ...editingItem.evidenceChecklist!,
                                hasReceiptsVouchers: e.target.checked,
                              },
                            })
                          }
                        />
                        <span>बिल, भौचर तथा लेखा कागजात उपलब्ध छ (Receipts/vouchers)</span>
                      </label>
                      <input
                        type="text"
                        value={editingItem.evidenceChecklist?.receiptsVouchersRef || ''}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            evidenceChecklist: {
                              ...editingItem.evidenceChecklist!,
                              receiptsVouchersRef: e.target.value,
                            },
                          })
                        }
                        placeholder="भौचर नं./लेखा फाइल सन्दर्भ (उदा: VOUCH-2082-01)"
                        className="w-full text-xs p-2 rounded-lg bg-slate-50 border border-slate-200"
                      />
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-blue-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.evidenceChecklist?.hasActivityReport || false}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        evidenceChecklist: {
                          ...editingItem.evidenceChecklist!,
                          hasActivityReport: e.target.checked,
                        },
                      })
                    }
                  />
                  <span>४. गतिविधि प्रतिवेदन (Activity report)</span>
                </label>

                <label className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-blue-200 cursor-pointer sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={editingItem.evidenceChecklist?.hasExecutiveCommitteeApproval || false}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        evidenceChecklist: {
                          ...editingItem.evidenceChecklist!,
                          hasExecutiveCommitteeApproval: e.target.checked,
                        },
                      })
                    }
                  />
                  <span>५. कार्यसमिति निर्णय / अनुमोदन (Executive committee approval)</span>
                </label>
              </div>
            </div>

            {/* 8. Publication Workflow & Private Admin Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  कार्यप्रवाह चरण (Workflow Stage)
                </label>
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-[#01366E]">
                  {editingItem.workflowStage || 'DRAFT'}
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  चरण प्रगति तलको तालिकाबाट नियन्त्रण हुन्छ।
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  🔒 आन्तरिक प्रशासनिक टिप्पणी (Internal Notes — कहिल्यै सार्वजनिक नहुने)
                </label>
                <textarea
                  rows={2}
                  value={editingItem.adminNotes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, adminNotes: e.target.value })}
                  placeholder="प्रशासनिक कागजात सन्दर्भ, बैठक मिति, लेखापरीक्षण टिप्पणी..."
                  className="w-full text-xs p-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-slate-100 transition"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="bg-[#01366E] hover:bg-blue-900 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm transition"
              >
                {isPending ? 'सुरक्षित गर्दै...' : 'मस्यौदा सुरक्षित गर्नुहोस्'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((act) => {
          const isPublished = act.status === 'PUBLISHED' && act.workflowStage === 'PUBLISHED';
          const ev = act.evidenceChecklist;
          const evCount = [
            ev?.hasAttendanceSheet,
            ev?.hasEventPhotos,
            ev?.hasReceiptsVouchers || (ev?.noExpenseIncurred && ev?.zeroExpenseDeclaration?.treasurerReviewed),
            ev?.hasActivityReport,
            ev?.hasExecutiveCommitteeApproval,
          ].filter(Boolean).length;

          return (
            <div
              key={act.id}
              className={`bg-white rounded-2xl border transition shadow-sm p-5 flex flex-col justify-between ${
                isPublished ? 'border-emerald-300' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Stage Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {act.category}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        act.workflowStage === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : act.workflowStage === 'PRESIDENT_APPROVAL'
                          ? 'bg-purple-100 text-purple-800'
                          : act.workflowStage === 'TREASURER_REVIEW'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {act.workflowStage || 'DRAFT'}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                      प्रमाण: {evCount}/५
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2 mb-1">
                  {act.titleNe}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1 mb-2">{act.titleEn}</p>

                <div className="text-[11px] text-gray-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">मिति:</span>
                    <span className="font-semibold text-gray-700">{act.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">स्थान:</span>
                    <span className="font-semibold text-gray-700 truncate ml-2">{act.locationNe}</span>
                  </div>
                  {act.hasBeneficiaryRecord && act.participantCount && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">प्रमाणित सहभागी:</span>
                      <span className="font-bold text-[#FB6C01]">{act.participantCount}</span>
                    </div>
                  )}
                </div>

                {/* Evidence Checklist Progress */}
                <div className="text-[10px] text-slate-500 space-y-0.5 mb-3 bg-slate-50/70 p-2 rounded-lg">
                  <p className={ev?.hasAttendanceSheet ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                    {ev?.hasAttendanceSheet ? '✓' : '✗'} १. उपस्थिति पुस्तिका
                  </p>
                  <p className={ev?.hasEventPhotos ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                    {ev?.hasEventPhotos ? '✓' : '✗'} २. कार्यक्रम तस्बिर
                  </p>
                  {ev?.noExpenseIncurred ? (
                    <p className={ev?.zeroExpenseDeclaration?.treasurerReviewed ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                      {ev?.zeroExpenseDeclaration?.treasurerReviewed ? '✓' : '⏳'} ३. शून्य खर्च घोषणा {ev?.zeroExpenseDeclaration?.treasurerReviewed ? '(कोषाध्यक्ष प्रमाणित)' : '(समीक्षा बाँकी)'}
                    </p>
                  ) : (
                    <p className={ev?.hasReceiptsVouchers ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                      {ev?.hasReceiptsVouchers ? '✓' : '✗'} ३. बिल / भौचर {ev?.receiptsVouchersRef ? `(${ev.receiptsVouchersRef})` : ''}
                    </p>
                  )}
                  <p className={ev?.hasActivityReport ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                    {ev?.hasActivityReport ? '✓' : '✗'} ४. प्रतिवेदन
                  </p>
                  <p className={ev?.hasExecutiveCommitteeApproval ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                    {ev?.hasExecutiveCommitteeApproval ? '✓' : '✗'} ५. कार्यसमिति निर्णय
                  </p>
                </div>

                {/* Approval Signatures */}
                {(act.reviewedByTreasurerName || act.approvedByPresidentName) && (
                  <div className="text-[10px] text-slate-600 bg-amber-50/60 p-2 rounded-lg border border-amber-200/60 mb-3 space-y-0.5">
                    {act.reviewedByTreasurerName && (
                      <p>✓ कोषाध्यक्ष: {act.reviewedByTreasurerName}</p>
                    )}
                    {act.approvedByPresidentName && (
                      <p>✓ अध्यक्ष: {act.approvedByPresidentName}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Workflow Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  {act.workflowStage === 'DRAFT' && (
                    <button
                      type="button"
                      onClick={() => handleAdvanceWorkflow(act.id, 'TREASURER_REVIEW')}
                      className="text-[11px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                    >
                      → कोषाध्यक्ष परीक्षणमा पठाउनुहोस्
                    </button>
                  )}

                  {act.workflowStage === 'TREASURER_REVIEW' && (
                    <button
                      type="button"
                      onClick={() => handleAdvanceWorkflow(act.id, 'PRESIDENT_APPROVAL')}
                      className="text-[11px] font-bold px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition"
                    >
                      → अध्यक्ष प्रमाणीकरणमा पठाउनुहोस्
                    </button>
                  )}

                  {act.workflowStage === 'PRESIDENT_APPROVAL' && (
                    <button
                      type="button"
                      onClick={() => handleAdvanceWorkflow(act.id, 'PUBLISHED')}
                      className="text-[11px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg transition"
                    >
                      🚀 सार्वजनिक प्रकाशन गर्नुहोस्
                    </button>
                  )}

                  {act.workflowStage === 'PUBLISHED' && (
                    <button
                      type="button"
                      onClick={() => handleAdvanceWorkflow(act.id, 'DRAFT')}
                      className="text-[11px] font-bold px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg transition"
                    >
                      ↩ मस्यौदामा फिर्ता लैजानुहोस्
                    </button>
                  )}

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem(act);
                        setIsEditing(true);
                      }}
                      className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition"
                    >
                      सम्पादन
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(act.id)}
                      className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded hover:bg-rose-100 transition"
                    >
                      हटाउनुहोस्
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
