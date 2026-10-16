import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Search,
  Filter,
  Eye,
  Building2,
  User,
  Calendar,
  Briefcase,
  Download,
  Mail,
  Zap,
  CheckCircle2,
  X,
  Send,
} from 'lucide-react';
import { adminService } from '../../../lib/adminService';
import { Application, Profile, Job } from '../../../types/database';
import { useAuth } from '../../../context/AuthContext';
import { adminNotificationService } from '../../../services/adminNotificationService';
import { ApplicationNotificationStatus } from '../../../types/edgeNotification';

export function AdminApplicationsPage() {
  const navigate = useNavigate();
  const { profile: currentAdmin } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Email Notification Modal State
  const [selectedAppForEmail, setSelectedAppForEmail] = useState<any | null>(null);
  const [emailStatus, setEmailStatus] = useState<ApplicationNotificationStatus>('interview');
  const [emailNotes, setEmailNotes] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    // Load real candidate applications from persistent storage or database
    let realApps: any[] = [];
    try {
      const raw =
        localStorage.getItem('jobhub_employer_applications') ||
        localStorage.getItem('tf_emp_employer_applications') ||
        localStorage.getItem('jobhub_applications');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          realApps = parsed.map((a: any) => ({
            id: a.id || `app-${Date.now()}`,
            application_reference: a.application_reference || `APP-${(a.id || '0000').slice(0, 8).toUpperCase()}`,
            applicant_name: a.applicant?.display_name || (a.applicant?.first_name ? `${a.applicant.first_name} ${a.applicant.last_name || ''}`.trim() : 'Applicant'),
            applicant_email: a.applicant?.email || a.email || 'applicant@candidate.com',
            job_title: a.job?.title || 'Job Opening',
            company_name: a.job?.company?.company_name || 'Hiring Organization',
            status: a.status || 'applied',
            applied_at: a.applied_at || a.created_at || new Date().toISOString(),
          }));
        }
      }
    } catch (e) {
      console.warn('Failed parsing local applications', e);
    }

    setApplications(realApps);
    setIsLoading(false);
  }, []);

  const filtered = applications.filter((app) => {
    const matchStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchSearch =
      !search ||
      app.applicant_name.toLowerCase().includes(search.toLowerCase()) ||
      app.job_title.toLowerCase().includes(search.toLowerCase()) ||
      app.application_reference.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-purple-400" />
            Applications Oversight & ATS Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global view of candidate submissions, hiring funnel progression, and compliance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/notifications/email-automation')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs text-indigo-300 font-semibold transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Automated Email Engine</span>
          </button>

          <button
            onClick={async () => {
              const csv = await adminService.exportDataset('applications', currentAdmin?.id || 'admin');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `jobhub-applications-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-200 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate, job, reference..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Stages</option>
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Application Ref</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Target Job</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <FileCheck2 className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                    <p className="text-xs font-semibold text-slate-400">No applications recorded yet</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Candidate submissions received across all published jobs will appear here for oversight.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-300 font-semibold">
                      {app.application_reference}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{app.applicant_name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{app.applicant_email}</p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">{app.job_title}</td>

                    <td className="py-3.5 px-4 text-slate-400 font-medium">{app.company_name}</td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                          app.status === 'hired'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : app.status === 'interview'
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                            : app.status === 'shortlisted'
                            ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedAppForEmail(app);
                            setEmailStatus(app.status || 'interview');
                            setEmailNotes(`Status updated to ${app.status} during admin oversight.`);
                          }}
                          className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                          title="Trigger Automated Email via Edge Function"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/applications/${app.id}`)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                          title="Inspect Application Dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500 text-emerald-300 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Quick Edge Function Dispatch Modal */}
      {selectedAppForEmail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  Dispatch Edge Function Email
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {selectedAppForEmail.applicant_name} ({selectedAppForEmail.applicant_email})
                </span>
              </div>
              <button
                onClick={() => setSelectedAppForEmail(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Notification Status Stage</label>
                <select
                  value={emailStatus}
                  onChange={(e) => setEmailStatus(e.target.value as ApplicationNotificationStatus)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                >
                  <option value="applied">Applied (Received & Processing)</option>
                  <option value="under_review">Under Review (Screening)</option>
                  <option value="shortlisted">Shortlisted for Interview</option>
                  <option value="interview">Interview Invitation Scheduled</option>
                  <option value="offer">Job Offer Extended</option>
                  <option value="hired">Hired & Welcome Onboarding</option>
                  <option value="rejected">Respectful Decision Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notes / Custom Message for Candidate</label>
                <textarea
                  rows={3}
                  value={emailNotes}
                  onChange={(e) => setEmailNotes(e.target.value)}
                  placeholder="Optional notes to include in candidate notification..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 font-mono">
                Dispatches immediately via Supabase Edge Function: <strong>/dispatch-notification</strong>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAppForEmail(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSendingEmail}
                  onClick={async () => {
                    setIsSendingEmail(true);
                    try {
                      await adminNotificationService.triggerApplicationStatusNotification({
                        applicationId: selectedAppForEmail.application_reference || selectedAppForEmail.id,
                        applicantName: selectedAppForEmail.applicant_name,
                        applicantEmail: selectedAppForEmail.applicant_email,
                        jobTitle: selectedAppForEmail.job_title,
                        companyName: selectedAppForEmail.company_name,
                        status: emailStatus,
                        notes: emailNotes,
                        interviewDate: emailStatus === 'interview' ? 'Thursday at 3:00 PM UTC' : undefined,
                      });

                      // Update local application state
                      setApplications((prev) =>
                        prev.map((a) =>
                          a.id === selectedAppForEmail.id ? { ...a, status: emailStatus } : a
                        )
                      );

                      setSelectedAppForEmail(null);
                      setToastMsg(`Dispatched Edge email to ${selectedAppForEmail.applicant_email}!`);
                      setTimeout(() => setToastMsg(null), 4000);
                    } catch (err: any) {
                      alert(`Error dispatching: ${err.message}`);
                    } finally {
                      setIsSendingEmail(false);
                    }
                  }}
                  className="w-1/2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition cursor-pointer"
                >
                  <Send className={`w-3.5 h-3.5 ${isSendingEmail ? 'animate-bounce' : ''}`} />
                  <span>{isSendingEmail ? 'Dispatching...' : 'Dispatch via Edge'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
