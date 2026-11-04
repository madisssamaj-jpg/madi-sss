'use client';

import { useState, useTransition } from 'react';
import { CommunityPartner } from '@/lib/cms/cms-service';
import { savePartnerAction, deletePartnerAction } from '@/app/actions/cms-actions';

export function PartnersManager({
  initialPartners,
  lang,
}: {
  initialPartners: CommunityPartner[];
  lang: string;
}) {
  const [partners, setPartners] = useState<CommunityPartner[]>(initialPartners);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<CommunityPartner> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleOpenNew = () => {
    setEditingItem({
      nameNe: '',
      nameEn: '',
      partnerType: 'LOCAL_GOVERNMENT',
      logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80',
      websiteUrl: '',
      contributionSummaryNe: '',
      contributionSummaryEn: '',
      displayOrder: partners.length + 1,
    });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setMessage(null);
    startTransition(async () => {
      const res = await savePartnerAction(editingItem);
      if (res.success && res.data) {
        setMessage('साझेदार संस्था विवरण सुरक्षित गरियो!');
        setIsEditing(false);
        setPartners((prev) => {
          const idx = prev.findIndex((p) => p.id === res.data.id);
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
    if (!confirm('के तपाईं यो साझेदार विवरण हटाउन निश्चित हुनुहुन्छ?')) return;
    setMessage(null);
    startTransition(async () => {
      const res = await deletePartnerAction(id);
      if (res.success) {
        setMessage('साझेदार हटाइयो।');
        setPartners((prev) => prev.filter((p) => p.id !== id));
      } else {
        setMessage(`त्रुटि: ${res.error}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-50 px-2.5 py-1 rounded-full">
            {lang === 'ne' ? 'साझेदारी तथा सहकार्य' : 'Partners Admin'}
          </span>
          <h1 className="text-2xl font-extrabold text-[#01366E] mt-2">
            {lang === 'ne' ? 'सहयोगी संस्था तथा साझेदार व्यवस्थापन' : 'Partners & Supporters'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {lang === 'ne'
              ? 'स्थानीय सरकार (मादी नगरपालिका), गैरसरकारी संस्था, दाता तथा कर्पोरेट साझेदारहरूको प्रोफाइल व्यवस्थापन गर्नुहोस्।'
              : 'Add and organize supporting institutions, local governments, NGOs, and sponsor contributions.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="bg-[#01366E] hover:bg-blue-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>➕</span>
          <span>{lang === 'ne' ? 'नयाँ साझेदार थप्नुहोस्' : 'Add Partner'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm font-semibold">
          ℹ️ {message}
        </div>
      )}

      {/* Editor Modal */}
      {isEditing && editingItem && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {editingItem.id ? 'साझेदार विवरण सम्पादन' : 'नयाँ साझेदार संस्था थप्नुहोस्'}
            </h2>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-gray-400 hover:text-gray-600 text-sm font-bold"
            >
              ✕ बन्द
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  संस्थाको नाम (नेपाली) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.nameNe || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, nameNe: e.target.value })}
                  placeholder="उदा: मादी नगरपालिका, संखुवासभा"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Organization Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.nameEn || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, nameEn: e.target.value })}
                  placeholder="e.g. Madi Municipality, Sankhuwasabha"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  साझेदार वर्ग (Partner Type) *
                </label>
                <select
                  value={editingItem.partnerType || 'LOCAL_GOVERNMENT'}
                  onChange={(e) => setEditingItem({ ...editingItem, partnerType: e.target.value as any })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                >
                  <option value="LOCAL_GOVERNMENT">LOCAL_GOVERNMENT (स्थानीय सरकार)</option>
                  <option value="NGO_INGO">NGO_INGO (गैरसरकारी संस्था)</option>
                  <option value="SPONSOR">SPONSOR (दाता तथा प्रायोजक)</option>
                  <option value="COMMUNITY_GROUP">COMMUNITY_GROUP (सामुदायिक संस्था)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  लोगो लिङ्क (Logo URL) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.logoUrl || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, logoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  वेबसाइट (Website URL)
                </label>
                <input
                  type="text"
                  value={editingItem.websiteUrl || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, websiteUrl: e.target.value })}
                  placeholder="https://example.gov.np"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                सहकार्य / योगदान सारांश (नेपाली) *
              </label>
              <textarea
                rows={2}
                required
                value={editingItem.contributionSummaryNe || ''}
                onChange={(e) => setEditingItem({ ...editingItem, contributionSummaryNe: e.target.value })}
                placeholder="संस्थासँगको सहकार्य क्षेत्र..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
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
                className="bg-[#01366E] hover:bg-blue-900 disabled:opacity-50 text-white font-bold px-6 py-2 rounded-xl text-xs shadow-sm transition"
              >
                {isPending ? 'सुरक्षित गर्दै...' : 'सुरक्षित गर्नुहोस्'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {partners.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center overflow-hidden">
                  <img src={p.logoUrl} alt={p.nameNe} className="max-h-full max-w-full object-contain" />
                </div>
                <span className="text-[10px] font-bold text-[#01366E] bg-blue-50 px-2 py-0.5 rounded">
                  {p.partnerType}
                </span>
              </div>
              <h3 className="font-bold text-sm text-gray-900">{p.nameNe}</h3>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{p.contributionSummaryNe}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
              {p.websiteUrl ? (
                <a
                  href={p.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  वेबसाइट ↗
                </a>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(p);
                    setIsEditing(true);
                  }}
                  className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition"
                >
                  सम्पादन
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded hover:bg-rose-100 transition"
                >
                  हटाउनुहोस्
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

