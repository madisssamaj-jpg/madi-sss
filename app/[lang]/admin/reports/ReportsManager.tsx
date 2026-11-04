'use client';

import { useState, useTransition } from 'react';
import { GovernanceReport, FinancialTransparencyRecord } from '@/lib/cms/cms-service';
import {
  saveReportAction,
  deleteReportAction,
  saveRegistrationCertificateAction,
  verifyRegistrationCertificateAction,
  updateCertificateVisibilityAction,
  downloadInternalCertificateAction,
} from '@/app/actions/cms-actions';
import { FinancialTransparencyManager } from './FinancialTransparencyManager';

export function ReportsManager({
  initialReports,
  initialFinancialRecords = [],
  lang,
}: {
  initialReports: GovernanceReport[];
  initialFinancialRecords?: FinancialTransparencyRecord[];
  lang: string;
}) {
  const [reports, setReports] = useState<GovernanceReport[]>(initialReports);
  const [activeTab, setActiveTab] = useState<'CERTIFICATE' | 'CONSTITUTION' | 'OTHER' | 'FINANCIAL_TRANSPARENCY'>('CERTIFICATE');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<GovernanceReport> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Separate registration certificates, constitutions, and other reports
  const registrationCertificates = reports.filter(
    (r) => r.category === 'REGISTRATION_CERTIFICATE'
  );
  const verifiedCertificate = registrationCertificates.find(
    (r) => r.verificationStatus === 'VERIFIED'
  );
  const publishedConstitution = reports.find(
    (r) =>
      r.category === 'CONSTITUTION' &&
      r.status === 'PUBLISHED' &&
      r.isOriginalApprovedDocument === true &&
      r.isPublic !== false
  );
  const archivedConstitutions = reports.filter(
    (r) => r.category === 'CONSTITUTION' && r.status === 'ARCHIVED'
  );
  const draftConstitutions = reports.filter(
    (r) => r.category === 'CONSTITUTION' && r.status === 'DRAFT'
  );
  const otherReports = reports.filter(
    (r) => r.category !== 'CONSTITUTION' && r.category !== 'REGISTRATION_CERTIFICATE'
  );

  const handleOpenNewCertificate = () => {
    setEditingItem({
      titleNe: 'जिल्ला प्रशासन कार्यालय, काठमाडौं दर्ता प्रमाणपत्र',
      titleEn: 'District Administration Office, Kathmandu Registration Certificate',
      fiscalYear: '२०८२ (2025)',
      category: 'REGISTRATION_CERTIFICATE',
      publishedDate: '२०८२-०४-२१',
      fileUrl: 'internal-docs/certificates/cdo-registration-certificate-2082.jpeg',
      redactedFileUrl: '/documents/cdo-registration-certificate-redacted.jpeg',
      fileSizeMb: '0.22 MB',
      isPublic: false, // Invariant: Default to Internal Only!
      status: 'PUBLISHED',
      issuingAuthorityNe: 'जिल्ला प्रशासन कार्यालय, काठमाडौं',
      issuingAuthorityEn: 'District Administration Office, Kathmandu',
      registrationDateNe: '२०८२/०४/२१',
      registrationDateEn: '2082/04/21 BS',
      registrationNumber: '१६',
      decisionDateNe: '२०८२/०४/२१',
      registeredOrgNameNe: 'मादी (संखुवासभा) सरोकार समाज, काठमाडौं',
      registeredOrgNameEn: 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu',
      verificationStatus: 'VERIFIED',
      publishRegistrationNumber: true,
      publishRedactedCertificate: false,
      adminNotes: 'जिल्ला प्रशासन कार्यालय, काठमाडौं बबरमहलबाट जारी आधिकारिक दर्ता प्रमाणपत्र (दर्ता नं. १६, निर्णय मिति २०८२/०४/२१)। सक्कल कागजात आन्तरिक अभिलेखमा सुरक्षित।',
      noPrivateDataConfirmed: true,
      isOriginalApprovedDocument: true,
    });
    setIsEditing(true);
  };

  const handleOpenNewConstitution = () => {
    setEditingItem({
      titleNe: 'मादी (संखुवासभा) सरोकार समाज, काठमाडौंको विधान',
      titleEn: 'Constitution of Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu',
      fiscalYear: '२०८२ (2025)',
      category: 'CONSTITUTION',
      version: '१.० (२०८२)',
      effectiveDate: '२०८२-०४-२१',
      publishedDate: '२०८२-०४-२१',
      fileUrl: '',
      fileSizeMb: '',
      descriptionNe: 'जिल्ला प्रशासन कार्यालय, काठमाडौंमा मिति २०८२/०४/२१ मा दर्ता तथा प्रमाणित आधिकारिक मूल विधान',
      descriptionEn: 'Official verified and registered Constitution approved by District Administration Office, Kathmandu on 2082/04/21',
      status: 'DRAFT',
      isPublic: false,
      isOriginalApprovedDocument: false,
      noPrivateDataConfirmed: false,
    });
    setIsEditing(true);
  };

  const handleOpenNewOtherReport = () => {
    setEditingItem({
      titleNe: '',
      titleEn: '',
      fiscalYear: '२०८१/०८२',
      category: 'AUDIT_FINANCIAL',
      publishedDate: '२०८२-०५-०१',
      fileUrl: '/documents/annual-report-2081-82.pdf',
      fileSizeMb: '2.5 MB',
      isPublic: true,
      status: 'PUBLISHED',
      noPrivateDataConfirmed: true,
    });
    setIsEditing(true);
  };

  const handleVerifyCertificate = (id: string, status: 'VERIFIED' | 'REJECTED' | 'PENDING') => {
    const notes = prompt(
      'प्रमाणीकरण टिप्पणी (Admin Notes) लेख्नुहोस्:',
      status === 'VERIFIED' ? 'कार्यसमिति तथा प्रशासनद्वारा सक्कल दर्ता प्रमाणपत्र प्रमाणित।' : ''
    );
    if (notes === null) return;
    setMessage(null);
    startTransition(async () => {
      const res = await verifyRegistrationCertificateAction(id, status, notes);
      if (res.success && res.data) {
        setMessage({
          text: `दर्ता प्रमाणपत्र सफलतापूर्वक ${status === 'VERIFIED' ? 'प्रमाणित (Verified)' : status} गरियो!`,
          type: 'success',
        });
        setReports((prev) => prev.map((r) => (r.id === id ? res.data : r)));
      } else {
        setMessage({ text: `त्रुटि: ${res.error}`, type: 'error' });
      }
    });
  };

  const handleToggleCertificateVisibility = (
    id: string,
    updates: { publishRegistrationNumber?: boolean; publishRedactedCertificate?: boolean }
  ) => {
    setMessage(null);
    startTransition(async () => {
      const res = await updateCertificateVisibilityAction(id, updates);
      if (res.success && res.data) {
        setMessage({
          text: 'प्रमाणपत्र सार्वजनिक दृश्यता (Visibility) सफलतापूर्वक अद्यावधिक गरियो!',
          type: 'success',
        });
        setReports((prev) => prev.map((r) => (r.id === id ? res.data : r)));
      } else {
        setMessage({ text: `त्रुटि: ${res.error}`, type: 'error' });
      }
    });
  };

  const handleDownloadInternal = async (id: string) => {
    startTransition(async () => {
      const res = await downloadInternalCertificateAction(id);
      if (res.success && res.fileUrl) {
        window.open(res.fileUrl, '_blank');
      } else {
        alert(res.error || 'Failed to download internal certificate.');
      }
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (editingItem.category === 'CONSTITUTION' && editingItem.status === 'PUBLISHED') {
      if (!editingItem.isOriginalApprovedDocument) {
        setMessage({
          text: 'प्रकाशन अस्विकृत: संस्थाको आधिकारिक छाप तथा दर्ता भएको सक्कल (Original Approved) विधान मात्र सार्वजनिक गर्न सकिन्छ। सन्दर्भ मस्यौदा प्रकाशित गर्न मिल्दैन।',
          type: 'error',
        });
        return;
      }
      if (!editingItem.noPrivateDataConfirmed) {
        setMessage({
          text: 'गोपनीयता पुष्टि अनिवार्य छ: कृपया "यो दस्तावेजमा कुनै निजी सदस्य विवरण छैन" भन्ने बाकसमा चिन्ह लगाउनुहोस्।',
          type: 'error',
        });
        return;
      }
    }

    setMessage(null);
    startTransition(async () => {
      const res =
        editingItem.category === 'REGISTRATION_CERTIFICATE'
          ? await saveRegistrationCertificateAction(editingItem)
          : await saveReportAction(editingItem);

      if (res.success && res.data) {
        setMessage({
          text:
            editingItem.category === 'REGISTRATION_CERTIFICATE'
              ? 'दर्ता प्रमाणपत्र सफलतापूर्वक सुरक्षित गरियो! (सक्कल प्रति स्वतः आन्तरिक गोपनीयतामा सुरक्षित)'
              : editingItem.category === 'CONSTITUTION'
                ? 'विधान सफलतापूर्वक सुरक्षित गरियो! (नयाँ विधान प्रकाशित हुँदा पुरानो संस्करण स्वतः अभिलेखमा सारिएको छ)'
                : 'प्रतिवेदन सफलतापूर्वक सुरक्षित गरियो!',
          type: 'success',
        });
        setIsEditing(false);

        // Update local state: if constitution published, archive others
        setReports((prev) => {
          let updated = [...prev];
          if (res.data.category === 'CONSTITUTION' && res.data.status === 'PUBLISHED') {
            updated = updated.map((r) =>
              r.category === 'CONSTITUTION' && r.id !== res.data.id && r.status === 'PUBLISHED'
                ? { ...r, status: 'ARCHIVED' }
                : r
            );
          }
          const idx = updated.findIndex((r) => r.id === res.data.id);
          if (idx !== -1) {
            updated[idx] = res.data;
          } else {
            updated.unshift(res.data);
          }
          return updated;
        });
      } else {
        setMessage({ text: `त्रुटि: ${res.error}`, type: 'error' });
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('के तपाईं यो दस्तावेज हटाउन निश्चित हुनुहुन्छ?')) return;
    setMessage(null);
    startTransition(async () => {
      const res = await deleteReportAction(id);
      if (res.success) {
        setMessage({ text: 'दस्तावेज हटाइयो।', type: 'success' });
        setReports((prev) => prev.filter((r) => r.id !== id));
      } else {
        setMessage({ text: `त्रुटि: ${res.error}`, type: 'error' });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FB6C01] bg-orange-50 px-2.5 py-1 rounded-full">
            {lang === 'ne' ? 'सुशासन तथा पारदर्शीता' : 'Transparency Admin'}
          </span>
          <h1 className="text-2xl font-extrabold text-[#01366E] mt-2">
            {lang === 'ne' ? 'विधान तथा प्रतिवेदन व्यवस्थापन' : 'Constitution & Governance Reports'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {lang === 'ne'
              ? 'आधिकारिक मूल विधान (संशोधन संस्करण, प्रमाणीकरण मिति, अभिलेख) तथा वार्षिक अडिट प्रतिवेदनहरू व्यवस्थापन गर्नुहोस्।'
              : 'Manage the official Constitution (versions, effective dates, DAO seals, archives) and statutory audit reports.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeTab === 'CERTIFICATE' ? (
            <button
              type="button"
              onClick={handleOpenNewCertificate}
              className="bg-[#01366E] hover:bg-blue-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <span>🏛️</span>
              <span>{lang === 'ne' ? 'नयाँ दर्ता प्रमाणपत्र अपलोड' : 'Upload Certificate'}</span>
            </button>
          ) : activeTab === 'CONSTITUTION' ? (
            <button
              type="button"
              onClick={handleOpenNewConstitution}
              className="bg-[#01366E] hover:bg-blue-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <span>📜</span>
              <span>{lang === 'ne' ? 'नयाँ विधान संस्करण थप्नुहोस्' : 'Publish Constitution Version'}</span>
            </button>
          ) : activeTab === 'OTHER' ? (
            <button
              type="button"
              onClick={handleOpenNewOtherReport}
              className="bg-[#01366E] hover:bg-blue-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <span>➕</span>
              <span>{lang === 'ne' ? 'नयाँ प्रतिवेदन थप्नुहोस्' : 'Publish Report'}</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-6 pt-3 rounded-t-2xl gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('CERTIFICATE')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${activeTab === 'CERTIFICATE'
              ? 'border-[#FB6C01] text-[#01366E]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
        >
          <span>🏛️</span>
          <span>
            {lang === 'ne' ? 'दर्ता प्रमाणपत्र' : 'Registration Certificate'}{' '}
            <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              {verifiedCertificate ? 'प्रमाणित (Verified)' : 'अपुष्ट (Pending)'}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CONSTITUTION')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${activeTab === 'CONSTITUTION'
              ? 'border-[#FB6C01] text-[#01366E]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
        >
          <span>📜</span>
          <span>
            {lang === 'ne' ? 'विधान (Constitution)' : 'Constitution'}{' '}
            <span className="text-[11px] bg-blue-100 text-[#01366E] px-2 py-0.5 rounded-full font-bold">
              {publishedConstitution ? 'सक्रिय' : 'तयारीमा'}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('OTHER')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${activeTab === 'OTHER'
              ? 'border-[#FB6C01] text-[#01366E]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
        >
          <span>📊</span>
          <span>
            {lang === 'ne' ? 'अन्य प्रतिवेदन तथा अडिट' : 'Other Reports & Audits'} ({otherReports.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('FINANCIAL_TRANSPARENCY')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${activeTab === 'FINANCIAL_TRANSPARENCY'
              ? 'border-[#FB6C01] text-[#01366E]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
        >
          <span>💼</span>
          <span>
            {lang === 'ne' ? 'वित्तीय पारदर्शिता ट्र्याकर' : 'Financial Transparency Tracker'}{' '}
            <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
              {initialFinancialRecords.length}
            </span>
          </span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm font-semibold border ${message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
        >
          {message.type === 'success' ? '✅' : '⚠️'} {message.text}
        </div>
      )}

      {/* Editor Modal / Drawer */}
      {isEditing && editingItem && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-blue-200 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {editingItem.category === 'REGISTRATION_CERTIFICATE'
                  ? '🏛️'
                  : editingItem.category === 'CONSTITUTION'
                    ? '📜'
                    : '📄'}
              </span>
              <h2 className="text-lg font-bold text-gray-900">
                {editingItem.id
                  ? editingItem.category === 'REGISTRATION_CERTIFICATE'
                    ? 'दर्ता प्रमाणपत्र विवरण सम्पादन'
                    : editingItem.category === 'CONSTITUTION'
                      ? 'विधान सम्पादन'
                      : 'दस्तावेज सम्पादन'
                  : editingItem.category === 'REGISTRATION_CERTIFICATE'
                    ? 'नयाँ दर्ता प्रमाणपत्र अपलोड तथा दर्ता'
                    : editingItem.category === 'CONSTITUTION'
                      ? 'नयाँ विधान प्रकाशन / संशोधन'
                      : 'नयाँ दस्तावेज प्रकाशन'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-gray-400 hover:text-gray-600 text-xs font-bold px-2 py-1 rounded-md bg-slate-100"
            >
              ✕ बन्द
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  दस्तावेज शीर्षक (नेपाली) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.titleNe || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, titleNe: e.target.value })}
                  placeholder="उदा: जिल्ला प्रशासन कार्यालय, काठमाडौं दर्ता प्रमाणपत्र"
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
                  placeholder="e.g. District Administration Office Registration Certificate"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  वर्ग (Category) *
                </label>
                <select
                  value={editingItem.category || 'CONSTITUTION'}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                >
                  <option value="REGISTRATION_CERTIFICATE">🏛️ दर्ता प्रमाणपत्र (REGISTRATION_CERTIFICATE)</option>
                  <option value="CONSTITUTION">📜 विधान (CONSTITUTION)</option>
                  <option value="ANNUAL_REPORT">📊 वार्षिक प्रतिवेदन (ANNUAL_REPORT)</option>
                  <option value="AUDIT_FINANCIAL">💰 लेखा परीक्षण तथा वित्तीय (AUDIT_FINANCIAL)</option>
                  <option value="POLICY">📑 नीति तथा कार्यविधि (POLICY)</option>
                  <option value="MINUTES">📝 माइन्युट निर्णय (MINUTES)</option>
                </select>
              </div>

              {editingItem.category === 'REGISTRATION_CERTIFICATE' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      दर्ता नम्बर (Registration No.) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.registrationNumber || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, registrationNumber: e.target.value })}
                      placeholder="उदा: १६"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      प्रमाणीकरण स्थिति (Verification) *
                    </label>
                    <select
                      value={editingItem.verificationStatus || 'PENDING'}
                      onChange={(e) => setEditingItem({ ...editingItem, verificationStatus: e.target.value as any })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                    >
                      <option value="VERIFIED">✅ VERIFIED (प्रमाणित)</option>
                      <option value="PENDING">⏳ PENDING (प्रतिक्षारत)</option>
                      <option value="REJECTED">❌ REJECTED (अस्वीकृत)</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      संस्करण (Version string) {editingItem.category === 'CONSTITUTION' ? '*' : ''}
                    </label>
                    <input
                      type="text"
                      value={editingItem.version || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, version: e.target.value })}
                      placeholder="उदा: १.० (२०८२)"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      प्रमाणीकरण / लागु मिति (Effective Date)
                    </label>
                    <input
                      type="text"
                      value={editingItem.effectiveDate || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, effectiveDate: e.target.value })}
                      placeholder="उदा: २०८२-०६-२९"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Certificate-specific fields */}
            {editingItem.category === 'REGISTRATION_CERTIFICATE' ? (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      दर्ता भएको संस्थाको नाम (नेपाली) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.registeredOrgNameNe || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, registeredOrgNameNe: e.target.value })}
                      placeholder="उदा: मादी (संखुवासभा) सरोकार समाज, काठमाडौं"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Registered Org Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.registeredOrgNameEn || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, registeredOrgNameEn: e.target.value })}
                      placeholder="e.g. Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      जारी गर्ने निकाय (Issuing Authority - नेपाली) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.issuingAuthorityNe || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, issuingAuthorityNe: e.target.value })}
                      placeholder="उदा: जिल्ला प्रशासन कार्यालय, काठमाडौं"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Issuing Authority (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.issuingAuthorityEn || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, issuingAuthorityEn: e.target.value })}
                      placeholder="e.g. District Administration Office, Kathmandu"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      निर्णय मिति (Decision Date BS) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.decisionDateNe || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, decisionDateNe: e.target.value })}
                      placeholder="उदा: २०८२/०४/२१"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      दर्ता मिति (Registration Date BS) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.registrationDateNe || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, registrationDateNe: e.target.value })}
                      placeholder="उदा: २०८२/०४/२१ BS"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      🔒 सक्कल दर्ता प्रमाणपत्र फाइल (Internal Only - Raw Scan) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.fileUrl || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, fileUrl: e.target.value })}
                      placeholder="internal-docs/certificates/cdo-registration-certificate-2082.jpeg"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                    />
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      सुरक्षा नियम: यो मूल सक्कल प्रति हो, सार्वजनिक रूपमा कहिल्यै खुला हुँदैन।
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      🛡️ सम्पादित/गोप्य प्रति (Redacted Public Copy URL)
                    </label>
                    <input
                      type="text"
                      value={editingItem.redactedFileUrl || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, redactedFileUrl: e.target.value })}
                      placeholder="/documents/cdo-registration-certificate-redacted.jpeg"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                    />
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      हस्ताक्षर र फोन नम्बर हटाइएको सुरक्षित प्रति (सार्वजनिक डाउनलोड खुला भएमा मात्र देखिने)।
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    प्रशासकीय टिप्पणी (Admin Notes)
                  </label>
                  <textarea
                    rows={2}
                    value={editingItem.adminNotes || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, adminNotes: e.target.value })}
                    placeholder="उदा: जिल्ला प्रशासन कार्यालय, काठमाडौं बबरमहलबाट जारी आधिकारिक दर्ता प्रमाणपत्र (दर्ता नं. १६)..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-[#01366E] block">
                    सार्वजनिक दृश्यता तथा गोपनीयता नियन्त्रण (Public Visibility & Privacy Controls)
                  </span>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingItem.publishRegistrationNumber)}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, publishRegistrationNumber: e.target.checked })
                        }
                        className="text-[#01366E] rounded"
                      />
                      <span>दर्ता नम्बर सार्वजनिक रूपमा प्रदर्शन गर्नुहोस् (Show Reg No. in Footer & About page)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingItem.publishRedactedCertificate)}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, publishRedactedCertificate: e.target.checked })
                        }
                        className="text-[#01366E] rounded"
                      />
                      <span>सम्पादित (Redacted) प्रति मात्र सार्वजनिक डाउनलोड खुला गर्नुहोस्</span>
                    </label>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                    <span>🔒</span>
                    <span>
                      <strong>गोपनीयता प्रत्याभूति:</strong> सक्कल प्रमाणपत्र फाइल (Raw Scan) सधैं आन्तरिक गोपनीयतामा रहनेछ। व्यक्तिगत हस्ताक्षर, फोन नम्बर वा नागरिकता विवरण कहिल्यै सार्वजनिक गरिने छैन।
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Non-certificate reports (Constitution / Audits) */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      आर्थिक वर्ष (Fiscal Year) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.fiscalYear || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, fiscalYear: e.target.value })}
                      placeholder="२०८२ (2025)"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      प्रकाशन मिति *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.publishedDate || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, publishedDate: e.target.value })}
                      placeholder="२०८२-०६-२९"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      स्थिति (Status) *
                    </label>
                    <select
                      value={editingItem.status || 'PUBLISHED'}
                      onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                    >
                      <option value="PUBLISHED">PUBLISHED (सार्वजनिक रूपमा प्रकाशित)</option>
                      <option value="DRAFT">DRAFT (मस्यौदा - अप्रकाशित)</option>
                      <option value="ARCHIVED">ARCHIVED (पुराना संस्करण - अभिलेख)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      फाइल डाउनलोड लिङ्क (PDF URL) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.fileUrl || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, fileUrl: e.target.value })}
                      placeholder="उदा: https://.../madi-sss-constitution-original-approved.pdf"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      फाइल साइज (File Size)
                    </label>
                    <input
                      type="text"
                      value={editingItem.fileSizeMb || '9.9 MB'}
                      onChange={(e) => setEditingItem({ ...editingItem, fileSizeMb: e.target.value })}
                      placeholder="9.9 MB"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    संक्षिप्त विवरण (नेपाली)
                  </label>
                  <textarea
                    rows={2}
                    value={editingItem.descriptionNe || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, descriptionNe: e.target.value })}
                    placeholder="उदा: जिल्ला प्रशासन कार्यालय, काठमाडौंमा मिति २०८२/०४/२१ मा दर्ता तथा प्रमाणित आधिकारिक विधान"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01366E]"
                  />
                </div>

                {/* Constitution Automatic Archive Notice */}
                {editingItem.category === 'CONSTITUTION' && editingItem.status === 'PUBLISHED' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                    <span>ℹ️</span>
                    <span>
                      <strong>संस्करण व्यवस्थापन नियम:</strong> यो नयाँ संस्करणलाई &apos;PUBLISHED&apos; गर्दा हालको चालू विधान स्वतः &apos;ARCHIVED&apos; (इतिहास) मा सर्नेछ। सार्वजनिक पृष्ठमा केवल नवीनतम प्रकाशित विधान मात्र देखिनेछ।
                    </span>
                  </div>
                )}

                {/* Mandatory Original Stamped Confirmation Checkbox for Constitution */}
                {editingItem.category === 'CONSTITUTION' && (
                  <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 space-y-2">
                    <label className="flex items-start gap-2.5 text-xs font-bold text-[#01366E] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingItem.isOriginalApprovedDocument)}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            isOriginalApprovedDocument: e.target.checked,
                          })
                        }
                        className="mt-0.5 text-[#01366E] rounded"
                      />
                      <span>
                        यो संस्थाको आधिकारिक छाप तथा दर्ता भएको सक्कल (Original Approved & Stamped) विधान हो / This is the original approved and stamped Constitution *
                      </span>
                    </label>
                    <p className="text-[11px] text-blue-700 pl-6">
                      सुपरएडमिन प्रमाणीकरण: जिल्ला प्रशासन कार्यालय वा आधिकारिक निकायबाट छाप लागेको सक्कल विधान मात्र सार्वजनिक गर्न मिल्छ। सन्दर्भ मस्यौदा (Reference Draft) लाई सार्वजनिक रूपमा प्रकाशित गर्न मिल्दैन।
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.isPublic !== false}
                      onChange={(e) => setEditingItem({ ...editingItem, isPublic: e.target.checked })}
                      className="text-[#01366E] rounded"
                    />
                    <span>सार्वजनिक रूपमा डाउनलोडको लागि खुला राख्नुहोस् (Publicly Accessible)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Mandatory Privacy Confirmation Checkbox */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="flex items-start gap-2.5 text-xs font-bold text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  required={editingItem.category === 'CONSTITUTION' && editingItem.status === 'PUBLISHED'}
                  checked={Boolean(editingItem.noPrivateDataConfirmed)}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, noPrivateDataConfirmed: e.target.checked })
                  }
                  className="mt-0.5 text-[#01366E] rounded"
                />
                <span>
                  यो दस्तावेजमा कुनै निजी सदस्य विवरण छैन / This document contains no private member data. *
                </span>
              </label>
              <p className="text-[11px] text-gray-500 pl-6">
                प्रकाशन पूर्व व्यक्तिगत गोपनीयता तथा डेटा सुरक्षा सुनिश्चित गर्न यो पुष्टि अनिवार्य छ।
              </p>
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
                className="bg-[#01366E] hover:bg-blue-900 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-2"
              >
                <span>{isPending ? 'सुरक्षित गर्दै...' : 'सुरक्षित गर्नुहोस्'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CERTIFICATE TAB CONTENT */}
      {activeTab === 'CERTIFICATE' && (
        <div className="space-y-6">
          {/* Top statutory authority info box */}
          <div className="bg-gradient-to-r from-blue-900 to-[#01366E] text-white p-6 rounded-2xl shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white">
                नेपाल सरकार • गृह मन्त्रालय • जिल्ला प्रशासन कार्यालय
              </span>
              <span className="text-xs font-semibold text-blue-200">
                संस्था दर्ता ऐन, २०३४ को दफा (४) बमोजिम
              </span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                जिल्ला प्रशासन कार्यालय, काठमाडौं दर्ता प्रमाणपत्र
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-3xl">
                मादी (संखुवासभा) सरोकार समाज, काठमाडौंको आधिकारिक वैधानिक दर्ता प्रमाणपत्र। सक्कल स्क्यान प्रति आन्तरिक अभिलेखमा पूर्ण सुरक्षित छ र कुनै व्यक्तिगत हस्ताक्षर वा फोन नम्बर सार्वजनिक हुँदैन।
              </p>
            </div>
          </div>

          {/* Verified Certificate Card */}
          {verifiedCertificate ? (
            <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <span>🏛️</span>
                      <span>जिल्ला प्रशासन कार्यालय, काठमाडौंमा दर्ता प्रमाणित</span>
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                      दर्ता नं. {verifiedCertificate.registrationNumber || '१६'}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      निर्णय मिति: {verifiedCertificate.decisionDateNe || '२०८२/०४/२१'}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#01366E] mt-3">
                    {verifiedCertificate.registeredOrgNameNe || 'मादी (संखुवासभा) सरोकार समाज, काठमाडौं'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {verifiedCertificate.issuingAuthorityNe || 'जिल्ला प्रशासन कार्यालय, काठमाडौं'} • दर्ता मिति: {verifiedCertificate.registrationDateNe || '२०८२/०४/२१'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadInternal(verifiedCertificate.id)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#01366E] hover:bg-blue-900 transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>🔒</span>
                    <span>सक्कल प्रति (Internal Only)</span>
                  </button>

                  {verifiedCertificate.redactedFileUrl && (
                    <a
                      href={verifiedCertificate.redactedFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1.5"
                    >
                      <span>🛡️</span>
                      <span>सम्पादित प्रति (Preview)</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(verifiedCertificate);
                      setIsEditing(true);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition flex items-center gap-1.5"
                  >
                    <span>✏️</span>
                    <span>सम्पादन</span>
                  </button>
                </div>
              </div>

              {/* Statutory & Privacy details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-gray-500 block font-semibold">जारी गर्ने निकाय:</span>
                  <span className="font-bold text-gray-900 mt-1 block">
                    {verifiedCertificate.issuingAuthorityNe}
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    {verifiedCertificate.issuingAuthorityEn}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-gray-500 block font-semibold">निर्णय तथा दर्ता मिति:</span>
                  <span className="font-bold text-gray-900 mt-1 block">
                    निर्णय: {verifiedCertificate.decisionDateNe || '२०८२/०४/२१'}
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    दर्ता: {verifiedCertificate.registrationDateNe || '२०८२/०४/२१'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-gray-500 block font-semibold">सुपरएडमिन अडिट लग:</span>
                  <span className="font-bold text-gray-900 mt-1 block">
                    प्रमाणित: {verifiedCertificate.verifiedByAdminName || 'सुपरएडमिन'}
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    मिति: {verifiedCertificate.verifiedAt || '२०८२-०४-२१'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-700 block font-semibold">गोपनीयता अवस्था:</span>
                  <span className="font-bold text-emerald-900 mt-1 block">
                    {verifiedCertificate.noPrivateDataConfirmed ? '✅ व्यक्तिगत डेटा सुरक्षित' : '⚠️ अपुष्ट'}
                  </span>
                  <span className="text-[11px] text-emerald-700 block">
                    सक्कल स्क्यान सार्वजनिक हुँदैन
                  </span>
                </div>
              </div>

              {/* Public Visibility Toggle Controls */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-gray-800 block">
                  सार्वजनिक दृश्यता नियन्त्रण (Public Visibility Toggles)
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-700">फुटर र About पृष्ठमा दर्ता नं. १६ प्रदर्शन:</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${verifiedCertificate.publishRegistrationNumber
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                      }`}>
                      {verifiedCertificate.publishRegistrationNumber ? 'सक्रिय (Active)' : 'निष्क्रिय (Hidden)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleCertificateVisibility(verifiedCertificate.id, {
                        publishRegistrationNumber: !verifiedCertificate.publishRegistrationNumber,
                      })
                    }
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 hover:bg-slate-100 text-gray-700 transition"
                  >
                    {verifiedCertificate.publishRegistrationNumber ? 'दर्ता नं. लुकाउनुहोस्' : 'दर्ता नं. देखाउनुहोस्'}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-slate-200 pt-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-700">सार्वजनिक पृष्ठमा सम्पादित (Redacted) प्रति डाउनलोड:</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${verifiedCertificate.publishRedactedCertificate
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                      }`}>
                      {verifiedCertificate.publishRedactedCertificate ? 'सार्वजनिक खुला (Public Download)' : 'आन्तरिक मात्र (Internal Only)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleCertificateVisibility(verifiedCertificate.id, {
                        publishRedactedCertificate: !verifiedCertificate.publishRedactedCertificate,
                      })
                    }
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 hover:bg-slate-100 text-gray-700 transition"
                  >
                    {verifiedCertificate.publishRedactedCertificate ? 'सार्वजनिक डाउनलोड बन्द गर्नुहोस्' : 'सम्पादित डाउनलोड खुला गर्नुहोस्'}
                  </button>
                </div>
              </div>

              {/* Admin Notes callout */}
              {verifiedCertificate.adminNotes && (
                <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 text-xs text-blue-900">
                  <span className="font-bold">प्रशासकीय टिप्पणी (Admin Notes): </span>
                  <span>{verifiedCertificate.adminNotes}</span>
                </div>
              )}
            </div>
          ) : (
            /* Empty state for certificate */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-gray-500 space-y-3">
              <span className="text-4xl block">🏛️</span>
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-amber-300">
                <span>⏳</span>
                <span>कुनै प्रमाणित दर्ता प्रमाणपत्र फेला परेन / Awaiting verified registration certificate</span>
              </div>
              <p className="text-base font-bold text-gray-800">
                जिल्ला प्रशासन कार्यालयको आधिकारिक दर्ता प्रमाणपत्र अपलोड गरी प्रमाणित गर्नुहोस्।
              </p>
              <button
                type="button"
                onClick={handleOpenNewCertificate}
                className="mt-2 bg-[#01366E] hover:bg-blue-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition inline-flex items-center gap-1.5"
              >
                <span>➕</span>
                <span>नयाँ दर्ता प्रमाणपत्र अपलोड</span>
              </button>
            </div>
          )}

          {/* List of all certificate submissions if multiple */}
          {registrationCertificates.length > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                दर्ता प्रमाणपत्रका अन्य अभिलेखहरू ({registrationCertificates.length})
              </h4>
              <div className="divide-y divide-slate-100">
                {registrationCertificates.map((cert) => (
                  <div key={cert.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-gray-900">{cert.titleNe}</span>
                      <span className="text-gray-500 ml-2">दर्ता नं. {cert.registrationNumber}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold ${cert.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : cert.verificationStatus === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                        {cert.verificationStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleVerifyCertificate(cert.id, cert.verificationStatus === 'VERIFIED' ? 'PENDING' : 'VERIFIED')}
                        className="text-xs text-blue-600 hover:underline font-bold"
                      >
                        {cert.verificationStatus === 'VERIFIED' ? 'अपुष्ट बनाउनुहोस्' : 'प्रमाणित गर्नुहोस्'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(cert);
                          setIsEditing(true);
                        }}
                        className="text-xs text-gray-600 hover:underline font-bold"
                      >
                        सम्पादन
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cert.id)}
                        className="text-xs text-rose-600 hover:underline font-bold"
                      >
                        हटाउनुहोस्
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONSTITUTION TAB CONTENT */}
      {activeTab === 'CONSTITUTION' && (
        <div className="space-y-6">
          {/* Active Published Constitution Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {lang === 'ne' ? 'चालू आधिकारिक विधान (हाल सार्वजनिक)' : 'Current Published Constitution'}
                </span>
                <h2 className="text-xl font-black text-[#01366E] mt-2">
                  {publishedConstitution
                    ? publishedConstitution.titleNe
                    : (lang === 'ne' ? 'कुनै विधान प्रकाशित छैन' : 'No Published Constitution')}
                </h2>
              </div>

              {publishedConstitution && (
                <div className="flex items-center gap-2">
                  <a
                    href={publishedConstitution.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1.5"
                  >
                    <span>📥</span>
                    <span>डाउनलोड (PDF)</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(publishedConstitution);
                      setIsEditing(true);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition flex items-center gap-1.5"
                  >
                    <span>✏️</span>
                    <span>सम्पादन</span>
                  </button>
                </div>
              )}
            </div>

            {publishedConstitution ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-gray-500 block font-semibold">संस्करण:</span>
                  <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                    {publishedConstitution.version || '१.० (२०८२)'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-gray-500 block font-semibold">प्रमाणीकरण मिति:</span>
                  <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                    {publishedConstitution.effectiveDate || '२०८२-०६-२९'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-gray-500 block font-semibold">फाइल साइज:</span>
                  <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                    {publishedConstitution.fileSizeMb}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-700 block font-semibold">गोपनीयता प्रमाणीकरण:</span>
                  <span className="font-bold text-emerald-900 text-sm mt-0.5 block">
                    {publishedConstitution.noPrivateDataConfirmed ? '✅ प्रमाणित (No PII)' : '⚠️ अपुष्ट'}
                  </span>
                </div>
              </div>
            ) : (
              /* Empty state message */
              <div className="p-8 text-center text-gray-500 space-y-3">
                <span className="text-3xl block">📜</span>
                <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-amber-300">
                  <span>⏳</span>
                  <span>Awaiting original approved Constitution PDF / आधिकारिक सक्कल विधान प्रतीक्षामा</span>
                </div>
                <p className="text-base font-bold text-gray-700">
                  {lang === 'ne'
                    ? 'विधान डाउनलोडका लागि तयारी भइरहेको छ।'
                    : 'The constitution document is being prepared for download.'}
                </p>
                <p className="text-xs text-gray-400">
                  {lang === 'ne'
                    ? 'माथिको "नयाँ विधान संस्करण थप्नुहोस्" बटन क्लिक गरी PDF लिङ्क राखी प्रकाशित गर्नुहोस्।'
                    : 'Click "Publish Constitution Version" above to upload and publish the official PDF.'}
                </p>
              </div>
            )}
          </div>

          {/* Draft Constitutions if any */}
          {draftConstitutions.length > 0 && (
            <div className="bg-amber-50/50 rounded-2xl border border-amber-200 p-6 space-y-3">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                अप्रकाशित मस्यौदाहरू (Drafts - {draftConstitutions.length})
              </h3>
              <div className="divide-y divide-amber-100">
                {draftConstitutions.map((draft) => (
                  <div key={draft.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{draft.titleNe}</span>
                        <span className="text-gray-500">v{draft.version}</span>
                        {!draft.isOriginalApprovedDocument && (
                          <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-extrabold">
                            ⚠️ Non-original / Reference Draft — Do Not Publish
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(draft);
                          setIsEditing(true);
                        }}
                        className="text-blue-600 hover:underline font-bold"
                      >
                        सम्पादन
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(draft.id)}
                        className="text-rose-600 hover:underline font-bold"
                      >
                        हटाउनुहोस्
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Archived Historical Versions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-gray-700">
              <span className="flex items-center gap-1.5">
                <span>🏛️</span>
                <span>पुराना तथा अभिलेख गरिएका विधानहरू (Archived History - {archivedConstitutions.length})</span>
              </span>
              <span className="text-[11px] text-gray-500 font-normal">
                (अडिट तथा कानुनी इतिहासका लागि सुरक्षित)
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {archivedConstitutions.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  कुनै पुरानो विधान अभिलेखमा छैन। नयाँ संस्करण प्रकाशित गर्दा हालको संस्करण यहाँ स्वतः अभिलेख हुनेछ।
                </div>
              ) : (
                archivedConstitutions.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-gray-900">{item.titleNe}</span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                          संस्करण: {item.version || 'पुरातन'}
                        </span>
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          अभिलेख (ARCHIVED)
                        </span>
                        {!item.isOriginalApprovedDocument && (
                          <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-extrabold">
                            ⚠️ Non-original / Reference Draft — Do Not Publish
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-[11px]">
                        प्रमाणीकरण मिति: {item.effectiveDate || item.publishedDate} | साइज: {item.fileSizeMb}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-gray-700"
                      >
                        डाउनलोड
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(item);
                          setIsEditing(true);
                        }}
                        className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700"
                      >
                        सम्पादन
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700"
                      >
                        हटाउनुहोस्
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* OTHER REPORTS TAB CONTENT */}
      {activeTab === 'OTHER' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-gray-700">
            <span>प्रकाशित प्रतिवेदन तथा वित्तीय दस्तावेजहरू ({otherReports.length})</span>
            <span>कार्यहरू</span>
          </div>

          <div className="divide-y divide-slate-100">
            {otherReports.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                कुनै प्रतिवेदन फेला परेन।
              </div>
            ) : (
              otherReports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-blue-50 text-[#01366E]">📄</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#FB6C01] bg-orange-50 px-2 py-0.5 rounded">
                          {rep.fiscalYear}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {rep.category}
                        </span>
                        <span className="text-xs text-gray-400">{rep.publishedDate}</span>
                      </div>
                      <h3 className="font-bold text-sm text-gray-900 mt-1">{rep.titleNe}</h3>
                      <p className="text-xs text-gray-500">साइज: {rep.fileSizeMb}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <a
                      href={rep.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 bg-slate-100 hover:bg-slate-200 transition"
                    >
                      डाउनलोड
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem(rep);
                        setIsEditing(true);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                    >
                      सम्पादन
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(rep.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition"
                    >
                      हटाउनुहोस्
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'FINANCIAL_TRANSPARENCY' && (
        <FinancialTransparencyManager initialRecords={initialFinancialRecords} lang={lang} />
      )}
    </div>
  );
}
