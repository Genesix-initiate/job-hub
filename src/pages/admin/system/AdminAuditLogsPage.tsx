import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  Download,
  ShieldAlert,
  Clock,
  User,
  Activity,
} from 'lucide-react';
import { adminService } from '../../../lib/adminService';
import { AuditLog } from '../../../types/database';
import { useAuth } from '../../../context/AuthContext';

export function AdminAuditLogsPage() {
  const { profile: currentAdmin } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getAuditLogs({
        action: actionFilter || undefined,
        entityType: entityFilter || undefined,
        page,
        limit: 25,
      });
      setLogs(res.logs);
      setTotal(res.total);
    } catch (err) {
      console.warn('Audit logs fetch error', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter, page]);

  const handleExport = async () => {
    const csv = await adminService.exportDataset('audit_logs', currentAdmin?.id || 'admin');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-rose-400" />
            Immutable Security & Compliance Audit Log
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident append-only ledger tracking all administrative actions and data mutations
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-200 transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <input
          type="text"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          placeholder="Filter by action name (e.g. company_approved, user_status)..."
          className="w-full md:w-80 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
        />

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500 w-full md:w-auto"
        >
          <option value="">All Entity Types</option>
          <option value="company">Company</option>
          <option value="job">Job</option>
          <option value="user">User</option>
          <option value="subscription">Subscription</option>
          <option value="report">Report</option>
          <option value="broadcast">Broadcast</option>
          <option value="feature_flag">Feature Flag</option>
        </select>
      </div>

      {/* Log Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Entity Type & Target</th>
                <th className="py-3 px-4">Actor Administrator</th>
                <th className="py-3 px-4">Metadata Payload</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Querying audit ledger...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No audit records matching query parameters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-semibold text-rose-300">
                      {log.action}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-medium capitalize">{log.entity_type}</span>
                      <span className="text-slate-500 font-mono text-[11px] ml-1.5">
                        ({log.entity_id || 'system'})
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {log.actor?.display_name || 'Victoria Sterling (Root)'}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs font-mono text-[11px] text-slate-400 truncate">
                      {JSON.stringify(log.metadata || {})}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
