import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Bookmark,
  FileCheck2,
  FileText,
  CalendarCheck2,
  MessageSquare,
  BellRing,
  Award,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Server,
  User,
  Sparkles,
  ChevronRight,
  Database,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';

export function JobSeekerLayout({ children }: { children: React.ReactNode }) {
  const { profile, jobSeekerProfile, signOut, isSupabaseConnected } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(2);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(1);

  useEffect(() => {
    if (profile?.id) {
      dataService.getNotifications(profile.id).then((notifs) => {
        const unread = notifs.filter((n) => !n.read_at).length;
        setUnreadNotifsCount(unread);
      });
    }
  }, [profile?.id, location.pathname]);

  const completionPct = jobSeekerProfile?.profile_completion_percentage || 85;

  const navLinks = [
    { to: '/', label: 'Landing Page', icon: Sparkles },
    { to: '/job-seeker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/jobs', label: 'Find Jobs', icon: Search },
    { to: '/job-seeker/saved-jobs', label: 'Saved Jobs', icon: Bookmark },
    { to: '/job-seeker/applications', label: 'Applications', icon: FileCheck2 },
    { to: '/job-seeker/cv', label: 'My CV', icon: FileText },
    { to: '/job-seeker/interviews', label: 'Interviews', icon: CalendarCheck2 },
    {
      to: '/job-seeker/messages',
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    { to: '/job-seeker/job-alerts', label: 'Job Alerts', icon: BellRing },
    { to: '/job-seeker/assessments', label: 'Assessments', icon: Award },
    { to: '/job-seeker/career-resources', label: 'Career Resources', icon: BookOpen },
    {
      to: '/job-seeker/notifications',
      label: 'Notifications',
      icon: BellRing,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
    },
    { to: '/job-seeker/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900/60 border-r border-slate-800/80 flex-col justify-between shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-5">
          {/* Logo */}
          <div
            onClick={() => navigate('/job-seeker/dashboard')}
            className="flex items-center gap-3 cursor-pointer group mb-6"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                JOBHUB
              </span>
              <span className="text-[9px] uppercase font-semibold text-emerald-400 tracking-wider block leading-tight">
                powered by genesix initiate group ltd
              </span>
            </div>
          </div>

          {/* Profile Completion Widget */}
          <div
            onClick={() => navigate('/job-seeker/profile')}
            className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 mb-5 hover:border-emerald-500/40 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Profile
              </span>
              <span className="text-emerald-400 font-semibold">{completionPct}% Complete</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            {completionPct < 100 && (
              <span className="text-[10px] text-slate-500 group-hover:text-slate-400 flex items-center gap-0.5 mt-1.5">
                Complete profile for 3x recruiter reach
                <ChevronRight className="w-3 h-3" />
              </span>
            )}
          </div>

          {/* Nav List */}
          <nav className="space-y-1 text-xs">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card, Recruiter Portal Switcher & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
          <NavLink
            to="/employer/dashboard"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all group"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span>Recruiter Portal</span>
            </div>
            <span className="text-[10px] text-indigo-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </NavLink>

          <div className="flex items-center justify-between">
            <div
              onClick={() => navigate('/job-seeker/profile')}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition overflow-hidden"
            >
              <img
                src={
                  profile?.profile_photo_url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                }
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
              />
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">
                  {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : 'Alex Morgan'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{profile?.email || 'jobseeker@example.com'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden border-b border-slate-800 bg-slate-900/80 backdrop-blur px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div onClick={() => navigate('/job-seeker/dashboard')} className="flex items-center gap-2 cursor-pointer">
          <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight leading-none block">JOBHUB</span>
            <span className="text-[8px] text-emerald-400 font-semibold tracking-tight">powered by genesix initiate group ltd</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/job-seeker/notifications')}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 relative"
          >
            <BellRing className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5" />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer (When hamburger clicked) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2 z-40">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium ${
                    isActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-rose-400 w-full"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Dynamic Viewport */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Mobile Bottom Navigation (Prompt 2 Section 6: HOME, JOBS, APPLICATIONS, MESSAGES, PROFILE) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800/90 px-2 py-1.5 flex items-center justify-around text-[10px] font-medium text-slate-400">
        <NavLink
          to="/job-seeker/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-lg transition ${
              isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>HOME</span>
        </NavLink>

        <NavLink
          to="/jobs"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-lg transition ${
              isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`
          }
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>JOBS</span>
        </NavLink>

        <NavLink
          to="/job-seeker/applications"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-lg transition ${
              isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`
          }
        >
          <FileCheck2 className="w-5 h-5 mb-0.5" />
          <span>APPLICATIONS</span>
        </NavLink>

        <NavLink
          to="/job-seeker/messages"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-lg transition relative ${
              isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`
          }
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span>MESSAGES</span>
          {unreadMessagesCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1 right-3" />
          )}
        </NavLink>

        <NavLink
          to="/job-seeker/profile"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-lg transition ${
              isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`
          }
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>PROFILE</span>
        </NavLink>
      </nav>
    </div>
  );
}
