import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Ban,
  Download,
} from 'lucide-react';
import { dataService } from '../../lib/dataService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';

export function ApplicationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [app, setApp] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      dataService.getApplicationById(id).then((found) => {
        setApp(found);
        setIsLoading(false);
      });
    }
  }, [id]);

  const handleConfirmWithdraw = async () => {
    if (!app || !profile) return;
    setIsWithdrawing(true);
    await dataService.withdrawApplication(app.id, profile.id);
    setIsWithdrawing(false);
    setIsWithdrawModalOpen(false);
    // Reload state
    const refreshed = await dataService.getApplicationById(app.id);
    setApp(refreshed);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading application tracking details..." />;
  }

  if (!app) {
    return (
      <div className="text-center py-16 space-y-3">
        <h3 className="text-base font-bold text-white">Application Record Not Found</h3>
        <p className="text-xs text-slate-400">Unable to locate an application with this identifier.</p>
        <button
          onClick={() => navigate('/job-seeker/applications')}
          className="bg-emerald-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs"
        >
          Back to Applications
        </button>
      </div>
    );
  }

  // Defined hiring pipeline stages for visual timeline
  const stages = [
    { key: 'applied', label: 'Application Submitted' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'shortlisted', label: 'Shortlisted' },
    { key: 'interview', label: 'Interview Scheduled' },
    { key: 'offer', label: 'Offer Extended' },
    { key: 'hired', label: 'Hired' },
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === app.status);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <button
        onClick={() => navigate('/job-seeker/applications')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to all applications</span>
      </button>

      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={
                app.job?.company?.logo_url ||
                'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100'
              }
              alt={app.job?.company?.company_name}
              className="w-14 h-14 rounded-2xl object-cover bg-slate-800 border border-slate-700 shrink-0"
            />
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400">{app.job?.company?.company_name}</span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{app.job?.title}</h1>
              <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                <span className="font-mono text-emerald-400 font-medium">Ref: {app.application_reference}</span>
                <span>&bull;</span>
                <span>Submitted {new Date(app.applied_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
            <StatusBadge status={app.status} size="md" />
            {app.status !== 'withdrawn' && app.status !== 'rejected' && (
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="text-xs text-rose-400 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Withdraw Application</span>
              </button>
            )}
          </div>
        </div>

        {/* Application Stage Timeline (Section 43) */}
        <div className="pt-6 border-t border-slate-800/80">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Hiring Pipeline Progression
          </h3>

          <div className="relative flex flex-col sm:flex-row justify-between gap-4 sm:gap-2">
            {stages.map((stg, idx) => {
              const isPast = currentStageIndex >= idx && app.status !== 'withdrawn';
              const isCurrent = app.status === stg.key;

              return (
                <div key={stg.key} className="flex sm:flex-col items-center gap-3 sm:gap-2 text-center flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border transition ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 ring-4 ring-emerald-500/20'
                        : isPast
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-950 text-slate-600 border-slate-800'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-xs ${
                      isCurrent
                        ? 'text-white font-semibold'
                        : isPast
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                  >
                    {stg.label}
                  </span>
                </div>
              );
            })}
          </div>

          {app.status === 'withdrawn' && (
            <div className="mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                This application was withdrawn on{' '}
                {new Date(app.withdrawn_at || app.updated_at).toLocaleDateString()}.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Submission Payload Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attached CV */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Submitted Resume
          </h3>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-white block">
                {app.resume?.title || 'Senior Engineering Resume (PDF)'}
              </span>
              <span className="text-[11px] text-slate-500">
                Template: {app.resume?.template_name || 'Modern'}
              </span>
            </div>
            <Link
              to="/job-seeker/cv"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="View in CV Manager"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Expected Salary */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Compensation Stated
          </h3>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-500 block mb-1">Target Annual Salary</span>
            <span className="text-lg font-bold text-white">
              {app.job?.salary_currency} {app.expected_salary?.toLocaleString() || '145,000'}
            </span>
          </div>
        </div>
      </div>

      {/* Cover Letter */}
      {app.cover_letter && (
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Submitted Cover Letter
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            {app.cover_letter}
          </p>
        </div>
      )}

      {/* Withdraw Modal Dialog (Section 44) */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Withdraw Application"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Are you sure you want to withdraw your application for{' '}
            <strong className="text-white">{app.job?.title}</strong>?
          </p>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed">
            The employer will be notified of your withdrawal. Your application record and audit reference will be preserved in withdrawn status.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsWithdrawModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700 cursor-pointer"
            >
              Keep Application
            </button>
            <button
              onClick={handleConfirmWithdraw}
              disabled={isWithdrawing}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-semibold rounded-xl text-xs cursor-pointer disabled:opacity-50"
            >
              {isWithdrawing ? 'Withdrawing...' : 'Confirm Withdrawal'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
