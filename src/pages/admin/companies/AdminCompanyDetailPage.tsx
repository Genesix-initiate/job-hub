import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Clock,
  Globe,
  Mail,
  Phone,
  MapPin,
  Lock,
  Download,
  Eye,
} from 'lucide-react';
import { adminService } from '../../../lib/adminService';
import { Company } from '../../../types/database';
import { useAuth } from '../../../context/AuthContext';

export function AdminCompanyDetailPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { profile: currentAdmin } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal action state
  const [modalAction, setModalAction] = useState<'verified' | 'rejected' | 'under_review' | 'suspended' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (companyId) {
      adminService.getCompanyById(companyId).then((res) => {
        setCompany(res);
        setIsLoading(false);
      });
    }
  }, [companyId]);

  const handleExecuteVerification = async () => {
    if (!company || !modalAction) return;
    setIsSubmitting(true);
    await adminService.reviewCompanyVerification(
      company.id,
      modalAction,
      actionNotes || `Administrative action changed status to ${modalAction}`,
      currentAdmin?.id || 'admin'
    );
    setCompany({
      ...company,
      verification_status: modalAction,
      verified_at: modalAction === 'verified' ? new Date().toISOString() : company.verified_at,
    });
    setIsSubmitting(false);
    setModalAction(null);
    setActionNotes('');
    setSuccessToast(`Company status updated to ${modalAction.toUpperCase()}`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading company verification dossier...</div>;
  }

  if (!company) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-400">Company record not found.</p>
        <button
          onClick={() => navigate('/admin/companies')}
          className="text-xs text-rose-400 hover:underline"
        >
          &larr; Return to Companies Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/companies')}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Company Verification Directory</span>
        </button>

        <span className="text-xs font-mono text-slate-500">ENTITY ID: {company.id}</span>
      </div>

      {successToast && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Company Header Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={company.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=160'}
              alt={company.company_name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-700 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-white tracking-tight">{company.company_name}</h1>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                    company.verification_status === 'verified'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : company.verification_status === 'pending' || company.verification_status === 'under_review'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {company.verification_status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{company.industry} · Founded {company.founded_year || 2020}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {company.verification_status !== 'verified' && (
              <button
                onClick={() => setModalAction('verified')}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                Approve Verification
              </button>
            )}

            {company.verification_status !== 'rejected' && (
              <button
                onClick={() => setModalAction('rejected')}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold text-xs transition cursor-pointer"
              >
                Reject
              </button>
            )}

            <button
              onClick={() => setModalAction('under_review')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
            >
              Request Info
            </button>
          </div>
        </div>

        {/* Company Contact & Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block mb-1 font-mono uppercase text-[10px]">Official Website</span>
            <a
              href={company.website || '#'}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:underline flex items-center gap-1 font-mono"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{company.website || 'N/A'}</span>
            </a>
          </div>
          <div>
            <span className="text-slate-500 block mb-1 font-mono uppercase text-[10px]">Official Email</span>
            <p className="text-slate-200 font-mono">{company.email || 'careers@apexcloud.example.com'}</p>
          </div>
          <div>
            <span className="text-slate-500 block mb-1 font-mono uppercase text-[10px]">Corporate Phone</span>
            <p className="text-slate-200 font-mono">{company.phone || '+1 (555) 800-2739'}</p>
          </div>
          <div>
            <span className="text-slate-500 block mb-1 font-mono uppercase text-[10px]">Headquarters Location</span>
            <p className="text-slate-200">{company.address || `${company.city}, ${company.country}`}</p>
          </div>
        </div>
      </div>

      {/* Submitted Legal Documents (Simulated Supabase Storage Private Bucket Inspection) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            Confidential Verification Documents (Supabase Storage)
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            BUCKET: private-company-documents
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              name: 'Certificate_of_Incorporation.pdf',
              type: 'CAC / State Registration',
              size: '2.4 MB',
              verified: company.verification_status === 'verified',
            },
            {
              name: 'Tax_Clearance_Compliance_2026.pdf',
              type: 'Tax Authority Clearance',
              size: '1.8 MB',
              verified: company.verification_status === 'verified',
            },
            {
              name: 'Commercial_Operating_License.pdf',
              type: 'Municipal Business Permit',
              size: '3.1 MB',
              verified: company.verification_status === 'verified',
            },
          ].map((doc) => (
            <div
              key={doc.name}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span className="text-[10px] font-mono text-slate-500">{doc.size}</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-white truncate">{doc.name}</p>
                <p className="text-[11px] text-slate-400">{doc.type}</p>
              </div>
              <div className="pt-2 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-mono">Encrypted 256-bit</span>
                <span className="text-indigo-400 hover:underline cursor-pointer flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>Inspect</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Decision Modal */}
      {modalAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-white">
              <ShieldCheck className="w-6 h-6 text-rose-400" />
              <h3 className="font-bold text-base">
                Confirm Verification Action: {modalAction.toUpperCase()}
              </h3>
            </div>

            <p className="text-xs text-slate-300">
              Target Company: <strong className="text-white">{company.company_name}</strong>.
              All administrative verification decisions are stamped into immutable PostgreSQL audit logs.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                Mandatory Administrative Review Notes
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Document verification findings, government registry validation ID, or deficiency notes..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500 placeholder-slate-600"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteVerification}
                disabled={isSubmitting || !actionNotes.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Recording Decision...' : 'Commit Decision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
