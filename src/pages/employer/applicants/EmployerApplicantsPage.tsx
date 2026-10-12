import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Star,
  Sparkles,
  MapPin,
  Clock,
  Briefcase,
  FileText,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Eye,
  CalendarCheck2,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { employerService } from '../../../lib/employerService';
import { Application, Profile, Job, Resume } from '../../../types/database';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export function EmployerApplicantsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { company } = useAuth();

  const [applicants, setApplicants] = useState<
    Array<Application & { applicant: Profile; job: Job; resume?: Resume; matchPercentage?: number }>
  >([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const selectedJobId = searchParams.get('jobId') || 'all';
  const selectedStage = searchParams.get('stage') || 'all';
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyStarred, setOnlyStarred] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const companyId = company?.id || '30000000-0000-0000-0000-000000000001';
    const [apps, companyJobs] = await Promise.all([
      employerService.getEmployerApplicants(companyId, {
        jobId: selectedJobId,
        stage: selectedStage,
        query: searchQuery,
        isStarred: onlyStarred,
      }),
      employerService.getEmployerJobs(companyId),
    ]);
    setApplicants(apps);
    setJobs(companyJobs);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [company?.id, selectedJobId, selectedStage, onlyStarred]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleToggleStar = async (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    await employerService.toggleStarApplicant(appId);
    setApplicants((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, is_starred: !a.is_starred } : a))
    );
  };

  const handleStageChange = (stage: string) => {
    const params = new URLSearchParams(searchParams);
    if (stage === 'all') params.delete('stage');
    else params.set('stage', stage);
    setSearchParams(params);
  };

  const handleJobChange = (jobId: string) => {
    const params = new URLSearchParams(searchParams);
    if (jobId === 'all') params.delete('jobId');
    else params.set('jobId', jobId);
    setSearchParams(params);
  };

  const stages = [
    { id: 'all', label: 'All Candidates' },
    { id: 'applied', label: 'New' },
    { id: 'under_review', label: 'Under Review' },
    { id: 'shortlisted', label: 'Shortlisted' },
    { id: 'assessment', label: 'Assessment' },
    { id: 'interview', label: 'Interview' },
    { id: 'selected', label: 'Selected' },
    { id: 'offer', label: 'Offer' },
    { id: 'hired', label: 'Hired' },
    { id: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            Applicant Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Review candidate resumes, qualification answers, stage progression, and screening metrics
          </p>
        </div>

        <button
          onClick={() => navigate('/employer/pipeline')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shrink-0 cursor-pointer"
        >
          <span>Switch to Kanban Pipeline &rarr;</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, email, skills, reference code..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </form>

          {/* Job Filter Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedJobId}
              onChange={(e) => handleJobChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 shrink-0"
            >
              <option value="all">All Company Jobs</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>

            {/* Starred Filter Button */}
            <button
              onClick={() => setOnlyStarred(!onlyStarred)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer shrink-0 ${
                onlyStarred
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5" fill={onlyStarred ? 'currentColor' : 'none'} />
              <span>Starred</span>
            </button>
          </div>
        </div>

        {/* Stage Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pt-2 border-t border-slate-800/80 scrollbar-none text-xs">
          {stages.map((st) => (
            <button
              key={st.id}
              onClick={() => handleStageChange(st.id)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                selectedStage === st.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applicant Cards List */}
      {isLoading ? (
        <div className="p-12 text-center">
          <LoadingSpinner message="Filtering candidate pool..." />
        </div>
      ) : applicants.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No candidates found matching your criteria.</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search filters or check another recruitment stage.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {applicants.map((app) => (
            <div
              key={app.id}
              onClick={() => navigate(`/employer/applications/${app.id}`)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Applicant Info */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <img
                  src={app.applicant.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={app.applicant.display_name || 'Applicant'}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-800 shrink-0"
                />

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-white hover:text-indigo-300 transition-colors">
                      {app.applicant.first_name} {app.applicant.last_name}
                    </h3>
                    <StatusBadge status={app.status} size="sm" />
                    {app.matchPercentage && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> {app.matchPercentage}% match
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-500">{app.application_reference}</span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Applied for <span className="font-semibold text-white">{app.job.title}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {app.applicant.city || 'San Francisco'}, {app.applicant.state || 'CA'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Applied {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <FileText className="w-3 h-3 text-indigo-400" />
                      {app.resume ? 'CV Attached' : 'No CV'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t border-slate-800/80 md:border-t-0">
                <button
                  type="button"
                  onClick={(e) => handleToggleStar(e, app.id)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    app.is_starred
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-500 hover:text-white'
                  }`}
                  title={app.is_starred ? 'Starred candidate' : 'Star candidate'}
                >
                  <Star className="w-4 h-4" fill={app.is_starred ? 'currentColor' : 'none'} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/employer/applications/${app.id}`);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <span>Review Application</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
