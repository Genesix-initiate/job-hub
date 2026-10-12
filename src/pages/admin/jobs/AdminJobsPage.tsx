import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  Eye,
  AlertTriangle,
  Building2,
  Calendar,
  Download,
} from 'lucide-react';
import { adminService } from '../../../lib/adminService';
import { Job, Company } from '../../../types/database';
import { useAuth } from '../../../context/AuthContext';

export function AdminJobsPage() {
  const navigate = useNavigate();
  const { profile: currentAdmin } = useAuth();
  const [jobs, setJobs] = useState<(Job & { company?: Company })[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Moderation state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [moderationAction, setModerationAction] = useState<'published' | 'rejected' | 'paused' | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getJobs({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search,
      });
      setJobs(res.jobs);
    } catch (err) {
      console.warn('getJobs error', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const handleModeration = async () => {
    if (!selectedJob || !moderationAction) return;
    setIsSubmitting(true);
    await adminService.moderateJob(
      selectedJob.id,
      moderationAction,
      reason || `Admin moderation decision: ${moderationAction}`,
      currentAdmin?.id || 'admin'
    );
    setIsSubmitting(false);
    setSelectedJob(null);
    setModerationAction(null);
    setReason('');
    fetchJobs();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-sky-400" />
            Job Postings Moderation & Compliance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review employment disclosures, salary transparency, and approve active listings
          </p>
        </div>

        <button
          onClick={async () => {
            const csv = await adminService.exportDataset('jobs', currentAdmin?.id || 'admin');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `jobhub-jobs-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-200 transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Jobs CSV</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs w-full md:w-auto">
          {[
            { id: 'all', label: 'All Postings' },
            { id: 'pending_review', label: 'Pending Moderation' },
            { id: 'published', label: 'Published' },
            { id: 'rejected', label: 'Rejected' },
            { id: 'closed', label: 'Closed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === tab.id ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
            placeholder="Search title, keywords..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Job Title & Reference</th>
                <th className="py-3 px-4">Enterprise Company</th>
                <th className="py-3 px-4">Work Mode & Type</th>
                <th className="py-3 px-4">Compensation Band</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Querying jobs database...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No jobs matching criteria found.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-white">{job.title}</p>
                        <p className="text-slate-400 text-[11px] font-mono">{job.reference_number}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{job.company?.company_name || 'Apex Cloud Solutions'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 capitalize">
                      {job.work_mode.replace('_', ' ')} · {job.employment_type.replace('_', ' ')}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}{' '}
                      <span className="text-[10px] text-slate-500">/{job.salary_period}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                          job.status === 'published'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : job.status === 'pending_review'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => navigate(`/admin/jobs/${job.id}`)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="View Full Spec"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {job.status !== 'published' && (
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setModerationAction('published');
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 transition"
                          title="Approve and Publish"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {job.status !== 'rejected' && (
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setModerationAction('rejected');
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
                          title="Reject Job"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderation Reason Modal */}
      {selectedJob && moderationAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">
              Moderate Job: {moderationAction.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-300">
              Target Job: <strong className="text-white">{selectedJob.title}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                Administrative Moderation Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain compliance findings or approval notes..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500 placeholder-slate-600"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedJob(null);
                  setModerationAction(null);
                }}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleModeration}
                disabled={isSubmitting || !reason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Commit Moderation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
