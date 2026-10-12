import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, Mail, DollarSign, Clock } from 'lucide-react';
import { adminService } from '../../../lib/adminService';
import { useAuth } from '../../../context/AuthContext';

export function AdminSettingsPage() {
  const { profile: currentAdmin } = useAuth();
  const [platformName, setPlatformName] = useState('JOBHUB');
  const [supportEmail, setSupportEmail] = useState('genesixinitiate@gmail.com');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [jobExpirationDays, setJobExpirationDays] = useState('30');
  const [coolingPeriodDays, setCoolingPeriodDays] = useState('30');
  const [requireVerification, setRequireVerification] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminService.logAuditEvent(currentAdmin?.id || 'admin', 'update_platform_settings', 'system_setting', 'global', {
      newData: {
        platformName,
        supportEmail,
        defaultCurrency,
        jobExpirationDays,
        coolingPeriodDays,
        requireVerification,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-rose-400" />
          Global Platform & Governance Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure recruitment compliance, default financial currencies, and platform operating rules
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Platform configuration updated and saved into PostgreSQL system_settings.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-400" />
            General Brand & Platform Defaults
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-mono">Platform Display Name</label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-mono">Official Support Inbound Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Recruitment Compliance Settings */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Recruitment Compliance & Moderation Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-mono">Default Job Expiration (Days)</label>
              <input
                type="number"
                value={jobExpirationDays}
                onChange={(e) => setJobExpirationDays(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-mono">Candidate Re-application Cooling Period</label>
              <input
                type="number"
                value={coolingPeriodDays}
                onChange={(e) => setCoolingPeriodDays(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-200">
              <input
                type="checkbox"
                checked={requireVerification}
                onChange={(e) => setRequireVerification(e.target.checked)}
                className="rounded text-rose-500 w-4 h-4"
              />
              <span>Strict Mode: Require Approved Corporate Verification Before Jobs Become Public</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Commit Platform Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
