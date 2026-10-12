import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  FileCheck2,
  Clock,
  Calendar,
  Building2,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export function ApplicationsListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeFilter = searchParams.get('status') || 'all';

  useEffect(() => {
    if (profile?.id) {
      setIsLoading(true);
      dataService.getApplications(profile.id).then((data) => {
        setApplications(data);
        setIsLoading(false);
      });
    }
  }, [profile?.id]);

  const filteredApps = applications.filter((app) => {
    if (activeFilter === 'all') return true;
    return app.status === activeFilter;
  });

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'applied', label: 'Applied' },
    { id: 'under_review', label: 'Under Review' },
    { id: 'shortlisted', label: 'Shortlisted' },
    { id: 'interview', label: 'Interview' },
    { id: 'offer', label: 'Offers' },
    { id: 'hired', label: 'Hired' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'withdrawn', label: 'Withdrawn' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <span className="text-[11px] font-semibold uppercase text-emerald-400 tracking-wider">
          Application Tracking
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
          My Applications
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Track real-time hiring stage transitions and view reference records for all submitted roles.
        </p>
      </div>

      {/* Filter Tabs Header */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800/80 text-xs">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          const count =
            tab.id === 'all'
              ? applications.length
              : applications.filter((a) => a.status === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ status: tab.id })}
              className={`px-3 py-1.5 rounded-xl font-medium transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Applications Cards List */}
      {isLoading ? (
        <LoadingSpinner message="Fetching your submitted applications..." />
      ) : filteredApps.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No applications match this filter"
          description="Start discovering vetted roles and submit your profile to initiate hiring discussions."
          actionText="Find Jobs"
          onAction={() => navigate('/jobs')}
        />
      ) : (
        <div className="space-y-3.5">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              onClick={() => navigate(`/job-seeker/applications/${app.id}`)}
              className="group bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-5 rounded-2xl transition duration-150 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <img
                  src={
                    app.job?.company?.logo_url ||
                    'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100'
                  }
                  alt={app.job?.company?.company_name || 'Company'}
                  className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-slate-700 shrink-0"
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400">
                      {app.job?.company?.company_name}
                    </span>
                    <span className="text-slate-600">&bull;</span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      {app.application_reference}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-emerald-400 transition tracking-tight">
                    {app.job?.title || 'Senior Software Role'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Applied on {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                    <span>&bull;</span>
                    <span>
                      {app.job?.city}, {app.job?.state || app.job?.country}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/80">
                <StatusBadge status={app.status} size="md" />
                <span className="text-[11px] text-slate-500 group-hover:text-slate-300 flex items-center gap-0.5 transition">
                  <span>View Timeline</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
