import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService, JobWithCompany } from '../../lib/dataService';
import { JobCard } from '../../components/common/JobCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export function SavedJobsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [savedJobs, setSavedJobs] = useState<JobWithCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      loadSavedJobs();
    }
  }, [profile?.id]);

  const loadSavedJobs = async () => {
    if (!profile) return;
    setIsLoading(true);
    const list = await dataService.getSavedJobs(profile.id);
    setSavedJobs(list);
    setIsLoading(false);
  };

  const handleSaveChange = (jobId: string, isSavedNow: boolean) => {
    if (!isSavedNow) {
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <span className="text-[11px] font-semibold uppercase text-emerald-400 tracking-wider">
          Bookmarks &amp; Saved
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
          Saved Jobs
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Roles you have bookmarked for later review or preparation.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading your saved job positions..." />
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="You haven't saved any jobs yet."
          description="Browse open roles and click the bookmark icon on any job card to save it here."
          actionText="Find Jobs"
          onAction={() => navigate('/jobs')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSavedInitial={true}
              onSaveChange={(saved) => handleSaveChange(job.id, saved)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
