import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Edit2,
  Copy,
  Pause,
  Play,
  XCircle,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { employerService } from '../../../lib/employerService';
import { Job } from '../../../types/database';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export function EmployerJobsPage() {
  const navigate = useNavigate();
  const { company, profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Close job confirmation modal state
  const [closeConfirmJobId, setCloseConfirmJobId] = useState<string | null>(null);

  const loadJobs = async () => {
    setIsLoading(true);
    const companyId = company?.id || '30000000-0000-0000-0000-000000000001';
    const list = await employerService.getEmployerJobs(companyId, {
      status: statusFilter,
      query: searchQuery,
    });
    setJobs(list);
    setIsLoading(false);
  };

  useEffect(() => {
    loadJobs();
  }, [company?.id, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs();
  };

  const handlePause = async (jobId: string) => {
    await employerService.pauseJob(jobId);
    setActionSuccessMsg('Job paused. New applications temporarily disabled.');
    loadJobs();
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleResume = async (jobId: string) => {
    await employerService.resumeJob(jobId);
    setActionSuccessMsg('Job resumed. Now accepting applications.');
    loadJobs();
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleClose = async (jobId: string) => {
    await employerService.closeJob(jobId);
    setCloseConfirmJobId(null);
    setActionSuccessMsg('Job has been permanently closed. Existing applications remain preserved.');
    loadJobs();
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleDuplicate = async (jobId: string) => {
    const duplicated = await employerService.duplicateJob(
      jobId,
      profile?.id || '00000000-0000-0000-0000-000000000201'
    );
    if (duplicated) {
      setActionSuccessMsg(`Draft duplicate created: "${duplicated.title}"`);
      loadJobs();
      setTimeout(() => setActionSuccessMsg(null), 3000);
    }
  };

  const handlePublish = async (jobId: string) => {
    if (!company?.id) return;
    const res = await employerService.publishJob(jobId, company.id);
    if (!res.success) {
      alert(res.error || 'Unable to publish job');
      return;
    }
    setActionSuccessMsg('Job published successfully and is now visible to Job Seekers!');
    loadJobs();
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Published</span>;
      case 'draft':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">Draft</span>;
      case 'paused':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">Paused</span>;
      case 'closed':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">Closed</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            Job Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Publish, edit, pause, and track applications across all organization positions
          </p>
        </div>

        <button
          onClick={() => navigate('/employer/jobs/create')}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Job</span>
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Jobs' },
            { id: 'published', label: 'Live / Published' },
            { id: 'draft', label: 'Drafts' },
            { id: 'paused', label: 'Paused' },
            { id: 'closed', label: 'Closed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or reference..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </form>
      </div>

      {/* Job Cards / Table */}
      {isLoading ? (
        <div className="p-12 text-center">
          <LoadingSpinner message="Loading company jobs..." />
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">You haven't created any jobs in this category yet.</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Create high-converting job posts with custom compensation, benefits, and screening questions.
          </p>
          <button
            onClick={() => navigate('/employer/jobs/create')}
            className="mt-2 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>POST YOUR FIRST JOB</span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80">
          {jobs.map((job) => {
            const deadlineDate = job.application_deadline ? new Date(job.application_deadline) : null;
            const isDeadlineNear = deadlineDate && (deadlineDate.getTime() - Date.now()) < 5 * 86400000;

            return (
              <div
                key={job.id}
                className="p-5 hover:bg-slate-900/60 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Job Information */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-white hover:text-indigo-300 transition-colors">
                      {job.title}
                    </h3>
                    {statusBadge(job.status)}
                    <span className="text-[11px] font-mono text-slate-500">{job.reference_number}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {job.city}, {job.state || job.country} ({job.work_mode})
                    </span>
                    <span>•</span>
                    <span>{job.employment_type.replace('_', ' ')}</span>
                    <span>•</span>
                    <span className="text-slate-200 font-semibold">
                      ${((job.salary_min || 100000) / 1000).toFixed(0)}k - ${((job.salary_max || 150000) / 1000).toFixed(0)}k / {job.salary_period}
                    </span>
                    {job.application_deadline && (
                      <>
                        <span>•</span>
                        <span className={`flex items-center gap-1 ${isDeadlineNear ? 'text-amber-400 font-medium' : 'text-slate-400'}`}>
                          <Clock className="w-3.5 h-3.5" />
                          Deadline: {deadlineDate?.toLocaleDateString()}
                          {isDeadlineNear && ' (Expiring soon)'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Job Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t border-slate-800/60 lg:border-t-0">
                  {/* View public / preview */}
                  <NavLink
                    to={`/jobs/${job.id}`}
                    target="_blank"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="View candidate page"
                  >
                    <Eye className="w-4 h-4" />
                  </NavLink>

                  {/* View Applicants for this job */}
                  <button
                    onClick={() => navigate(`/employer/applicants?jobId=${job.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Applicants</span>
                  </button>

                  {/* Publish if Draft */}
                  {job.status === 'draft' && (
                    <button
                      onClick={() => handlePublish(job.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Publish Job
                    </button>
                  )}

                  {/* Pause if published */}
                  {job.status === 'published' && (
                    <button
                      onClick={() => handlePause(job.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors cursor-pointer"
                      title="Pause applications"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}

                  {/* Resume if paused */}
                  {job.status === 'paused' && (
                    <button
                      onClick={() => handleResume(job.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors cursor-pointer"
                      title="Resume applications"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}

                  {/* Duplicate job */}
                  <button
                    onClick={() => handleDuplicate(job.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    title="Duplicate job"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* Close Job if not closed */}
                  {job.status !== 'closed' && (
                    <button
                      onClick={() => setCloseConfirmJobId(job.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Close job permanently"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Close Job Confirmation Dialog (Section 29 & 78) */}
      {closeConfirmJobId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Permanently Close This Job?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Closing this job will prevent any new candidates from applying. All existing applications and interview records will remain completely intact and accessible for compliance and reporting.
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setCloseConfirmJobId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleClose(closeConfirmJobId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Confirm Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
