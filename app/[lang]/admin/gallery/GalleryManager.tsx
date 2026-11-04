'use client';

import { useState, useTransition } from 'react';
import { GalleryAlbum } from '@/lib/cms/cms-service';
import { saveGalleryAlbumAction, deleteGalleryAlbumAction } from '@/app/actions/cms-actions';

export function GalleryManager({
  initialAlbums,
  lang,
}: {
  initialAlbums: GalleryAlbum[];
  lang: string;
}) {
  const [albums, setAlbums] = useState<GalleryAlbum[]>(initialAlbums);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<GalleryAlbum> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleOpenNew = () => {
    setEditingItem({
      slug: `album-${Date.now()}`,
      titleNe: '',
      titleEn: '',
      descriptionNe: '',
      descriptionEn: '',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
      eventDate: '२०८३-०१-१५',
      category: 'COMMUNITY',
      isFeatured: false,
      displayOrder: albums.length + 1,
    });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setMessage(null);
    startTransition(async () => {
      const res = await saveGalleryAlbumAction(editingItem);
      if (res.success && res.data) {
        setMessage('एल्बम सफलतापूर्वक सुरक्षित गरियो!');
        setIsEditing(false);
        setAlbums((prev) => {
          const idx = prev.findIndex((a) => a.id === res.data.id);
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
    if (!confirm('के तपाईं यो एल्बम हटाउन निश्चित हुनुहुन्छ?')) return;
    setMessage(null);
    startTransition(async () => {
      const res = await deleteGalleryAlbumAction(id);
      if (res.success) {
        setMessage('एल्बम हटाइयो।');
        setAlbums((prev) => prev.filter((a) => a.id !== id));
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
            {lang === 'ne' ? 'तस्बिर तथा भिडियो' : 'Media CMS'}
          </span>
          <h1 className="text-2xl font-extrabold text-[#01366E] mt-2">
            {lang === 'ne' ? 'ग्यालरी एल्बम व्यवस्थापन' : 'Gallery Albums Management'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {lang === 'ne'
              ? 'कार्यक्रम, स्वास्थ्य शिविर तथा भेलाका तस्बिर एल्बमहरू सिर्जना र सम्पादन गर्नुहोस्।'
              : 'Create and organize photo/video albums for social events, clinics, and relief drives.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="bg-[#01366E] hover:bg-blue-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>➕</span>
          <span>{lang === 'ne' ? 'नयाँ एल्बम थप्नुहोस्' : 'Create Album'}</span>
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
              {editingItem.id ? 'एल्बम सम्पादन गर्नुहोस्' : 'नयाँ एल्बम सिर्जना गर्नुहोस्'}
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
                  एल्बम शीर्षक (नेपाली) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.titleNe || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, titleNe: e.target.value })}
                  placeholder="उदा: मादी निःशुल्क स्वास्थ्य शिविर २०८३"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Album Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.titleEn || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, titleEn: e.target.value })}
                  placeholder="e.g. Madi Free Health Camp 2083"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  मिति (Date) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.eventDate || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, eventDate: e.target.value })}
                  placeholder="२०८३-०१-१५"
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
                  <option value="HEALTH">HEALTH (स्वास्थ्य शिविर)</option>
                  <option value="CULTURAL">CULTURAL (सांस्कृतिक)</option>
                  <option value="RELIEF">RELIEF (राहत कार्य)</option>
                  <option value="COMMUNITY">COMMUNITY (सामुदायिक भेटघाट)</option>
                  <option value="GENERAL">GENERAL (सामान्य)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  क्रम संख्या (Order)
                </label>
                <input
                  type="number"
                  value={editingItem.displayOrder || 1}
                  onChange={(e) => setEditingItem({ ...editingItem, displayOrder: parseInt(e.target.value) || 1 })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                कभर तस्बिर लिङ्क (Cover Photo URL) *
              </label>
              <input
                type="text"
                required
                value={editingItem.coverPhotoUrl || ''}
                onChange={(e) => setEditingItem({ ...editingItem, coverPhotoUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                विवरण (नेपाली)
              </label>
              <textarea
                rows={2}
                value={editingItem.descriptionNe || ''}
                onChange={(e) => setEditingItem({ ...editingItem, descriptionNe: e.target.value })}
                placeholder="एल्बमको संक्षिप्त व्यहोरा..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingItem.isFeatured || false}
                  onChange={(e) => setEditingItem({ ...editingItem, isFeatured: e.target.checked })}
                  className="text-[#01366E] rounded"
                />
                <span>गृहपृष्ठमा विशेष (Featured) देखाउनुहोस्</span>
              </label>
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

      {/* Albums Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((a) => (
          <div
            key={a.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img src={a.coverPhotoUrl} alt={a.titleNe} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-[#01366E] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {a.category}
                </span>
                {a.isFeatured && (
                  <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded">
                    Featured
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-400">📅 {a.eventDate}</p>
                <h3 className="font-bold text-sm text-gray-900 mt-1">{a.titleNe}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.descriptionNe}</p>
              </div>
            </div>

            <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">क्रम: {a.displayOrder}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(a);
                    setIsEditing(true);
                  }}
                  className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded hover:bg-blue-100 transition"
                >
                  सम्पादन
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(a.id)}
                  className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded hover:bg-rose-100 transition"
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

