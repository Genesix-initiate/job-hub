import React, { useState } from 'react';
import {
  BellRing,
  Plus,
  Play,
  Pause,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export function JobAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([
    {
      id: 'a1',
      name: 'Senior Frontend TypeScript (Remote)',
      keywords: 'TypeScript, React, Frontend',
      location: 'Remote / US',
      salary_min: 140000,
      frequency: 'daily',
      is_active: true,
    },
    {
      id: 'a2',
      name: 'Full-Stack Distributed Systems',
      keywords: 'Node.js, PostgreSQL, Docker',
      location: 'San Francisco, CA',
      salary_min: 130000,
      frequency: 'weekly',
      is_active: true,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('Remote');
  const [salaryMin, setSalaryMin] = useState(130000);
  const [frequency, setFrequency] = useState('daily');

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert = {
      id: `alert-${Date.now()}`,
      name,
      keywords,
      location,
      salary_min: Number(salaryMin),
      frequency,
      is_active: true,
    };
    setAlerts([newAlert, ...alerts]);
    setIsModalOpen(false);
    setName('');
    setKeywords('');
  };

  const toggleAlertStatus = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_active: !a.is_active } : a))
    );
  };

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase text-emerald-400 tracking-wider">
            Automated Matching
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Job Alerts
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Receive automated notifications the moment a relevant opening matches your parameters.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Job Alert</span>
        </button>
      </div>

      <div className="space-y-3.5">
        {alerts.map((al) => (
          <div
            key={al.id}
            className={`p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              al.is_active
                ? 'bg-slate-900/60 border-slate-800'
                : 'bg-slate-900/20 border-slate-800/40 opacity-70'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{al.name}</h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                    al.is_active
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {al.is_active ? 'Active' : 'Paused'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                <span>Keywords: <strong className="text-slate-200">{al.keywords}</strong></span>
                <span>&bull;</span>
                <span>Location: {al.location}</span>
                <span>&bull;</span>
                <span>From ${al.salary_min.toLocaleString()}</span>
                <span>&bull;</span>
                <span className="capitalize">{al.frequency} summary</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleAlertStatus(al.id)}
                className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  al.is_active
                    ? 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {al.is_active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{al.is_active ? 'Pause' : 'Resume'}</span>
              </button>

              <button
                onClick={() => deleteAlert(al.id)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 transition cursor-pointer"
                title="Delete Alert"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Alert Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Job Alert">
        <form onSubmit={handleCreateAlert} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Alert Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lead TypeScript Engineer (Remote)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Keywords &amp; Skills</label>
            <input
              type="text"
              required
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. React, TypeScript, GraphQL"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Location Preference</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Minimum Compensation ($)</label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Dispatch Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Summary</option>
              <option value="instant">Instant Real-time Alerts</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs"
            >
              Save Alert
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
