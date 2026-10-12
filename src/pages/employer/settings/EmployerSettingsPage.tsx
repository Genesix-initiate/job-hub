import React, { useState } from 'react';
import {
  Settings,
  User,
  Building2,
  Bell,
  Shield,
  CreditCard,
  Lock,
  Save,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export function EmployerSettingsPage() {
  const { profile, company, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'security' | 'privacy'>('account');
  const [saved, setSaved] = useState(false);

  // Account form
  const [accountForm, setAccountForm] = useState({
    firstName: profile?.first_name || 'Marcus',
    lastName: profile?.last_name || 'Vance',
    email: profile?.email || 'marcus.vance@apexcloud.example.com',
    phone: profile?.phone || '+1 (555) 890-1234',
  });

  // Notification toggles
  const [notifSettings, setNotifSettings] = useState({
    newApplication: true,
    candidateMessage: true,
    interviewResponse: true,
    assessmentCompleted: true,
    jobExpiry: true,
  });

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      first_name: accountForm.firstName,
      last_name: accountForm.lastName,
      display_name: `${accountForm.firstName} ${accountForm.lastName}`,
      phone: accountForm.phone,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-400" />
          Employer Account & Security Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Configure personal credentials, notifications, two-factor authentication, and privacy preferences
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('account')}
          className={`px-3 py-2 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'account' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Account Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-3 py-2 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'notifications' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notifications</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3 py-2 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'security' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Security & 2FA</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'account' && (
        <form onSubmit={handleSaveAccount} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Recruiter Identity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
              <input
                type="text"
                required
                value={accountForm.firstName}
                onChange={(e) => setAccountForm({ ...accountForm, firstName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={accountForm.lastName}
                onChange={(e) => setAccountForm({ ...accountForm, lastName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
              <input
                type="email"
                disabled
                value={accountForm.email}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Work Phone</label>
              <input
                type="tel"
                value={accountForm.phone}
                onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Email & System Alerts</h3>
          <div className="space-y-3">
            {[
              { key: 'newApplication', label: 'New Application Received', desc: 'Notify immediately when candidates apply to company jobs' },
              { key: 'candidateMessage', label: 'Candidate Direct Messages', desc: 'Send alert when a candidate responds in the chat interface' },
              { key: 'interviewResponse', label: 'Interview Confirmations', desc: 'Notify when candidates accept or reschedule video meetings' },
              { key: 'assessmentCompleted', label: 'Assessment Completed', desc: 'Alert when candidates complete automated technical testing' },
              { key: 'jobExpiry', label: 'Job Expiry Warnings', desc: 'Receive notice 3 days before any job application deadline expires' },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-start justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-white block">{item.label}</span>
                  <span className="text-[11px] text-slate-400">{item.desc}</span>
                </div>
                <input
                  type="checkbox"
                  checked={(notifSettings as any)[item.key]}
                  onChange={(e) => setNotifSettings({ ...notifSettings, [item.key]: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-0 mt-1"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Access Security & Multi-Factor</h3>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Smartphone className="w-8 h-8 text-indigo-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Two-Factor Authentication (TOTP / SMS)</h4>
                <p className="text-[11px] text-slate-400">Add an extra layer of protection using Google Authenticator or hardware keys</p>
              </div>
            </div>
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Configure 2FA
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-white">Active Recruiter Session</h4>
            <p className="text-[11px] text-slate-400">
              Authenticated via Supabase Auth session token. Secure Row Level Security policies applied automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
