import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  UserCheck,
  Search,
  Filter,
  Eye,
  FileText,
  MapPin,
  Calendar,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { adminService } from '../../../lib/adminService';
import { Profile } from '../../../types/database';

export function AdminJobSeekersPage() {
  const navigate = useNavigate();
  const [jobSeekers, setJobSeekers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService.getUsers({ role: 'job_seeker' }).then((res) => {
      setJobSeekers(res.users);
      setIsLoading(false);
    });
  }, []);

  const filtered = jobSeekers.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.first_name.toLowerCase().includes(q) ||
      u.last_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-400" />
            Job Seeker & Candidate Oversight
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered candidates, curriculum vitae profiles, skills assessments, and applications
          </p>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates by name, email, or skill..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            Querying candidate records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500">
            No candidates matching search criteria.
          </div>
        ) : (
          filtered.map((seeker) => (
            <div
              key={seeker.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={seeker.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={seeker.display_name || 'Candidate'}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
                    />
                    <div>
                      <h3 className="font-semibold text-white text-sm">
                        {seeker.first_name} {seeker.last_name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">{seeker.email}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      seeker.account_status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {seeker.account_status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{seeker.city ? `${seeker.city}, ${seeker.country}` : 'Remote candidate'}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono">Joined {new Date(seeker.created_at).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => navigate(`/admin/users/${seeker.id}`)}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Dossier</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
