import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  BadgeCheck,
  AlertTriangle,
  Upload,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lock,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { employerService } from '../../../lib/employerService';
import { CompanyDocument, CompanyVerification } from '../../../types/database';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export function CompanyVerificationPage() {
  const { company, profile, updateCompany } = useAuth();
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [form, setForm] = useState({
    registrationNumber: 'US-DEL-9842104',
    registrationType: 'Corporation (C-Corp)',
    authorizedRepresentative: profile?.display_name || 'Marcus Vance',
    documentType: 'Certificate of Incorporation',
    reviewerNotes: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadData() {
      if (company?.id) {
        setIsLoading(true);
        const docs = await employerService.getCompanyDocuments(company.id);
        setDocuments(docs);
        setIsLoading(false);
      }
    }
    loadData();
  }, [company?.id]);

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company?.id) return;
    setIsSubmitting(true);

    try {
      if (selectedFile) {
        await employerService.uploadCompanyDocument(
          company.id,
          profile?.id || '00000000-0000-0000-0000-000000000201',
          form.documentType,
          selectedFile
        );
      }

      await employerService.submitCompanyVerification(
        company.id,
        profile?.id || '00000000-0000-0000-0000-000000000201',
        form.registrationNumber,
        form.registrationType,
        'Enterprise documents submitted for verification.'
      );

      await updateCompany({ verification_status: 'under_review' });

      // Refresh documents
      const docs = await employerService.getCompanyDocuments(company.id);
      setDocuments(docs);
      setSubmitSuccess(true);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateAdminApproval = async () => {
    if (!company?.id) return;
    await updateCompany({
      verification_status: 'verified',
      verified_at: new Date().toISOString(),
    });
    await employerService.updateCompany(company.id, {
      verification_status: 'verified',
      verified_at: new Date().toISOString(),
    });
  };

  const status = company?.verification_status || 'pending';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            Company Legal Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Submit regulatory and incorporation documentation to unlock job publishing on JOBHUB
          </p>
        </div>
      </div>

      {submitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Verification documentation received! Our compliance team will review your application within 24 hours.</span>
        </div>
      )}

      {/* Current Status Banner (Section 11) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                status === 'verified'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : status === 'under_review'
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : status === 'rejected'
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}
            >
              {status === 'verified' && <BadgeCheck className="w-6 h-6" />}
              {status === 'under_review' && <Clock className="w-6 h-6" />}
              {status === 'rejected' && <XCircle className="w-6 h-6" />}
              {status === 'pending' && <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-300">Status:</span>
                <span className="text-sm font-bold uppercase tracking-wider text-white">
                  {status === 'verified' && 'Verified Organization'}
                  {status === 'under_review' && 'Under Active Review'}
                  {status === 'rejected' && 'Review Rejected'}
                  {status === 'pending' && 'Not Yet Verified'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {status === 'verified' && 'Your organization has been officially verified by platform administrators. Job publishing is unlocked.'}
                {status === 'under_review' && 'Documents are currently undergoing manual review by compliance administrators.'}
                {status === 'rejected' && 'The submitted documentation did not match the business registry. Please review and resubmit.'}
                {status === 'pending' && 'Submit official corporate documents to verify business legitimacy and activate job postings.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-white mb-1">
              Submit Business Registration Information
            </h3>
            <p className="text-xs text-slate-400">
              Provide your state or national company registration credentials and corporate filing documents
            </p>
          </div>

          <form onSubmit={handleSubmitVerification} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registration / Tax ID / EIN *
                </label>
                <input
                  type="text"
                  required
                  value={form.registrationNumber}
                  onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                  placeholder="e.g. 12-3456789 or REG-984210"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Entity / Registration Type *
                </label>
                <select
                  value={form.registrationType}
                  onChange={(e) => setForm({ ...form, registrationType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Corporation (C-Corp)">Corporation (C-Corp / Inc)</option>
                  <option value="Limited Liability Company (LLC)">Limited Liability Company (LLC)</option>
                  <option value="S-Corporation">S-Corporation</option>
                  <option value="Partnership">Partnership (LLP / LP)</option>
                  <option value="Non-Profit Organization">Non-Profit Organization (501c3)</option>
                  <option value="Government / Public Entity">Government / Public Agency</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Authorized Executive / Representative *
              </label>
              <input
                type="text"
                required
                value={form.authorizedRepresentative}
                onChange={(e) => setForm({ ...form, authorizedRepresentative: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Document Upload section */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Document Classification *
              </label>
              <select
                value={form.documentType}
                onChange={(e) => setForm({ ...form, documentType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white mb-3 focus:outline-none focus:border-indigo-500"
              >
                <option value="Certificate of Incorporation">Certificate of Incorporation / Articles of Organization</option>
                <option value="Tax Identification & EIN Certificate">IRS EIN / National Tax Certificate</option>
                <option value="Business Operating License">Municipal / Commercial Business License</option>
                <option value="Utility or Corporate Lease Bill">Proof of Commercial Address (Lease / Utility)</option>
                <option value="Certificate of Good Standing">State Certificate of Good Standing</option>
              </select>

              <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-6 text-center bg-slate-950/40 transition-colors">
                <input
                  type="file"
                  id="doc-upload"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <label htmlFor="doc-upload" className="cursor-pointer space-y-2 block">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-medium text-slate-200">
                    {selectedFile ? (
                      <span className="text-emerald-400 font-semibold">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                    ) : (
                      <span>Click to upload verification document</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">PDF, PNG, JPG up to 10MB (stored in private Supabase Storage)</p>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Uploading & Encrypting...' : 'Submit Verification Package'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Uploaded Documents List (Section 9 & 73) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Private Storage Vault</h3>
          </div>
          <p className="text-xs text-slate-400">
            Files stored in the <code className="text-slate-300">company-documents</code> bucket are non-public and protected by Row Level Security.
          </p>

          <div className="space-y-3 pt-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileText className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="font-medium text-slate-200 truncate">{doc.file_name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{doc.document_type}</p>
                  </div>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {doc.verification_status}
                </span>
              </div>
            ))}

            {documents.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-500">
                No documents uploaded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
