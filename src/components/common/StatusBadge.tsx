import React from 'react';
import { ApplicationStatus, WorkMode, EmploymentType } from '../../types/database';

interface StatusBadgeProps {
  status: ApplicationStatus | string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  const getStyle = () => {
    switch (status) {
      case 'applied':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'under_review':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'shortlisted':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'assessment':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
      case 'interview':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-medium animate-pulse';
      case 'selected':
      case 'offer':
        return 'bg-teal-500/15 text-teal-300 border-teal-500/30 font-medium';
      case 'hired':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 font-semibold';
      case 'rejected':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'withdrawn':
        return 'bg-slate-700/50 text-slate-400 border-slate-600/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'under_review':
        return 'Under Review';
      case 'shortlisted':
        return 'Shortlisted';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium border uppercase tracking-wider ${sizeClasses} ${getStyle()}`}>
      {getLabel()}
    </span>
  );
}

export function WorkModeBadge({ mode }: { mode: WorkMode | string }) {
  const styles = {
    remote: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    hybrid: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    on_site: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const labels = {
    remote: 'Remote',
    hybrid: 'Hybrid',
    on_site: 'On-site',
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${styles[mode as keyof typeof styles] || styles.on_site}`}>
      {labels[mode as keyof typeof labels] || mode}
    </span>
  );
}

export function EmploymentTypeBadge({ type }: { type: EmploymentType | string }) {
  const labels: Record<string, string> = {
    full_time: 'Full-time',
    part_time: 'Part-time',
    contract: 'Contract',
    temporary: 'Temporary',
    internship: 'Internship',
    graduate_trainee: 'Graduate Trainee',
    freelance: 'Freelance',
  };

  return (
    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/80">
      {labels[type] || type}
    </span>
  );
}
