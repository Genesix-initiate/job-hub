import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck2,
  Clock,
  Video,
  MapPin,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export function InterviewsListPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      setIsLoading(true);
      dataService.getInterviews(profile.id).then((list) => {
        setInterviews(list);
        setIsLoading(false);
      });
    }
  }, [profile?.id]);

  const filtered = interviews.filter((itw) => {
    if (activeTab === 'upcoming') return itw.status === 'scheduled' || itw.status === 'confirmed';
    if (activeTab === 'completed') return itw.status === 'completed';
    return itw.status === 'cancelled';
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <span className="text-[11px] font-semibold uppercase text-emerald-400 tracking-wider">
          Recruitment Schedules
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
          Interviews &amp; Meetings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          View scheduled sessions, test your camera/mic beforehand, and join virtual meeting rooms.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        {[
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading interview schedules..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarCheck2}
          title={`No ${activeTab} interviews`}
          description="When employers invite you for discussions, interview calendar links will appear here."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((itw) => (
            <div
              key={itw.id}
              onClick={() => navigate(`/job-seeker/interviews/${itw.id}`)}
              className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-5 rounded-2xl transition duration-150 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <img
                  src={
                    itw.company?.logo_url ||
                    'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100'
                  }
                  alt={itw.company?.company_name}
                  className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-slate-700 shrink-0"
                />

                <div className="space-y-1">
                  <span className="text-xs font-medium text-slate-400">
                    {itw.company?.company_name}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {itw.title}
                  </h3>
                  <p className="text-xs text-emerald-400 font-medium">Role: {itw.job?.title}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      {new Date(itw.scheduled_at).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {itw.duration_minutes} Minutes
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-slate-500" />
                      {itw.interview_type} interview
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                  {itw.status}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-0.5">
                  <span>Prepare</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
