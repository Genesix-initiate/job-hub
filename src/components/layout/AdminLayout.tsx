import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileCheck2,
  AlertTriangle,
  LifeBuoy,
  BookOpen,
  BellRing,
  CreditCard,
  BarChart3,
  ScrollText,
  ShieldCheck,
  Settings,
  ToggleLeft,
  Activity,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  UserCheck,
  Download,
  Search,
  Sparkles,
  Layers,
  Database,
  LayoutTemplate,
  DollarSign,
  Zap,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminRoleName } from '../../types/database';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { profile, adminRole, signOut, hasAdminPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewAsBannerDismissed, setViewAsBannerDismissed] = useState(false);

  const roleLabels: Record<AdminRoleName, string> = {
    super_admin: 'Super Admin (Full Root Access)',
    admin: 'Platform Admin',
    recruitment_admin: 'Recruitment & Job Admin',
    moderator: 'Content & Trust Moderator',
    verification_admin: 'Company Verification Officer',
    finance_admin: 'Finance & Billing Admin',
    support: 'Customer Support Specialist',
    support_admin: 'Support Lead & Escalations',
    content_manager: 'Content & Taxonomy Manager',
    content_admin: 'Career Resources Editor',
  };

  const navSections = [
    {
      title: 'CORE OVERSIGHT',
      items: [
        { name: 'Landing Page', path: '/', icon: Sparkles, perm: 'view_dashboard' },
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, perm: 'view_dashboard' },
        { name: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3, perm: 'view_dashboard' },
      ],
    },
    {
      title: 'USER & ENTITY GOVERNANCE',
      items: [
        { name: 'All Users', path: '/admin/users', icon: Users, perm: 'manage_users' },
        { name: 'Job Seekers', path: '/admin/job-seekers', icon: UserCheck, perm: 'view_job_seekers' },
        { name: 'Employers & Teams', path: '/admin/employers', icon: Building2, perm: 'manage_employers' },
        { name: 'Companies & Verification', path: '/admin/companies', icon: ShieldCheck, perm: 'verify_companies' },
        { name: 'Admin Approvals & Team', path: '/admin/administrators', icon: ShieldAlert, perm: 'manage_admins' },
      ],
    },
    {
      title: 'RECRUITMENT & OPERATIONS',
      items: [
        { name: 'Job Moderation', path: '/admin/jobs', icon: Briefcase, perm: 'moderate_jobs' },
        { name: 'Applications Oversight', path: '/admin/applications', icon: FileCheck2, perm: 'view_applications' },
        { name: 'Interviews Oversight', path: '/admin/recruitment/interviews', icon: Activity, perm: 'view_applications' },
        { name: 'Reports & Complaints', path: '/admin/reports', icon: AlertTriangle, perm: 'resolve_complaints' },
        { name: 'Support Tickets', path: '/admin/support', icon: LifeBuoy, perm: 'resolve_complaints' },
      ],
    },
    {
      title: 'CONTENT & COMMUNICATIONS',
      items: [
        { name: 'Landing Page CMS', path: '/admin/content/landing-page', icon: LayoutTemplate, perm: 'manage_content' },
        { name: 'Job Categories', path: '/admin/content/job-categories', icon: Layers, perm: 'manage_categories' },
        { name: 'Skills Taxonomy', path: '/admin/content/skills', icon: Sparkles, perm: 'manage_categories' },
        { name: 'Career Resources CMS', path: '/admin/content/career-resources', icon: BookOpen, perm: 'manage_content' },
        { name: 'Broadcast Alerts', path: '/admin/notifications', icon: BellRing, perm: 'send_broadcasts' },
        { name: 'Automated Email Engine', path: '/admin/notifications/email-automation', icon: Zap, perm: 'send_broadcasts' },
      ],
    },
    {
      title: 'FINANCE & COMMERCE',
      items: [
        { name: 'Subscriptions & Pricing', path: '/admin/subscriptions', icon: CreditCard, perm: 'manage_finance' },
        { name: 'Withdrawals & Payments', path: '/admin/payments', icon: DollarSign, perm: 'manage_finance' },
        { name: 'Tax Invoices', path: '/admin/invoices', icon: ScrollText, perm: 'manage_finance' },
      ],
    },
    {
      title: 'SYSTEM & SECURITY',
      items: [
        { name: 'Audit Logs', path: '/admin/audit-logs', icon: ScrollText, perm: 'view_audit_logs' },
        { name: 'Security Center', path: '/admin/security', icon: ShieldAlert, perm: 'manage_system_settings' },
        { name: 'System Health', path: '/admin/system/health', icon: Activity, perm: 'manage_system_settings' },
        { name: 'Database & Supabase Console', path: '/backend-console', icon: Database, perm: 'manage_system_settings' },
        { name: 'Platform Settings', path: '/admin/settings', icon: Settings, perm: 'manage_system_settings' },
      ],
    },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased font-sans">
      {/* Top Banner for Admin View Mode */}
      {!viewAsBannerDismissed && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-rose-950/90 border-b border-rose-800 text-rose-200 px-3 py-1.5 text-xs flex items-center justify-between">
          <span className="font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            ADMIN CONSOLE — {roleLabels[adminRole] || adminRole}
          </span>
          <button
            onClick={() => setViewAsBannerDismissed(true)}
            className="text-rose-400 hover:text-white text-xs font-mono"
          >
            &times;
          </button>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 border-r border-slate-800 shrink-0 sticky top-0 h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
        {/* Brand & Portal Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-rose-600/20">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-base leading-tight flex items-center gap-1.5">
                JOBHUB
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  ADMIN
                </span>
              </div>
              <p className="text-[9px] text-rose-300 uppercase tracking-tight">
                powered by genesix initiate group ltd
              </p>
            </div>
          </div>

          {/* Active Admin Role Badge (No Demo Switching) */}
          <div className="mt-3">
            <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0"></span>
                <span className="truncate font-medium">{roleLabels[adminRole] || adminRole}</span>
              </div>
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-3 space-y-4">
          {navSections.map((sec) => {
            const authorizedItems = sec.items.filter((item) => hasAdminPermission(item.perm));
            if (authorizedItems.length === 0) return null;

            return (
              <div key={sec.title}>
                <p className="px-2.5 mb-1.5 text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                  {sec.title}
                </p>
                <div className="space-y-0.5">
                  {authorizedItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive: matchActive }) =>
                          `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            matchActive || isActive
                              ? 'bg-rose-600/15 text-rose-300 border border-rose-500/25 shadow-sm'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                          }`
                        }
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                        <span className="truncate">{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer: Authenticated Admin Profile & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <img
                src={profile?.profile_photo_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'}
                alt="Admin Profile"
                className="w-7 h-7 rounded-full object-cover ring-1 ring-rose-500 shrink-0"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {profile?.display_name || 'Super Admin'}
                </p>
                <p className="text-[10px] text-rose-400 font-mono truncate">
                  {profile?.email || 'genesixintiate@gmail.com'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white text-xs">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm text-white block leading-none">JOBHUB Admin</span>
            <p className="text-[8px] text-rose-300">powered by genesix initiate group ltd</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-4 max-h-[85vh] overflow-y-auto z-40">
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Session Role:</span>
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              {roleLabels[adminRole] || adminRole}
            </span>
          </div>

          <div className="space-y-1">
            {navSections.flatMap((s) => s.items).filter((i) => hasAdminPermission(i.perm)).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                <item.icon className="w-4 h-4 text-slate-400" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-mono">
              {profile?.email || 'genesixintiate@gmail.com'}
            </span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="text-rose-400 hover:text-rose-300 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto">
        {/* Top Header Bar for Desktop */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-slate-900/60 backdrop-blur border-b border-slate-800/80 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-medium text-slate-400">
              JOBHUB GOVERNANCE CONSOLE
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
              AUDITED SESSION
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Export Audit Trail Button */}
            <button
              onClick={async () => {
                const csv = await (await import('../../lib/adminService')).adminService.exportDataset('audit_logs', profile?.id || 'admin');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700/80 transition cursor-pointer"
              title="Download recent security audit log CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Audit CSV</span>
            </button>

            {/* Platform Status Indicator */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-800 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-400 font-mono text-[11px]">PostgreSQL 15 / RLS ACTIVE</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
