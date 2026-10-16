import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  AlertTriangle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { adminService } from '../../../lib/adminService';
import { Job, Company } from '../../../types/database';
import { useAuth } from '../../../context/AuthContext';

export function AdminJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { profile: currentAdmin } = useAuth();
  const [job, setJob] = useState<(Job & { company?: Company }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [statusUpdated, setStatusUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      adminService.getJobs({ search: '' }).then((res) => {
        const found = res.jobs.find((j) => j.id === jobId);
        setJob(found || res.jobs[0] || null);
        setIsLoading(false);
      });
    }
  }, [jobId]);

  const handleModerate = async (newStatus: 'published' | 'rejected' | 'closed' | 'paused') => {
    if (!job) return;
    await adminService.moderateJob(
      job.id,
      newStatus,
      reason || `Direct moderation to ${newStatus}`,
      currentAdmin?.id || 'admin'
    );
    setJob({ ...job, status: newStatus as any });
    setStatusUpdated(`Job status successfully changed to ${newStatus.toUpperCase()}`);
    setTimeout(() => setStatusUpdated(null), 3500);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading job specification...</div>;
  }

  if (!job) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-400">Job posting record not found.</p>
        <button
          onClick={() => navigate('/admin/jobs')}
          className="text-xs text-rose-400 hover:underline"
        >
          &larr; Return to Job Moderation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/jobs')}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Moderation Queue</span>
        </button>
        <span className="text-xs font-mono text-slate-500">REF: {job.reference_number}</span>
      </div>

      {statusUpdated && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusUpdated}</span>
        </div>
      )}

      {/* Main Job Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">{job.title}</h1>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                  job.status === 'published'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {job.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{job.company?.company_name || 'Unassigned Company'}</span>
              <span>·</span>
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{job.city || 'Remote'}, {job.country}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {job.status !== 'published' && (
              <button
                onClick={() => handleModerate('published')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer"
              >
                Approve & Publish
              </button>
            )}
            {job.status !== 'rejected' && (
              <button
                onClick={() => handleModerate('rejected')}
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold text-xs transition cursor-pointer"
              >
                Reject Listing
              </button>
            )}
          </div>
        </div>

        {/* Compensation & Work Mode Band */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-mono">Salary Range</span>
            <span className="text-slate-200 font-bold font-mono">
              ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-mono">Work Mode</span>
            <span className="text-slate-200 capitalize">{job.work_mode.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-mono">Employment Type</span>
            <span className="text-slate-200 capitalize">{job.employment_type.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-mono">Application Deadline</span>
            <span className="text-slate-200 font-mono">
              {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'Rolling'}
            </span>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-4 text-xs text-slate-300">
          <div>
            <h3 className="text-xs font-semibold uppercase font-mono text-slate-400 mb-2">Job Description</h3>
            <p className="leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              {job.description}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase font-mono text-slate-400 mb-2">Responsibilities</h3>
            <p className="leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              {job.responsibilities || 'Standard architectural and team leadership responsibilities.'}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase font-mono text-slate-400 mb-2">Requirements</h3>
            <p className="leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              {job.requirements || 'Proven track record in technology and engineering execution.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
