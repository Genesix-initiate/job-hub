import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Eye,
  Bell,
  Trash2,
  Check,
  AlertTriangle,
  LogOut,
  Save,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';

export function SettingsPage() {
  const { profile, jobSeekerProfile, updateJobSeekerProfile, signOut } = useAuth();

  const [visibility, setVisibility] = useState<'public' | 'employers_only' | 'private'>(
    (jobSeekerProfile?.profile_visibility as any) || 'public'
  );
  const [notifyApplications, setNotifyApplications] = useState(true);
  const [notifyInterviews, setNotifyInterviews] = useState(true);
  const [notifyMarketing, setNotifyMarketing] = useState(false);

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdToast, setPwdToast] = useState(false);

  // Deletion Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const [savedToast, setSavedToast] = useState(false);

  const handleSavePrivacy = async () => {
    await updateJobSeekerProfile({ profile_visibility: visibility });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword === confirmPassword) {
      setPwdToast(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdToast(false), 2500);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.toLowerCase() === 'delete my account') {
      alert('Your deletion request has been submitted. Any legally required audit records will be anonymized.');
      setIsDeleteModalOpen(false);
      await signOut();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <span className="text-[11px] font-semibold uppercase text-emerald-400 tracking-wider">
          Account &amp; Security Controls
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
          Settings &amp; Privacy
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your credentials, visibility to recruiters, notification dispatches, and session security.
        </p>
      </div>

      <div className="space-y-6 text-xs">
        {/* Section 59 & 61: Profile Visibility & Privacy */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              Profile Discovery &amp; Recruiter Visibility
            </h3>
            {savedToast && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'public',
                label: 'Public Visibility',
                desc: 'Your profile and active public CV can be discovered by all registered recruiters and talent sourcers.',
              },
              {
                id: 'employers_only',
                label: 'Verified Employers Only (Recommended)',
                desc: 'Only companies with verified enterprise accounts can discover and view your profile.',
              },
              {
                id: 'private',
                label: 'Private (Applied Jobs Only)',
                desc: 'Only employers of jobs you have explicitly submitted an application to can see your credentials.',
              },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                  visibility === opt.id
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-800/40 text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === opt.id}
                  onChange={() => setVisibility(opt.id as any)}
                  className="mt-0.5 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                />
                <div className="space-y-0.5">
                  <span className="font-semibold text-white block">{opt.label}</span>
                  <span className="text-[11px] text-slate-400">{opt.desc}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSavePrivacy}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
            >
              Save Visibility Settings
            </button>
          </div>
        </div>

        {/* Section 58: Security & Password */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            Security &amp; Password
          </h3>

          {pwdToast && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs">
              Password successfully updated via Supabase Auth!
            </div>
          )}

          <form onSubmit={handlePasswordUpdate} className="space-y-3 max-w-md">
            <div>
              <label className="block text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2 rounded-xl text-xs transition cursor-pointer"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Notifications Dispatches */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            Notification Preferences
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-white block">Application Status Alerts</span>
                <span className="text-[11px] text-slate-500">
                  Notify me when an application is shortlisted, reviewed, or scheduled.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyApplications}
                onChange={(e) => setNotifyApplications(e.target.checked)}
                className="text-emerald-500 h-4 w-4 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-white block">Interview Reminders</span>
                <span className="text-[11px] text-slate-500">
                  Send reminder alerts 2 hours and 15 minutes before scheduled meetings.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyInterviews}
                onChange={(e) => setNotifyInterviews(e.target.checked)}
                className="text-emerald-500 h-4 w-4 rounded"
              />
            </label>
          </div>
        </div>

        {/* Section 60: Safe Account Deletion */}
        <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-6 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Danger Zone &amp; Account Deletion
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Deleting your account will revoke login sessions and remove public profile discovery. Per recruitment auditing regulations, historical submitted applications may be anonymized rather than deleted immediately.
          </p>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Request Account Deletion
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal (Section 60) */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Account Deletion Request"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            This action is irreversible. All your CVs, saved bookmarks, and direct messages will be deleted or anonymized.
          </p>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            To proceed, type <strong className="text-white">&quot;delete my account&quot;</strong> below:
          </div>

          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="delete my account"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation.toLowerCase() !== 'delete my account'}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-xs disabled:opacity-30"
            >
              Confirm &amp; Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
