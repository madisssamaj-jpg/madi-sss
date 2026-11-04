'use client';

import { useState, useTransition } from 'react';
import {
  FinancialTransparencyRecord,
  FinancialRecordType,
  FinancialPartyCategory,
  FinancialPublicationStatus,
} from '@/lib/cms/cms-service';
import {
  saveFinancialTransparencyRecordAction,
  advanceFinancialWorkflowAction,
  deleteFinancialTransparencyRecordAction,
} from '@/app/actions/cms-actions';

export function FinancialTransparencyManager({
  initialRecords,
  lang,
}: {
  initialRecords: FinancialTransparencyRecord[];
  lang: string;
}) {
  const [records, setRecords] = useState<FinancialTransparencyRecord[]>(initialRecords);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<Partial<FinancialTransparencyRecord>>({
    id: '',
    recordType: 'ACTIVITY_EXPENSE',
    amount: 0,
    currency: 'NPR',
    transactionDate: '२०८२-०४-२१',
    payerPayeeCategory: 'COMMUNITY_MEMBER',
    supportingEvidence: {
      bankStatementRef: '',
      voucherRef: '',
      invoiceRef: '',
      receiptRef: '',
      approvalMinuteRef: '',
      auditReportRef: '',
    },
    evidenceVerification: {
      bankStatementVerified: false,
      voucherVerified: false,
      invoiceVerified: false,
      receiptVerified: false,
      approvalMinuteVerified: false,
      auditReportVerified: false,
    },
    status: 'DRAFT',
    publicSummary: {
      descriptionNe: '',
      descriptionEn: '',
      isAmountVisible: true,
      approvedDocumentUrl: '',
    },
    adminNotes: '',
  });

  const handleOpenNew = () => {
    setFormData({
      id: `fin-${Date.now()}`,
      recordType: 'ACTIVITY_EXPENSE',
      amount: 0,
      currency: 'NPR',
      transactionDate: '२०८२-०४-२१',
      payerPayeeCategory: 'COMMUNITY_MEMBER',
      supportingEvidence: {
        bankStatementRef: '',
        voucherRef: '',
        invoiceRef: '',
        receiptRef: '',
        approvalMinuteRef: '',
        auditReportRef: '',
      },
      evidenceVerification: {
        bankStatementVerified: false,
        voucherVerified: false,
        invoiceVerified: false,
        receiptVerified: false,
        approvalMinuteVerified: false,
        auditReportVerified: false,
      },
      status: 'DRAFT',
      publicSummary: {
        descriptionNe: '',
        descriptionEn: '',
        isAmountVisible: true,
        approvedDocumentUrl: '',
      },
      adminNotes: '',
    });
    setIsEditing(true);
    setMessage(null);
  };

  const handleEdit = (record: FinancialTransparencyRecord) => {
    setFormData({
      ...record,
      supportingEvidence: { ...record.supportingEvidence },
      evidenceVerification: { ...record.evidenceVerification },
      publicSummary: { ...record.publicSummary },
    });
    setIsEditing(true);
    setMessage(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recordType || formData.amount === undefined) {
      setMessage({ text: 'रेकर्ड प्रकार र रकम अनिवार्य छन्।', type: 'error' });
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const res = await saveFinancialTransparencyRecordAction({
        ...formData,
        recordType: formData.recordType as FinancialRecordType,
        amount: Number(formData.amount),
      });

      if (res.success && res.data) {
        setMessage({ text: 'आर्थिक रेकर्ड सफलतापूर्वक सुरक्षित गरियो!', type: 'success' });
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
        setMessage({ text: `त्रुटि: ${res.error}`, type: 'error' });
      }
    });
  };

  const handleAdvanceWorkflow = (id: string, targetStatus: FinancialPublicationStatus) => {
    let note = '';
    if (targetStatus === 'PENDING_PRESIDENT_APPROVAL') {
      note = prompt('कोषाध्यक्ष परीक्षण टिप्पणी (Treasurer Review Notes):') || '';
    } else if (targetStatus === 'APPROVED_PUBLIC') {
      if (!confirm('चेतावनी: सार्वजनिक प्रकाशन गरेपछि यो आर्थिक सारांश सार्वजनिक रूपमा देखिनेछ। के सबै प्रमाण प्रमाणीकृत छन्?')) {
        return;
      }
      note = prompt('अध्यक्ष स्वीकृति टिप्पणी (President Approval Notes):') || '';
    } else if (targetStatus === 'INTERNAL_ONLY' || targetStatus === 'DRAFT') {
      note = prompt('स्थिति परिवर्तन टिप्पणी (Status change note):') || '';
    }

    setMessage(null);
    startTransition(async () => {
      const res = await advanceFinancialWorkflowAction(id, targetStatus, note);
      if (res.success && res.data) {
        setMessage({ text: `कार्यप्रवाह चरण अद्यावधिक: ${targetStatus}`, type: 'success' });
        setRecords((prev) => prev.map((r) => (r.id === id ? res.data! : r)));
      } else {
        setMessage({ text: `कार्यप्रवाह त्रुटि: ${res.error}`, type: 'error' });
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('के तपाईं यो आर्थिक रेकर्ड हटाउन निश्चित हुनुहुन्छ?')) return;
    setMessage(null);
    startTransition(async () => {
      const res = await deleteFinancialTransparencyRecordAction(id);
      if (res.success) {
        setMessage({ text: 'रेकर्ड हटाइयो।', type: 'success' });
        setRecords((prev) => prev.filter((r) => r.id !== id));
      } else {
        setMessage({ text: `त्रुटि: ${res.error}`, type: 'error' });
      }
    });
  };

  const filtered = records.filter((r) => {
    const matchesType = filterType === 'ALL' || r.recordType === filterType;
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.publicSummary?.descriptionNe.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.publicSummary?.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2.5 py-1 rounded-full">
              {lang === 'ne' ? 'वित्तीय पारदर्शिता तथा सुशासन' : 'Financial Transparency & Audit'}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {lang === 'ne' ? 'आन्तरिक कार्यप्रवाह' : 'Internal Workflow'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-2">
            {lang === 'ne' ? 'वित्तीय पारदर्शिता परीक्षण सूची तथा प्रकाशन कार्यप्रवाह' : 'Financial Transparency Checklist & Workflow'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
            {lang === 'ne'
              ? 'राहत कोष योगदान, खर्च, गतिविधि बजेट तथा लेखापरीक्षण प्रतिवेदनको ६-बुँदे प्रमाण प्रमाणीकरण: मस्यौदा → कोषाध्यक्ष परीक्षण → अध्यक्ष प्रमाणीकरण → सार्वजनिक प्रकाशन।'
              : '6-point evidence verification: Draft → Treasurer Review → President Approval → Published.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="bg-[#FB6C01] hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <span>➕</span>
          <span>{lang === 'ne' ? 'नयाँ आर्थिक रेकर्ड' : 'New Financial Record'}</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}

      {/* Strict Financial Rules Notice */}
      <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-xl text-xs text-blue-950 flex items-start gap-2.5">
        <span className="text-lg leading-none">🛡️</span>
        <div>
          <p className="font-bold">
            {lang === 'ne' ? 'वित्तीय पारदर्शिता तथा गोपनीयता नियमहरू:' : 'Financial Transparency & Privacy Rules:'}
          </p>
          <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-blue-900">
            <li>सबै आर्थिक रेकर्डहरू पूर्वनिर्धारित रूपमा <strong>DRAFT</strong> वा <strong>INTERNAL_ONLY</strong> मा रहन्छन्।</li>
            <li>प्रमाणित लेखा प्रमाण (बैंक स्टेटमेन्ट, भौचर, बिल, रसिद वा निर्णय पुस्तिका) विना प्रकाशन पूर्णतया निषेध छ।</li>
            <li>व्यक्तिगत बैंक खाता, व्यक्तिगत सम्पर्क तथा लाभार्थीको पहिचान कहिल्यै सार्वजनिक हुँदैन (सार्वजनिक रूपमा केवल स्वीकृत सुरक्षित विवरण र रकम मात्र देखिनेछ)।</li>
            <li>प्रकाशनका लागि कोषाध्यक्ष परीक्षण र अध्यक्षको अन्तिम प्रमाणीकरण दुवै अनिवार्य छ।</li>
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
            <option value="RELIEF_FUND_CONTRIBUTION">राहत कोष योगदान (Relief Contribution)</option>
            <option value="RELIEF_FUND_EXPENDITURE">राहत कोष खर्च (Relief Expenditure)</option>
            <option value="ACTIVITY_EXPENSE">गतिविधि खर्च (Activity Expense)</option>
            <option value="AUDIT_REPORT">लेखापरीक्षण प्रतिवेदन (Audit Report)</option>
            <option value="ANNUAL_FINANCIAL_STATEMENT">वार्षिक वित्तीय विवरण (Annual Statement)</option>
            <option value="OTHER_FINANCIAL_DOCUMENT">अन्य वित्तीय कागजात (Other)</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#01366E]"
          >
            <option value="ALL">सबै स्थिति (All Status)</option>
            <option value="DRAFT">मस्यौदा (DRAFT)</option>
            <option value="INTERNAL_ONLY">🔒 आन्तरिक मात्र (INTERNAL_ONLY)</option>
            <option value="PENDING_TREASURER_REVIEW">⏳ कोषाध्यक्ष समीक्षा बाँकी</option>
            <option value="PENDING_PRESIDENT_APPROVAL">⏳ अध्यक्ष प्रमाणीकरण बाँकी</option>
            <option value="APPROVED_PUBLIC">✓ स्वीकृत सार्वजनिक (APPROVED_PUBLIC)</option>
          </select>
        </div>

        {/* Search */}
        <div className="w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="खोज्नुहोस् (Record ID, विवरण)..."
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
                {formData.id ? `आर्थिक विवरण सम्पादन: ${formData.id}` : 'नयाँ आर्थिक रेकर्ड'}
              </h3>
              <p className="text-xs text-gray-500">
                सबै आर्थिक प्रविष्टिका लागि ६-बुँदे प्रमाण तथा प्रमाणीकरण आवश्यक छ।
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  रेकर्ड प्रकार (Record Type) *
                </label>
                <select
                  value={formData.recordType}
                  onChange={(e) =>
                    setFormData({ ...formData, recordType: e.target.value as FinancialRecordType })
                  }
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 font-semibold"
                >
                  <option value="RELIEF_FUND_CONTRIBUTION">राहत कोष योगदान (Relief Contribution)</option>
                  <option value="RELIEF_FUND_EXPENDITURE">राहत कोष खर्च (Relief Expenditure)</option>
                  <option value="ACTIVITY_EXPENSE">गतिविधि खर्च (Activity Expense)</option>
                  <option value="AUDIT_REPORT">लेखापरीक्षण प्रतिवेदन (Audit Report)</option>
                  <option value="ANNUAL_FINANCIAL_STATEMENT">वार्षिक वित्तीय विवरण (Annual Statement)</option>
                  <option value="OTHER_FINANCIAL_DOCUMENT">अन्य वित्तीय कागजात (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  रकम (Amount in NPR) *
                </label>
                <input
                  type="number"
                  value={formData.amount || 0}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  कारोबार मिति (Transaction Date) *
                </label>
                <input
                  type="text"
                  value={formData.transactionDate || ''}
                  onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                  placeholder="२०८२-०४-२१"
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  भुक्तानीकर्ता/प्राप्तकर्ता वर्ग (Party Category — सार्वजनिक रूपमा नाम कहिल्यै नखुल्ने)
                </label>
                <select
                  value={formData.payerPayeeCategory}
                  onChange={(e) =>
                    setFormData({ ...formData, payerPayeeCategory: e.target.value as FinancialPartyCategory })
                  }
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200"
                >
                  <option value="COMMUNITY_MEMBER">सामुदायिक सदस्य / नागरिक (Community Member)</option>
                  <option value="INSTITUTIONAL_DONOR">संस्थागत दाता / साझेदार (Institutional Donor)</option>
                  <option value="SERVICE_PROVIDER">सेवा प्रदायक (Service Provider)</option>
                  <option value="GOVERNMENT_BODY">सरकारी निकाय (Government Body)</option>
                  <option value="VENDOR">आपूर्तिकर्ता / बिक्रेता (Vendor)</option>
                  <option value="OTHER">अन्य (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  स्वीकृत दस्तावेज लिङ्क (Approved Document URL — ऐच्छिक)
                </label>
                <input
                  type="text"
                  value={formData.publicSummary?.approvedDocumentUrl || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      publicSummary: {
                        ...formData.publicSummary!,
                        approvedDocumentUrl: e.target.value,
                      },
                    })
                  }
                  placeholder="/documents/reports/audit-summary.pdf"
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200"
                />
              </div>
            </div>

            {/* 6-Point Supporting Evidence Checklist */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-[#01366E] uppercase tracking-wide flex items-center gap-1.5">
                <span>📑</span>
                <span>६-बुँदे लेखा प्रमाण तथा प्रमाणीकरण सूची (Supporting Evidence Checklist)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. Bank Statement */}
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">१. बैंक स्टेटमेन्ट सन्दर्भ</span>
                    <label className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.evidenceVerification?.bankStatementVerified || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            evidenceVerification: {
                              ...formData.evidenceVerification!,
                              bankStatementVerified: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>प्रमाणित</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={formData.supportingEvidence?.bankStatementRef || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        supportingEvidence: {
                          ...formData.supportingEvidence!,
                          bankStatementRef: e.target.value,
                        },
                      })
                    }
                    placeholder="उदा: TXN-BANK-0091"
                    className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded"
                  />
                </div>

                {/* 2. Voucher */}
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">२. भौचर सन्दर्भ (Voucher)</span>
                    <label className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.evidenceVerification?.voucherVerified || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            evidenceVerification: {
                              ...formData.evidenceVerification!,
                              voucherVerified: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>प्रमाणित</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={formData.supportingEvidence?.voucherRef || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        supportingEvidence: {
                          ...formData.supportingEvidence!,
                          voucherRef: e.target.value,
                        },
                      })
                    }
                    placeholder="उदा: VOUCH-2082-01"
                    className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded"
                  />
                </div>

                {/* 3. Invoice */}
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">३. बिल / इनभ्वाइस (Invoice)</span>
                    <label className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.evidenceVerification?.invoiceVerified || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            evidenceVerification: {
                              ...formData.evidenceVerification!,
                              invoiceVerified: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>प्रमाणित</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={formData.supportingEvidence?.invoiceRef || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        supportingEvidence: {
                          ...formData.supportingEvidence!,
                          invoiceRef: e.target.value,
                        },
                      })
                    }
                    placeholder="उदा: INV-TAX-8890"
                    className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded"
                  />
                </div>

                {/* 4. Receipt */}
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">४. रसिद (Receipt)</span>
                    <label className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.evidenceVerification?.receiptVerified || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            evidenceVerification: {
                              ...formData.evidenceVerification!,
                              receiptVerified: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>प्रमाणित</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={formData.supportingEvidence?.receiptRef || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        supportingEvidence: {
                          ...formData.supportingEvidence!,
                          receiptRef: e.target.value,
                        },
                      })
                    }
                    placeholder="उदा: REC-0021"
                    className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded"
                  />
                </div>

                {/* 5. Approval Minute */}
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">५. निर्णय पुस्तिका (Approval Minute)</span>
                    <label className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.evidenceVerification?.approvalMinuteVerified || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            evidenceVerification: {
                              ...formData.evidenceVerification!,
                              approvalMinuteVerified: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>प्रमाणित</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={formData.supportingEvidence?.approvalMinuteRef || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        supportingEvidence: {
                          ...formData.supportingEvidence!,
                          approvalMinuteRef: e.target.value,
                        },
                      })
                    }
                    placeholder="उदा: MIN-EXEC-16"
                    className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded"
                  />
                </div>

                {/* 6. Audit Report */}
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">६. लेखापरीक्षण प्रतिवेदन (Audit Report)</span>
                    <label className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.evidenceVerification?.auditReportVerified || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            evidenceVerification: {
                              ...formData.evidenceVerification!,
                              auditReportVerified: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>प्रमाणित</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={formData.supportingEvidence?.auditReportRef || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        supportingEvidence: {
                          ...formData.supportingEvidence!,
                          auditReportRef: e.target.value,
                        },
                      })
                    }
                    placeholder="उदा: AUDIT-REP-2081.pdf"
                    className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Public-Safe Summary Fields */}
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/60 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                  <span>🌐</span>
                  <span>सार्वजनिक-सुरक्षित सारांश (Public-Safe Summary — सार्वजनिक देखिने मात्र विवरण)</span>
                </h4>

                <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.publicSummary?.isAmountVisible !== false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publicSummary: {
                          ...formData.publicSummary!,
                          isAmountVisible: e.target.checked,
                        },
                      })
                    }
                  />
                  <span>सार्वजनिक रूपमा रकम देखाउने (Amount Visible)</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  सार्वजनिक सुरक्षित विवरण (नेपालीमा) *
                </label>
                <textarea
                  rows={2}
                  value={formData.publicSummary?.descriptionNe || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      publicSummary: {
                        ...formData.publicSummary!,
                        descriptionNe: e.target.value,
                      },
                    })
                  }
                  placeholder="उदा: मादी–४ ओखरबोटे निःशुल्क स्वास्थ्य शिविर औषधि व्यवस्थापन खर्च..."
                  className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Public Safe Description (English)
                </label>
                <textarea
                  rows={2}
                  value={formData.publicSummary?.descriptionEn || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      publicSummary: {
                        ...formData.publicSummary!,
                        descriptionEn: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Pharmaceutical logistics expenditure for free medical camp in Madi-4..."
                  className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200"
                />
              </div>
            </div>

            {/* Private Admin Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                🔒 आन्तरिक प्रशासनिक तथा लेखा टिप्पणी (Private Admin Notes — कहिल्यै सार्वजनिक नहुने)
              </label>
              <textarea
                rows={2}
                value={formData.adminNotes || ''}
                onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                placeholder="चेक नं., आन्तरिक खाता नम्बर, लेखापरीक्षकको टिप्पणी..."
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
                {isPending ? 'सुरक्षित गर्दै...' : 'मस्यौदा सुरक्षित गर्नुहोस्'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Financial Records List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-gray-500 text-xs">
            कुनै वित्तीय रेकर्ड फेला परेन।
          </div>
        ) : (
          filtered.map((item) => {
            const ev = item.evidenceVerification;
            const evCount = [
              ev?.bankStatementVerified,
              ev?.voucherVerified,
              ev?.invoiceVerified,
              ev?.receiptVerified,
              ev?.approvalMinuteVerified,
              ev?.auditReportVerified,
            ].filter(Boolean).length;

            const isApproved = item.status === 'APPROVED_PUBLIC';

            return (
              <div
                key={item.id}
                className={`bg-white p-5 rounded-2xl border transition shadow-sm ${
                  isApproved
                    ? 'border-emerald-300 bg-emerald-50/10'
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

                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#01366E] border border-blue-200">
                        {item.recordType}
                      </span>

                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          item.status === 'APPROVED_PUBLIC'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'PENDING_PRESIDENT_APPROVAL'
                            ? 'bg-purple-100 text-purple-800'
                            : item.status === 'PENDING_TREASURER_REVIEW'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'INTERNAL_ONLY'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        प्रमाण: {evCount}/६ प्रमाणित
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 mt-1">
                      {item.publicSummary?.descriptionNe || 'सार्वजनिक विवरण पेन्डिङ'}
                    </h4>
                    <p className="text-xs text-gray-500">{item.publicSummary?.descriptionEn}</p>
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

                {/* Amount and Meta Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] mb-3">
                  <div>
                    <span className="text-gray-400 block">रकम (Amount):</span>
                    <span className="font-bold text-sm text-[#01366E]">
                      Rs. {item.amount.toLocaleString()} {item.currency}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">कारोबार मिति:</span>
                    <span className="font-semibold text-gray-700">{item.transactionDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">पक्ष वर्ग (Category):</span>
                    <span className="font-semibold text-gray-700">{item.payerPayeeCategory}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">सार्वजनिक दृश्यता:</span>
                    <span className="font-semibold text-gray-700">
                      {item.publicSummary?.isAmountVisible ? 'रकम देखिने' : 'रकम गोप्य'}
                    </span>
                  </div>
                </div>

                {/* Evidence Checklist Display */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[10px] mb-3 bg-slate-50/70 p-2.5 rounded-xl">
                  <div className={item.evidenceVerification?.bankStatementVerified ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {item.evidenceVerification?.bankStatementVerified ? '✓' : '✗'} १. बैंक स्टेटमेन्ट
                  </div>
                  <div className={item.evidenceVerification?.voucherVerified ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {item.evidenceVerification?.voucherVerified ? '✓' : '✗'} २. भौचर
                  </div>
                  <div className={item.evidenceVerification?.invoiceVerified ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {item.evidenceVerification?.invoiceVerified ? '✓' : '✗'} ३. इनभ्वाइस
                  </div>
                  <div className={item.evidenceVerification?.receiptVerified ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {item.evidenceVerification?.receiptVerified ? '✓' : '✗'} ४. रसिद
                  </div>
                  <div className={item.evidenceVerification?.approvalMinuteVerified ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {item.evidenceVerification?.approvalMinuteVerified ? '✓' : '✗'} ५. निर्णय पुस्तिका
                  </div>
                  <div className={item.evidenceVerification?.auditReportVerified ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {item.evidenceVerification?.auditReportVerified ? '✓' : '✗'} ६. अडिट प्रतिवेदन
                  </div>
                </div>

                {/* Audit Signatures */}
                {(item.reviewedByTreasurerName || item.approvedByPresidentName) && (
                  <div className="text-[11px] text-slate-700 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60 mb-3 space-y-1">
                    {item.reviewedByTreasurerName && (
                      <p>✓ कोषाध्यक्ष परीक्षण: <strong>{item.reviewedByTreasurerName}</strong> ({item.reviewedByTreasurerAt?.slice(0, 10)})</p>
                    )}
                    {item.approvedByPresidentName && (
                      <p>✓ अध्यक्ष प्रमाणीकरण: <strong>{item.approvedByPresidentName}</strong> ({item.approvedByPresidentAt?.slice(0, 10)})</p>
                    )}
                  </div>
                )}

                {/* Private Admin Notes */}
                {item.adminNotes && (
                  <div className="bg-slate-100 p-2.5 rounded-xl text-[11px] text-slate-700 border border-slate-200 mb-3 space-y-0.5">
                    <span className="font-bold text-slate-500">🔒 आन्तरिक प्रशासनिक टिप्पणी:</span>
                    <p className="whitespace-pre-wrap">{item.adminNotes}</p>
                  </div>
                )}

                {/* Workflow Actions */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[10px] text-gray-400">
                    दस्तावेज: <span className="font-mono text-gray-600">{item.publicSummary?.approvedDocumentUrl || 'कुनै लिङ्क छैन'}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {item.status !== 'INTERNAL_ONLY' && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceWorkflow(item.id, 'INTERNAL_ONLY')}
                        className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[11px]"
                      >
                        🔒 आन्तरिक मात्र (INTERNAL_ONLY)
                      </button>
                    )}

                    {item.status === 'DRAFT' && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceWorkflow(item.id, 'PENDING_TREASURER_REVIEW')}
                        className="px-3 py-1 rounded bg-blue-50 text-[#01366E] hover:bg-blue-100 border border-blue-200 font-semibold text-[11px]"
                      >
                        कोषाध्यक्ष समीक्षामा पठाउनुहोस् ➔
                      </button>
                    )}

                    {item.status === 'PENDING_TREASURER_REVIEW' && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceWorkflow(item.id, 'PENDING_PRESIDENT_APPROVAL')}
                        className="px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700 font-semibold text-[11px]"
                      >
                        ✓ कोषाध्यक्ष प्रमाणीकरण (Treasurer Review)
                      </button>
                    )}

                    {item.status === 'PENDING_PRESIDENT_APPROVAL' && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceWorkflow(item.id, 'APPROVED_PUBLIC')}
                        className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-[11px]"
                      >
                        ✓ अध्यक्ष प्रमाणीकरण तथा सार्वजनिक स्वीकृति (Publish)
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

