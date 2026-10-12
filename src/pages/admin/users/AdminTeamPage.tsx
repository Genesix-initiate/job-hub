import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Mail,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  AlertCircle,
  Filter,
  Check,
  X,
  Trash2,
} from 'lucide-react';
import { adminService } from '../../../lib/adminService';
import { AdminUser, AdminRoleName } from '../../../types/database';
import { useAuth } from '../../../context/AuthContext';
import { adminApprovalService, AdminAccessRequest } from '../../../lib/adminApprovalService';

export function AdminTeamPage() {
  const { adminRole, profile: currentAdmin } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [requests, setRequests] = useState<AdminAccessRequest[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const [showDirectAuthModal, setShowDirectAuthModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<AdminRoleName>('content_admin');
  const [newName, setNewName] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = () => {
    adminService.getAdministrators().then(setAdmins);
    setRequests(adminApprovalService.getAllRequests());
  };

  useEffect(() => {
    loadData();

    const handleReqUpdate = () => {
      setRequests(adminApprovalService.getAllRequests());
    };

    window.addEventListener('jobhub_admin_requests_updated', handleReqUpdate);
    return () => {
      window.removeEventListener('jobhub_admin_requests_updated', handleReqUpdate);
    };
  }, []);

  const handleApprove = (reqId: string, role?: AdminRoleName) => {
    adminApprovalService.approveRequest(reqId, role);
    setSuccessMsg('Admin access approved successfully. The user can now access their authorized portal.');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleReject = (reqId: string) => {
    adminApprovalService.rejectRequest(reqId);
    setSuccessMsg('Admin access request declined.');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleRevoke = (reqIdOrEmail: string) => {
    adminApprovalService.revokeAccess(reqIdOrEmail);
    setSuccessMsg('Administrative access revoked.');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleDirectAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    adminApprovalService.directAuthorizeEmail(newEmail, newName, newRole);

    setShowDirectAuthModal(false);
    setNewEmail('');
    setNewName('');
    setSuccessMsg(`Administrator credentials pre-authorized for ${newEmail}`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const filteredRequests =
    selectedFilter === 'all'
      ? requests
      : requests.filter((r) => r.status === selectedFilter);

  return (
    <div className="space-y-6 animate-in fade-in font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            Admin Approvals &amp; RBAC Authority
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Super Administrator (<span className="text-rose-300 font-mono">genesixintiate@gmail.com</span>) approval queue and staff privileges
          </p>
        </div>

        <button
          onClick={() => setShowDirectAuthModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Directly Authorize Admin Email</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Super Admin Status Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Designated Super Administrator</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Root Authority
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Super Admin access is exclusively accessible by{' '}
              <code className="text-rose-300 font-mono font-semibold">genesixintiate@gmail.com</code> with secure Super Admin password authentication.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Only the Super Admin can grant approval to other administrative email requests.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center font-mono">
            <span className="text-xs text-amber-400 font-bold">{pendingRequests.length}</span>
            <p className="text-[10px] text-slate-400">Pending Approvals</p>
          </div>
        </div>
      </div>

      {/* PENDING APPROVALS QUEUE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Pending Admin Access Requests ({pendingRequests.length})
          </h2>
          <span className="text-xs text-slate-400">
            Submitted requests awaiting Super Admin decision
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
            <p className="text-xs font-semibold text-slate-200">No pending admin email requests</p>
            <p className="text-[11px] text-slate-400">All submitted administrative requests have been reviewed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3 shadow-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">{req.name}</h4>
                    <p className="text-xs font-mono text-amber-300">{req.email}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {req.requestedRole.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Reason:</span>
                  {req.reason || 'No specific justification provided.'}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Requested: {new Date(req.requestedAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3 h-3 text-rose-400" />
                      <span>Decline</span>
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-sm shadow-emerald-600/30"
                    >
                      <Check className="w-3 h-3" />
                      <span>Approve Access</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ALL ADMIN ACCESS REQUESTS & DELEGATED EMAILS */}
      <div className="space-y-3 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Admin Email Delegation &amp; Audit Log
          </h2>

          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({requests.length})
            </button>
            <button
              onClick={() => setSelectedFilter('approved')}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedFilter === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Approved ({requests.filter((r) => r.status === 'approved').length})
            </button>
            <button
              onClick={() => setSelectedFilter('pending')}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedFilter === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending ({pendingRequests.length})
            </button>
            <button
              onClick={() => setSelectedFilter('rejected')}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedFilter === 'rejected' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Declined ({requests.filter((r) => r.status === 'rejected').length})
            </button>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">Staff Email</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Authorized Role</th>
                  <th className="py-3 px-4">Approval Status</th>
                  <th className="py-3 px-4">Super Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {/* Super Admin Root Record */}
                <tr className="bg-rose-950/20 hover:bg-rose-950/30 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-rose-300">genesixintiate@gmail.com</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-500/30 text-rose-200 uppercase font-mono">
                        Super Admin
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-white font-semibold">Genesix Initiate Group</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Super Admin (Root)
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-400 bg-emerald-500/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Permanent Authority
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                    Super Admin Password
                  </td>
                </tr>

                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-200">
                      {req.email}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {req.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {req.requestedRole.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {req.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-emerald-400 bg-emerald-500/10">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved by Super Admin
                        </span>
                      ) : req.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-amber-400 bg-amber-500/10">
                          <Clock className="w-3 h-3" />
                          Pending Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-rose-400 bg-rose-500/10">
                          <XCircle className="w-3 h-3" />
                          Declined / Revoked
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {req.status === 'approved' ? (
                        <button
                          onClick={() => handleRevoke(req.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Revoke Access</span>
                        </button>
                      ) : req.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition cursor-pointer"
                        >
                          Re-authorize
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DIRECT AUTHORIZE MODAL */}
      {showDirectAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Authorize Admin Email Directly</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDirectAuthModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              As Super Admin, pre-authorize an administrator email so they can log in immediately.
            </p>

            <form onSubmit={handleDirectAuthorize} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1 font-mono">Staff Member Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Chioma Adeyemi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 font-mono">Staff Email to Authorize</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="content@jobhub.platform or new.staff@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 font-mono">Administrative Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminRoleName)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="content_admin">Content Admin (Landing Page CMS & Taxonomies)</option>
                  <option value="verification_admin">Company Verification Officer</option>
                  <option value="recruitment_admin">Recruitment & Job Moderator</option>
                  <option value="finance_admin">Finance & Billing Admin</option>
                  <option value="moderator">Trust & Moderator</option>
                  <option value="support">Support Specialist</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDirectAuthModal(false)}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition cursor-pointer"
                >
                  Authorize Admin Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
