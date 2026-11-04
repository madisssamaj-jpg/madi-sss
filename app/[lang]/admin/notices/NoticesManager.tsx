'use client';

import { useState, useTransition } from 'react';
import { NoticeItem } from '@/lib/cms/cms-service';
import { saveNoticeAction, deleteNoticeAction } from '@/app/actions/cms-actions';

export function NoticesManager({
  initialNotices,
  lang,
}: {
  initialNotices: NoticeItem[];
  lang: string;
}) {
  const [notices, setNotices] = useState<NoticeItem[]>(initialNotices);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<NoticeItem> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleOpenNew = () => {
    setEditingItem({
      titleNe: '',
      titleEn: '',
      date: '२०८३-०१-१५',
      summaryNe: '',
      summaryEn: '',
      isUrgent: false,
    });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setMessage(null);
    startTransition(async () => {
      const res = await saveNoticeAction(editingItem);
      if (res.success && res.data) {
        setMessage('सूचना सफलतापूर्वक सुरक्षित गरियो!');
        setIsEditing(false);
        setNotices((prev) => {
          const idx = prev.findIndex((n) => n.id === res.data.id);
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
    if (!confirm('के तपाईं यो सूचना हटाउन निश्चित हुनुहुन्छ?')) return;
    setMessage(null);
    startTransition(async () => {
      const res = await deleteNoticeAction(id);
      if (res.success) {
        setMessage('सूचना हटाइयो।');
        setNotices((prev) => prev.filter((n) => n.id !== id));
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
            {lang === 'ne' ? 'ताजा सूचना' : 'Announcements'}
          </span>
          <h1 className="text-2xl font-extrabold text-[#01366E] mt-2">
            {lang === 'ne' ? 'सूचना तथा सार्वजनिक समाचार' : 'Notices & Announcements'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {lang === 'ne'
              ? 'वेबसाइटको शीर्ष पट्टीमा देखिने जरूरी सूचनाहरू तथा सार्वजनिक विज्ञप्ति व्यवस्थापन गर्नुहोस्।'
              : 'Publish urgent ticker notices, general meetings announcements, and public press releases.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="bg-[#01366E] hover:bg-blue-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>➕</span>
          <span>{lang === 'ne' ? 'नयाँ सूचना थप्नुहोस्' : 'Create Notice'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm font-semibold">
          ℹ️ {message}
        </div>
      )}

      {/* Editor Modal */}
      {isEditing && editingItem && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-gray-900">
              {editingItem.id ? 'सूचना सम्पादन' : 'नयाँ सूचना प्रकाशन'}
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
                  सूचना शीर्षक (नेपाली) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.titleNe || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, titleNe: e.target.value })}
                  placeholder="उदा: सातौं वार्षिक साधारण सभा सम्बन्धी जरूरी सूचना"
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
                  placeholder="e.g. Notice Regarding 7th Annual General Meeting"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  मिति (Date) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.date || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                  placeholder="२०८३-०१-१५"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 text-xs font-bold text-red-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isUrgent || false}
                    onChange={(e) => setEditingItem({ ...editingItem, isUrgent: e.target.checked })}
                    className="text-red-600 rounded"
                  />
                  <span>शीर्ष टिकरमा जरूरी (Urgent Ticker) देखाउनुहोस्</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                संक्षिप्त सारांश (नेपाली) *
              </label>
              <textarea
                rows={2}
                required
                value={editingItem.summaryNe || ''}
                onChange={(e) => setEditingItem({ ...editingItem, summaryNe: e.target.value })}
                placeholder="सूचनाको मुख्य विषयवस्तु..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-slate-100 transition"
              >
                रद्द
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

      {/* Notices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-gray-700">
          <span>प्रकाशित सूचनाहरू ({notices.length})</span>
          <span>कार्यहरू</span>
        </div>

        <div className="divide-y divide-slate-100">
          {notices.map((n) => (
            <div
              key={n.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  {n.isUrgent && (
                    <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded uppercase">
                      Urgent
                    </span>
                  )}
                  <span className="text-xs text-gray-400">📅 {n.date}</span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 mt-1">{n.titleNe}</h3>
                <p className="text-xs text-gray-600 mt-0.5">{n.summaryNe}</p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(n);
                    setIsEditing(true);
                  }}
                  className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                >
                  सम्पादन
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(n.id)}
                  className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition"
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

