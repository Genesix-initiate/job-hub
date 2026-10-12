import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  FileText,
  Download,
  Star,
  CheckCircle2,
  XCircle,
  MessageSquare,
  CalendarCheck2,
  Sparkles,
  Award,
  AlertTriangle,
  Lock,
  Send,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { employerService } from '../../../lib/employerService';
import { Application, Profile, Job, Resume, CandidateNote, ApplicationStatus } from '../../../types/database';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export function ApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { company, profile } = useAuth();

  const [application, setApplication] = useState<(Application & { applicant: Profile; job: Job; resume?: Resume }) | null>(null);
  const [notes, setNotes] = useState<CandidateNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Move stage modal / dropdown
  const [stageMenuOpen, setStageMenuOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (applicationId) {
        setIsLoading(true);
        const app = await employerService.getApplicationById(applicationId);
        setApplication(app);
        if (app) {
          const appNotes = await employerService.getCandidateNotes(applicationId);
          setNotes(appNotes);
        }
        setIsLoading(false);
      }
    }
    loadData();
  }, [applicationId]);

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <LoadingSpinner message="Retrieving candidate dossier, submitted CV & notes..." />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Application Not Found</h2>
        <p className="text-xs text-slate-400">The requested application could not be located.</p>
        <button
          onClick={() => navigate('/employer/applicants')}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Return to Applicants
        </button>
      </div>
    );
  }

  const handleMoveStage = async (newStage: ApplicationStatus) => {
    setIsUpdating(true);
    await employerService.updateApplicationStage(
      application.id,
      newStage,
      profile?.id || '00000000-0000-0000-0000-000000000201',
      `Recruiter moved candidate to ${newStage}`
    );
    setApplication({ ...application, status: newStage });
    setStageMenuOpen(false);
    setIsUpdating(false);
    setActionNotice(`Candidate stage updated to "${newStage}". Job Seeker notified.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleShortlist = async () => {
    await handleMoveStage('shortlisted');
  };

  const handleReject = async () => {
    setIsUpdating(true);
    await employerService.updateApplicationStage(
      application.id,
      'rejected',
      profile?.id || '00000000-0000-0000-0000-000000000201',
      rejectReason || 'Applicant rejected by recruiter'
    );
    setApplication({ ...application, status: 'rejected' });
    setRejectModalOpen(false);
    setIsUpdating(false);
    setActionNotice('Candidate marked as Rejected. Internal reason archived privately.');
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleToggleStar = async () => {
    const newStar = await employerService.toggleStarApplicant(application.id);
    setApplication({ ...application, is_starred: newStar });
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !company?.id) return;
    const authorName = profile?.display_name || 'Marcus Vance';
    const authorId = profile?.id || '00000000-0000-0000-0000-000000000201';

    const added = await employerService.addCandidateNote(
      application.id,
      company.id,
      authorId,
      authorName,
      newNoteText
    );
    setNotes([added, ...notes]);
    setNewNoteText('');
  };

  const stagesList: ApplicationStatus[] = [
    'applied',
    'under_review',
    'shortlisted',
    'assessment',
    'interview',
    'selected',
    'offer',
    'hired',
    'rejected',
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Top Back Nav */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={() => navigate('/employer/applicants')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Applicants</span>
        </button>

        <span className="text-xs font-mono text-slate-500">Ref: {application.application_reference}</span>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Primary Candidate Card Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <img
            src={application.applicant.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
            alt={application.applicant.display_name || 'Candidate'}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-800 shrink-0 bg-slate-950"
          />

          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {application.applicant.first_name} {application.applicant.last_name}
              </h1>
              <button
                onClick={handleToggleStar}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  application.is_starred ? 'text-amber-400' : 'text-slate-500 hover:text-white'
                }`}
                title="Star candidate"
              >
                <Star className="w-5 h-5" fill={application.is_starred ? 'currentColor' : 'none'} />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300">
              Applied for <span className="font-semibold text-white">{application.job.title}</span>
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {application.applicant.city || 'San Francisco'}, {application.applicant.country || 'USA'}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {application.applicant.email}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Applied {new Date(application.applied_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Current Stage & Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 pt-4 md:pt-0 border-t border-slate-800/80 md:border-t-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Current Stage:</span>
            <StatusBadge status={application.status} size="md" />
          </div>

          <div className="relative">
            <button
              onClick={() => setStageMenuOpen(!stageMenuOpen)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>Move Stage</span>
            </button>

            {stageMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
                <p className="px-2 py-1 text-[10px] uppercase font-mono text-slate-500">Recruitment Stages</p>
                {stagesList.map((st) => (
                  <button
                    key={st}
                    onClick={() => handleMoveStage(st)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors capitalize ${
                      application.status === st
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Application Details (Left 2 cols) & Action / Notes Sidebar (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: CV Viewer, Cover Letter, Answers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Letter */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Candidate Cover Letter & Statement
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 whitespace-pre-line">
              {application.cover_letter || 'No customized cover letter was provided with this application.'}
            </p>
          </div>

          {/* Submitted CV / Resume Viewer (Section 34) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Submitted Curriculum Vitae (CV)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {application.resume?.title || 'Primary Candidate Resume'}
                </p>
              </div>

              {application.resume?.file_url && (
                <a
                  href={application.resume.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CV</span>
                </a>
              )}
            </div>

            {/* CV Summary Card */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Executive Summary</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {application.resume?.summary ||
                    '6+ years developing modern web applications, distributed systems, and scalable cloud architectures. Passionate about design systems, performance, and engineering leadership.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Expected Salary:</span>
                  <span className="text-emerald-400 font-semibold font-mono">
                    ${(application.expected_salary || 150000).toLocaleString()} USD
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Resume Template:</span>
                  <span className="text-slate-300 font-medium">
                    {application.resume?.template_name || 'Modern Executive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Screening Answers (Section 24 & 33) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Screening Question Responses
            </h3>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-xs font-semibold text-slate-300">
                  1. How many years of professional experience do you have with modern web architectures?
                </p>
                <p className="text-xs text-emerald-400 font-medium pl-2 border-l-2 border-emerald-500">
                  6 years
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-xs font-semibold text-slate-300">
                  2. Are you authorized to work in the specified country without sponsorship?
                </p>
                <p className="text-xs text-emerald-400 font-medium pl-2 border-l-2 border-emerald-500">
                  Yes, fully authorized.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Quick Actions & Private Recruiter Notes (Section 40) */}
        <div className="space-y-6">
          {/* Quick Recruitment Actions (Section 33) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Recruitment Actions
            </h3>

            <button
              onClick={handleShortlist}
              disabled={application.status === 'shortlisted'}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Shortlist Candidate</span>
            </button>

            <button
              onClick={() => navigate('/employer/interviews')}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Schedule Interview</span>
            </button>

            <button
              onClick={() => navigate('/employer/messages')}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Message</span>
            </button>

            <button
              onClick={() => setRejectModalOpen(true)}
              disabled={application.status === 'rejected'}
              className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-30"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Candidate</span>
            </button>
          </div>

          {/* Private Recruiter Notes (Section 40) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Private Recruiter Notes
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Confidential</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Notes are strictly internal to authorized members of {company?.company_name}. Job Seekers will never see these observations.
            </p>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={3}
                required
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Add interview observation, assessment feedback, or hiring recommendation..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Private Note</span>
              </button>
            </form>

            {/* Notes List */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
              {notes.map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-300">{n.author_name || 'Recruiter'}</span>
                    <span className="text-slate-500">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{n.note}</p>
                </div>
              ))}

              {notes.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-500">
                  No internal notes recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Candidate Confirmation Dialog (Section 39 & 78) */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Reject Candidate?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to mark this candidate as Rejected? An automated status update will appear in their Job Seeker portal.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Internal Rejection Reason (Confidential to Employer)
              </label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Compensation requirements exceeded band / Insufficient cloud infrastructure experience"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
