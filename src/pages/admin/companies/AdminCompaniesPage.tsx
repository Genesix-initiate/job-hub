import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Clock,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Download,
} from 'lucide-react';
import { adminService } from '../../../lib/adminService';
import { Company } from '../../../types/database';
import { useAuth } from '../../../context/AuthContext';

export function AdminCompaniesPage() {
  const navigate = useNavigate();
  const { profile: currentAdmin } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getCompanies({
        status: activeTab === 'all' ? undefined : activeTab,
        search,
      });
      setCompanies(res.companies);
    } catch (err) {
      console.warn('Error fetching companies', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCompanies();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-400" />
            Company & Entity Verification Oversight
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review incorporation credentials, commercial licenses, and verification statuses
          </p>
        </div>

        <button
          onClick={async () => {
            const csv = await adminService.exportDataset('companies', currentAdmin?.id || 'admin');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `jobhub-companies-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-200 transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Companies CSV</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs w-full md:w-auto">
          {[
            { id: 'all', label: 'All Companies' },
            { id: 'pending', label: 'Pending Verification' },
            { id: 'verified', label: 'Verified' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeTab === tab.id ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company name, industry..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </form>
      </div>

      {/* Companies Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Company Entity</th>
                <th className="py-3 px-4">Industry & Size</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4">Verified Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading enterprise records...
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No companies in this status category.
                  </td>
                </tr>
              ) : (
                companies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100'}
                          alt={c.company_name}
                          className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-white">{c.company_name}</p>
                          <p className="text-slate-400 text-[11px] font-mono">{c.website || 'No website'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{c.industry}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{c.company_size || 'Unknown'} staff</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {c.city ? `${c.city}, ${c.country}` : c.country || 'Global'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                          c.verification_status === 'verified'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : c.verification_status === 'pending' || c.verification_status === 'under_review'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {c.verification_status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">
                      {c.verified_at ? new Date(c.verified_at).toLocaleDateString() : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/companies/${c.id}`)}
                        className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium text-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect & Review</span>
                      </button>
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
