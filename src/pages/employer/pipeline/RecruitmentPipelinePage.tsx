import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Kanban,
  Star,
  Users,
  ChevronRight,
  Filter,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  CalendarCheck2,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { employerService } from '../../../lib/employerService';
import { Application, Profile, Job, Resume, ApplicationStatus } from '../../../types/database';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export function RecruitmentPipelinePage() {
  const navigate = useNavigate();
  const { company, profile } = useAuth();

  const [applicants, setApplicants] = useState<
    Array<Application & { applicant: Profile; job: Job; resume?: Resume; matchPercentage?: number }>
  >([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  const columns: Array<{ status: ApplicationStatus; title: string; color: string }> = [
    { status: 'applied', title: 'New', color: 'border-blue-500/30 bg-blue-500/5' },
    { status: 'under_review', title: 'Under Review', color: 'border-cyan-500/30 bg-cyan-500/5' },
    { status: 'shortlisted', title: 'Shortlisted', color: 'border-amber-500/30 bg-amber-500/5' },
    { status: 'assessment', title: 'Assessment', color: 'border-purple-500/30 bg-purple-500/5' },
    { status: 'interview', title: 'Interview', color: 'border-indigo-500/30 bg-indigo-500/5' },
    { status: 'selected', title: 'Selected', color: 'border-teal-500/30 bg-teal-500/5' },
    { status: 'offer', title: 'Offer Made', color: 'border-emerald-500/30 bg-emerald-500/5' },
    { status: 'hired', title: 'Hired', color: 'border-green-500/30 bg-green-500/5' },
    { status: 'rejected', title: 'Rejected', color: 'border-rose-500/30 bg-rose-500/5' },
  ];

  const loadData = async () => {
    setIsLoading(true);
    const companyId = company?.id || '30000000-0000-0000-0000-000000000001';
    const [allApps, companyJobs] = await Promise.all([
      employerService.getEmployerApplicants(companyId, {
        jobId: selectedJobId,
      }),
      employerService.getEmployerJobs(companyId),
    ]);
    setApplicants(allApps);
    setJobs(companyJobs);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [company?.id, selectedJobId]);

  const handleMoveCandidate = async (appId: string, newStage: ApplicationStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    await employerService.updateApplicationStage(
      appId,
      newStage,
      profile?.id || '00000000-0000-0000-0000-000000000201',
      `Candidate moved to ${newStage} via pipeline Kanban`
    );

    setApplicants((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStage } : a))
    );

    setActiveNotification(`Candidate moved to ${newStage.replace('_', ' ')}. Job Seeker notified.`);
    setTimeout(() => setActiveNotification(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Constructing interactive recruitment pipeline..." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-full mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Kanban className="w-6 h-6 text-indigo-400" />
            Recruitment Pipeline (Kanban)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Drag or transition applicants between pipeline stages with automated audit logging
          </p>
        </div>

        {/* Job Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Filter Position:</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Jobs ({jobs.length})</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>
      </div>

      {activeNotification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{activeNotification}</span>
        </div>
      )}

      {/* Horizontal Scroll Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
        {columns.map((col, colIdx) => {
          const colCandidates = applicants.filter((a) => a.status === col.status);

          return (
            <div
              key={col.status}
              className={`w-72 shrink-0 rounded-2xl border ${col.color} p-3 flex flex-col max-h-[75vh]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {col.title}
                </span>
                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-300">
                  {colCandidates.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {colCandidates.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => navigate(`/employer/applications/${app.id}`)}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/90 hover:border-slate-700 hover:shadow-lg transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={app.applicant.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={app.applicant.display_name || 'Applicant'}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white hover:text-indigo-300 transition-colors truncate max-w-[140px]">
                            {app.applicant.first_name} {app.applicant.last_name}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {app.job.title}
                          </p>
                        </div>
                      </div>

                      {app.is_starred && (
                        <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" />
                      )}
                    </div>

                    {app.matchPercentage && (
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Match score:</span>
                        <span className="font-semibold text-emerald-400 flex items-center gap-0.5">
                          <Sparkles className="w-3 h-3" /> {app.matchPercentage}%
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{new Date(app.applied_at).toLocaleDateString()}</span>

                      {/* Quick Next Stage Advance Button */}
                      {colIdx < columns.length - 2 && (
                        <button
                          type="button"
                          onClick={(e) => handleMoveCandidate(app.id, columns[colIdx + 1].status, e)}
                          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                          title={`Move to ${columns[colIdx + 1].title}`}
                        >
                          <span>Advance</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {colCandidates.length === 0 && (
                  <div className="text-center py-8 text-[11px] text-slate-500">
                    No candidates in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
