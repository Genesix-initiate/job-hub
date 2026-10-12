import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  UserPlus,
  Clock,
  X,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { SEO } from '../../../components/common/SEO';
import { adminApprovalService } from '../../../lib/adminApprovalService';
import { AdminRoleName } from '../../../types/database';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { signInAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Request Access Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqEmail, setReqEmail] = useState('');
  const [reqName, setReqName] = useState('');
  const [reqRole, setReqRole] = useState<AdminRoleName>('content_admin');
  const [reqReason, setReqReason] = useState('');
  const [reqSubmitting, setReqSubmitting] = useState(false);

  const isSuperAdmin = adminApprovalService.isSuperAdmin(email);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrorMsg('Please enter your administrator email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your administrator security password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await signInAdmin(email, password);
    setIsLoading(false);

    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setErrorMsg(res.error || 'Access Denied: Invalid administrator credentials or unapproved email.');
    }
  };

  const handleAccessRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReqSubmitting(true);
    setErrorMsg(null);

    const res = adminApprovalService.submitAccessRequest({
      email: reqEmail,
      name: reqName,
      requestedRole: reqRole,
      reason: reqReason,
    });

    setReqSubmitting(false);
    setShowRequestModal(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setEmail(reqEmail);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <SEO
        title="Admin Governance Console | JOBHUB"
        description="JOBHUB governance and ATS console."
        canonicalPath="/admin/login"
        noindex={true}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 shadow-xl shadow-rose-600/25 mb-4">
          <ShieldAlert className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">JOBHUB Admin</h2>
        <p className="mt-1 text-xs text-rose-300 uppercase tracking-wider font-semibold">
          powered by genesix initiate group ltd
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Super Admin access &amp; delegated governance console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur space-y-6">
          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-1.5">
                <p>{errorMsg}</p>
                {errorMsg.includes('approval') && (
                  <button
                    type="button"
                    onClick={() => {
                      setReqEmail(email);
                      setShowRequestModal(true);
                    }}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 underline inline-flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Request approval from Super Admin &rarr;
                  </button>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Regular Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Administrator Email
                </label>
                {isSuperAdmin && (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Super Admin
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="genesixintiate@gmail.com or approved staff email"
                  className={`w-full bg-slate-950/80 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition ${
                    isSuperAdmin
                      ? 'border-emerald-500/60 ring-1 ring-emerald-500/30'
                      : 'border-slate-700/80 focus:border-rose-500'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  {isSuperAdmin ? 'Super Admin Security Password' : 'Security Password'}
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                'Authenticating Session...'
              ) : isSuperAdmin ? (
                <>
                  <span>Sign In as Super Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Sign In as Approved Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Request Approval Trigger */}
          <div className="pt-2 border-t border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">
              Need administrative portal access?
            </p>
            <button
              type="button"
              onClick={() => {
                setReqEmail(email);
                setShowRequestModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-rose-400" />
              <span>Submit Admin Email Request for Super Admin Approval</span>
            </button>
          </div>
        </div>
      </div>

      {/* REQUEST ADMIN ACCESS MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Request Admin Access</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Administrative permissions are strictly granted upon approval by the Super Admin (<span className="text-rose-300 font-mono">genesixintiate@gmail.com</span>).
            </p>

            <form onSubmit={handleAccessRequestSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1 font-mono">Full Name</label>
                <input
                  type="text"
                  value={reqName}
                  onChange={(e) => setReqName(e.target.value)}
                  placeholder="e.g., Tunde Adeyemi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 font-mono">Your Email Address</label>
                <input
                  type="email"
                  value={reqEmail}
                  onChange={(e) => setReqEmail(e.target.value)}
                  placeholder="staff@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 font-mono">Requested Role</label>
                <select
                  value={reqRole}
                  onChange={(e) => setReqRole(e.target.value as AdminRoleName)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="content_admin">Content Admin (Landing Page & Taxonomy CMS)</option>
                  <option value="verification_admin">Company Verification Officer</option>
                  <option value="recruitment_admin">Recruitment & Job Moderator</option>
                  <option value="finance_admin">Finance & Billing Admin</option>
                  <option value="support">Support Specialist</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 font-mono">Justification / Reason</label>
                <textarea
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder="Specify why you require this administrative tier..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reqSubmitting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Submit Request to Super Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
