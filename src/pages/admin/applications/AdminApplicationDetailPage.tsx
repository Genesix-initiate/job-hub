import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  ArrowLeft,
  FileText,
  Zap,
  CheckCircle2,
  Send,
  AlertCircle,
} from 'lucide-react';
import { adminNotificationService } from '../../../services/adminNotificationService';
import { ApplicationNotificationStatus } from '../../../types/edgeNotification';

export function AdminApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentStatus, setCurrentStatus] = useState<ApplicationNotificationStatus>('interview');
  const [notes, setNotes] = useState('Application dossier reviewed.');
  const [interviewDate, setInterviewDate] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    let foundApp: any = null;
    try {
      const raw =
        localStorage.getItem('jobhub_employer_applications') ||
        localStorage.getItem('tf_emp_employer_applications') ||
        localStorage.getItem('jobhub_applications');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          foundApp = parsed.find((a: any) => a.id === applicationId);
        }
      }
    } catch (e) {
      console.warn('Error reading application', e);
    }

    if (foundApp) {
      setApplication(foundApp);
      if (foundApp.status) {
        setCurrentStatus(foundApp.status as ApplicationNotificationStatus);
      }
    }
    setIsLoading(false);
  }, [applicationId]);

  const applicantName =
    application?.applicant?.display_name ||
    (application?.applicant?.first_name
      ? `${application.applicant.first_name} ${application.applicant.last_name || ''}`.trim()
      : 'Applicant');
  const applicantEmail = application?.applicant?.email || application?.email || '';
  const jobTitle = application?.job?.title || 'Job Opening';
  const companyName = application?.job?.company?.company_name || 'Hiring Organization';

  const handleSendNotification = async () => {
    if (!application) return;
    setIsSending(true);
    try {
      await adminNotificationService.triggerApplicationStatusNotification({
        applicationId: application.id,
        applicantName,
        applicantEmail,
        jobTitle,
        companyName,
        status: currentStatus,
        notes,
        interviewDate: currentStatus === 'interview' && interviewDate ? interviewDate : undefined,
      });
      setToastMsg(`Notification for "${currentStatus}" dispatched via Edge Function!`);
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err: any) {
      alert(`Error dispatching notification: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-slate-500 text-xs">
        Loading application details...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in py-8">
        <button
          onClick={() => navigate('/admin/applications')}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications Oversight</span>
        </button>

        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto opacity-70" />
          <h2 className="text-base font-bold text-white">Application Not Found</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No candidate submission matches reference identifier <span className="font-mono text-slate-200">{applicationId}</span>. The application may have been archived or removed.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/admin/applications')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
            >
              Return to Applications Oversight
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/applications')}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications Oversight</span>
        </button>
        <span className="text-xs font-mono text-slate-500">ID: {application.id}</span>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              {applicantName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">{applicantName}</h1>
              <p className="text-xs text-slate-400 font-mono">{applicantEmail}</p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30">
            {application.status || 'Applied'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block uppercase font-mono text-[10px]">Applied For</span>
            <span className="text-slate-200 font-semibold">{jobTitle}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-mono text-[10px]">Enterprise Recruiter</span>
            <span className="text-slate-200 font-semibold">{companyName}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-mono text-[10px]">Submitted Date</span>
            <span className="text-slate-200 font-mono font-semibold">
              {new Date(application.applied_at || application.created_at || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>

        {application.cover_letter && (
          <div className="space-y-3 text-xs">
            <h3 className="font-semibold text-slate-300 uppercase font-mono">Candidate Cover Statement</h3>
            <p className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 leading-relaxed">
              {application.cover_letter}
            </p>
          </div>
        )}

        {application.resume_url && (
          <div className="space-y-3 text-xs">
            <h3 className="font-semibold text-slate-300 uppercase font-mono">Curriculum Vitae Document</h3>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-rose-400" />
                <div>
                  <p className="font-medium text-white">Candidate_Resume.pdf</p>
                  <p className="text-[11px] text-slate-500 font-mono">Verified ATS Resume</p>
                </div>
              </div>
              <a
                href={application.resume_url}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 font-medium text-xs hover:underline"
              >
                Download / View Resume
              </a>
            </div>
          </div>
        )}

        {/* Automated Notification Trigger Section */}
        <div className="space-y-3 text-xs p-5 rounded-2xl bg-indigo-950/30 border border-indigo-900/50">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              Automated Email Notification (Supabase Edge Function)
            </h3>
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
              /dispatch-notification
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Update Application Stage</label>
              <select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value as ApplicationNotificationStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
              >
                <option value="applied">Applied (Received & Processing)</option>
                <option value="under_review">Under Review (Screening)</option>
                <option value="shortlisted">Shortlisted for Interview</option>
                <option value="interview">Interview Invitation Scheduled</option>
                <option value="offer">Job Offer Extended</option>
                <option value="hired">Hired & Onboarding Welcome</option>
                <option value="rejected">Respectful Decision Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Interview Time (if applicable)</label>
              <input
                type="text"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                placeholder="e.g. Thursday, 3:00 PM UTC"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Candidate Notes / Email Body Snippet</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400 font-mono">
              Recipients will receive full branded ATS HTML template instantly.
            </span>
            <button
              onClick={handleSendNotification}
              disabled={isSending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-bounce' : ''}`} />
              <span>{isSending ? 'Dispatching...' : 'Dispatch Notification via Edge'}</span>
            </button>
          </div>
        </div>

        {/* Toast */}
        {toastMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
