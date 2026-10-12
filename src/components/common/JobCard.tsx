import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  Bookmark,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { JobWithCompany, dataService } from '../../lib/dataService';
import { WorkModeBadge, EmploymentTypeBadge } from './StatusBadge';
import { useAuth } from '../../context/AuthContext';

interface JobCardProps {
  job: JobWithCompany;
  isSavedInitial?: boolean;
  onSaveChange?: (saved: boolean) => void;
  matchScore?: number;
}

export function JobCard({ job, isSavedInitial = false, onSaveChange, matchScore }: JobCardProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profile) {
      navigate('/login');
      return;
    }
    setIsSaving(true);
    try {
      const nowSaved = await dataService.toggleSaveJob(profile.id, job.id);
      setIsSaved(nowSaved);
      if (onSaveChange) onSaveChange(nowSaved);
    } finally {
      setIsSaving(false);
    }
  };

  const getCurrencySymbol = (c?: string) => {
    if (c === 'NGN') return '₦';
    if (c === 'USD') return '$';
    if (c === 'EUR') return '€';
    if (c === 'GBP') return '£';
    return c || '$';
  };

  const currSym = getCurrencySymbol(job.salary_currency);
  const periodText = job.salary_period ? `/${job.salary_period}` : '';

  const formattedSalary =
    job.salary_min && job.salary_max
      ? `${currSym}${job.salary_min.toLocaleString()} - ${currSym}${job.salary_max.toLocaleString()} ${periodText}`
      : job.salary_min
      ? `From ${currSym}${job.salary_min.toLocaleString()} ${periodText}`
      : 'Competitive Compensation';

  const postedAgo = Math.max(1, Math.round((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="group bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/40 p-5 rounded-2xl transition duration-200 cursor-pointer flex flex-col justify-between relative shadow-sm hover:shadow-lg hover:shadow-emerald-950/20"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <img
              src={job.company?.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100'}
              alt={job.company?.company_name || 'Company'}
              className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-slate-700/80 shrink-0"
              loading="lazy"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300 transition">
                  {job.company?.company_name}
                </span>
                {job.company?.verification_status === 'verified' && (
                  <span title="Verified Employer">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </span>
                )}
              </div>

              <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-emerald-400 transition tracking-tight mt-0.5 line-clamp-1">
                {job.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {matchScore !== undefined && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {matchScore}% Match
              </span>
            )}

            <button
              onClick={handleToggleSave}
              disabled={isSaving}
              aria-label={isSaved ? 'Unsave Job' : 'Save Job'}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isSaved
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-700/60'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Location & Metadata */}
        <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              {job.city ? `${job.city}, ${job.state || job.country}` : job.country || 'Global'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{formattedSalary} / {job.salary_period}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{job.experience_min} - {job.experience_max || '8+'} yrs exp</span>
          </div>
        </div>

        {/* Badges / Chips */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <WorkModeBadge mode={job.work_mode} />
          <EmploymentTypeBadge type={job.employment_type} />
          {job.is_featured && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Posted {postedAgo === 1 ? 'today' : `${postedAgo}d ago`}</span>
        </div>

        {job.application_deadline && (
          <div className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>Apply before {new Date(job.application_deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
      </div>
    </div>
  );
}
