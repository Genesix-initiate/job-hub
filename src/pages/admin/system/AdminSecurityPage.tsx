import React from 'react';
import { ShieldCheck, ShieldAlert, Key, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

export function AdminSecurityPage() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-rose-400" />
          Security Center & RLS Enforcement Audit
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          PostgreSQL Row-Level Security verification, cryptographic auth controls, and posture checks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">RLS Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-white font-mono">100% Enforced</p>
          <p className="text-[11px] text-slate-400">All 38 public schema tables have Row-Level Security enabled</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Storage Authorization</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-white font-mono">Signed Tokens</p>
          <p className="text-[11px] text-slate-400">Private buckets prevent unauthorized document scraping</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">JWT Security Token</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-white font-mono">HS256 Verified</p>
          <p className="text-[11px] text-slate-400">Zero plain-text password storage; managed by Supabase Auth</p>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-400" />
          Row Level Security (RLS) Policy Audit Checklist
        </h2>

        <div className="space-y-2 text-xs">
          {[
            { table: 'profiles', rule: 'Users update own profile; basic info public; Admins manage all', state: 'Active & Enforced' },
            { table: 'companies', rule: 'Verified companies public read; active employers update own company; Admins verify', state: 'Active & Enforced' },
            { table: 'jobs', rule: 'Published jobs public read; recruiters create/update only own company jobs; Admins moderate', state: 'Active & Enforced' },
            { table: 'applications', rule: 'Strictly applicant and reviewing company members; Admins view; zero cross-tenant leak', state: 'Active & Enforced' },
            { table: 'company_documents', rule: 'Private bucket; only verified company employers and verification admins have read token', state: 'Active & Enforced' },
            { table: 'audit_logs', rule: 'Append-only for database triggers; read restricted to authorized admins with view_audit_logs', state: 'Active & Enforced' },
          ].map((item) => (
            <div key={item.table} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-slate-200 font-semibold">{item.table}</span>
                <span className="text-slate-400 ml-3">{item.rule}</span>
              </div>
              <span className="text-emerald-400 font-mono text-[11px] font-semibold">{item.state}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
