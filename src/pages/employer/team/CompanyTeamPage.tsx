import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  Shield,
  Mail,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { employerService } from '../../../lib/employerService';
import { Profile, EmployerProfile, CompanyInvitation } from '../../../types/database';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export function CompanyTeamPage() {
  const { company, employerProfile, profile } = useAuth();
  const [team, setTeam] = useState<Array<{ profile: Profile; employerProfile: EmployerProfile }>>([]);
  const [invitations, setInvitations] = useState<CompanyInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'recruiter' as 'employer_owner' | 'employer_admin' | 'recruiter' | 'hiring_manager',
  });

  const currentUserRole = employerProfile?.company_role || 'employer_owner';
  const canManageTeam = currentUserRole === 'employer_owner' || currentUserRole === 'employer_admin';

  useEffect(() => {
    async function loadTeamData() {
      if (company?.id) {
        setIsLoading(true);
        const [teamData, inviteData] = await Promise.all([
          employerService.getCompanyTeam(company.id),
          employerService.getCompanyInvitations(company.id),
        ]);
        setTeam(teamData);
        setInvitations(inviteData);
        setIsLoading(false);
      }
    }
    loadTeamData();
  }, [company?.id]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company?.id) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await employerService.inviteTeamMember(
        company.id,
        profile?.id || '00000000-0000-0000-0000-000000000201',
        inviteForm.email,
        inviteForm.name,
        inviteForm.role
      );

      if (res.error) {
        setErrorMsg(res.error);
        setIsSubmitting(false);
        return;
      }

      const updatedInvites = await employerService.getCompanyInvitations(company.id);
      setInvitations(updatedInvites);
      setSuccessMsg(`Invitation dispatched to ${inviteForm.email}`);
      setInviteModalOpen(false);
      setInviteForm({ name: '', email: '', role: 'recruiter' });
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    if (!company?.id) return;
    await employerService.cancelInvitation(company.id, inviteId);
    setInvitations((prev) => prev.filter((i) => i.id !== inviteId));
  };

  const roleLabels: Record<string, { label: string; desc: string; badge: string }> = {
    employer_owner: { label: 'Owner / Executive', desc: 'Full authority, verification & billing', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    employer_admin: { label: 'Company Admin', desc: 'Manage jobs, recruiters & applications', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    recruiter: { label: 'Recruiter', desc: 'Post jobs, review applicants, schedule interviews', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    hiring_manager: { label: 'Hiring Manager', desc: 'Evaluate assigned candidates & interviews', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Retrieving authorized team members & permissions..." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-indigo-400" />
            Recruiter & Team Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Control member seats, invitation statuses, and role-based access permissions
          </p>
        </div>

        {canManageTeam && (
          <button
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Role permission info note */}
      {!canManageTeam && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-400">
          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            You are signed in as a <span className="text-slate-200 font-semibold">{roleLabels[currentUserRole]?.label}</span>. Team role management and member invitation requires Owner or Admin authorization.
          </span>
        </div>
      )}

      {/* Active Team Members List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Active Members ({team.length})</h2>
          <span className="text-xs text-slate-400">Organization: {company?.company_name}</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {team.map((member) => {
            const roleInfo = roleLabels[member.employerProfile.company_role || 'recruiter'] || roleLabels.recruiter;
            const isSelf = member.profile.id === profile?.id;

            return (
              <div key={member.profile.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={member.profile.profile_photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                    alt={member.profile.display_name || 'Member'}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {member.profile.first_name} {member.profile.last_name}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-800 text-slate-300">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {member.profile.email} • {member.employerProfile.job_title || 'Recruitment Team'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleInfo.badge}`}>
                      {roleInfo.label}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">{roleInfo.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invitations Section (Section 14) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Pending Invitations ({invitations.filter((i) => i.status === 'pending').length})
          </h2>
          <span className="text-xs text-slate-400">Invitation links expire in 7 days</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {invitations.map((invite) => {
            const roleInfo = roleLabels[invite.role] || roleLabels.recruiter;
            return (
              <div key={invite.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{invite.name || invite.email}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleInfo.badge}`}>
                      {roleInfo.label}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    Invited {invite.email} • Sent {new Date(invite.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-amber-400 font-mono text-[11px] font-medium uppercase">
                    Status: {invite.status}
                  </span>
                  {canManageTeam && invite.status === 'pending' && (
                    <button
                      onClick={() => handleCancelInvite(invite.id)}
                      className="text-slate-400 hover:text-red-400 p-1.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Cancel invitation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {invitations.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-500">
              No active pending invitations.
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                Invite Team Member
              </h3>
              <button onClick={() => setInviteModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="s.jenkins@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="recruiter">Recruiter (Post jobs, view & move applicants)</option>
                  <option value="hiring_manager">Hiring Manager (Interviews & evaluations)</option>
                  <option value="employer_admin">Company Admin (Full portal access)</option>
                  {currentUserRole === 'employer_owner' && (
                    <option value="employer_owner">Company Owner (Full executive authority)</option>
                  )}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
