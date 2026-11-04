'use client';

import { useState, useTransition } from 'react';
import {
  MediaConsentRecord,
  MediaConsentType,
  MediaConsentStatus,
  MediaConsentScope,
} from '@/lib/cms/cms-service';
import {
  saveMediaConsentRecordAction,
  approveMediaConsentPublicationAction,
  deleteMediaConsentRecordAction,
} from '@/app/actions/cms-actions';

export function MediaConsentTracker({
  initialRecords,
  lang,
}: {
  initialRecords: MediaConsentRecord[];
  lang: string;
}) {
  const [records, setRecords] = useState<MediaConsentRecord[]>(initialRecords);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<Partial<MediaConsentRecord>>({
    id: '',
    titleNe: '',
    titleEn: '',
    fileUrl: '',
    redactedFileUrl: '',
    mediaType: 'patient_identification',
    status: 'INTERNAL_ONLY',
    hasWrittenConsent: false,
    consentDate: '',
    consentScope: 'internal_use',
    redactionRequirement: '',
    approverName: '',
    approvalDate: '',
    adminNotes: '',
  });

  const handleOpenNew = () => {
    setFormData({
      id: `mct-${Date.now()}`,
      titleNe: '',
      titleEn: '',
      fileUrl: '',
      redactedFileUrl: '',
      mediaType: 'patient_identification',
      status: 'INTERNAL_ONLY',
      hasWrittenConsent: false,
      consentDate: '',
      consentScope: 'internal_use',
      redactionRequirement: 'Patient face blur and diagnostic details masking required.',
      approverName: '',
      approvalDate: '',
      adminNotes: '',
    });
    setIsEditing(true);
    setMessage(null);
  };

  const handleEdit = (record: MediaConsentRecord) => {
    setFormData({ ...record });
    setIsEditing(true);
    setMessage(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleNe || !formData.mediaType) {
      setMessage('शीर्षक तथा मिडिया प्रकार अनिवार्य छन्।');
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const res = await saveMediaConsentRecordAction({
        ...formData,
        mediaType: formData.mediaType as MediaConsentType,
        titleNe: formData.titleNe!,
      });

      if (res.success && res.data) {
        setMessage('सहमति रेकर्ड सुरक्षित गरियो!');
        setIsEditing(false);
        setRecords((prev) => {
          const idx = prev.findIndex((r) => r.id === res.data.id);
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

  const handleApprove = (id: string, targetStatus: 'APPROVED_PUBLIC' | 'REDACTED_PUBLIC') => {
    const approver = prompt('स्वीकृति दिने आधिकारिक पदाधिकारीको नाम (Approver Full Name):');
    if (!approver || !approver.trim()) return;

    let notes = '';
    let redactedUrl = '';
    if (targetStatus === 'REDACTED_PUBLIC') {
      redactedUrl = prompt('सम्पादित फाइल लिङ्क (Redacted File URL) — यदि उपलब्ध भए:') || '';
      notes = prompt('सम्पादन तथा स्वीकृति टिप्पणी (Redaction & Approval Notes):') || '';
    } else {
      notes = prompt('प्रकाशन स्वीकृति टिप्पणी (Approval Notes):') || '';
    }

    setMessage(null);
    startTransition(async () => {
      const res = await approveMediaConsentPublicationAction(
        id,
        targetStatus,
        notes,
        redactedUrl || undefined
      );

      if (res.success && res.data) {
        setMessage(`प्रकाशन स्थिति अद्यावधिक: ${targetStatus}`);
        setRecords((prev) => prev.map((r) => (r.id === id ? res.data! : r)));
      } else {
        setMessage(`स्वीकृति त्रुटि: ${res.error}`);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('के तपाईं यो सहमति ट्र्याकर रेकर्ड हटाउन निश्चित हुनुहुन्छ?')) return;
    setMessage(null);
    startTransition(async () => {
      const res = await deleteMediaConsentRecordAction(id);
      if (res.success) {
        setMessage('रेकर्ड हटाइयो।');
        setRecords((prev) => prev.filter((r) => r.id !== id));
      } else {
        setMessage(`त्रुटि: ${res.error}`);
      }
    });
  };

  const filtered = records.filter((r) => {
    const matchesType = filterType === 'ALL' || r.mediaType === filterType;
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      r.titleNe.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const isSensitiveType = (type: MediaConsentType) =>
    ['condolence', 'ward_correspondence', 'relief_handover', 'patient_identification'].includes(type);

  return (
    <div className="space-y-6">
      {/* Top Banner & Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/70 border border-amber-800/80 px-2.5 py-1 rounded-full">
              {lang === 'ne' ? 'गोपनीयता तथा आन्तरिक सहमति' : 'Privacy & Consent Governance'}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {lang === 'ne' ? 'आन्तरिक ट्र्याकर' : 'Internal Tracker'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-2">
            {lang === 'ne' ? 'मिडिया सहमति तथा प्रकाशन ट्र्याकर' : 'Media Consent & Publication Tracker'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
            {lang === 'ne'
              ? 'बिरामी पहिचान, वडा पत्राचार, शोक प्रस्ताव तथा राहत वितरण सम्बन्धी संवेदनशील मिडियाको लिखित सहमति, गोपनीयता सम्पादन (Redaction) र आधिकारिक स्वीकृति ट्र्याक गर्नुहोस्।'
              : 'Track written consent, redaction requirements, and explicit executive approval for sensitive beneficiary media.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="bg-[#FB6C01] hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <span>➕</span>
          <span>{lang === 'ne' ? 'नयाँ सहमति रेकर्ड' : 'New Consent Record'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm font-semibold flex items-center justify-between">
          <span>ℹ️ {message}</span>
          <button type="button" onClick={() => setMessage(null)} className="text-blue-500 hover:text-blue-700">✕</button>
        </div>
      )}

      {/* Strict Privacy Governance Notice */}
      <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
        <span className="text-lg leading-none">🛡️</span>
        <div>
          <p className="font-bold">
            {lang === 'ne'
              ? 'संवेदनशील मिडिया प्रकाशनका अनिवार्य नियमहरू:'
              : 'Mandatory Sensitive Media Publication Rules:'}
          </p>
          <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-amber-800">
            <li>बिरामी पहिचान, वडा पत्राचार, शोक प्रस्ताव वा राहत वितरणका फाइलहरू पूर्वनिर्धारित रूपमा <strong>INTERNAL_ONLY</strong> वा <strong>PENDING_REVIEW</strong> रहन्छन्।</li>
            <li>लिखित सहमति (Written consent) र आधिकारिक पदाधिकारीको स्वीकृति विना कुनै पनि मिडिया सार्वजनिक गर्न पाइँदैन।</li>
            <li>सहमति कागजात, सम्पादन टिप्पणी तथा आन्तरिक प्रशासनिक नोटहरू सार्वजनिक API बाट पूर्ण रूपमा सुरक्षित रहन्छन्।</li>
          </ul>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#01366E]"
          >
            <option value="ALL">सबै प्रकार (All Types)</option>
            <option value="patient_identification">बिरामी पहिचान (Patient ID)</option>
            <option value="ward_correspondence">वडा पत्राचार (Ward Correspondence)</option>
            <option value="condolence">समवेदना / शोक (Condolence)</option>
            <option value="relief_handover">राहत वितरण (Relief Handover)</option>
            <option value="event_photo">कार्यक्रम तस्बिर (Event Photo)</option>
            <option value="other">अन्य (Other)</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#01366E]"
          >
            <option value="ALL">सबै स्थिति (All Status)</option>
            <option value="INTERNAL_ONLY">🔒 आन्तरिक मात्र (INTERNAL_ONLY)</option>
            <option value="PENDING_REVIEW">⏳ समीक्षा बाँकी (PENDING_REVIEW)</option>
            <option value="DRAFT">मस्यौदा (DRAFT)</option>
            <option value="REDACTED_PUBLIC">सम्पादित सार्वजनिक (REDACTED_PUBLIC)</option>
            <option value="APPROVED_PUBLIC">स्वीकृत सार्वजनिक (APPROVED_PUBLIC)</option>
          </select>
        </div>

        {/* Search */}
        <div className="w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="खोज्नुहोस् (Media ID, शीर्षक)..."
            className="w-full text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
          />
        </div>
      </div>

      {/* Edit / New Modal Form */}
      {isEditing && (
        <div className="bg-white p-6 rounded-2xl border-2 border-[#01366E]/20 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div>
              <h3 className="font-extrabold text-base text-[#01366E]">
                {formData.id ? `सहमति विवरण सम्पादन: ${formData.id}` : 'नयाँ मिडिया सहमति रेकर्ड'}
              </h3>
              <p className="text-xs text-gray-500">
                सबै संवेदनशील मिडियाका लागि लिखित सहमति र गोपनीयता सम्पादन अनिवार्य छ।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-gray-400 hover:text-gray-600 text-lg"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  मिडिया ID (Media ID)
                </label>
                <input
                  type="text"
                  value={formData.id || ''}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  मिडिया प्रकार (Media Type)
                </label>
                <select
                  value={formData.mediaType}
                  onChange={(e) =>
                    setFormData({ ...formData, mediaType: e.target.value as MediaConsentType })
                  }
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 font-semibold"
                >
                  <option value="patient_identification">बिरामी पहिचान (Patient Identification)</option>
                  <option value="ward_correspondence">वडा पत्राचार (Ward Correspondence)</option>
                  <option value="condolence">समवेदना / शोक प्रस्ताव (Condolence)</option>
                  <option value="relief_handover">राहत वितरण (Relief Handover)</option>
                  <option value="event_photo">कार्यक्रम तस्बिर (Event Photo)</option>
                  <option value="other">अन्य (Other)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  शीर्षक (नेपालीमा) *
                </label>
                <input
                  type="text"
                  value={formData.titleNe || ''}
                  onChange={(e) => setFormData({ ...formData, titleNe: e.target.value })}
                  placeholder="उदा: ओखरबोटे स्वास्थ्य शिविर बिरामी पहिचान..."
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  शीर्षक (Title in English)
                </label>
                <input
                  type="text"
                  value={formData.titleEn || ''}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  placeholder="e.g. Cataract Patient Diagnostic Record..."
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  मूल फाइल लिङ्क (Original File URL / Internal Path)
                </label>
                <input
                  type="text"
                  value={formData.fileUrl || ''}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  placeholder="/media/internal/patient-01.jpg"
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  सम्पादित फाइल लिङ्क (Redacted File URL — ऐच्छिक)
                </label>
                <input
                  type="text"
                  value={formData.redactedFileUrl || ''}
                  onChange={(e) => setFormData({ ...formData, redactedFileUrl: e.target.value })}
                  placeholder="/media/internal/patient-01-redacted.jpg"
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200"
                />
              </div>
            </div>

            {/* Consent & Governance Sub-Panel */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-[#01366E] uppercase tracking-wide flex items-center gap-1.5">
                <span>📋</span>
                <span>सहमति तथा सम्पादन विवरण (Consent & Redaction Details)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1 flex items-center">
                  <label className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={formData.hasWrittenConsent || false}
                      onChange={(e) => setFormData({ ...formData, hasWrittenConsent: e.target.checked })}
                    />
                    <span className="text-xs font-bold text-gray-800">लिखित सहमति उपलब्ध छ (Written Consent Exists)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    सहमति मिति (Consent Date)
                  </label>
                  <input
                    type="text"
                    value={formData.consentDate || ''}
                    onChange={(e) => setFormData({ ...formData, consentDate: e.target.value })}
                    placeholder="२०८२-०५-०२"
                    className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    सहमति दायरा (Consent Scope)
                  </label>
                  <select
                    value={formData.consentScope || 'internal_use'}
                    onChange={(e) =>
                      setFormData({ ...formData, consentScope: e.target.value as MediaConsentScope })
                    }
                    className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200"
                  >
                    <option value="internal_use">आन्तरिक प्रयोग मात्र (internal_use)</option>
                    <option value="redacted_public_use">सम्पादित सार्वजनिक (redacted_public_use)</option>
                    <option value="full_public_use">पूर्ण सार्वजनिक (full_public_use)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  गोपनीयता सम्पादन आवश्यकता (Redaction Requirement) *
                </label>
                <textarea
                  rows={2}
                  value={formData.redactionRequirement || ''}
                  onChange={(e) => setFormData({ ...formData, redactionRequirement: e.target.value })}
                  placeholder="उदा: अनुहार ब्लर, नागरिकता नं. गोप्य, मेडिकल विवरण हटाउने..."
                  className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200"
                />
              </div>
            </div>

            {/* Approval & Status Sub-Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-200/60">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  वर्तमान स्थिति (Current Status)
                </label>
                <select
                  value={formData.status || 'INTERNAL_ONLY'}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as MediaConsentStatus })
                  }
                  className="w-full text-xs p-2 rounded-lg bg-white border border-blue-200 font-bold text-[#01366E]"
                >
                  <option value="INTERNAL_ONLY">🔒 आन्तरिक मात्र (INTERNAL_ONLY)</option>
                  <option value="PENDING_REVIEW">⏳ समीक्षा बाँकी (PENDING_REVIEW)</option>
                  <option value="DRAFT">मस्यौदा (DRAFT)</option>
                  <option value="REDACTED_PUBLIC">सम्पादित सार्वजनिक (REDACTED_PUBLIC)</option>
                  <option value="APPROVED_PUBLIC">स्वीकृत सार्वजनिक (APPROVED_PUBLIC)</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  संवेदनशील मिडिया स्वीकृति विना सार्वजनिक गर्न मिल्दैन।
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  स्वीकृति दिने पदाधिकारी (Approver Name)
                </label>
                <input
                  type="text"
                  value={formData.approverName || ''}
                  onChange={(e) => setFormData({ ...formData, approverName: e.target.value })}
                  placeholder="पदाधिकारीको नाम"
                  className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  स्वीकृति मिति (Approval Date)
                </label>
                <input
                  type="text"
                  value={formData.approvalDate || ''}
                  onChange={(e) => setFormData({ ...formData, approvalDate: e.target.value })}
                  placeholder="YYYY-MM-DD"
                  className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200"
                />
              </div>
            </div>

            {/* Private Admin Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                🔒 आन्तरिक प्रशासनिक टिप्पणी (Private Admin Notes — कहिल्यै सार्वजनिक नहुने)
              </label>
              <textarea
                rows={2}
                value={formData.adminNotes || ''}
                onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                placeholder="सहमति दर्ता फाइल, कानूनी परामर्श, सम्पर्क विवरण..."
                className="w-full text-xs p-2 rounded-xl bg-slate-50 border border-slate-200"
              />
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
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
                {isPending ? 'सुरक्षित गर्दै...' : 'रेकर्ड सुरक्षित गर्नुहोस्'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tracker Records Table / Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-gray-500 text-xs">
            कुनै मिडिया सहमति रेकर्ड फेला परेन।
          </div>
        ) : (
          filtered.map((item) => {
            const isSensitive = isSensitiveType(item.mediaType);
            const isApproved = item.status === 'APPROVED_PUBLIC' || item.status === 'REDACTED_PUBLIC';

            return (
              <div
                key={item.id}
                className={`bg-white p-5 rounded-2xl border transition shadow-sm ${
                  item.status === 'APPROVED_PUBLIC'
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : item.status === 'REDACTED_PUBLIC'
                    ? 'border-blue-300 bg-blue-50/20'
                    : item.status === 'INTERNAL_ONLY'
                    ? 'border-red-200 bg-red-50/10'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-700 bg-slate-100 px-2 py-0.5 rounded">
                        {item.id}
                      </span>

                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          isSensitive
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.mediaType}
                      </span>

                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          item.status === 'APPROVED_PUBLIC'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'REDACTED_PUBLIC'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'INTERNAL_ONLY'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.hasWrittenConsent
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.hasWrittenConsent ? '✓ लिखित सहमति उपलब्ध' : '✗ लिखित सहमति छैन'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 mt-1">{item.titleNe}</h4>
                    <p className="text-xs text-gray-500">{item.titleEn}</p>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                    >
                      सम्पादन
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition"
                    >
                      हटाउनुहोस्
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] mb-3">
                  <div>
                    <span className="text-gray-400 block">सहमति दायरा (Scope):</span>
                    <span className="font-semibold text-gray-700">{item.consentScope}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">सहमति मिति (Date):</span>
                    <span className="font-semibold text-gray-700">{item.consentDate || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">स्वीकृति (Approver):</span>
                    <span className="font-semibold text-gray-700">{item.approverName || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">स्वीकृति मिति:</span>
                    <span className="font-semibold text-gray-700">{item.approvalDate || '—'}</span>
                  </div>
                </div>

                {/* Redaction Requirement Note */}
                <div className="bg-amber-50/60 border border-amber-200/70 p-2.5 rounded-xl text-[11px] text-amber-900 mb-3 space-y-0.5">
                  <span className="font-bold flex items-center gap-1">
                    <span>🛡️</span>
                    <span>गोपनीयता सम्पादन आवश्यकता (Redaction Requirement):</span>
                  </span>
                  <p>{item.redactionRequirement || 'कुनै सम्पादन आवश्यक छैन'}</p>
                </div>

                {/* Private Admin Notes */}
                {item.adminNotes && (
                  <div className="bg-slate-100 p-2.5 rounded-xl text-[11px] text-slate-700 border border-slate-200 mb-3 space-y-0.5">
                    <span className="font-bold text-slate-500">🔒 आन्तरिक प्रशासनिक टिप्पणी:</span>
                    <p className="whitespace-pre-wrap">{item.adminNotes}</p>
                  </div>
                )}

                {/* Workflow Governance Buttons */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[10px] text-gray-400">
                    फाइल: <span className="font-mono text-gray-600">{item.fileUrl || 'कुनै फाइल छैन'}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {item.status !== 'INTERNAL_ONLY' && (
                      <button
                        type="button"
                        onClick={() =>
                          startTransition(async () => {
                            const res = await saveMediaConsentRecordAction({
                              ...item,
                              status: 'INTERNAL_ONLY',
                            });
                            if (res.success && res.data) {
                              setRecords((prev) => prev.map((r) => (r.id === item.id ? res.data! : r)));
                              setMessage('मिडिया सुरक्षित रूपमा INTERNAL_ONLY मा राखियो।');
                            }
                          })
                        }
                        className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[11px]"
                      >
                        🔒 आन्तरिक मात्र (INTERNAL_ONLY)
                      </button>
                    )}

                    {item.mediaType !== 'patient_identification' && item.status !== 'APPROVED_PUBLIC' && (
                      <button
                        type="button"
                        onClick={() => handleApprove(item.id, 'APPROVED_PUBLIC')}
                        disabled={!item.hasWrittenConsent}
                        className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 font-semibold text-[11px]"
                        title={!item.hasWrittenConsent ? 'लिखित सहमति विना स्वीकृत गर्न मिल्दैन' : ''}
                      >
                        ✓ पूर्ण सार्वजनिक स्वीकृति
                      </button>
                    )}

                    {item.status !== 'REDACTED_PUBLIC' && (
                      <button
                        type="button"
                        onClick={() => handleApprove(item.id, 'REDACTED_PUBLIC')}
                        disabled={!item.hasWrittenConsent}
                        className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 font-semibold text-[11px]"
                        title={!item.hasWrittenConsent ? 'लिखित सहमति विना सम्पादित सार्वजनिक गर्न मिल्दैन' : ''}
                      >
                        🛡️ सम्पादित सार्वजनिक स्वीकृति
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

