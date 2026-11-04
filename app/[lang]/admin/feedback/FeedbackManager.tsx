'use client';

import { useState, useTransition } from 'react';
import { FeedbackSubmission } from '@/lib/cms/cms-service';
import { updateFeedbackStatusAction } from '@/app/actions/cms-actions';

export function FeedbackManager({
  initialFeedbacks,
  lang,
}: {
  initialFeedbacks: FeedbackSubmission[];
  lang: string;
}) {
  const [feedbacks, setFeedbacks] = useState<FeedbackSubmission[]>(initialFeedbacks);
  const [filter, setFilter] = useState('ALL');
  const [selectedFb, setSelectedFb] = useState<FeedbackSubmission | null>(
    initialFeedbacks.length > 0 ? initialFeedbacks[0] : null
  );
  const [adminNotes, setAdminNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const filtered = filter === 'ALL' ? feedbacks : feedbacks.filter((f) => f.status === filter);

  const handleUpdateStatus = (status: 'NEW' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED') => {
    if (!selectedFb) return;
    setMessage(null);
    startTransition(async () => {
      const res = await updateFeedbackStatusAction(selectedFb.id, status, adminNotes || selectedFb.adminNotes);
      if (res.success) {
        setMessage(`स्थिति अद्यावधिक भयो: ${status}`);
        const updated = { ...selectedFb, status, adminNotes: adminNotes || selectedFb.adminNotes };
        setSelectedFb(updated);
        setFeedbacks((prev) => prev.map((f) => (f.id === selectedFb.id ? updated : f)));
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
            {lang === 'ne' ? 'गुनासो तथा सुझाव डेस्क' : 'Grievance Desk'}
          </span>
          <h1 className="text-2xl font-extrabold text-[#01366E] mt-2">
            {lang === 'ne' ? 'सुझाव, गुनासो तथा सहयोग इनबक्स' : 'Feedback & Grievances Inbox'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {lang === 'ne'
              ? 'सार्वजनिक रूपमा प्राप्त सुझाव, गुनासो वा राहत निवेदनहरूको समीक्षा र समाधान स्थिति व्यवस्थापन।'
              : 'Track, review, and resolve community complaints, constructive suggestions, and relief requests.'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'NEW', 'IN_REVIEW', 'RESOLVED', 'CLOSED'].map((st) => (
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
        {/* Feedbacks List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-gray-700 flex justify-between">
            <span>सन्देश सूची ({filtered.length})</span>
            <span>स्थिति</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs">
                कुनै सन्देश फेला परेन।
              </div>
            ) : (
              filtered.map((fb) => (
                <div
                  key={fb.id}
                  onClick={() => {
                    setSelectedFb(fb);
                    setAdminNotes(fb.adminNotes || '');
                  }}
                  className={`p-4 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between gap-4 ${
                    selectedFb?.id === fb.id ? 'bg-blue-50/70 border-l-4 border-[#01366E]' : ''
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900 truncate">{fb.subject}</span>
                      <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded shrink-0">
                        {fb.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      👤 {fb.fullName} | 📞 {fb.phone}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      दर्ता: {new Date(fb.submittedAt).toLocaleString()}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      fb.status === 'NEW'
                        ? 'bg-rose-100 text-rose-800'
                        : fb.status === 'IN_REVIEW'
                        ? 'bg-amber-100 text-amber-800'
                        : fb.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {fb.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Feedback Detail Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          {selectedFb ? (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-white bg-[#01366E] px-2 py-0.5 rounded">
                  {selectedFb.category}
                </span>
                <h2 className="text-base font-bold text-gray-900 mt-2">
                  {selectedFb.subject}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  प्रेषक: {selectedFb.fullName} ({selectedFb.phone})
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-gray-700 leading-relaxed border border-slate-100 max-h-48 overflow-y-auto">
                {selectedFb.message}
              </div>

              {/* Admin Resolution Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  सचिवालय आन्तरिक टिप्पणी (Admin Note):
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="सम्पर्क गरिएको मिति वा समाधान प्रगति..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>

              {/* Status Transition Actions */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  स्थिति परिवर्तन गर्नुहोस्:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isPending || selectedFb.status === 'IN_REVIEW'}
                    onClick={() => handleUpdateStatus('IN_REVIEW')}
                    className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold py-2 rounded-xl text-xs transition"
                  >
                    समीक्षाधीन (Review)
                  </button>
                  <button
                    type="button"
                    disabled={isPending || selectedFb.status === 'RESOLVED'}
                    onClick={() => handleUpdateStatus('RESOLVED')}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold py-2 rounded-xl text-xs transition"
                  >
                    समाधान भयो (Resolve)
                  </button>
                </div>
                <button
                  type="button"
                  disabled={isPending || selectedFb.status === 'CLOSED'}
                  onClick={() => handleUpdateStatus('CLOSED')}
                  className="w-full bg-slate-700 hover:bg-slate-800 disabled:opacity-40 text-white font-bold py-2 rounded-xl text-xs transition"
                >
                  बन्द गर्नुहोस् (Close)
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8 text-gray-400 text-xs">
              👈 बाँया सूचीबाट कुनै सन्देश छनोट गर्नुहोस्।
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

