import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  FileCheck2,
  Clock,
  Award,
  CalendarCheck2,
  TrendingUp,
  CheckCircle2,
  Search,
  FileText,
  Briefcase,
  AlertCircle,
  Bookmark,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService, JobWithCompany } from '../../lib/dataService';
import { JobCard } from '../../components/common/JobCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SEO } from '../../components/common/SEO';

export function JobSeekerDashboard() {
  const navigate = useNavigate();
  const { profile, jobSeekerProfile } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<{ job: JobWithCompany; matchScore: number }[]>([]);
  const [latestJobs, setLatestJobs] = useState<JobWithCompany[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const firstName = profile?.first_name || 'Alex';
  const completionPct = jobSeekerProfile?.profile_completion_percentage || 85;

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const userId = profile?.id || '00000000-0000-0000-0000-000000000101';
        const [apps, jobsRes, savedRes] = await Promise.all([
          dataService.getApplications(userId),
          dataService.getJobs({ limit: 8 }),
          dataService.getSavedJobs(userId),
        ]);

        setApplications(apps);
        setLatestJobs(jobsRes.jobs.slice(0, 4));
        setSavedJobIds(new Set(savedRes.map((j) => j.id)));

        // Deterministic Match Percentage Algorithm based on user profile
        const userHeadline = (jobSeekerProfile?.professional_headline || '').toLowerCase();
        const userMode = jobSeekerProfile?.preferred_work_mode;
        const userExp = jobSeekerProfile?.years_of_experience || 5;

        const scored = jobsRes.jobs.map((job) => {
          let score = 55; // Base compatibility baseline

          // Category / Title match
          if (userHeadline.includes('frontend') && job.title.toLowerCase().includes('engineer')) {
            score += 20;
          }
          if (job.title.toLowerCase().includes('typescript') || job.title.toLowerCase().includes('react')) {
            score += 15;
          }

          // Work mode preference match
          if (userMode && job.work_mode === userMode) {
            score += 10;
          }

          // Experience fit
          if (userExp >= job.experience_min && (!job.experience_max || userExp <= job.experience_max + 2)) {
            score += 5;
          }

          return { job, matchScore: Math.min(score, 96) };
        });

        scored.sort((a, b) => b.matchScore - a.matchScore);
        setRecommendedJobs(scored.slice(0, 3));
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [profile?.id, jobSeekerProfile]);

  // Dynamic counts calculated from database records
  const stats = {
    total: applications.length,
    underReview: applications.filter((a) => a.status === 'under_review').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    interviews: applications.filter((a) => a.status === 'interview').length,
    offers: applications.filter((a) => a.status === 'selected' || a.status === 'offer').length,
    hired: applications.filter((a) => a.status === 'hired').length,
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your Job Seeker Dashboard..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <SEO
        title="Candidate Dashboard"
        description="Candidate operations dashboard: applications overview, personalized vacancy matches, and profile optimization."
        canonicalPath="/job-seeker/dashboard"
        noindex={true}
      />
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Job Seeker Hub
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              You have <strong className="text-emerald-400">{stats.interviews} upcoming interview</strong> and{' '}
              <strong className="text-white">{stats.underReview} applications</strong> currently undergoing review.
            </p>
          </div>

          {/* Profile Completion Meter */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shrink-0 min-w-[260px]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-medium">Profile Completeness</span>
              <span className="text-emerald-400 font-bold">{completionPct}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <button
              onClick={() => navigate('/job-seeker/profile')}
              className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{completionPct === 100 ? 'View Profile' : 'Complete Profile'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Statistics Section (Section 8) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white tracking-tight">Application Activity</h2>
          <span className="text-xs text-slate-400">Click any card to filter applications</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { label: 'Applications', count: stats.total, filter: 'all', icon: FileCheck2, color: 'text-blue-400' },
            { label: 'Under Review', count: stats.underReview, filter: 'under_review', icon: Clock, color: 'text-amber-400' },
            { label: 'Shortlisted', count: stats.shortlisted, filter: 'shortlisted', icon: Award, color: 'text-purple-400' },
            { label: 'Interviews', count: stats.interviews, filter: 'interview', icon: CalendarCheck2, color: 'text-emerald-400' },
            { label: 'Offers', count: stats.offers, filter: 'offer', icon: TrendingUp, color: 'text-teal-400' },
            { label: 'Hired', count: stats.hired, filter: 'hired', icon: CheckCircle2, color: 'text-emerald-300' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                onClick={() => navigate(`/job-seeker/applications?status=${item.filter}`)}
                className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl transition duration-150 cursor-pointer flex flex-col justify-between group shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition">
                    {item.label}
                  </span>
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">{item.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Jobs Section (Section 9) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2 tracking-tight">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Recommended for You
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic platform match estimate based on your headline, skills, and work mode preferences.
            </p>
          </div>
          <button
            onClick={() => navigate('/jobs')}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition self-start sm:self-auto cursor-pointer"
          >
            <span>Browse All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedJobs.map(({ job, matchScore }) => (
            <JobCard
              key={job.id}
              job={job}
              matchScore={matchScore}
              isSavedInitial={savedJobIds.has(job.id)}
            />
          ))}
        </div>
      </section>

      {/* Latest Jobs Section (Section 10) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white tracking-tight">Recently Published Openings</h2>
          <button
            onClick={() => navigate('/jobs')}
            className="text-xs font-medium text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <span>View More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {latestJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSavedInitial={savedJobIds.has(job.id)}
            />
          ))}
        </div>
      </section>

      {/* Quick Access Action Bar */}
      <section className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Need to update your CV before applying?</h4>
            <p className="text-[11px] text-slate-400">Build a tailored CV with our multi-step template builder.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/job-seeker/cv/create')}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-md shadow-emerald-500/10"
          >
            Create New CV
          </button>
          <button
            onClick={() => navigate('/job-seeker/job-alerts')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer"
          >
            Manage Job Alerts
          </button>
        </div>
      </section>
    </div>
  );
}
