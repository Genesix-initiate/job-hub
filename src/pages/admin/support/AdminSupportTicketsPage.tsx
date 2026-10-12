import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  MessageSquare,
} from 'lucide-react';
import { adminService } from '../../../lib/adminService';
import { Complaint } from '../../../types/database';
import { useAuth } from '../../../context/AuthContext';

export function AdminSupportTicketsPage() {
  const { profile: currentAdmin } = useAuth();
  const [tickets, setTickets] = useState<Complaint[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);
  const [resolution, setResolution] = useState('');
  const [status, setStatus] = useState<any>('resolved');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTickets = async () => {
    const data = await adminService.getComplaints();
    setTickets(data);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdate = async () => {
    if (!selectedTicket) return;
    setIsSubmitting(true);
    await adminService.updateComplaintStatus(
      selectedTicket.id,
      status,
      resolution || `Support status updated to ${status}`,
      currentAdmin?.id || 'admin'
    );
    setIsSubmitting(false);
    setSelectedTicket(null);
    setResolution('');
    fetchTickets();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <LifeBuoy className="w-6 h-6 text-indigo-400" />
          Customer Support & Escalations Desk
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review customer service grievances, dispute resolution requests, and support tickets
        </p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Subject & Issue</th>
                <th className="py-3 px-4">Submitter</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Ticket Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-semibold text-white">{t.subject}</p>
                    <p className="text-[11px] text-slate-400 truncate">{t.description}</p>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    <p>{t.submitter?.display_name || 'Member'}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{t.submitter?.email}</p>
                  </td>

                  <td className="py-3.5 px-4 text-slate-400">{t.category}</td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                        t.priority === 'urgent' || t.priority === 'high'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                        t.status === 'resolved' || t.status === 'closed'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedTicket(t)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition cursor-pointer"
                    >
                      Respond
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Respond to Ticket #{selectedTicket.id}</h3>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <p className="font-semibold text-white">{selectedTicket.subject}</p>
              <p className="text-slate-400">{selectedTicket.description}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                Update Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="in_progress">In Progress (Investigating)</option>
                <option value="resolved">Resolved (Solution provided)</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                Official Support Resolution
              </label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Draft response dispatched to ticket submitter..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isSubmitting || !resolution.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Updating...' : 'Dispatch Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
