'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams } from 'next/navigation';
import {
  fetchTransfersAction,
  fetchFinancialAccountsAction,
  createDraftTransferAction,
  postTransferAction,
  reverseTransferAction,
  cancelDraftTransferAction,
  deleteDraftTransferAction,
  getTransferDetailsAction,
} from '@/app/actions/financial-actions';

interface FinancialAccount {
  id: string;
  account_code: string;
  name_ne: string;
  name_en: string;
  bank_name?: string;
  current_balance: string | number;
  currency: string;
}

interface TransferItem {
  id: string;
  amount_npr: string | number;
  currency: string;
  status: 'DRAFT' | 'POSTED' | 'REVERSED' | 'CANCELLED';
  purpose_ne: string;
  purpose_en: string;
  voucher_number?: string;
  created_at: string;
  posted_at?: string;
  reversed_at?: string;
  cancelled_at?: string;
  source_account_code: string;
  source_account_name_ne: string;
  source_account_name_en: string;
  destination_account_code: string;
  destination_account_name_ne: string;
  destination_account_name_en: string;
  created_by_name: string;
}

export default function TransfersPage() {
  const params = useParams();
  const lang = (params?.lang as string) || 'ne';

  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReverseModal, setShowReverseModal] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<any | null>(null);

  // Form Inputs
  const [newTransfer, setNewTransfer] = useState({
    sourceAccountId: '',
    destinationAccountId: '',
    amountNpr: '',
    purposeNe: '',
    purposeEn: '',
    notes: '',
  });

  const [reversalReason, setReversalReason] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  const [isPending, startTransition] = useTransition();

  const loadData = async (statusFilter?: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [tRes, aRes] = await Promise.all([
        fetchTransfersAction(statusFilter === 'ALL' ? undefined : statusFilter),
        fetchFinancialAccountsAction(),
      ]);

      if (tRes.success) {
        setTransfers(tRes.data || []);
      } else {
        setErrorMessage(tRes.error || 'Failed to load transfers');
      }

      if (aRes.success) {
        setAccounts(aRes.data || []);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch financial data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const amount = parseFloat(newTransfer.amountNpr);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage(lang === 'ne' ? 'रकम शून्य भन्दा बढी हुनुपर्दछ।' : 'Amount must be greater than zero.');
      return;
    }

    if (newTransfer.sourceAccountId === newTransfer.destinationAccountId) {
      setErrorMessage(
        lang === 'ne'
          ? 'स्रोत र गन्तव्य खाता फरक-फरक हुनुपर्दछ।'
          : 'Source and destination accounts must be distinct.'
      );
      return;
    }

    startTransition(async () => {
      const res = await createDraftTransferAction({
        sourceAccountId: newTransfer.sourceAccountId,
        destinationAccountId: newTransfer.destinationAccountId,
        amountNpr: amount,
        purposeNe: newTransfer.purposeNe,
        purposeEn: newTransfer.purposeEn,
        notes: newTransfer.notes,
      });

      if (res.success) {
        setShowCreateModal(false);
        setNewTransfer({
          sourceAccountId: '',
          destinationAccountId: '',
          amountNpr: '',
          purposeNe: '',
          purposeEn: '',
          notes: '',
        });
        setSuccessMessage(
          lang === 'ne'
            ? 'आन्तरिक रकमान्तर ड्राफ्ट सफलतापूर्वक सिर्जना भयो।'
            : 'Internal transfer draft created successfully.'
        );
        loadData(activeTab);
      } else {
        setErrorMessage(res.error || 'Failed to create transfer draft.');
      }
    });
  };

  const handlePost = async (transferId: string) => {
    if (!confirm(lang === 'ne' ? 'के तपाईं यो रकमान्तर पोस्ट गर्न निश्चित हुनुहुन्छ?' : 'Are you sure you want to post this transfer?')) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await postTransferAction(transferId);
      if (res.success) {
        setSuccessMessage(
          lang === 'ne'
            ? 'रकमान्तर सफलतापूर्वक पोस्ट भयो र खाता मौज्दात अद्यावधिक भयो।'
            : 'Transfer posted successfully and balances updated.'
        );
        loadData(activeTab);
      } else {
        setErrorMessage(res.error || 'Posting failed.');
      }
    });
  };

  const handleReverseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReverseModal) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await reverseTransferAction(showReverseModal, reversalReason);
      if (res.success) {
        setShowReverseModal(null);
        setReversalReason('');
        setSuccessMessage(
          lang === 'ne'
            ? 'रकमान्तर सफलतापूर्वक उल्टाइयो (Reversed) र मौज्दात सच्याइयो।'
            : 'Transfer successfully reversed and ledger balanced.'
        );
        loadData(activeTab);
      } else {
        setErrorMessage(res.error || 'Reversal failed.');
      }
    });
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCancelModal) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await cancelDraftTransferAction(showCancelModal, cancellationReason);
      if (res.success) {
        setShowCancelModal(null);
        setCancellationReason('');
        setSuccessMessage(
          lang === 'ne' ? 'ड्राफ्ट रद्द गरियो।' : 'Transfer draft cancelled.'
        );
        loadData(activeTab);
      } else {
        setErrorMessage(res.error || 'Cancellation failed.');
      }
    });
  };

  const handleDelete = async (transferId: string) => {
    if (!confirm(lang === 'ne' ? 'के तपाईं यो ड्राफ्ट मेट्न निश्चित हुनुहुन्छ?' : 'Permanently delete this draft?')) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await deleteDraftTransferAction(transferId);
      if (res.success) {
        setSuccessMessage(lang === 'ne' ? 'ड्राफ्ट मेटाइयो।' : 'Draft deleted.');
        loadData(activeTab);
      } else {
        setErrorMessage(res.error || 'Deletion failed.');
      }
    });
  };

  const handleViewDetails = async (transferId: string) => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await getTransferDetailsAction(transferId);
      if (res.success) {
        setShowDetailsModal(res.data);
      } else {
        setErrorMessage(res.error || 'Unable to retrieve details.');
      }
    });
  };

  const counts = {
    all: transfers.length,
    draft: transfers.filter((t) => t.status === 'DRAFT').length,
    posted: transfers.filter((t) => t.status === 'POSTED').length,
    reversed: transfers.filter((t) => t.status === 'REVERSED').length,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-[#01366E] tracking-tight">
            {lang === 'ne' ? 'आन्तरिक रकमान्तर व्यवस्थापन' : 'Internal Transfer Subsystem'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {lang === 'ne'
              ? 'HMAC प्रमाणीकरण, प्रिफ्लाइट नोन्स, र लेजर सन्तुलन सुरक्षासहित'
              : 'Cryptographic HMAC attestation, preflight nonces, and deferred ledger parity'}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#FB6C01] hover:bg-[#e55a00] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow transition"
        >
          <span>+</span>
          {lang === 'ne' ? 'नयाँ रकमान्तर ड्राफ्ट' : 'New Internal Transfer'}
        </button>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-sm text-red-700 flex justify-between items-center shadow-sm">
          <div>
            <span className="font-semibold">{lang === 'ne' ? 'सूचना: ' : 'Alert: '}</span>
            {errorMessage}
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-500 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-sm text-emerald-800 flex justify-between items-center shadow-sm">
          <div>
            <span className="font-semibold">{lang === 'ne' ? 'सफल: ' : 'Success: '}</span>
            {successMessage}
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {lang === 'ne' ? 'कुल रकमान्तर' : 'Total Transfers'}
          </div>
          <div className="text-2xl font-black text-[#01366E] mt-1">{counts.all}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
            {lang === 'ne' ? 'ड्राफ्ट (DRAFT)' : 'Pending Drafts'}
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">{counts.draft}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
            {lang === 'ne' ? 'सफल (POSTED)' : 'Active Posted'}
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{counts.posted}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-purple-500 uppercase tracking-wider">
            {lang === 'ne' ? 'उल्टाइएको (REVERSED)' : 'Reversed'}
          </div>
          <div className="text-2xl font-black text-purple-600 mt-1">{counts.reversed}</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
        {['ALL', 'DRAFT', 'POSTED', 'REVERSED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === tab
                ? 'bg-[#01366E] text-white shadow'
                : 'text-gray-600 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Transfers List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-[#01366E] border-t-transparent rounded-full mb-2"></div>
            <div>{lang === 'ne' ? 'विवरण लोड हुँदैछ...' : 'Loading transfers...'}</div>
          </div>
        ) : transfers.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-sm">
              {lang === 'ne' ? 'कुनै रकमान्तर अभिलेख फेला परेन।' : 'No internal transfer records found.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">{lang === 'ne' ? 'भौचर / पहिचान' : 'Voucher / ID'}</th>
                  <th className="px-6 py-3.5">{lang === 'ne' ? 'स्रोत → गन्तव्य' : 'Source → Dest'}</th>
                  <th className="px-6 py-3.5">{lang === 'ne' ? 'रकम (NPR)' : 'Amount (NPR)'}</th>
                  <th className="px-6 py-3.5">{lang === 'ne' ? 'प्रयोजन' : 'Purpose'}</th>
                  <th className="px-6 py-3.5">{lang === 'ne' ? 'स्थिति' : 'Status'}</th>
                  <th className="px-6 py-3.5 text-right">{lang === 'ne' ? 'कार्यहरू' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-mono text-xs">
                      {item.voucher_number ? (
                        <span className="font-bold text-[#01366E]">{item.voucher_number}</span>
                      ) : (
                        <span className="text-gray-400">{item.id.slice(0, 8)}...</span>
                      )}
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {lang === 'ne' ? item.source_account_name_ne : item.source_account_name_en}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <span>→</span>
                        <span>{lang === 'ne' ? item.destination_account_name_ne : item.destination_account_name_en}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                      NPR {Number(item.amount_npr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-6 py-4 text-xs max-w-xs truncate text-gray-600">
                      {lang === 'ne' ? item.purpose_ne : item.purpose_en}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                          item.status === 'POSTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'DRAFT'
                            ? 'bg-amber-100 text-amber-800'
                            : item.status === 'REVERSED'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleViewDetails(item.id)}
                        className="text-xs font-semibold text-[#01366E] hover:underline"
                      >
                        {lang === 'ne' ? 'विवरण' : 'Details'}
                      </button>

                      {item.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => handlePost(item.id)}
                            disabled={isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1 rounded transition disabled:opacity-50"
                          >
                            {lang === 'ne' ? 'पोस्ट' : 'Post'}
                          </button>
                          <button
                            onClick={() => setShowCancelModal(item.id)}
                            className="text-xs font-semibold text-amber-700 hover:underline"
                          >
                            {lang === 'ne' ? 'रद्द' : 'Cancel'}
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-xs font-semibold text-red-600 hover:underline"
                          >
                            {lang === 'ne' ? 'मेट्नुहोस्' : 'Delete'}
                          </button>
                        </>
                      )}

                      {item.status === 'POSTED' && (
                        <button
                          onClick={() => setShowReverseModal(item.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-2.5 py-1 rounded transition"
                        >
                          {lang === 'ne' ? 'उल्टाउनुहोस्' : 'Reverse'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE DRAFT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#01366E]">
                {lang === 'ne' ? 'नयाँ आन्तरिक रकमान्तर ड्राफ्ट' : 'Create Internal Transfer Draft'}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {lang === 'ne' ? 'स्रोत खाता (Source Account)' : 'Source Account'}
                </label>
                <select
                  required
                  value={newTransfer.sourceAccountId}
                  onChange={(e) => setNewTransfer({ ...newTransfer, sourceAccountId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                >
                  <option value="">-- {lang === 'ne' ? 'खाता छान्नुहोस्' : 'Select Account'} --</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_code} - {lang === 'ne' ? acc.name_ne : acc.name_en} (NPR {acc.current_balance})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {lang === 'ne' ? 'गन्तव्य खाता (Destination Account)' : 'Destination Account'}
                </label>
                <select
                  required
                  value={newTransfer.destinationAccountId}
                  onChange={(e) => setNewTransfer({ ...newTransfer, destinationAccountId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                >
                  <option value="">-- {lang === 'ne' ? 'खाता छान्नुहोस्' : 'Select Account'} --</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_code} - {lang === 'ne' ? acc.name_ne : acc.name_en} (NPR {acc.current_balance})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {lang === 'ne' ? 'रकम (NPR)' : 'Amount (NPR)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newTransfer.amountNpr}
                  onChange={(e) => setNewTransfer({ ...newTransfer, amountNpr: e.target.value })}
                  placeholder="50000.00"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    {lang === 'ne' ? 'प्रयोजन (नेपाली)' : 'Purpose (Nepali)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newTransfer.purposeNe}
                    onChange={(e) => setNewTransfer({ ...newTransfer, purposeNe: e.target.value })}
                    placeholder="राहत कोषमा रकमान्तर"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    {lang === 'ne' ? 'प्रयोजन (अंग्रेजी)' : 'Purpose (English)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newTransfer.purposeEn}
                    onChange={(e) => setNewTransfer({ ...newTransfer, purposeEn: e.target.value })}
                    placeholder="Relief fund transfer"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {lang === 'ne' ? 'टिप्पणी (Notes)' : 'Notes'}
                </label>
                <textarea
                  rows={2}
                  value={newTransfer.notes}
                  onChange={(e) => setNewTransfer({ ...newTransfer, notes: e.target.value })}
                  placeholder="Additional audit reference..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
                >
                  {lang === 'ne' ? 'रद्द' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#01366E] hover:bg-[#002855] text-white px-5 py-2 rounded-lg text-sm font-semibold shadow disabled:opacity-50"
                >
                  {isPending ? '...' : lang === 'ne' ? 'ड्राफ्ट सिर्जना गर्नुहोस्' : 'Create Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVERSE MODAL */}
      {showReverseModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-purple-900 mb-2">
              {lang === 'ne' ? 'रकमान्तर उल्ट्याउने पुष्टि' : 'Confirm Transfer Reversal'}
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              {lang === 'ne'
                ? 'लेजरमा विपरित (Symmetrical) प्रविष्टि गरिनेछ र सम्बन्धित खाताहरूको मौज्दात पूर्ववत गरिनेछ।'
                : 'Symmetrical reversal legs will be appended to the ledger and account balances will be restored.'}
            </p>

            <form onSubmit={handleReverseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {lang === 'ne' ? 'उल्टाउनुको कारण (अनिवार्य)' : 'Reversal Reason (Required)'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  placeholder={
                    lang === 'ne'
                      ? 'उदाहरण: गलत खाता छनोट भएकाले सच्याइएको'
                      : 'E.g., Correction of incorrect allocation'
                  }
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReverseModal(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
                >
                  {lang === 'ne' ? 'रद्द' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow disabled:opacity-50"
                >
                  {isPending ? '...' : lang === 'ne' ? 'उल्ट्याउनुहोस्' : 'Execute Reversal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL DRAFT MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-amber-900 mb-2">
              {lang === 'ne' ? 'ड्राफ्ट रद्द गर्ने पुष्टि' : 'Confirm Draft Cancellation'}
            </h3>

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {lang === 'ne' ? 'रद्द गर्नुको कारण' : 'Cancellation Reason'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Reason for draft cancellation..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
                >
                  {lang === 'ne' ? 'रद्द' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow disabled:opacity-50"
                >
                  {isPending ? '...' : lang === 'ne' ? 'रद्द गर्नुहोस्' : 'Cancel Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#01366E]">
                  {lang === 'ne' ? 'आन्तरिक रकमान्तर विस्तृत विवरण' : 'Internal Transfer Details'}
                </h3>
                <span className="font-mono text-xs text-gray-500">ID: {showDetailsModal.transfer?.id}</span>
              </div>
              <button onClick={() => setShowDetailsModal(null)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="font-semibold text-gray-400 block">{lang === 'ne' ? 'भौचर नम्बर' : 'Voucher'}</span>
                  <span className="font-bold text-sm text-[#01366E]">{showDetailsModal.transfer?.voucher_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-400 block">{lang === 'ne' ? 'रकम' : 'Amount'}</span>
                  <span className="font-bold text-sm text-gray-900">
                    NPR {Number(showDetailsModal.transfer?.amount_npr).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-400 block">{lang === 'ne' ? 'स्थिति' : 'Status'}</span>
                  <span className="font-bold">{showDetailsModal.transfer?.status}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-400 block">{lang === 'ne' ? 'सिर्जना मिति' : 'Created At'}</span>
                  <span>{new Date(showDetailsModal.transfer?.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Masked Accounts */}
              <div className="border rounded-xl p-4">
                <h4 className="font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  {lang === 'ne' ? 'खाता विवरण (सुरक्षित मास्क गरिएको)' : 'Associated Accounts (Masked)'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="font-bold text-gray-500 block">{lang === 'ne' ? 'स्रोत खाता' : 'Source'}</span>
                    <div className="font-semibold text-gray-800">{showDetailsModal.transfer?.source_account_name}</div>
                    <div className="font-mono text-gray-500 mt-1">
                      {showDetailsModal.transfer?.source_account_mask || '****'}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="font-bold text-gray-500 block">{lang === 'ne' ? 'गन्तव्य खाता' : 'Destination'}</span>
                    <div className="font-semibold text-gray-800">{showDetailsModal.transfer?.destination_account_name}</div>
                    <div className="font-mono text-gray-500 mt-1">
                      {showDetailsModal.transfer?.destination_account_mask || '****'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legs history */}
              <div className="border rounded-xl p-4">
                <h4 className="font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  {lang === 'ne' ? 'वित्तीय लेजर प्रविष्टिहरू (Legs)' : 'Ledger Leg History'}
                </h4>
                {showDetailsModal.legs && showDetailsModal.legs.length > 0 ? (
                  <div className="space-y-2">
                    {showDetailsModal.legs.map((leg: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded bg-slate-50 font-mono">
                        <div>
                          <span className="font-bold text-gray-800">{leg.leg_type}</span>{' '}
                          <span className={leg.type === 'INCOME' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                            [{leg.type}]
                          </span>
                          {leg.is_reversal && (
                            <span className="ml-2 bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              REVERSAL
                            </span>
                          )}
                        </div>
                        <div className="font-bold">NPR {Number(leg.amount_npr).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">
                    {lang === 'ne' ? 'कुनै लेजर प्रविष्टि भएको छैन (ड्राफ्ट)।' : 'No posted legs exist for this draft.'}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(null)}
                className="bg-[#01366E] text-white px-5 py-2 rounded-lg font-semibold text-xs"
              >
                {lang === 'ne' ? 'बन्द गर्नुहोस्' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
