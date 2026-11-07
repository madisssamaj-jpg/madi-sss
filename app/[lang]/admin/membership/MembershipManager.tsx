'use client';

import { useState, useTransition } from 'react';
import { MembershipApplication } from '@/lib/cms/cms-service';
import { updateApplicationStatusAction } from '@/app/actions/cms-actions';

export function MembershipManager({
  initialApplications,
  lang,
}: {
  initialApplications: MembershipApplication[];
  lang: string;
}) {
  const [applications, setApplications] = useState<MembershipApplication[]>(initialApplications);
  const [filter, setFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState<MembershipApplication | null>(
    initialApplications.length > 0 ? initialApplications[0] : null
  );
  const [adminNotes, setAdminNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const filtered = filter === 'ALL' ? applications : applications.filter((a) => a.status === filter);

  const handleStatusUpdate = (id: string, status: 'APPROVED' | 'REJECTED' | 'MORE_INFO_REQUESTED') => {
    setMessage(null);
    startTransition(async () => {
      const res = await updateApplicationStatusAction(id, status, adminNotes || selectedApp?.adminNotes);
      if (res.success) {
        setMessage(`आवेदन स्थिति सफलतापूर्वक परिवर्तन भयो: ${status}`);
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status, adminNotes: adminNotes || a.adminNotes } : a))
        );
        if (selectedApp && selectedApp.id === id) {
          setSelectedApp({ ...selectedApp, status, adminNotes: adminNotes || selectedApp.adminNotes });
        }
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
            {lang === 'ne' ? 'सदस्यता इनबक्स' : 'Membership Admin'}
          </span>
          <h1 className="text-2xl font-extrabold text-[#01366E] mt-2">
            {lang === 'ne' ? 'अनलाइन सदस्यता आवेदनहरू' : 'Membership Applications Review'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {lang === 'ne'
              ? 'काठमाण्डौं तथा मादीबाट प्राप्त सदस्यता आवेदनहरूको प्रमाणीकरण, स्वीकृति, अस्वीकृति तथा थप विवरण माग कार्यप्रवाह।'
              : 'Review, approve, reject, or request more information for incoming membership applications.'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'MORE_INFO_REQUESTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === st
                  ? 'bg-[#01366E] text-white shadow-sm'
                  : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm font-semibold">
          ℹ️ {message}
        </div>
      )}

      {/* Main Grid: List + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-gray-700 flex justify-between">
            <span>आवेदन सूची ({filtered.length})</span>
            <span>स्थिति</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs">
                कुनै आवेदन फेला परेन।
              </div>
            ) : (
              filtered.map((app) => (
                <div
                  key={app.id}
                  onClick={() => {
                    setSelectedApp(app);
                    setAdminNotes(app.adminNotes || '');
                  }}
                  className={`p-4 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between gap-4 ${
                    selectedApp?.id === app.id ? 'bg-blue-50/70 border-l-4 border-[#01366E]' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{app.fullNameNe}</span>
                      <span className="text-xs text-gray-500">({app.fullNameEn})</span>
                      <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {app.membershipType}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {app.madiAddressNe} | 📞 {app.phone}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      दर्ता मिति: {new Date(app.submittedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      app.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : app.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.status === 'MORE_INFO_REQUESTED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Application Detail Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          {selectedApp ? (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-white bg-[#01366E] px-2 py-0.5 rounded">
                  {selectedApp.membershipType}
                </span>
                <h2 className="text-lg font-bold text-gray-900 mt-2">
                  {selectedApp.fullNameNe}
                </h2>
                <p className="text-xs text-gray-500">{selectedApp.fullNameEn}</p>
              </div>

              <div className="space-y-2.5 text-xs text-gray-700">
                <div>
                  <span className="font-semibold text-gray-900">मादी स्थायी ठेगाना:</span>{' '}
                  {selectedApp.madiAddressNe}
                </div>
                <div>
                  <span className="font-semibold text-gray-900">काठमाण्डौं ठेगाना:</span>{' '}
                  {selectedApp.currentAddressNe}
                </div>
                <div>
                  <span className="font-semibold text-gray-900">सम्पर्क फोन:</span>{' '}
                  <a href={`tel:${selectedApp.phone}`} className="text-blue-600 underline">
                    {selectedApp.phone}
                  </a>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">इमेल:</span>{' '}
                  <a href={`mailto:${selectedApp.email}`} className="text-blue-600 underline">
                    {selectedApp.email}
                  </a>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">पेशा / व्यवसाय:</span>{' '}
                  {selectedApp.occupationNe}
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-semibold text-gray-900 block mb-1">सदस्यता लिनुको उद्देश्य:</span>
                  <p className="p-3 bg-slate-50 rounded-xl text-xs text-gray-600 italic">
                    "{selectedApp.reasonForJoiningNe}"
                  </p>
                </div>
              </div>

              {/* Admin Note Input */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  सचिवालय आन्तरिक टिप्पणी (Admin Note):
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="आवेदकसँग सम्पर्क वा आवश्यक कागजात..."
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={isPending || selectedApp.status === 'APPROVED'}
                  onClick={() => handleStatusUpdate(selectedApp.id, 'APPROVED')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition"
                >
                  ✓ आवेदन स्वीकृत गर्नुहोस् (Approve)
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isPending || selectedApp.status === 'MORE_INFO_REQUESTED'}
                    onClick={() => handleStatusUpdate(selectedApp.id, 'MORE_INFO_REQUESTED')}
                    className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs shadow-sm transition"
                  >
                    थप विवरण माग
                  </button>
                  <button
                    type="button"
                    disabled={isPending || selectedApp.status === 'REJECTED'}
                    onClick={() => handleStatusUpdate(selectedApp.id, 'REJECTED')}
                    className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs shadow-sm transition"
                  >
                    ✕ अस्वीकृत
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8 text-gray-400 text-xs">
              👈 बाँया सूचीबाट कुनै आवेदन छनोट गर्नुहोस्।
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
