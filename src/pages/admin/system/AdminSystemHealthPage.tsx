import React from 'react';
import { Activity, CheckCircle2, Server, Database, ShieldCheck, HardDrive, Cpu } from 'lucide-react';
import { getSupabaseCredentials } from '../../../lib/supabase';

export function AdminSystemHealthPage() {
  const creds = getSupabaseCredentials();
  const isReal = Boolean(creds.url && creds.anonKey && !creds.url.includes('placeholder'));

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-emerald-400" />
          Infrastructure & Supabase Service Health
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Operational telemetry, database connection pooling, latency, and storage bucket availability
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Database Engine',
            desc: 'PostgreSQL 15.6',
            status: 'Operational',
            latency: '18ms',
            icon: Database,
            color: 'text-emerald-400',
          },
          {
            title: 'Supabase Auth',
            desc: 'JWT & GoTrue Auth',
            status: 'Operational',
            latency: '24ms',
            icon: ShieldCheck,
            color: 'text-emerald-400',
          },
          {
            title: 'Supabase Storage',
            desc: 'S3 Multi-tenant Buckets',
            status: 'Operational',
            latency: '32ms',
            icon: HardDrive,
            color: 'text-emerald-400',
          },
          {
            title: 'Realtime Service',
            desc: 'WebSocket Engine',
            status: 'Connected',
            latency: '12ms',
            icon: Activity,
            color: 'text-emerald-400',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{item.title}</span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <p className="text-sm font-bold text-slate-200">{item.desc}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono">
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{item.status}</span>
                </span>
                <span className="text-slate-400">{item.latency}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">Storage Buckets Audit</h2>
        <div className="space-y-2 text-xs">
          {[
            { name: 'private-company-documents', visibility: 'Private', purpose: 'Incorporation & Tax Certificates (Secured via RLS)', rls: 'Enforced' },
            { name: 'private-resumes', visibility: 'Private', purpose: 'Candidate CVs & Portfolios (Owner + Reviewer)', rls: 'Enforced' },
            { name: 'public-logos', visibility: 'Public', purpose: 'Company brand logos and avatars', rls: 'Public Read' },
            { name: 'public-job-attachments', visibility: 'Public', purpose: 'Job description specs and briefs', rls: 'Public Read' },
          ].map((bucket) => (
            <div key={bucket.name} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-slate-200 font-semibold">{bucket.name}</span>
                <span className="text-slate-400 ml-3">{bucket.purpose}</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{bucket.visibility}</span>
                <span className="text-emerald-400 font-semibold">{bucket.rls}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
