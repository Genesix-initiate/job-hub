import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Building2,
  Briefcase,
  User,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { adminService } from '../../../lib/adminService';
import { useAuth } from '../../../context/AuthContext';

export function AdminReportsPage() {
  const { profile: currentAdmin } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [activeType, setActiveType] = useState<'all' | 'job' | 'company' | 'user'>('all');
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState<'resolved' | 'dismissed'>('resolved');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchReports = async () => {
    const data = await adminService.getReports();
    setReports(data);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async () => {
    if (!selectedReport) return;
    setIsSubmitting(true);
    await adminService.updateReportStatus(
      selectedReport.id,
      resolutionStatus,
      resolutionText || `Administrative determination: ${resolutionStatus}`,
      currentAdmin?.id || 'admin'
    );
    setIsSubmitting(false);
    setSelectedReport(null);
    setResolutionText('');
    setSuccessToast(`Report marked as ${resolutionStatus.toUpperCase()}`);
    setTimeout(() => setSuccessToast(null), 3000);
    fetchReports();
  };

  const filtered = reports.filter((r) => activeType === 'all' || r.type === activeType);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
          Trust, Safety & Community Reports
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review suspicious job listings, fraudulent enterprises, and member misconduct reports
        </p>
      </div>

      {successToast && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex gap-2">
        {(['all', 'job', 'company'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer capitalize ${
              activeType === t ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white bg-slate-950'
            }`}
          >
            {t === 'all' ? 'All Reports' : `${t} Flags`}
          </button>
        ))}
      </div>

      {/* Reports Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Reported Target</th>
                <th className="py-3 px-4">Reason & Violation</th>
                <th className="py-3 px-4">Reporter</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-slate-800 text-slate-300">
                      {rep.type}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-white">
                    {rep.job_title || rep.company_name || 'Flagged Target'}
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 max-w-sm">
                    <p className="font-medium text-amber-300">{rep.reason}</p>
                    <p className="text-[11px] text-slate-400 truncate">{rep.description}</p>
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 font-mono">
                    {rep.reporter_name || 'Confidential Candidate'}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                        rep.status === 'resolved'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : rep.status === 'investigating'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedReport(rep)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition cursor-pointer"
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investigate / Resolve Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Resolve Trust Report #{selectedReport.id}
            </h3>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <p className="font-semibold text-white">Reason: {selectedReport.reason}</p>
              <p className="text-slate-400">{selectedReport.description}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                Determination Action
              </label>
              <select
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="resolved">Mark as Resolved (Violation addressed)</option>
                <option value="dismissed">Dismiss (False alarm / No violation)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                Investigation Findings & Resolution Notes
              </label>
              <textarea
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Document actions taken or explanation for reporter..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolve}
                disabled={isSubmitting || !resolutionText.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Recording...' : 'Commit Determination'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
