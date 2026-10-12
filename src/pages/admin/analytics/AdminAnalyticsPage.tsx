import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  FileCheck2,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

export function AdminAnalyticsPage() {
  const [range, setRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-rose-400" />
            Platform Telemetry & Comprehensive Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated conversion funnels, job liquidity, candidate retention, and MRR growth
          </p>
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          {(['7d', '30d', '90d', '1y'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                range === r ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Key Growth Ratios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Application Liquidity', val: '8.6 per Job', sub: '+1.4 vs last month', up: true },
          { label: 'Recruiter Conversion Rate', val: '78.9%', sub: 'Verified vs registered', up: true },
          { label: 'Interview Placement Rate', val: '59.3%', sub: 'Candidates getting offers', up: true },
          { label: 'Avg Monthly Revenue / Recruiter', val: '$210.00', sub: '+12% expansion', up: true },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
            <div className="text-2xl font-bold text-white font-mono">{stat.val}</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
              <TrendingUp className="w-3 h-3" />
              <span>{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Breakdown Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry Sector Distribution */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            Top Hiring Industries & Sector Volume
          </h2>

          <div className="space-y-3 pt-2 text-xs">
            {[
              { sector: 'Information Technology & Cloud', count: 24, pct: 50.0, color: 'bg-indigo-500' },
              { sector: 'Banking & Financial Services', count: 12, pct: 25.0, color: 'bg-emerald-500' },
              { sector: 'Healthcare & Biotechnology', count: 6, pct: 12.5, color: 'bg-rose-500' },
              { sector: 'Logistics & Supply Chain', count: 4, pct: 8.3, color: 'bg-amber-500' },
              { sector: 'Human Resources & Staffing', count: 2, pct: 4.2, color: 'bg-purple-500' },
            ].map((item) => (
              <div key={item.sector} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium">{item.sector}</span>
                  <span className="text-slate-400 font-mono">{item.count} jobs ({item.pct}%)</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Work Mode & Candidate Geography */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-400" />
            Work Mode Breakdown
          </h2>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400">Remote</span>
              <p className="text-xl font-bold text-white font-mono">62%</p>
              <p className="text-[10px] text-emerald-400">+5% this quarter</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400">Hybrid</span>
              <p className="text-xl font-bold text-white font-mono">26%</p>
              <p className="text-[10px] text-slate-500">Stable</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400">On-Site</span>
              <p className="text-xl font-bold text-white font-mono">12%</p>
              <p className="text-[10px] text-slate-500">Metro hubs</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 leading-relaxed">
            Candidates demonstrate a 3.4x higher click-through and application submission rate on listings featuring explicit salary compensation ranges and remote work options.
          </div>
        </div>
      </div>
    </div>
  );
}
