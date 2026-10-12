import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BellRing,
  Send,
  Users,
  Building2,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Radio,
  Zap,
} from 'lucide-react';
import { adminService } from '../../../lib/adminService';
import { BroadcastNotification } from '../../../types/database';
import { useAuth } from '../../../context/AuthContext';

export function AdminBroadcastsPage() {
  const { profile: currentAdmin } = useAuth();
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<'all' | 'job_seekers' | 'employers' | 'admins'>('all');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchBroadcasts = async () => {
    const list = await adminService.getBroadcasts();
    setBroadcasts(list);
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await adminService.sendBroadcast(
      {
        title,
        message,
        target_audience: audience,
        priority,
      },
      currentAdmin?.id || 'admin'
    );

    setIsSubmitting(false);
    setShowModal(false);
    setTitle('');
    setMessage('');
    setSuccessMsg('Broadcast announcement dispatched successfully to target audience.');
    setTimeout(() => setSuccessMsg(null), 4000);
    fetchBroadcasts();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Notifications Sub-Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <NavLink
          to="/admin/notifications"
          end
          className={({ isActive }) =>
            `flex items-center gap-2 pb-3 px-1 text-xs font-semibold border-b-2 transition ${
              isActive
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`
          }
        >
          <Radio className="w-4 h-4" />
          <span>Broadcast Announcements</span>
        </NavLink>
        <NavLink
          to="/admin/notifications/email-automation"
          className={({ isActive }) =>
            `flex items-center gap-2 pb-3 px-1 text-xs font-semibold border-b-2 transition ${
              isActive
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`
          }
        >
          <Zap className="w-4 h-4 text-indigo-400" />
          <span>Automated Email Engine (Edge Functions)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
            New
          </span>
        </NavLink>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Radio className="w-6 h-6 text-rose-400" />
            Platform Announcements & Broadcast System
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch urgent notices, scheduled maintenance alerts, and policy changes to platform cohorts
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 text-white font-semibold text-xs transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>New Broadcast Alert</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Broadcast History Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Broadcast Notice</th>
                <th className="py-3 px-4">Target Audience</th>
                <th className="py-3 px-4">Priority Level</th>
                <th className="py-3 px-4">Dispatched Cohort</th>
                <th className="py-3 px-4">Dispatch Timestamp</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {broadcasts.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 max-w-md">
                    <p className="font-semibold text-white">{b.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{b.message}</p>
                  </td>

                  <td className="py-3.5 px-4 capitalize text-slate-300 font-mono text-[11px]">
                    {b.target_audience.replace('_', ' ')}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                        b.priority === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : b.priority === 'important'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {b.priority}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 font-mono">
                    {b.recipient_count.toLocaleString()} recipients
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">
                    {b.sent_at ? new Date(b.sent_at).toLocaleString() : 'Pending'}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Dispatched
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Radio className="w-5 h-5 text-rose-400" />
              Dispatch Platform Broadcast
            </h3>

            <form onSubmit={handleSend} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-mono">Announcement Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Scheduled Maintenance Window / System Upgrade"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-mono">Target Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="all">All Platform Users (~2,450)</option>
                    <option value="job_seekers">Job Seekers Only (~2,270)</option>
                    <option value="employers">Recruiters & Employers (~180)</option>
                    <option value="admins">Administrative Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-mono">Priority Classification</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="normal">Normal (Informational Notice)</option>
                    <option value="important">Important (Feature / Policy)</option>
                    <option value="urgent">Urgent (Maintenance / Critical)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-mono">Announcement Message Body</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Draft the clear notification content displayed to users in their notification center..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-slate-300 text-[11px] leading-relaxed">
                Confirmation: This broadcast will immediately push transactional notices to all active accounts in the target audience cohort and record an immutable event in the PostgreSQL audit log.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !message.trim()}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Dispatching...' : 'Authorize & Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
