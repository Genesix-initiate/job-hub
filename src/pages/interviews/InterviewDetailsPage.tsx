import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  ExternalLink,
  Mic,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export function InterviewDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleSent, setRescheduleSent] = useState(false);

  // Video check simulator state
  const [micChecked, setMicChecked] = useState(true);
  const [cameraChecked, setCameraChecked] = useState(true);

  // Interview data
  const interview = {
    id: id || 'interview-session',
    title: 'Technical Evaluation & Interview Discussion',
    companyName: 'Hiring Organization',
    jobTitle: 'Open Position',
    scheduledAt: new Date(Date.now() + 2 * 86400000 + 4 * 3600000).toISOString(),
    durationMinutes: 45,
    interviewType: 'technical',
    meetingUrl: 'https://meet.google.com/interview-room',
    instructions: 'Please be in a quiet space with stable high-speed internet. You will be asked to share your screen and discuss technical project experiences.',
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRescheduleSent(true);
    setTimeout(() => {
      setIsRescheduleModalOpen(false);
      setRescheduleSent(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <button
        onClick={() => navigate('/job-seeker/interviews')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to interview list</span>
      </button>

      {/* Header Info Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald-400">{interview.companyName}</span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{interview.title}</h1>
            <p className="text-xs text-slate-300">Position: {interview.jobTitle}</p>
          </div>

          <div className="flex items-center gap-2">
            {!isConfirmed ? (
              <button
                onClick={() => setIsConfirmed(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Confirm Attendance
              </button>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Attendance Confirmed
              </span>
            )}

            <button
              onClick={() => setIsRescheduleModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              Request Reschedule
            </button>
          </div>
        </div>

        {/* Schedule Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Date &amp; Time</span>
            <span className="text-white font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              {new Date(interview.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Session Duration</span>
            <span className="text-white font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {interview.durationMinutes} Minutes
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Format</span>
            <span className="text-white font-semibold capitalize flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-emerald-400" />
              {interview.interviewType} Video Meeting
            </span>
          </div>
        </div>
      </div>

      {/* Video Interview Preparation Room (Section 47) */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
            <Video className="w-5 h-5 text-emerald-400" />
            Virtual Interview Preparation Room
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Test your audiovisual devices and review key discussion guidelines before entering the virtual room.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Simulated Camera Check Box */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[220px]">
            <div className="h-16 w-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <Camera className="w-7 h-7 text-emerald-400" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-white">Camera &amp; Microphone Test</span>
              <p className="text-[11px] text-slate-500">Camera: Ready &bull; Mic Input: Active</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCameraChecked(!cameraChecked)}
                className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
                  cameraChecked ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{cameraChecked ? 'Camera Connected' : 'Camera Muted'}</span>
              </button>

              <button
                type="button"
                onClick={() => setMicChecked(!micChecked)}
                className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
                  micChecked ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{micChecked ? 'Mic Active' : 'Mic Muted'}</span>
              </button>
            </div>
          </div>

          {/* Guidelines Checklist */}
          <div className="space-y-3 text-xs text-slate-300">
            <h3 className="font-semibold text-white">Pre-Interview Checklist</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Join 5 minutes prior to start time to verify audio output.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Keep your updated resume and project portfolio tabs open.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Ensure your background is distraction-free and well-lit.</span>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href={interview.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-6 rounded-xl text-xs transition inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 uppercase tracking-wider"
              >
                <span>JOIN VIRTUAL MEETING ROOM</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      <Modal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        title="Request Interview Reschedule"
      >
        {rescheduleSent ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-semibold text-white">Request Sent</h4>
            <p className="text-xs text-slate-400">
              The hiring coordinator has been notified of your reschedule request.
            </p>
          </div>
        ) : (
          <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
            <p className="text-slate-300">
              Please share your reason and 2&ndash;3 alternate time slots that work best for your schedule.
            </p>
            <textarea
              rows={4}
              required
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              placeholder="e.g. Due to an urgent scheduling conflict, I would like to request moving this to Friday afternoon..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRescheduleModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Send Request
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
