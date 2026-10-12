import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Calendar,
  Clock,
  Video,
  MapPin,
  Plus,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Star,
  Users,
  Briefcase,
  X,
  FileCheck2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { employerService } from '../../../lib/employerService';
import { Interview, Profile, Job, Application, InterviewEvaluation } from '../../../types/database';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export function EmployerInterviewsPage() {
  const { company, profile } = useAuth();
  const [interviews, setInterviews] = useState<
    Array<Interview & { application: Application; applicant: Profile; job: Job }>
  >([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  // Modals
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [evalModalInterview, setEvalModalInterview] = useState<Interview | null>(null);
  const [rescheduleInterview, setRescheduleInterview] = useState<Interview | null>(null);

  // Forms
  const [scheduleForm, setScheduleForm] = useState({
    application_id: '',
    title: 'Technical Systems Architecture Discussion',
    interview_type: 'technical' as any,
    scheduled_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    scheduled_time: '14:00',
    duration_minutes: 45,
    location: 'Google Meet',
    meeting_url: 'https://meet.google.com/apx-new-meet',
    description: '',
  });

  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  const [evaluationForm, setEvaluationForm] = useState({
    rating: 4,
    recommendation: 'hire' as any,
    strengths: 'Excellent system design clarity, clear communication of trade-offs, strong production debugging examples.',
    weaknesses: 'Limited experience with bare-metal Kubernetes clusters; primarily AWS EKS focused.',
    notes: 'High potential for leading frontend platform initiatives.',
  });

  const [notification, setNotification] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const companyId = company?.id || '30000000-0000-0000-0000-000000000001';
    const [intList, appList] = await Promise.all([
      employerService.getEmployerInterviews(companyId),
      employerService.getEmployerApplicants(companyId),
    ]);
    setInterviews(intList);
    setApplicants(appList);
    if (appList.length > 0 && !scheduleForm.application_id) {
      setScheduleForm((prev) => ({ ...prev, application_id: appList[0].id }));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [company?.id]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.application_id) return;

    const scheduledAt = new Date(`${scheduleForm.scheduled_date}T${scheduleForm.scheduled_time}:00`).toISOString();
    await employerService.scheduleInterview({
      application_id: scheduleForm.application_id,
      scheduled_by: profile?.id || '00000000-0000-0000-0000-000000000201',
      title: scheduleForm.title,
      interview_type: scheduleForm.interview_type,
      scheduled_at: scheduledAt,
      duration_minutes: scheduleForm.duration_minutes,
      location: scheduleForm.location,
      meeting_url: scheduleForm.meeting_url,
      description: scheduleForm.description,
    });

    setScheduleModalOpen(false);
    setNotification('Interview scheduled! Automated calendar invitation dispatched to candidate.');
    loadData();
    setTimeout(() => setNotification(null), 3500);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleInterview || !rescheduleDate) return;
    await employerService.rescheduleInterview(rescheduleInterview.id, new Date(rescheduleDate).toISOString(), rescheduleReason);
    setRescheduleInterview(null);
    setNotification('Interview rescheduled. Updated confirmation sent.');
    loadData();
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCancelInterview = async (interviewId: string) => {
    const reason = prompt('Please enter cancellation reason:');
    if (!reason) return;
    await employerService.cancelInterview(interviewId, reason);
    setNotification('Interview cancelled.');
    loadData();
    setTimeout(() => setNotification(null), 3500);
  };

  const handleEvaluationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalModalInterview) return;

    await employerService.submitInterviewEvaluation({
      interview_id: evalModalInterview.id,
      evaluator_id: profile?.id || '00000000-0000-0000-0000-000000000201',
      rating: evaluationForm.rating,
      recommendation: evaluationForm.recommendation,
      strengths: evaluationForm.strengths,
      weaknesses: evaluationForm.weaknesses,
      notes: evaluationForm.notes,
    });

    setEvalModalInterview(null);
    setNotification('Interview evaluation submitted and archived privately in candidate dossier.');
    loadData();
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredInterviews = interviews.filter((i) => {
    if (activeTab === 'upcoming') return i.status === 'scheduled' || i.status === 'rescheduled';
    if (activeTab === 'completed') return i.status === 'completed';
    if (activeTab === 'cancelled') return i.status === 'cancelled';
    return true;
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Loading interview schedule and evaluation scorecards..." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <CalendarCheck2 className="w-6 h-6 text-indigo-400" />
            Interview Management & Scorecards
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Coordinate video or on-site candidate sessions, record ratings, and manage hiring decisions
          </p>
        </div>

        <button
          onClick={() => setScheduleModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Interview</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit text-xs">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'upcoming' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Upcoming ({interviews.filter((i) => i.status === 'scheduled' || i.status === 'rescheduled').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'completed' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Completed ({interviews.filter((i) => i.status === 'completed').length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-4 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'cancelled' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Cancelled ({interviews.filter((i) => i.status === 'cancelled').length})
        </button>
      </div>

      {/* Interview Cards List */}
      {filteredInterviews.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <CalendarCheck2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No interviews in this tab.</h3>
          <p className="text-xs text-slate-400">
            Schedule screening calls or technical loops with candidates directly from their applications.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInterviews.map((int) => (
            <div
              key={int.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="flex items-start gap-4">
                <img
                  src={int.applicant?.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={int.applicant?.display_name || 'Candidate'}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-800 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-white">{int.title}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {int.interview_type}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold capitalize bg-slate-800 text-slate-300">
                      {int.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">
                    Candidate: <span className="text-white">{int.applicant?.first_name} {int.applicant?.last_name}</span> • Role: <span className="text-slate-400">{int.job?.title}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1 text-indigo-300 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(int.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} ({int.duration_minutes}m)
                    </span>
                    <span className="flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-slate-500" />
                      {int.location || 'Video Call'}
                    </span>
                    {int.meeting_url && (
                      <a
                        href={int.meeting_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <span>Join Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t border-slate-800 md:border-t-0">
                {int.status === 'scheduled' || int.status === 'rescheduled' ? (
                  <>
                    <button
                      onClick={() => setEvalModalInterview(int)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
                    >
                      Record Evaluation
                    </button>
                    <button
                      onClick={() => {
                        setRescheduleInterview(int);
                        setRescheduleDate(int.scheduled_at.slice(0, 16));
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="Reschedule session"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancelInterview(int.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Cancel interview"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                ) : int.status === 'completed' ? (
                  <button
                    onClick={() => setEvalModalInterview(int)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 cursor-pointer"
                  >
                    View Scorecard
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Interview Modal (Section 43) */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarCheck2 className="w-4 h-4 text-indigo-400" />
                Schedule Candidate Interview
              </h3>
              <button onClick={() => setScheduleModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Candidate *</label>
                <select
                  required
                  value={scheduleForm.application_id}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, application_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {applicants.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.applicant.first_name} {a.applicant.last_name} — {a.job.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.scheduled_date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.scheduled_time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                  <select
                    value={scheduleForm.interview_type}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interview_type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="screening">Screening</option>
                    <option value="technical">Technical Loop</option>
                    <option value="cultural">Culture & Values</option>
                    <option value="final">Final Round</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={scheduleForm.duration_minutes}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, duration_minutes: parseInt(e.target.value) || 45 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Meeting Video URL</label>
                <input
                  type="url"
                  value={scheduleForm.meeting_url}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, meeting_url: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 cursor-pointer"
                >
                  Confirm & Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal (Section 44) */}
      {rescheduleInterview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-indigo-400" />
              Reschedule Interview
            </h3>
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Rescheduling</label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Interviewer conflict / Candidate availability"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRescheduleInterview(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 cursor-pointer"
                >
                  Save New Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evaluation Scorecard Modal (Section 45) */}
      {evalModalInterview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                Interview Evaluation Scorecard
              </h3>
              <button onClick={() => setEvalModalInterview(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEvaluationSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Overall Evaluation Rating (1 to 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEvaluationForm({ ...evaluationForm, rating: star })}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star className="w-6 h-6" fill={star <= evaluationForm.rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 font-semibold ml-2">
                    {evaluationForm.rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Final Recommendation</label>
                <select
                  value={evaluationForm.recommendation}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, recommendation: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="strong_hire">Strong Hire</option>
                  <option value="hire">Hire</option>
                  <option value="neutral">Neutral / Re-evaluate</option>
                  <option value="no_hire">No Hire</option>
                  <option value="strong_no_hire">Strong No Hire</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Candidate Strengths</label>
                <textarea
                  rows={2}
                  value={evaluationForm.strengths}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, strengths: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Weaknesses & Risks</label>
                <textarea
                  rows={2}
                  value={evaluationForm.weaknesses}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, weaknesses: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEvalModalInterview(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 cursor-pointer"
                >
                  Save Scorecard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
