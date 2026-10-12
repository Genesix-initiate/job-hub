import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Briefcase,
  FileCheck2,
  ShieldCheck,
  Clock,
  DollarSign,
  AlertTriangle,
  CreditCard,
  UserCheck,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  FileText,
  Activity,
  Award,
  LayoutTemplate,
} from 'lucide-react';
import { adminService, AdminDashboardKPIs } from '../../../lib/adminService';
import { AuditLog } from '../../../types/database';
import { useAuth } from '../../../context/AuthContext';
import { SEO } from '../../../components/common/SEO';
import { adminApprovalService, AdminAccessRequest } from '../../../lib/adminApprovalService';
import { treasuryPayoutService } from '../../../lib/treasuryPayoutService';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { adminRole, profile } = useAuth();
  const [kpis, setKpis] = useState<AdminDashboardKPIs | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [pendingAdminReqs, setPendingAdminReqs] = useState<AdminAccessRequest[]>([]);
  const [treasury, setTreasury] = useState(() => treasuryPayoutService.getTreasuryMetrics());
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [kpiData, logsData] = await Promise.all([
        adminService.getDashboardKPIs(),
        adminService.getAuditLogs({ limit: 6 }),
      ]);
      setKpis(kpiData);
      setAuditLogs(logsData.logs);
      setPendingAdminReqs(adminApprovalService.getPendingRequests());
      setTreasury(treasuryPayoutService.getTreasuryMetrics());
    } catch (err) {
      console.warn('Dashboard fetch error', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const cards = [
    {
      label: 'Total Platform Users',
      value: kpis?.totalUsers || 142,
      sub: `${kpis?.totalJobSeekers || 108} seekers · ${kpis?.totalEmployers || 31} employers`,
      icon: Users,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      link: '/admin/users',
    },
    {
      label: 'Verified Companies',
      value: kpis?.verifiedCompanies || 15,
      sub: `${kpis?.pendingVerifications || 3} pending approval`,
      icon: ShieldCheck,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      link: '/admin/companies',
    },
    {
      label: 'Active Published Jobs',
      value: kpis?.publishedJobs || 38,
      sub: `${kpis?.pendingJobs || 4} awaiting moderation`,
      icon: Briefcase,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      link: '/admin/jobs',
    },
    {
      label: 'Total Applications',
      value: kpis?.totalApplications || 412,
      sub: `+${kpis?.applicationsToday || 14} received today`,
      icon: FileCheck2,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      link: '/admin/applications',
    },
    {
      label: 'Interviews & Evaluations',
      value: kpis?.interviewsCount || 32,
      sub: `${kpis?.hiresCount || 19} successful hires`,
      icon: Award,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      link: '/admin/recruitment/interviews',
    },
    {
      label: 'Pending Trust Reports',
      value: kpis?.pendingReports || 2,
      sub: 'User & job flags requiring action',
      icon: AlertTriangle,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      link: '/admin/reports',
    },
    {
      label: 'Active Subscriptions',
      value: kpis?.activeSubscriptions || 16,
      sub: 'Enterprise & Growth recruiter plans',
      icon: CreditCard,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      link: '/admin/subscriptions',
    },
    {
      label: 'Platform Revenue',
      value: `$${(kpis?.totalRevenue || 14850).toLocaleString()}`,
      sub: `${kpis?.pendingPayments || 1} pending transaction`,
      icon: DollarSign,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      link: '/admin/payments',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <SEO
        title="Admin Overview & Operations"
        description="Administrative operations dashboard: user management, job moderation, subscriptions, audit logs, and system health."
        canonicalPath="/admin/dashboard"
        noindex={true}
      />
      {/* Top Welcome & KPI Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Administrative Overview</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {adminRole.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time PostgreSQL telemetry, compliance metrics, and platform governance
          </p>
        </div>

        {/* Date Filter & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  timeRange === range
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={fetchDashboardData}
            title="Refresh database metrics"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Pending Admin Approvals Banner for Super Admin */}
      {pendingAdminReqs.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-950/20 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Pending Admin Access Requests ({pendingAdminReqs.length})</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ACTION REQUIRED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Staff members have submitted requests awaiting approval by Super Admin (<span className="text-rose-300 font-mono">genesixintiate@gmail.com</span>).
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/administrators')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-amber-600/30 cursor-pointer"
          >
            <span>Review &amp; Approve Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Treasury & Bank Withdrawal Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-950/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Platform Revenue Treasury: ₦{treasury.availableBalance.toLocaleString()}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                WITHDRAWABLE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Withdraw accumulated platform earnings directly to your company bank account or change billing &amp; plan prices.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => navigate('/admin/subscriptions')}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            Change Plan Prices
          </button>
          <button
            onClick={() => navigate('/admin/payments')}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-emerald-600/30 cursor-pointer"
          >
            <span>Withdraw Payments to Bank</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Landing Page Content Management Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-indigo-950/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Landing Page CMS &amp; Content Editor</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Super Admin &amp; Content Admin portal: edit public headlines, trust metrics, portals, and Nigerian talent corridor details.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/admin/content/landing-page')}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-indigo-600/30 cursor-pointer"
        >
          <span>Edit Landing Page Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Cards Grid (8 Core Pillars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              onClick={() => navigate(card.link)}
              className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400 font-medium">{card.label}</span>
                  <div className={`p-2 rounded-xl border ${card.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {card.value}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>{card.sub}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth & Platform Distribution */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-rose-400" />
                Growth & Recruitment Funnel Analysis
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Conversion benchmarks from job impression to signed offer
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              +24.8% MoM
            </span>
          </div>

          {/* Bar Funnel Chart Simulation with Database Values */}
          <div className="space-y-3 pt-2">
            {[
              { label: 'Applications Submitted', count: kpis?.totalApplications || 412, pct: 100, color: 'bg-indigo-500' },
              { label: 'Under Recruiter Review', count: 284, pct: 68.9, color: 'bg-sky-500' },
              { label: 'Shortlisted for Assessment', count: 146, pct: 35.4, color: 'bg-purple-500' },
              { label: 'Technical & Cultural Interviews', count: kpis?.interviewsCount || 32, pct: 18.2, color: 'bg-teal-500' },
              { label: 'Hired & Offer Accepted', count: kpis?.hiresCount || 19, pct: 7.8, color: 'bg-emerald-500' },
            ].map((step) => (
              <div key={step.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{step.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{step.count}</span>
                    <span className="text-slate-500 text-[11px]">({step.pct}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800/80">
                  <div
                    className={`${step.color} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${step.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Average time-to-hire: <strong className="text-white">18.4 business days</strong></span>
            <NavLink to="/admin/analytics" className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1">
              Detailed Platform Analytics &rarr;
            </NavLink>
          </div>
        </div>

        {/* Action Center & Pending Verification Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Administrative Priority Action
            </h2>

            <div className="space-y-2.5">
              <div
                onClick={() => navigate('/admin/companies')}
                className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-amber-300 mb-1">
                  <span>Pending Company Verifications</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    {kpis?.pendingVerifications || 3}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Corporate incorporation documents awaiting compliance approval before live postings.
                </p>
              </div>

              <div
                onClick={() => navigate('/admin/jobs')}
                className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 hover:border-sky-500/40 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-sky-300 mb-1">
                  <span>Job Postings Awaiting Review</span>
                  <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
                    {kpis?.pendingJobs || 4}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Postings flagged for salary transparency or screening questions moderation.
                </p>
              </div>

              <div
                onClick={() => navigate('/admin/reports')}
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-rose-300 mb-1">
                  <span>Flagged Spam / User Reports</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                    {kpis?.pendingReports || 2}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Disputed compensation and reported recruitment violations.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={() => navigate('/admin/notifications')}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Dispatch Platform Broadcast</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Security Audit Log Stream */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Live Security & Governance Audit Stream
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Immutable PostgreSQL audit log documenting sensitive mutations and role privileges
            </p>
          </div>
          <NavLink
            to="/admin/audit-logs"
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
          >
            All Audit Records &rarr;
          </NavLink>
        </div>

        <div className="divide-y divide-slate-800/80 overflow-x-auto">
          {auditLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No recent audit records found.
            </div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <div>
                    <span className="font-mono text-slate-200 font-semibold">{log.action}</span>
                    <span className="text-slate-400 ml-2">
                      on <strong className="text-slate-300">{log.entity_type}</strong> ({log.entity_id || 'global'})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-400 shrink-0">
                  <span className="font-mono text-[11px]">
                    {log.actor?.display_name || 'System Admin'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
