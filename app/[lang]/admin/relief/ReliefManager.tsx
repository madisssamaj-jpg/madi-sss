'use client';

import { useState, useTransition } from 'react';
import { ReliefProgram } from '@/lib/cms/cms-service';
import { saveReliefProgramAction, deleteReliefProgramAction } from '@/app/actions/cms-actions';

export function ReliefManager({
  initialRelief,
  lang,
}: {
  initialRelief: ReliefProgram[];
  lang: string;
}) {
  const [reliefList, setReliefList] = useState<ReliefProgram[]>(initialRelief);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<ReliefProgram> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleOpenNew = () => {
    setEditingItem({
      slug: `relief-${Date.now()}`,
      titleNe: '',
      titleEn: '',
      type: 'DISASTER_RELIEF',
      beneficiaryGroupNe: 'मादीका विपन्न तथा प्रभावित परिवार',
      beneficiaryGroupEn: 'Underprivileged families in Madi',
      date: '२०८३-०१-०१',
      locationNe: 'मादी नगरपालिका, संखुवासभा',
      locationEn: 'Madi Municipality, Sankhuwasabha',
      amountNpr: 100000,
      materialsProvidedNe: 'खाद्यान्न तथा लत्ताकपडा',
      materialsProvidedEn: 'Rations and clothes',
      descriptionNe: '',
      descriptionEn: '',
      photos: ['https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80'],
      status: 'COMPLETED',
    });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setMessage(null);
    startTransition(async () => {
      const res = await saveReliefProgramAction(editingItem);
      if (res.success && res.data) {
        setMessage('राहत कार्यक्रम सफलतापूर्वक सुरक्षित गरियो!');
        setIsEditing(false);
        setReliefList((prev) => {
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

  const handleDelete = (id: string) => {
    if (!confirm('के तपाईं यो राहत अभिलेख हटाउन निश्चित हुनुहुन्छ?')) return;
    setMessage(null);
    startTransition(async () => {
      const res = await deleteReliefProgramAction(id);
      if (res.success) {
        setMessage('राहत अभिलेख हटाइयो।');
        setReliefList((prev) => prev.filter((r) => r.id !== id));
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
            {lang === 'ne' ? 'राहत तथा पारदर्शीता' : 'Relief Ledger Admin'}
          </span>
          <h1 className="text-2xl font-extrabold text-[#01366E] mt-2">
            {lang === 'ne' ? 'राहत कोष तथा सहयोग व्यवस्थापन' : 'Relief Programs & Welfare Funds'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {lang === 'ne'
              ? 'विपद् राहत, उपचार सहायता तथा छात्रवृत्ति वितरणको पारदर्शी अभिलेख राख्नुहोस्।'
              : 'Maintain public transparency records of emergency relief, beneficiary groups, and material aid.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="bg-[#01366E] hover:bg-blue-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>➕</span>
          <span>{lang === 'ne' ? 'नयाँ राहत अभिलेख' : 'Record Relief'}</span>
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
              {editingItem.id ? 'राहत अभिलेख सम्पादन' : 'नयाँ राहत सहयोग अभिलेख'}
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
                  कार्यक्रम शीर्षक (नेपाली) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.titleNe || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, titleNe: e.target.value })}
                  placeholder="उदा: बाढी–पहिरो पीडितलाई राहत"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.titleEn || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, titleEn: e.target.value })}
                  placeholder="e.g. Landslide Emergency Relief"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  राहत प्रकार (Type) *
                </label>
                <select
                  value={editingItem.type || 'DISASTER_RELIEF'}
                  onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as any })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                >
                  <option value="DISASTER_RELIEF">DISASTER_RELIEF (विपद् राहत)</option>
                  <option value="HEALTH_ASSISTANCE">HEALTH_ASSISTANCE (स्वास्थ्य उपचार)</option>
                  <option value="SCHOLARSHIP">SCHOLARSHIP (शैक्षिक छात्रवृत्ति)</option>
                  <option value="COMMUNITY_WELFARE">COMMUNITY_WELFARE (सामुदायिक कल्याण)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  रकम रु. (Amount NPR) *
                </label>
                <input
                  type="number"
                  required
                  value={editingItem.amountNpr || 0}
                  onChange={(e) => setEditingItem({ ...editingItem, amountNpr: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  वितरण मिति *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.date || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                  placeholder="२०८२-०४-२८"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  लाभान्वित समूह (Beneficiaries) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.beneficiaryGroupNe || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, beneficiaryGroupNe: e.target.value })}
                  placeholder="उदा: मादी–१ र २ का ४५ घरधुरी"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  वितरण गरिएका सामग्रीहरू *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.materialsProvidedNe || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, materialsProvidedNe: e.target.value })}
                  placeholder="खाद्यान्न, त्रिपाल, प्राथमिक उपचार सामग्री"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                विस्तृत विवरण (Description) *
              </label>
              <textarea
                rows={3}
                required
                value={editingItem.descriptionNe || ''}
                onChange={(e) => setEditingItem({ ...editingItem, descriptionNe: e.target.value })}
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

      {/* Relief List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-gray-700">
          <span>राहत कार्यक्रम अभिलेख ({reliefList.length})</span>
          <span>रकम तथा कार्य</span>
        </div>

        <div className="divide-y divide-slate-100">
          {reliefList.map((rel) => (
            <div
              key={rel.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#FB6C01] bg-orange-50 px-2 py-0.5 rounded">
                    {rel.type}
                  </span>
                  <span className="text-xs text-gray-400">📅 {rel.date}</span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 mt-1">{rel.titleNe}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  👥 लाभान्वित: {rel.beneficiaryGroupNe} | 📦 सामग्री: {rel.materialsProvidedNe}
                </p>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <span className="text-sm font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl">
                  रु. {rel.amountNpr.toLocaleString('en-IN')}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(rel);
                    setIsEditing(true);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                >
                  सम्पादन
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(rel.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition"
                >
                  हटाउनुहोस्
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

