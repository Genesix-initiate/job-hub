import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  UserCheck,
  CalendarCheck2,
  Trophy,
  CheckCircle2,
  Clock,
  ArrowRight,
  PlusCircle,
  BarChart3,
  Search,
  BadgeCheck,
  AlertTriangle,
  ChevronRight,
  Filter,
  Eye,
  Star,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { employerService } from '../../../lib/employerService';
import { Job, Application, Profile, Resume } from '../../../types/database';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { SEO } from '../../../components/common/SEO';

export function EmployerDashboard() {
  const navigate = useNavigate();
  const { company, employerProfile, profile } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalJobs: 0,
    totalApplications: 0,
    newApplicants: 0,
    shortlisted: 0,
    interviews: 0,
    offers: 0,
    hired: 0,
  });
  const [recentApplications, setRecentApplications] = useState<
    Array<Application & { applicant: Profile; job: Job; resume?: Resume; matchPercentage?: number }>
  >([]);
  const [activeJobsList, setActiveJobsList] = useState<Job[]>([]);
  const [pipelineSummary, setPipelineSummary] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const companyId = company?.id || '30000000-0000-0000-0000-000000000001';
        const [analyticsData, applicants, jobs] = await Promise.all([
          employerService.getEmployerAnalytics(companyId),
          employerService.getEmployerApplicants(companyId),
          employerService.getEmployerJobs(companyId),
        ]);

        setStats({
          activeJobs: analyticsData.activeJobs,
          totalJobs: analyticsData.totalJobs,
          totalApplications: analyticsData.totalApplications,
          newApplicants: analyticsData.newApplicants,
          shortlisted: analyticsData.shortlisted,
          interviews: analyticsData.interviews,
          offers: analyticsData.offers,
          hired: analyticsData.hired,
        });

        setPipelineSummary(analyticsData.stageBreakdown);
        setRecentApplications(applicants.slice(0, 5));
        setActiveJobsList(jobs.filter((j) => j.status === 'published').slice(0, 4));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [company?.id]);

  const isVerified = company?.verification_status === 'verified';

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Aggregating recruitment metrics & applicants..." />
      </div>
    );
  }

  const pipelineStages = [
    { key: 'applied', label: 'New', count: pipelineSummary.applied || 0, color: 'border-blue-500/40 bg-blue-500/10 text-blue-300' },
    { key: 'under_review', label: 'Under Review', count: pipelineSummary.under_review || 0, color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' },
    { key: 'shortlisted', label: 'Shortlisted', count: pipelineSummary.shortlisted || 0, color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
    { key: 'assessment', label: 'Assessment', count: pipelineSummary.assessment || 0, color: 'border-purple-500/40 bg-purple-500/10 text-purple-300' },
    { key: 'interview', label: 'Interview', count: pipelineSummary.interview || 0, color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300' },
    { key: 'selected', label: 'Selected', count: pipelineSummary.selected || 0, color: 'border-teal-500/40 bg-teal-500/10 text-teal-300' },
    { key: 'offer', label: 'Offer', count: pipelineSummary.offer || 0, color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
    { key: 'hired', label: 'Hired', count: pipelineSummary.hired || 0, color: 'border-green-500/40 bg-green-500/10 text-green-300' },
    { key: 'rejected', label: 'Rejected', count: pipelineSummary.rejected || 0, color: 'border-rose-500/40 bg-rose-500/10 text-rose-300' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <SEO
        title="Employer Recruitment Console"
        description="Employer dashboard: manage enterprise job vacancies, candidate pipelines, interview workflows, and team collaboration."
        canonicalPath="/employer/dashboard"
        noindex={true}
      />
      {/* 1. HEADER SECTION (Section 5) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <img
            src={company?.logo_url || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=150'}
            alt={company?.company_name || 'Company'}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-800 shrink-0 bg-slate-900 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {company?.company_name || 'My Organization'}
              </h1>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <BadgeCheck className="w-3.5 h-3.5" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <AlertTriangle className="w-3.5 h-3.5" /> Pending Verification
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Welcome back, <span className="text-slate-200 font-medium">{profile?.display_name || profile?.first_name || 'Recruiter'}</span> ({employerProfile?.job_title || 'Hiring Lead'})
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/employer/jobs/create')}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium px-4 py-2.5 rounded-xl text-sm shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a Job</span>
          </button>
        </div>
      </div>

      {/* Verification Alert if Not Verified (Section 12) */}
      {!isVerified && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">Your company must be verified before you can publish jobs</h4>
              <p className="text-xs text-slate-400">
                Submit your business registration documents to activate your employer account.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/employer/verification')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shrink-0 cursor-pointer"
          >
            Complete Verification
          </button>
        </div>
      )}

      {/* 2. STATS OVERVIEW CARDS (Section 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Active Jobs</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.activeJobs}</div>
          <div className="mt-1 text-[11px] text-slate-500">{stats.totalJobs} total jobs</div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Applications</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.totalApplications}</div>
          <div className="mt-1 text-[11px] text-cyan-400 font-medium">+{stats.newApplicants} new</div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>New Applicants</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.newApplicants}</div>
          <div className="mt-1 text-[11px] text-slate-500">Unreviewed</div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Shortlisted</span>
            <Star className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.shortlisted}</div>
          <div className="mt-1 text-[11px] text-amber-400">High match</div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Interviews</span>
            <CalendarCheck2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.interviews}</div>
          <div className="mt-1 text-[11px] text-slate-500">Scheduled</div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Offers</span>
            <Trophy className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.offers}</div>
          <div className="mt-1 text-[11px] text-emerald-400">Sent to talent</div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Hired</span>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-green-400">{stats.hired}</div>
          <div className="mt-1 text-[11px] text-slate-500">Talent onboarded</div>
        </div>
      </div>

      {/* 3. QUICK ACTION BUTTONS (Section 6) */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2">Quick Actions:</span>
        <button
          onClick={() => navigate('/employer/jobs/create')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" /> POST A JOB
        </button>
        <button
          onClick={() => navigate('/employer/applicants')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
        >
          <Users className="w-3.5 h-3.5" /> VIEW APPLICANTS
        </button>
        <button
          onClick={() => navigate('/employer/jobs')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
        >
          <Briefcase className="w-3.5 h-3.5" /> MANAGE JOBS
        </button>
        <button
          onClick={() => navigate('/employer/interviews')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
        >
          <CalendarCheck2 className="w-3.5 h-3.5" /> SCHEDULE INTERVIEW
        </button>
        <button
          onClick={() => navigate('/employer/analytics')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
        >
          <BarChart3 className="w-3.5 h-3.5" /> VIEW ANALYTICS
        </button>
      </div>

      {/* 4. RECRUITMENT PIPELINE SUMMARY (Section 8) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Recruitment Pipeline Summary
            </h2>
            <p className="text-xs text-slate-400">Click any recruitment stage to view candidates</p>
          </div>
          <button
            onClick={() => navigate('/employer/pipeline')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>Open Kanban Board</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {pipelineStages.map((stage) => (
            <button
              key={stage.key}
              onClick={() => navigate(`/employer/applicants?stage=${stage.key}`)}
              className={`p-3 rounded-xl border text-center transition-all hover:scale-[1.02] cursor-pointer ${stage.color}`}
            >
              <div className="text-xl font-bold">{stage.count}</div>
              <div className="text-[11px] font-medium mt-1 truncate">{stage.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. TWO COLUMN SECTION: RECENT APPLICATIONS & ACTIVE JOBS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications (Section 7) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Recent Applications</h2>
              <p className="text-xs text-slate-400">Candidates who applied recently to your open positions</p>
            </div>
            <NavLink
              to="/employer/applicants"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>View All ({stats.totalApplications})</span>
              <ChevronRight className="w-4 h-4" />
            </NavLink>
          </div>

          <div className="space-y-3">
            {recentApplications.map((app) => (
              <div
                key={app.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={app.applicant.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={app.applicant.display_name || 'Applicant'}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {app.applicant.first_name} {app.applicant.last_name}
                      </span>
                      {app.matchPercentage && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> {app.matchPercentage}% match
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Applied for <span className="text-slate-300 font-medium">{app.job.title}</span> • {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <StatusBadge status={app.status} size="sm" />
                  <button
                    onClick={() => navigate(`/employer/applications/${app.id}`)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    View Application
                  </button>
                </div>
              </div>
            ))}

            {recentApplications.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                No recent applications received yet.
              </div>
            )}
          </div>
        </div>

        {/* Active Jobs Mini List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Published Jobs</h2>
              <p className="text-xs text-slate-400">Accepting applications</p>
            </div>
            <NavLink
              to="/employer/jobs"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>Manage</span>
              <ChevronRight className="w-4 h-4" />
            </NavLink>
          </div>

          <div className="space-y-2.5">
            {activeJobsList.map((job) => (
              <div
                key={job.id}
                onClick={() => navigate(`/employer/jobs/${job.id}`)}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-white truncate max-w-[190px]">{job.title}</h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{job.city}, {job.state || job.country}</span>
                  <span className="text-slate-300 font-medium">
                    ${((job.salary_min || 120000) / 1000).toFixed(0)}k - ${((job.salary_max || 160000) / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
            ))}

            {activeJobsList.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-500">
                <p className="mb-2">You haven't published any jobs yet.</p>
                <button
                  onClick={() => navigate('/employer/jobs/create')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-xs cursor-pointer"
                >
                  Post First Job
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
