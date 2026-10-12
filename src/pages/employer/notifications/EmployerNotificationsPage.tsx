import React, { useState } from 'react';
import {
  BellRing,
  CheckCircle2,
  Clock,
  Briefcase,
  CalendarCheck2,
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  MessageSquare,
  Check,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export function EmployerNotificationsPage() {
  const { company } = useAuth();

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      type: 'job_expiry',
      title: 'Job Deadline Approaching',
      message: 'The application deadline for "Principal Cloud Solutions Architect" expires in 3 days.',
      time: '2 hours ago',
      read: false,
      urgent: true,
    },
    {
      id: 'notif-2',
      type: 'new_application',
      title: 'New Candidate Applied',
      message: 'Alex Morgan submitted an application for the Principal Cloud Solutions Architect role.',
      time: '5 hours ago',
      read: false,
      urgent: false,
    },
    {
      id: 'notif-3',
      type: 'assessment_completed',
      title: 'Assessment Challenge Completed',
      message: 'Elena Rostova finished the "Cloud Infrastructure" assessment with a passing score of 92%.',
      time: 'Yesterday',
      read: true,
      urgent: false,
    },
    {
      id: 'notif-4',
      type: 'interview_confirmed',
      title: 'Interview Slot Confirmed',
      message: 'Elena Rostova confirmed attendance for the Technical Loop on Thursday at 2:00 PM PST.',
      time: 'Yesterday',
      read: true,
      urgent: false,
    },
    {
      id: 'notif-5',
      type: 'verification',
      title: 'Company Verification Active',
      message: `${company?.company_name || 'Apex Cloud Solutions'} legal business documents are verified.`,
      time: '3 days ago',
      read: true,
      urgent: false,
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markSingleRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'job_expiry':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'new_application':
        return <Briefcase className="w-4 h-4 text-indigo-400" />;
      case 'assessment_completed':
        return <FileCheck2 className="w-4 h-4 text-purple-400" />;
      case 'interview_confirmed':
        return <CalendarCheck2 className="w-4 h-4 text-emerald-400" />;
      case 'verification':
        return <ShieldCheck className="w-4 h-4 text-green-400" />;
      default:
        return <BellRing className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <BellRing className="w-6 h-6 text-indigo-400" />
            Employer Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Realtime alerts regarding applicant activity, upcoming interviews, and job deadlines
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => markSingleRead(n.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
              !n.read
                ? 'bg-slate-900 border-indigo-500/40 shadow-sm'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{n.title}</h4>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                  )}
                  {n.urgent && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Action Required
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                <span className="text-[11px] text-slate-500 font-mono block pt-0.5">{n.time}</span>
              </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-500">
            No notifications received.
          </div>
        )}
      </div>
    </div>
  );
}
