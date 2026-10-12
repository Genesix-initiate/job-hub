import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  Users,
  ShieldCheck,
  Search,
  MapPin,
  ArrowRight,
  Bell,
  Mail,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Globe,
  FileText,
  UserCheck,
  ChevronRight,
  Star,
  ExternalLink,
  Layers,
  Award,
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { EmailAutomationDrawer } from '../../components/notifications/EmailAutomationDrawer';
import { dataService } from '../../lib/dataService';
import { JobWithCompany } from '../../lib/dataService';
import { useAuth } from '../../context/AuthContext';
import { landingContentService, LandingPageContent } from '../../lib/landingContentService';
import heroBgImage from '../../assets/images/talent_hero_bg_1791458165822.jpg';

export function LandingPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Landing Page CMS Content State
  const [content, setContent] = useState<LandingPageContent>(() =>
    landingContentService.getLandingContent()
  );

  // Search Bar State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Email Automation Drawer State
  const [isEmailDrawerOpen, setIsEmailDrawerOpen] = useState(false);
  const [emailDrawerDefaultTab, setEmailDrawerDefaultTab] = useState<'notifications' | 'automation'>('notifications');

  // Featured Jobs & Companies State
  const [featuredJobs, setFeaturedJobs] = useState<JobWithCompany[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const jobsRes = await dataService.getJobs({ limit: 4, sortBy: 'newest' });
        setFeaturedJobs(jobsRes.jobs);
      } catch (e) {
        console.warn('Error loading featured jobs', e);
      } finally {
        setIsLoadingJobs(false);
      }
    }
    loadData();

    // Listen to real-time landing page updates from Admin / Content Admin portal
    const handleContentUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<LandingPageContent>;
      if (customEvent.detail) {
        setContent(customEvent.detail);
      } else {
        setContent(landingContentService.getLandingContent());
      }
    };

    window.addEventListener('jobhub_landing_content_updated', handleContentUpdate);
    return () => {
      window.removeEventListener('jobhub_landing_content_updated', handleContentUpdate);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedLocation) params.set('location', selectedLocation);
    navigate(`/jobs?${params.toString()}`);
  };

  const formatSalaryDisplay = (job: JobWithCompany) => {
    if (!job.salary_min && !job.salary_max) return 'Competitive Package';
    const sym = job.salary_currency === 'NGN' ? '₦' : job.salary_currency === 'EUR' ? '€' : job.salary_currency === 'GBP' ? '£' : '$';
    const period = job.salary_period ? `/${job.salary_period}` : '';
    if (job.salary_min && job.salary_max) {
      return `${sym}${job.salary_min.toLocaleString()} - ${sym}${job.salary_max.toLocaleString()} ${period}`;
    }
    return `From ${sym}${(job.salary_min || 0).toLocaleString()} ${period}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <SEO
        title="JOBHUB | Premier Tech Talent & Hiring Infrastructure | powered by genesix initiate group ltd"
        description="JOBHUB powered by genesix initiate group ltd. Connect verified engineering leaders, Nigerian tech talents, and global tech organizations."
        canonicalPath="/"
      />

      {/* NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-white tracking-tight leading-none">{content.footer.brandName}</span>
                <span className="text-[9px] text-indigo-300 font-medium tracking-tight mt-0.5">
                  {content.footer.brandPoweredBy}
                </span>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-300">
              <Link to="/jobs" className="hover:text-white transition">
                Explore Jobs
              </Link>
              <Link to="/companies" className="hover:text-white transition">
                Top Companies
              </Link>
              <Link to="/career-resources" className="hover:text-white transition">
                Career Resources
              </Link>
              <a href="#portals-hub" className="hover:text-white text-indigo-400 transition flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Portal Hub
              </a>
              <a href="#nigeria-ecosystem" className="hover:text-white text-emerald-400 transition flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Nigeria Talent Hub
              </a>
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell with Badge */}
            <button
              onClick={() => {
                setEmailDrawerDefaultTab('notifications');
                setIsEmailDrawerOpen(true);
              }}
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Live Notification Feed & Email Automation"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
            </button>

            {/* User Session Link or Sign In */}
            {user ? (
              <button
                onClick={() => {
                  if (profile?.role === 'employer') {
                    navigate('/employer/dashboard');
                  } else if (profile?.role === 'super_admin' || profile?.role === 'admin') {
                    navigate('/admin/dashboard');
                  } else {
                    navigate('/job-seeker/dashboard');
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
              >
                <span>My Portal Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  Candidate Sign In
                </Link>
                <Link
                  to="/employer/login"
                  className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-700/60 text-indigo-300 text-xs font-semibold transition"
                >
                  Employer Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH HERO BACKGROUND PICTURE */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28 border-b border-slate-800/80">
        {/* Hero Background Image Container */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBgImage}
            alt="JOBHUB Workspace Background"
            className="w-full h-full object-cover object-center filter brightness-65 scale-105"
          />
          {/* Multi-layered cinematic gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-indigo-950/70" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/50 to-slate-950" />
        </div>

        {/* Hero Foreground Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            {/* Pill Announcement */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-indigo-500/40 backdrop-blur-md text-xs shadow-lg">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-emerald-300 font-semibold">{content.hero.badge}</span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-slate-300 font-mono text-[11px]">{content.hero.poweredBy}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              {content.hero.headlinePrefix}
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                {content.hero.headlineHighlight}
              </span>
              {content.hero.headlineSuffix}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl">
              {content.hero.subtitle}
            </p>

            {/* Live Hero Job Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2 sm:p-2.5 backdrop-blur-xl shadow-2xl shadow-indigo-950/50 flex flex-col md:flex-row items-stretch gap-2"
            >
              <div className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-slate-950/60 rounded-xl border border-slate-800">
                <Search className="w-4 h-4 text-indigo-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={content.hero.searchPlaceholder}
                  className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 md:w-56 flex items-center gap-2 px-3 py-2 bg-slate-950/60 rounded-xl border border-slate-800">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-900">All Locations</option>
                    <option value="Lagos" className="bg-slate-900">🇳🇬 Lagos, Nigeria</option>
                    <option value="Abuja" className="bg-slate-900">🇳🇬 Abuja (FCT), Nigeria</option>
                    <option value="Nigeria" className="bg-slate-900">🇳🇬 Remote Nigeria</option>
                    <option value="Remote" className="bg-slate-900">🌐 Global Remote</option>
                    <option value="United States" className="bg-slate-900">🇺🇸 United States</option>
                    <option value="London" className="bg-slate-900">🇬🇧 United Kingdom</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 whitespace-nowrap"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Jobs</span>
                </button>
              </div>
            </form>

            {/* Quick Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={content.hero.primaryCtaLink}
                className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white transition flex items-center gap-2"
              >
                <span>{content.hero.primaryCtaText}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </Link>

              <Link
                to={content.hero.secondaryCtaLink}
                className="px-4 py-2.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 border border-indigo-500/50 text-xs font-semibold text-white transition flex items-center gap-2"
              >
                <Briefcase className="w-3.5 h-3.5 text-cyan-300" />
                <span>{content.hero.secondaryCtaText}</span>
              </Link>
            </div>

            {/* Hero Trust Badges & Metrics */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 border-t border-slate-800/80 font-mono">
              <div className="bg-slate-950/60 backdrop-blur-md rounded-xl p-3 border border-slate-800/60">
                <span className="text-xl sm:text-2xl font-bold text-white">{content.hero.metric1_value}</span>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">{content.hero.metric1_label}</p>
              </div>
              <div className="bg-slate-950/60 backdrop-blur-md rounded-xl p-3 border border-slate-800/60">
                <span className="text-xl sm:text-2xl font-bold text-emerald-400">{content.hero.metric2_value}</span>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">{content.hero.metric2_label}</p>
              </div>
              <div className="bg-slate-950/60 backdrop-blur-md rounded-xl p-3 border border-slate-800/60">
                <span className="text-xl sm:text-2xl font-bold text-cyan-400">{content.hero.metric3_value}</span>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">{content.hero.metric3_label}</p>
              </div>
              <div className="bg-slate-950/60 backdrop-blur-md rounded-xl p-3 border border-slate-800/60">
                <span className="text-xl sm:text-2xl font-bold text-indigo-400">{content.hero.metric4_value}</span>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">{content.hero.metric4_label}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PORTALS HUB */}
      <section id="portals-hub" className="py-16 sm:py-24 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" /> {content.portalsHub.badge}
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {content.portalsHub.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {content.portalsHub.subtitle}
            </p>
          </div>

          {/* Portals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* PORTAL 1: JOB SEEKER / CANDIDATE */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-200 group hover:shadow-xl hover:shadow-emerald-950/20">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                    {content.portalsHub.candidateTag}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">{content.portalsHub.candidateTitle}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {content.portalsHub.candidateDescription}
                  </p>
                </div>

                {/* Sub links */}
                <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                  <Link to="/jobs" className="flex items-center justify-between text-slate-300 hover:text-emerald-400 transition py-1">
                    <span>&bull; {content.portalsHub.candidateBullet1}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link to="/companies" className="flex items-center justify-between text-slate-300 hover:text-emerald-400 transition py-1">
                    <span>&bull; {content.portalsHub.candidateBullet2}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link to="/job-seeker/cv" className="flex items-center justify-between text-slate-300 hover:text-emerald-400 transition py-1">
                    <span>&bull; {content.portalsHub.candidateBullet3}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link to="/job-seeker/applications" className="flex items-center justify-between text-slate-300 hover:text-emerald-400 transition py-1">
                    <span>&bull; {content.portalsHub.candidateBullet4}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link to="/career-resources" className="flex items-center justify-between text-slate-300 hover:text-emerald-400 transition py-1">
                    <span>&bull; {content.portalsHub.candidateBullet5}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-800 space-y-2.5">
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <span>{content.portalsHub.candidateCtaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <div className="text-center text-[11px] text-slate-400">
                  New talent? <Link to="/register" className="text-emerald-400 hover:underline font-semibold">Create Free Account</Link>
                </div>
              </div>
            </div>

            {/* PORTAL 2: EMPLOYER / RECRUITER */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 flex flex-col justify-between hover:border-indigo-500/50 transition-all duration-200 group hover:shadow-xl hover:shadow-indigo-950/20">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider font-mono">
                    {content.portalsHub.employerTag}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">{content.portalsHub.employerTitle}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {content.portalsHub.employerDescription}
                  </p>
                </div>

                {/* Sub links */}
                <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                  <Link to="/employer/jobs/create" className="flex items-center justify-between text-slate-300 hover:text-indigo-400 transition py-1">
                    <span>&bull; {content.portalsHub.employerBullet1}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link to="/employer/applicants" className="flex items-center justify-between text-slate-300 hover:text-indigo-400 transition py-1">
                    <span>&bull; {content.portalsHub.employerBullet2}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link to="/employer/pipeline" className="flex items-center justify-between text-slate-300 hover:text-indigo-400 transition py-1">
                    <span>&bull; {content.portalsHub.employerBullet3}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link to="/employer/interviews" className="flex items-center justify-between text-slate-300 hover:text-indigo-400 transition py-1">
                    <span>&bull; {content.portalsHub.employerBullet4}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link to="/employer/company" className="flex items-center justify-between text-slate-300 hover:text-indigo-400 transition py-1">
                    <span>&bull; {content.portalsHub.employerBullet5}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-800 space-y-2.5">
                <Link
                  to="/employer/login"
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <span>{content.portalsHub.employerCtaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <div className="text-center text-[11px] text-slate-400">
                  New company? <Link to="/employer/register" className="text-indigo-400 hover:underline font-semibold">Register Organization</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NIGERIA TALENT ECOSYSTEM & TECH HUBS SPOTLIGHT */}
      <section id="nigeria-ecosystem" className="py-16 sm:py-20 bg-slate-900/60 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                {content.nigeriaEcosystem.badge}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {content.nigeriaEcosystem.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {content.nigeriaEcosystem.subtitle}
              </p>
            </div>

            <Link
              to={content.nigeriaEcosystem.ctaLink}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/30 whitespace-nowrap self-start"
            >
              <span>{content.nigeriaEcosystem.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                🇳🇬
              </div>
              <h3 className="text-base font-bold text-white">{content.nigeriaEcosystem.card1_title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {content.nigeriaEcosystem.card1_desc}
              </p>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">{content.nigeriaEcosystem.card2_title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {content.nigeriaEcosystem.card2_desc}
              </p>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">{content.nigeriaEcosystem.card3_title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {content.nigeriaEcosystem.card3_desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED JOBS PREVIEW */}
      <section className="py-16 sm:py-20 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                {content.featuredJobs.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                {content.featuredJobs.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {content.featuredJobs.subtitle}
              </p>
            </div>

            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
            >
              <span>{content.featuredJobs.viewAllText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Job Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoadingJobs ? (
              <div className="col-span-2 py-12 text-center text-xs text-slate-500">
                Loading verified vacancies...
              </div>
            ) : (
              featuredJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition flex flex-col justify-between group hover:shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={job.company?.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=160'}
                          alt={job.company?.company_name}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-800 border border-slate-700"
                        />
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition line-clamp-1">
                            {job.title}
                          </h3>
                          <p className="text-xs text-slate-400">{job.company?.company_name}</p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full uppercase">
                        {job.employment_type?.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{job.city || 'Remote'}, {job.country || 'Global'}</span>
                    </div>

                    <div className="font-mono font-bold text-emerald-400">
                      {formatSalaryDisplay(job)}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Col */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-extrabold text-base text-white">{content.footer.brandName}</span>
                  <p className="text-[10px] text-indigo-400 font-medium">{content.footer.brandPoweredBy}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                {content.footer.tagline}
              </p>
            </div>

            {/* Col 1: Candidate Portal */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Candidate Portal</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/jobs" className="hover:text-white transition">Browse All Vacancies</Link></li>
                <li><Link to="/jobs?location=Nigeria" className="hover:text-white text-emerald-400 transition">Nigeria Tech Jobs</Link></li>
                <li><Link to="/companies" className="hover:text-white transition">Top Tech Companies</Link></li>
                <li><Link to="/job-seeker/cv" className="hover:text-white transition">ATS Resume Builder</Link></li>
                <li><Link to="/career-resources" className="hover:text-white transition">Career Resources</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Candidate Sign In</Link></li>
              </ul>
            </div>

            {/* Col 2: Employer Portal */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Employer Portal</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/employer/jobs/create" className="hover:text-white transition">Post a Job Opening</Link></li>
                <li><Link to="/employer/login" className="hover:text-white transition">Employer Sign In</Link></li>
                <li><Link to="/employer/register" className="hover:text-white transition">Register Organization</Link></li>
                <li><Link to="/companies" className="hover:text-white transition">Verified Employers Directory</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} {content.footer.copyright}</p>
            <div className="flex gap-4">
              <span>{content.footer.badge1}</span>
              <span>&bull;</span>
              <span>{content.footer.badge2}</span>
              <span>&bull;</span>
              <span>{content.footer.badge3}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* EMAIL AUTOMATION & NOTIFICATIONS DRAWER */}
      <EmailAutomationDrawer
        isOpen={isEmailDrawerOpen}
        onClose={() => setIsEmailDrawerOpen(false)}
        defaultTab={emailDrawerDefaultTab}
      />
    </div>
  );
}
