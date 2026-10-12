import React, { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, CheckCircle2, Clock } from 'lucide-react';
import { adminService } from '../../../lib/adminService';
import { FeatureFlag } from '../../../types/database';
import { useAuth } from '../../../context/AuthContext';

export function AdminFeatureFlagsPage() {
  const { profile: currentAdmin } = useAuth();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [toggleMsg, setToggleMsg] = useState<string | null>(null);

  useEffect(() => {
    adminService.getFeatureFlags().then(setFlags);
  }, []);

  const handleToggle = async (key: string, current: boolean) => {
    await adminService.toggleFeatureFlag(key, !current, currentAdmin?.id || 'admin');
    setFlags(
      flags.map((f) => (f.key === key ? { ...f, is_enabled: !current, updated_at: new Date().toISOString() } : f))
    );
    setToggleMsg(`Feature flag "${key}" set to ${!current ? 'ENABLED' : 'DISABLED'}`);
    setTimeout(() => setToggleMsg(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ToggleLeft className="w-6 h-6 text-rose-400" />
          Platform Operational Feature Flags
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Dynamic runtime toggles for phased releases, candidate assessments, and billing gateways
        </p>
      </div>

      {toggleMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toggleMsg}</span>
        </div>
      )}

      <div className="space-y-3">
        {flags.map((flag) => (
          <div
            key={flag.key}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-sm">{flag.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                  {flag.key}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-rose-300">
                  {flag.category}
                </span>
              </div>
              <p className="text-xs text-slate-400">{flag.description}</p>
            </div>

            <button
              onClick={() => handleToggle(flag.key, flag.is_enabled)}
              className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
                flag.is_enabled
                  ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                  : 'text-slate-500 bg-slate-800 hover:bg-slate-700'
              }`}
              title={flag.is_enabled ? 'Disable feature' : 'Enable feature'}
            >
              {flag.is_enabled ? (
                <ToggleRight className="w-8 h-8" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
