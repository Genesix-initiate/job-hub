import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Briefcase,
  Users,
  Kanban,
  CalendarCheck2,
  FileCheck2,
  MessageSquare,
  BellRing,
  BarChart3,
  CreditCard,
  UserCheck,
  Settings,
  LogOut,
  PlusCircle,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  User,
  AlertTriangle,
  BadgeCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface EmployerLayoutProps {
  children: React.ReactNode;
}

export function EmployerLayout({ children }: EmployerLayoutProps) {
  const { profile, employerProfile, company, signOut, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItems = [
    { name: 'Landing Page', path: '/', icon: Sparkles },
    { name: 'Dashboard', path: '/employer/dashboard', icon: LayoutDashboard },
    { name: 'Company Profile', path: '/employer/company', icon: Building2 },
    { name: 'Verification', path: '/employer/verification', icon: ShieldCheck },
    { name: 'Jobs', path: '/employer/jobs', icon: Briefcase },
    { name: 'Applicants', path: '/employer/applicants', icon: Users },
    { name: 'Pipeline', path: '/employer/pipeline', icon: Kanban },
    { name: 'Interviews', path: '/employer/interviews', icon: CalendarCheck2 },
    { name: 'Assessments', path: '/employer/assessments', icon: FileCheck2 },
    { name: 'Messages', path: '/employer/messages', icon: MessageSquare },
    { name: 'Notifications', path: '/employer/notifications', icon: BellRing },
    { name: 'Analytics', path: '/employer/analytics', icon: BarChart3 },
    { name: 'Billing', path: '/employer/billing', icon: CreditCard },
    { name: 'Team', path: '/employer/team', icon: UserCheck },
    { name: 'Settings', path: '/employer/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/employer/login');
  };

  const currentRole = employerProfile?.company_role || 'employer_owner';

  const roleLabels: Record<string, string> = {
    employer_owner: 'Owner / Executive',
    employer_admin: 'Company Admin',
    recruiter: 'Senior Recruiter',
    hiring_manager: 'Hiring Manager',
  };

  const isVerified = company?.verification_status === 'verified';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased font-sans">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Brand & Portal Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-500/20">
              JH
            </div>
            <div>
              <div className="font-bold text-white leading-tight flex items-center gap-1.5">
                JOBHUB
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  RECRUITER
                </span>
              </div>
              <p className="text-[9px] text-indigo-300 uppercase tracking-tight">
                powered by genesix initiate group ltd
              </p>
              <p className="text-xs text-slate-400 truncate max-w-[150px] mt-0.5">
                {company?.company_name || 'Organization Workspace'}
              </p>
            </div>
          </div>

          {/* Quick Post Job Button */}
          <button
            onClick={() => navigate('/employer/jobs/create')}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium py-2 px-3 rounded-lg text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a Job</span>
          </button>
        </div>

        {/* Verification Status Banner */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              {isVerified ? (
                <BadgeCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              {isVerified ? 'Verified Company' : 'Verification Required'}
            </span>
            <NavLink
              to="/employer/verification"
              className={`text-[11px] font-semibold underline underline-offset-2 ${
                isVerified ? 'text-slate-400 hover:text-slate-200' : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              {isVerified ? 'View' : 'Submit'}
            </NavLink>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive: matchActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    matchActive || isActive
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Portal Switcher & User Profile Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          {/* Verified Account Role Badge */}
          <div className="mb-2">
            <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-950/80 text-xs text-slate-300 border border-slate-800">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="truncate font-medium">{roleLabels[currentRole] || 'Verified Employer'}</span>
              </div>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* Switch to Job Seeker View */}
          <button
            onClick={() => {
              switchRole('job_seeker');
              navigate('/jobs');
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60 transition-colors mb-2"
          >
            <span>Switch to Job Seeker Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Profile Info */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2 overflow-hidden">
              <img
                src={profile?.profile_photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                alt={profile?.display_name || 'User'}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-medium text-slate-200 truncate">{profile?.display_name || profile?.first_name || 'Employer Account'}</p>
                <p className="text-[11px] text-slate-400 truncate">{company?.company_name || 'Organization'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 p-1.5 rounded hover:bg-slate-800 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
            JH
          </div>
          <div>
            <span className="font-bold text-sm text-white block leading-none">JOBHUB Recruiter</span>
            <p className="text-[8px] text-indigo-300">powered by genesix initiate group ltd</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NavLink
            to="/employer/jobs/create"
            className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
            title="Post Job"
          >
            <PlusCircle className="w-4 h-4" />
          </NavLink>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex">
          <div className="w-72 bg-slate-900 h-full border-r border-slate-800 flex flex-col p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-white text-sm">Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-3 overflow-y-auto space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                        isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  switchRole('job_seeker');
                  navigate('/jobs');
                }}
                className="w-full text-left text-xs text-slate-400 hover:text-emerald-400 py-1"
              >
                Go to Job Seeker Portal &rarr;
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 text-xs text-red-400 hover:text-red-300 py-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 bg-slate-950 flex flex-col">
        {children}
      </main>
    </div>
  );
}
