'use client';

import { useState, useTransition } from 'react';
import { EventProgram } from '@/lib/cms/cms-service';
import { saveEventAction, deleteEventAction } from '@/app/actions/cms-actions';

export function EventsManager({
  initialEvents,
  lang,
}: {
  initialEvents: EventProgram[];
  lang: string;
}) {
  const [events, setEvents] = useState<EventProgram[]>(initialEvents);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<EventProgram> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleOpenNew = () => {
    setEditingItem({
      slug: `event-${Date.now()}`,
      titleNe: '',
      titleEn: '',
      eventDateTime: '२०८३ जेठ १५ गते, शनिबार बिहान ११:०० बजे',
      venueNe: 'नेपाल प्रज्ञा–प्रतिष्ठान, कमलादी, काठमाडौं',
      venueEn: 'Nepal Academy Hall, Kamaladi, Kathmandu',
      agendaNe: '१. वार्षिक प्रगति प्रतिवेदन | २. नयाँ कार्यसमिति निर्वाचन | ३. चियापान',
      agendaEn: '1. Annual Report | 2. Election | 3. Refreshments',
      organizerNe: 'मादी संखुवासभा सरोकार समाज, काठमाडौं',
      organizerEn: 'Madi Sankhuwasabha Sarokar Samaj, Kathmandu',
      featuredImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      descriptionNe: '',
      descriptionEn: '',
      status: 'UPCOMING',
    });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setMessage(null);
    startTransition(async () => {
      const res = await saveEventAction(editingItem);
      if (res.success && res.data) {
        setMessage('कार्यक्रम सफलतापूर्वक सुरक्षित गरियो!');
        setIsEditing(false);
        setEvents((prev) => {
          const idx = prev.findIndex((ev) => ev.id === res.data.id);
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
    if (!confirm('के तपाईं यो कार्यक्रम हटाउन निश्चित हुनुहुन्छ?')) return;
    setMessage(null);
    startTransition(async () => {
      const res = await deleteEventAction(id);
      if (res.success) {
        setMessage('कार्यक्रम हटाइयो।');
        setEvents((prev) => prev.filter((ev) => ev.id !== id));
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
            {lang === 'ne' ? 'क्यालेन्डर तथा तालिका' : 'Events Admin'}
          </span>
          <h1 className="text-2xl font-extrabold text-[#01366E] mt-2">
            {lang === 'ne' ? 'कार्यक्रम तथा भेला व्यवस्थापन' : 'Events & Gatherings'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {lang === 'ne'
              ? 'आगामी तथा सम्पन्न साधारण सभा, सांस्कृतिक भेटघाट र बनभोज कार्यक्रमहरूको तालिका व्यवस्थापन गर्नुहोस्।'
              : 'Publish upcoming general assemblies, cultural gatherings, venue details, and registration links.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="bg-[#01366E] hover:bg-blue-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>➕</span>
          <span>{lang === 'ne' ? 'नयाँ कार्यक्रम थप्नुहोस्' : 'Create Event'}</span>
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
              {editingItem.id ? 'कार्यक्रम सम्पादन गर्नुहोस्' : 'नयाँ कार्यक्रम सिर्जना गर्नुहोस्'}
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
                  placeholder="उदा: सातौं वार्षिक साधारण सभा तथा बृहत् भेला"
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
                  placeholder="e.g. 7th Annual General Assembly & Cultural Gathering"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  मिति र समय (Date & Time) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.eventDateTime || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, eventDateTime: e.target.value })}
                  placeholder="२०८३ जेठ १५ गते, शनिबार बिहान ११:०० बजे"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  स्थान (Venue) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.venueNe || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, venueNe: e.target.value })}
                  placeholder="नेपाल प्रज्ञा–प्रतिष्ठान, कमलादी"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                कार्यसूची / एजेण्डा (Agenda) *
              </label>
              <textarea
                rows={2}
                required
                value={editingItem.agendaNe || ''}
                onChange={(e) => setEditingItem({ ...editingItem, agendaNe: e.target.value })}
                placeholder="१. वार्षिक प्रतिवेदन | २. लेखापरीक्षण प्रतिवेदन | ३. सम्मान तथा चियापान"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                विस्तृत व्यहोरा (Description) *
              </label>
              <textarea
                rows={3}
                required
                value={editingItem.descriptionNe || ''}
                onChange={(e) => setEditingItem({ ...editingItem, descriptionNe: e.target.value })}
                placeholder="कार्यक्रमको विस्तृत जानकारी..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  अनलाइन नाम दर्ता लिङ्क (Registration Link)
                </label>
                <input
                  type="text"
                  value={editingItem.registrationLink || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, registrationLink: e.target.value })}
                  placeholder="https://forms.gle/..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  कार्यक्रम अवस्था (Status)
                </label>
                <select
                  value={editingItem.status || 'UPCOMING'}
                  onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                >
                  <option value="UPCOMING">UPCOMING (आगामी कार्यक्रम)</option>
                  <option value="COMPLETED">COMPLETED (सम्पन्न कार्यक्रम)</option>
                </select>
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
                className="bg-[#01366E] hover:bg-blue-900 disabled:opacity-50 text-white font-bold px-6 py-2 rounded-xl text-xs shadow-sm transition"
              >
                {isPending ? 'सुरक्षित गर्दै...' : 'सुरक्षित गर्नुहोस्'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-gray-700">
          <span>कार्यक्रम तालिका ({events.length})</span>
          <span>अवस्था तथा कार्य</span>
        </div>

        <div className="divide-y divide-slate-100">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      evt.status === 'UPCOMING'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {evt.status}
                  </span>
                  <span className="text-xs text-[#FB6C01] font-semibold">⏰ {evt.eventDateTime}</span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 mt-1">{evt.titleNe}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  📍 {evt.venueNe}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(evt);
                    setIsEditing(true);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                >
                  सम्पादन
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(evt.id)}
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

