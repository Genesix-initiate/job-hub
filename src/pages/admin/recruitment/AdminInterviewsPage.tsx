import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Search,
  Filter,
  Video,
  Clock,
  User,
  Building2,
  Calendar,
} from 'lucide-react';

export function AdminInterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);

  useEffect(() => {
    try {
      const raw =
        localStorage.getItem('jobhub_interviews') ||
        localStorage.getItem('tf_emp_interviews');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setInterviews(parsed);
        }
      }
    } catch (e) {
      console.warn('Error reading interviews', e);
    }
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <CalendarCheck2 className="w-6 h-6 text-teal-400" />
          Interviews Oversight & Schedule Audit
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor scheduled candidate video evaluations, durations, and interviewer completion
        </p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Interview Session</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Employer Company</th>
                <th className="py-3 px-4">Scheduled Date & Time</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Meeting Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {interviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <CalendarCheck2 className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                    <p className="text-xs font-semibold text-slate-400">No scheduled interviews found</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      When employers schedule video interviews or technical screenings with candidates, they will be tracked here.
                    </p>
                  </td>
                </tr>
              ) : (
                interviews.map((int) => (
                  <tr key={int.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{int.title}</p>
                      <span className="text-[10px] font-mono text-teal-400 uppercase">{int.type}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-white font-medium">{int.candidate}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{int.candidate_email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{int.company}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {new Date(int.scheduled_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">{int.duration} mins</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                          int.status === 'confirmed' || int.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {int.status}
                      </span>
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
