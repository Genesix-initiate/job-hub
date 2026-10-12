import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellRing,
  CheckCircle2,
  Clock,
  Award,
  CalendarCheck2,
  CheckCheck,
  Briefcase,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { Notification } from '../../types/database';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export function NotificationsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      loadNotifs();
    }
  }, [profile?.id]);

  const loadNotifs = async () => {
    if (!profile) return;
    setIsLoading(true);
    const list = await dataService.getNotifications(profile.id);
    setNotifications(list);
    setIsLoading(false);
  };

  const handleMarkRead = async (notifId: string) => {
    if (!profile) return;
    await dataService.markNotificationRead(notifId, profile.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read_at: new Date().toISOString() } : n))
    );
  };

  const handleMarkAllRead = async () => {
    if (!profile) return;
    await dataService.markAllNotificationsRead(profile.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'application_status_change':
        return <Award className="w-5 h-5 text-purple-400" />;
      case 'interview_scheduled':
        return <CalendarCheck2 className="w-5 h-5 text-emerald-400" />;
      case 'job_alert':
        return <Briefcase className="w-5 h-5 text-teal-400" />;
      default:
        return <BellRing className="w-5 h-5 text-emerald-400" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase text-emerald-400 tracking-wider">
            Activity Alerts
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Notifications
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time status changes, interview invites, and candidate communications.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-700 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner message="Checking for new activity..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No notifications yet"
          description="When your applications advance or employers message you, updates will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const isUnread = !n.read_at;
            return (
              <div
                key={n.id}
                onClick={() => {
                  if (isUnread) handleMarkRead(n.id);
                  if (n.type === 'interview_scheduled') navigate('/job-seeker/interviews');
                  else if (n.type === 'application_status_change') navigate('/job-seeker/applications');
                }}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-4 ${
                  isUnread
                    ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-900/30 border-slate-800/80 hover:bg-slate-900/60'
                }`}
              >
                <div className="h-10 w-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shrink-0">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{n.title}</span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </h3>
                    <span className="text-[10px] text-slate-500">
                      {new Date(n.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
