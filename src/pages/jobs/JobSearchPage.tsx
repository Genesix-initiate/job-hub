import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  SlidersHorizontal,
  X,
  ChevronDown,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { dataService, JobWithCompany } from '../../lib/dataService';
import { JobCategory } from '../../types/database';
import { JobCard } from '../../components/common/JobCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { SEO } from '../../components/common/SEO';

export function JobSearchPage() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [totalJobs, setTotalJobs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'salary_high' | 'salary_low' | 'relevance'>('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    dataService.getCategories().then(setCategories);
    if (profile?.id) {
      dataService.getSavedJobs(profile.id).then((saved) => {
        setSavedJobIds(new Set(saved.map((j) => j.id)));
      });
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchJobs();
  }, [searchQuery, selectedCategory, locationQuery, workMode, employmentType, sortBy, currentPage]);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await dataService.getJobs({
        query: searchQuery,
        category: selectedCategory,
        location: locationQuery,
        workMode,
        employmentType,
        sortBy,
        page: currentPage,
        limit: pageSize,
      });
      setJobs(res.jobs);
      setTotalJobs(res.total);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setLocationQuery('');
    setWorkMode('');
    setEmploymentType('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedCategory || locationQuery || workMode || employmentType
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <SEO
        title="Find Tech & Executive Jobs"
        description="Search verified full-time, contract, and remote positions across Nigeria and worldwide on JOBHUB powered by genesix initiate group ltd."
        canonicalPath="/jobs"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Jobs', path: '/jobs' },
        ]}
      />

      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div>
          <span className="text-[11px] font-semibold uppercase text-emerald-400 tracking-wider">
            Explore Opportunities on JOBHUB
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Find Your Next Career Move
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Search verified tech openings across Nigeria, Africa, and global tech hubs. Full-time, contract, remote, and graduate trainee positions.
          </p>
        </div>

        {/* Search Inputs Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-950 p-2 sm:p-3 rounded-2xl border border-slate-800 shadow-xl">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Job title, keywords, or company..."
              className="w-full bg-slate-900/60 border border-slate-800/80 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-4 relative">
            <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="e.g. Lagos, Abuja, Remote Nigeria, Global..."
              className="w-full bg-slate-900/60 border border-slate-800/80 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800/80 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
            >
              <option value="">All Work Modes</option>
              <option value="remote">Remote Only</option>
              <option value="hybrid">Hybrid</option>
              <option value="on_site">On-site</option>
            </select>

            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden p-2.5 bg-slate-800 rounded-xl text-slate-300 hover:text-white"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Nigerian and Global Location Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
          <span className="text-slate-400 text-[11px] font-medium mr-1">Popular Locations:</span>
          {[
            { label: '🇳🇬 Lagos (VI/Lekki)', val: 'Lagos' },
            { label: '🇳🇬 Abuja (FCT)', val: 'Abuja' },
            { label: '🇳🇬 Remote Nigeria', val: 'Nigeria' },
            { label: '🌐 Global Remote', val: 'Remote' },
            { label: '🇺🇸 United States', val: 'United States' },
            { label: '🇬🇧 London / UK', val: 'London' },
          ].map((loc) => (
            <button
              key={loc.val}
              type="button"
              onClick={() => setLocationQuery(locationQuery === loc.val ? '' : loc.val)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer border ${
                locationQuery === loc.val
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
              }`}
            >
              {loc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Filters Sidebar */}
        <aside
          className={`lg:col-span-3 space-y-5 bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl ${
            showMobileFilters ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              Filter Results
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Employment Type</label>
            <div className="space-y-1.5 text-xs text-slate-300">
              {[
                { id: '', label: 'Any Type' },
                { id: 'full_time', label: 'Full-time' },
                { id: 'part_time', label: 'Part-time' },
                { id: 'contract', label: 'Contract' },
                { id: 'internship', label: 'Internship' },
              ].map((t) => (
                <label key={t.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="employmentType"
                    checked={employmentType === t.id}
                    onChange={() => setEmploymentType(t.id)}
                    className="text-emerald-500 focus:ring-emerald-500 h-3.5 w-3.5"
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Work Mode */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Work Mode</label>
            <div className="space-y-1.5 text-xs text-slate-300">
              {[
                { id: '', label: 'All Modes' },
                { id: 'remote', label: 'Remote' },
                { id: 'hybrid', label: 'Hybrid' },
                { id: 'on_site', label: 'On-site' },
              ].map((m) => (
                <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="workModeFilter"
                    checked={workMode === m.id}
                    onChange={() => setWorkMode(m.id)}
                    className="text-emerald-500 focus:ring-emerald-500 h-3.5 w-3.5"
                  />
                  <span>{m.label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Results List */}
        <section className="lg:col-span-9 space-y-4">
          {/* Results Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/30 border border-slate-800/80 px-4 py-3 rounded-2xl">
            <div className="text-xs text-slate-400">
              Showing <strong className="text-white">{jobs.length}</strong> of{' '}
              <strong className="text-white">{totalJobs}</strong> open positions
              {hasActiveFilters && <span className="text-emerald-400 font-medium"> (filtered)</span>}
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 shrink-0">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="salary_high">Salary: High to Low</option>
                <option value="salary_low">Salary: Low to High</option>
              </select>
            </div>
          </div>

          {/* Cards List */}
          {isLoading ? (
            <LoadingSpinner message="Searching verified jobs..." />
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No jobs found matching your criteria"
              description="Try adjusting your keywords, expanding your location radius, or resetting your filter parameters."
              actionText="Reset Filters"
              onAction={clearAllFilters}
            />
          ) : (
            <div className="space-y-3.5">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSavedInitial={savedJobIds.has(job.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
