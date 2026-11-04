'use client';

import { useState, useTransition, useRef } from 'react';
import { CommitteeMember } from '@/lib/cms/cms-service';
import {
  saveCommitteeMemberAction,
  deleteCommitteeMemberAction,
  toggleCommitteeMemberPublicationAction,
  updateCommitteePhotoConsentAction,
  uploadCommitteePhotoAction,
} from '@/app/actions/cms-actions';

export function CommitteeManager({
  initialMembers,
  lang,
}: {
  initialMembers: CommitteeMember[];
  lang: string;
}) {
  const [members, setMembers] = useState<CommitteeMember[]>(initialMembers);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<CommitteeMember> | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isPending, startTransition] = useTransition();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenNew = () => {
    setEditingItem({
      nameNe: '',
      nameEn: '',
      designationNe: '',
      designationEn: '',
      category: 'EXECUTIVE',
      departmentNe: 'केन्द्रीय कार्यसमिति',
      departmentEn: 'Central Executive Committee',
      photoUrl: '',
      termStartDateNe: '२०८२-०४-२१',
      termStartDateEn: '2082/04/21 BS',
      termEndDateNe: '२०८४-०४-२०',
      termEndDateEn: '2084/04/20 BS',
      term: '२०८२ - २०८४',
      bioNe: '',
      bioEn: '',
      displayOrder: members.length + 1,
      status: 'DRAFT',
      photoConsent: 'PENDING',
      adminNotes: '',
    });
    setIsEditing(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    setIsUploadingPhoto(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    const res = await uploadCommitteePhotoAction(formData);
    setIsUploadingPhoto(false);

    if (res.success && res.url) {
      setEditingItem((prev) => (prev ? { ...prev, photoUrl: res.url } : null));
      setMessage('तस्बिर सफलतापूर्वक अपलोड भयो!');
    } else {
      setMessage(`तस्बिर अपलोड त्रुटि: ${res.error}`);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.nameNe || !editingItem.designationNe) return;

    setMessage(null);
    startTransition(async () => {
      const res = await saveCommitteeMemberAction(editingItem);
      if (res.success && res.data) {
        setMessage('पदाधिकारी विवरण सुरक्षित गरियो!');
        setIsEditing(false);
        setMembers((prev) => {
          const idx = prev.findIndex((m) => m.id === res.data.id);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = res.data;
            return next.sort((a, b) => a.displayOrder - b.displayOrder);
          }
          return [...prev, res.data].sort((a, b) => a.displayOrder - b.displayOrder);
        });
      } else {
        setMessage(`त्रुटि: ${res.error}`);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('के तपाईं यो पदाधिकारी विवरण हटाउन निश्चित हुनुहुन्छ?')) return;
    setMessage(null);
    startTransition(async () => {
      const res = await deleteCommitteeMemberAction(id);
      if (res.success) {
        setMessage('पदाधिकारी विवरण हटाइयो।');
        setMembers((prev) => prev.filter((m) => m.id !== id));
      } else {
        setMessage(`त्रुटि: ${res.error}`);
      }
    });
  };

  const handleTogglePublication = (id: string, currentStatus: 'PUBLISHED' | 'DRAFT') => {
    const nextStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    if (nextStatus === 'PUBLISHED') {
      const target = members.find((m) => m.id === id);
      if (target?.photoConsent !== 'VERIFIED') {
        if (!confirm('चेतावनी: यो पदाधिकारीको तस्बिर सहमति VERIFIED छैन। के तपाईं तैपनि प्रकाशित गर्न चाहनुहुन्छ? (सहमति बिना तस्बिर सार्वजनिक पृष्ठमा देखाइने छैन)')) {
          return;
        }
      }
    }

    setMessage(null);
    startTransition(async () => {
      const res = await toggleCommitteeMemberPublicationAction(id, nextStatus);
      if (res.success && res.data) {
        setMessage(`स्थिति परिवर्तन गरियो: ${nextStatus === 'PUBLISHED' ? 'प्रकाशित (PUBLISHED)' : 'ड्राफ्ट (DRAFT)'}`);
        setMembers((prev) => prev.map((m) => (m.id === id ? res.data : m)));
      } else {
        setMessage(`त्रुटि: ${res.error}`);
      }
    });
  };

  const handlePhotoConsentChange = (id: string, consent: 'PENDING' | 'VERIFIED' | 'DECLINED') => {
    setMessage(null);
    startTransition(async () => {
      const res = await updateCommitteePhotoConsentAction(id, consent);
      if (res.success && res.data) {
        setMessage(`तस्बिर सहमति अद्यावधिक: ${consent}`);
        setMembers((prev) => prev.map((m) => (m.id === id ? res.data : m)));
      } else {
        setMessage(`त्रुटि: ${res.error}`);
      }
    });
  };

  const filteredMembers = members.filter((m) => {
    const matchesCategory = filterCategory === 'ALL' || m.category === filterCategory;
    const matchesStatus =
      filterStatus === 'ALL'
        ? true
        : filterStatus === 'PUBLISHED'
        ? m.status === 'PUBLISHED'
        : filterStatus === 'DRAFT'
        ? m.status === 'DRAFT'
        : filterStatus === 'CONSENT_PENDING'
        ? m.photoConsent === 'PENDING'
        : true;
    return matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-50 px-2.5 py-1 rounded-full">
            {lang === 'ne' ? 'नेतृत्व तथा विधान' : 'Committee Admin'}
          </span>
          <h1 className="text-2xl font-extrabold text-[#01366E] mt-2">
            {lang === 'ne' ? 'कार्यसमिति पदाधिकारी व्यवस्थापन' : 'Executive & Advisory Committee'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            {lang === 'ne'
              ? 'पदाधिकारीहरूको नाम, पद, कार्यकाल, बायो, तस्बिर सहमति तथा प्रकाशन स्थिति व्यवस्थापन गर्नुहोस्। आन्तरिक टिप्पणीहरू पूर्णतया सुरक्षित रहन्छन्।'
              : 'Manage officials, constitutional terms, photo consent, display order, and publication status. Internal notes remain strictly confidential.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="bg-[#01366E] hover:bg-blue-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <span>➕</span>
          <span>{lang === 'ne' ? 'नयाँ पदाधिकारी थप्नुहोस्' : 'Add Official'}</span>
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm font-semibold flex items-center justify-between">
          <span>ℹ️ {message}</span>
          <button type="button" onClick={() => setMessage(null)} className="text-blue-500 hover:text-blue-800 text-xs">✕</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
        <div className="flex flex-wrap gap-2">
          <span className="font-bold text-gray-500 py-1 mr-1">वर्ग:</span>
          {['ALL', 'EXECUTIVE', 'ADVISORY', 'SUB_COMMITTEE'].map((cat) => (
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
                : cat === 'EXECUTIVE'
                ? 'कार्यसमिति'
                : cat === 'ADVISORY'
                ? 'सल्लाहकार'
                : 'उपसमिति'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="font-bold text-gray-500 py-1 mr-1">स्थिति:</span>
          {[
            { key: 'ALL', label: 'सबै' },
            { key: 'PUBLISHED', label: '🟢 प्रकाशित' },
            { key: 'DRAFT', label: '🟡 ड्राफ्ट' },
            { key: 'CONSENT_PENDING', label: '⏳ सहमति बाँकी' },
          ].map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setFilterStatus(s.key)}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterStatus === s.key
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
                {editingItem.id ? 'पदाधिकारी विवरण सम्पादन' : 'नयाँ पदाधिकारी थप्नुहोस्'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                विधान र सुशासन मापदण्ड अनुसार पदाधिकारीको सम्पूर्ण विवरण भर्नुहोस्।
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
            {/* 1. Name & Designation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  पूरा नाम (नेपालीमा) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.nameNe || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, nameNe: e.target.value })}
                  placeholder="उदा: डम्बर बहादुर श्रेष्ठ"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.nameEn || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, nameEn: e.target.value })}
                  placeholder="e.g. Dambar Bahadur Shrestha"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  पद (Designation - Nepali) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.designationNe || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, designationNe: e.target.value })}
                  placeholder="अध्यक्ष / उपाध्यक्ष / महासचिव"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Designation (English) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.designationEn || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, designationEn: e.target.value })}
                  placeholder="President / Senior Vice President"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  समिति वर्ग (Category) *
                </label>
                <select
                  value={editingItem.category || 'EXECUTIVE'}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                >
                  <option value="EXECUTIVE">EXECUTIVE (केन्द्रीय कार्यसमिति)</option>
                  <option value="ADVISORY">ADVISORY (सल्लाहकार परिषद्)</option>
                  <option value="SUB_COMMITTEE">SUB_COMMITTEE (विभागीय उपसमिति)</option>
                </select>
              </div>
            </div>

            {/* 2. Term Dates & Display Order */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  कार्यकाल सुरु (Nepali)
                </label>
                <input
                  type="text"
                  value={editingItem.termStartDateNe || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, termStartDateNe: e.target.value })}
                  placeholder="२०८२-०४-२१"
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  कार्यकाल समाप्ति (Nepali)
                </label>
                <input
                  type="text"
                  value={editingItem.termEndDateNe || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, termEndDateNe: e.target.value })}
                  placeholder="२०८४-०४-२०"
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Term Range (English)
                </label>
                <input
                  type="text"
                  value={editingItem.termStartDateEn || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, termStartDateEn: e.target.value })}
                  placeholder="2082/04/21 BS"
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  क्रम संख्या (Display Order) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editingItem.displayOrder || 1}
                  onChange={(e) => setEditingItem({ ...editingItem, displayOrder: parseInt(e.target.value) || 1 })}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            {/* 3. Photo Upload & Photo Consent Status */}
            <div className="bg-orange-50/60 p-4 rounded-xl border border-orange-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                    📷 तस्बिर तथा सहमति व्यवस्थापन (Photo & Consent)
                  </h3>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    सहमति VERIFIED नभएसम्म तस्बिर सार्वजनिक पृष्ठमा देखाइने छैन।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-700">तस्बिर सहमति:</label>
                  <select
                    value={editingItem.photoConsent || 'PENDING'}
                    onChange={(e) => setEditingItem({ ...editingItem, photoConsent: e.target.value as any })}
                    className="text-xs font-bold p-1.5 rounded-lg border border-orange-300 bg-white"
                  >
                    <option value="PENDING">🟡 PENDING (प्रतीक्षारत)</option>
                    <option value="VERIFIED">🟢 VERIFIED (सहमति प्रमाणित)</option>
                    <option value="DECLINED">🔴 DECLINED (अस्वीकृत/अनुपलब्ध)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    तस्बिर लिङ्क वा फाइल मार्ग (Photo URL / Local Path)
                  </label>
                  <input
                    type="text"
                    value={editingItem.photoUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, photoUrl: e.target.value })}
                    placeholder="/media/committee/photo.jpg वा https://..."
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    वा नयाँ तस्बिर अपलोड गर्नुहोस्:
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                    className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#01366E] file:text-white hover:file:bg-blue-900 cursor-pointer"
                  />
                  {isUploadingPhoto && <span className="text-[11px] text-blue-600 mt-1 block">अपलोड हुँदैछ...</span>}
                </div>
              </div>

              {editingItem.photoUrl && (
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 bg-white shrink-0">
                    <img src={editingItem.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs text-gray-600 truncate">पूर्वावलोकन: {editingItem.photoUrl}</span>
                </div>
              )}
            </div>

            {/* 4. Public Bio (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  सार्वजनिक छोटो परिचय (Bio - Nepali) — ऐच्छिक
                </label>
                <textarea
                  rows={3}
                  value={editingItem.bioNe || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, bioNe: e.target.value })}
                  placeholder="संस्था तथा सामाजिक सेवामा योगदान सम्बन्धी छोटो परिचय..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Public Safe Bio (English) — Optional
                </label>
                <textarea
                  rows={3}
                  value={editingItem.bioEn || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, bioEn: e.target.value })}
                  placeholder="Short public-safe bio highlighting community service..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            {/* 5. Publication Status & Internal Private Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  प्रकाशन स्थिति (Publication Status) *
                </label>
                <select
                  value={editingItem.status || 'DRAFT'}
                  onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                >
                  <option value="DRAFT">🟡 DRAFT (सार्वजनिक रूपमा गोप्य)</option>
                  <option value="PUBLISHED">🟢 PUBLISHED (सार्वजनिक पृष्ठमा प्रकाशित)</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  प्रमाणीकरण स्वीकृत नभएसम्म DRAFT मै राख्नुहोला।
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  🔒 आन्तरिक प्रशासनिक टिप्पणी (Internal Admin Notes) — कहिल्यै सार्वजनिक नहुने
                </label>
                <textarea
                  rows={2}
                  value={editingItem.adminNotes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, adminNotes: e.target.value })}
                  placeholder="सहमति पत्र, कागजात प्रमाणीकरण स्थिति, वा प्रशासनिक टिप्पणी..."
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
                {isPending ? 'सुरक्षित गर्दै...' : 'विवरण सुरक्षित गर्नुहोस्'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members Grid / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMembers.map((m) => {
          const isPublished = m.status === 'PUBLISHED';
          const consent = m.photoConsent;

          return (
            <div
              key={m.id}
              className={`bg-white rounded-2xl border transition shadow-sm p-5 flex flex-col justify-between ${
                isPublished ? 'border-emerald-200' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header Row: Order, Status, Consent */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                    #{m.displayOrder}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Publication Status Badge */}
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isPublished
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isPublished ? 'PUBLISHED' : 'DRAFT'}
                    </span>

                    {/* Photo Consent Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        consent === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : consent === 'DECLINED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-orange-50 text-orange-700 border border-orange-200'
                      }`}
                    >
                      📷 {consent || 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Profile Identity */}
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-100 bg-slate-50 shrink-0 flex items-center justify-center">
                    {m.photoUrl ? (
                      <img src={m.photoUrl} alt={m.nameNe} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl text-slate-400">👤</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-gray-900 truncate">{m.nameNe}</h3>
                    <p className="text-xs text-gray-500 truncate">{m.nameEn}</p>
                    <p className="text-xs text-[#01366E] font-bold mt-0.5">{m.designationNe}</p>
                  </div>
                </div>

                {/* Category & Term */}
                <div className="space-y-1 text-xs text-gray-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">वर्ग:</span>
                    <span className="font-semibold text-gray-700">{m.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">कार्यकाल:</span>
                    <span className="font-semibold text-gray-700">
                      {m.termStartDateNe || '२०८२'} — {m.termEndDateNe || '२०८४'}
                    </span>
                  </div>
                  {m.departmentNe && (
                    <div className="flex justify-between truncate">
                      <span className="text-gray-400">विभाग:</span>
                      <span className="font-medium text-gray-700 truncate">{m.departmentNe}</span>
                    </div>
                  )}
                </div>

                {/* Bio Snippet */}
                {m.bioNe && (
                  <p className="text-[11px] text-gray-500 italic mb-3 line-clamp-2">
                    “{m.bioNe}”
                  </p>
                )}

                {/* Private Admin Notes */}
                {m.adminNotes && (
                  <div className="text-[11px] text-amber-900 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60 mb-3">
                    <span className="font-bold">🔒 आन्तरिक नोट:</span> {m.adminNotes}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                {/* Single-Click Publish / Unpublish Toggle */}
                <button
                  type="button"
                  onClick={() => handleTogglePublication(m.id, m.status)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                    isPublished
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  {isPublished ? 'ड्राफ्टमा लैजानुहोस्' : 'प्रकाशित गर्नुहोस्'}
                </button>

                {/* Photo Consent Quick Switch */}
                <button
                  type="button"
                  title="तस्बिर सहमति बदल्नुहोस् (VERIFIED / PENDING / DECLINED)"
                  onClick={() => {
                    const next = consent === 'VERIFIED' ? 'DECLINED' : consent === 'DECLINED' ? 'PENDING' : 'VERIFIED';
                    handlePhotoConsentChange(m.id, next);
                  }}
                  className="text-xs font-semibold px-2 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  📷 सहमति
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(m);
                      setIsEditing(true);
                    }}
                    className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition"
                  >
                    सम्पादन
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(m.id)}
                    className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-1.5 rounded-lg hover:bg-rose-100 transition"
                  >
                    हटाउनुहोस्
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
