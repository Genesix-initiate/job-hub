import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  Bookmark,
  Share2,
  Flag,
  CheckCircle2,
  Calendar,
  GraduationCap,
  Users,
  Building2,
  ArrowLeft,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { dataService, JobWithCompany } from '../../lib/dataService';
import { WorkModeBadge, EmploymentTypeBadge } from '../../components/common/StatusBadge';
import { ApplyJobModal } from '../apply/ApplyJobModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';
import { SEO, buildJobPostingSchema } from '../../components/common/SEO';

export function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [job, setJob] = useState<JobWithCompany | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Misleading salary or position info');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      dataService.getJobById(id).then((found) => {
        setJob(found);
        setIsLoading(false);
      });

      if (profile?.id) {
        dataService.getSavedJobs(profile.id).then((saved) => {
          setIsSaved(saved.some((j) => j.id === id));
        });
      }
    }
  }, [id, profile?.id]);

  const handleToggleSave = async () => {
    if (!profile) {
      navigate('/login');
      return;
    }
    if (job) {
      const nowSaved = await dataService.toggleSaveJob(profile.id, job.id);
      setIsSaved(nowSaved);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setIsReportModalOpen(false);
      setReportSubmitted(false);
      setReportDescription('');
    }, 1800);
  };

  if (isLoading) {
    return <LoadingSpinner message="Retrieving job position details..." />;
  }

  if (!job) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-lg font-bold text-white">Job Position Not Found</h2>
        <p className="text-xs text-slate-400">The position you requested may have expired or been removed.</p>
        <button
          onClick={() => navigate('/jobs')}
          className="bg-emerald-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer"
        >
          Return to Job Search
        </button>
      </div>
    );
  }

  const formattedSalary =
    job.salary_min && job.salary_max
      ? `${job.salary_currency} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} / ${job.salary_period}`
      : job.salary_min
      ? `From ${job.salary_currency} ${job.salary_min.toLocaleString()} / ${job.salary_period}`
      : 'Competitive Salary';

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      <SEO
        title={`${job.title} at ${job.company?.company_name || 'Hiring Partner'}`}
        description={`${job.title} vacancy in ${job.city || 'Remote'}: ${job.description.slice(0, 140)}...`}
        canonicalPath={`/jobs/${job.id}`}
        ogImage={job.company?.logo_url}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Jobs', path: '/jobs' },
          { name: job.title, path: `/jobs/${job.id}` },
        ]}
        jsonLd={buildJobPostingSchema(job, typeof window !== 'undefined' ? `${window.location.origin}/jobs/${job.id}` : `/jobs/${job.id}`)}
      />

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to search results</span>
      </button>

      {/* Main Header Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={job.company?.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150'}
              alt={job.company?.company_name}
              className="w-16 h-16 rounded-2xl object-cover bg-slate-800 border border-slate-700/80 shrink-0 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link
                  to={`/companies/${job.company?.id}`}
                  className="text-xs font-semibold text-slate-300 hover:text-emerald-400 transition flex items-center gap-1.5"
                >
                  <span>{job.company?.company_name}</span>
                  {job.company?.verification_status === 'verified' && (
                    <span title="Verified Employer">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    </span>
                  )}
                </Link>
                <span className="text-slate-600">&bull;</span>
                <span className="text-xs text-slate-400">{job.company?.industry}</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{job.city ? `${job.city}, ${job.state || job.country}` : job.country}</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <DollarSign className="w-3.5 h-3.5 shrink-0" />
                  <span>{formattedSalary}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Top Bar */}
          <div className="flex sm:flex-col items-center sm:items-end gap-2.5 shrink-0">
            {job.status === 'paused' ? (
              <button
                disabled
                className="w-full sm:w-auto bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider cursor-not-allowed"
              >
                Applications Paused
              </button>
            ) : job.status === 'closed' ? (
              <button
                disabled
                className="w-full sm:w-auto bg-slate-800 text-slate-500 border border-slate-700 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider cursor-not-allowed"
              >
                Position Closed
              </button>
            ) : (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs transition duration-150 cursor-pointer shadow-lg shadow-emerald-500/25 uppercase tracking-wider"
              >
                APPLY NOW
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleSave}
                className={`p-2.5 rounded-xl border transition cursor-pointer ${
                  isSaved
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                }`}
                title={isSaved ? 'Unsave' : 'Save'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-400' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
                title="Share link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsReportModalOpen(true)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-500 hover:text-rose-400 border border-slate-700 transition cursor-pointer"
                title="Report job"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Spec Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Work Mode</span>
            <WorkModeBadge mode={job.work_mode} />
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Employment Type</span>
            <EmploymentTypeBadge type={job.employment_type} />
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Experience Required</span>
            <span className="text-white font-medium">{job.experience_min} - {job.experience_max || '8+'} Years</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Vacancies</span>
            <span className="text-white font-medium">{job.vacancies} open spots</span>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Job Description, Responsibilities, Requirements */}
        <div className="lg:col-span-8 space-y-6">
          {/* Description */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-3">
            <h3 className="text-sm font-semibold text-white tracking-tight">Role Overview</h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && (
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-3">
              <h3 className="text-sm font-semibold text-white tracking-tight">Key Responsibilities</h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {job.responsibilities}
              </p>
            </div>
          )}

          {/* Requirements & Qualifications */}
          {job.requirements && (
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-3">
              <h3 className="text-sm font-semibold text-white tracking-tight">Qualifications &amp; Requirements</h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {job.requirements}
              </p>
              {job.education_requirement && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
                  <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Education:</strong> {job.education_requirement}</span>
                </div>
              )}
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-3">
              <h3 className="text-sm font-semibold text-white tracking-tight">Perks &amp; Benefits</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {job.benefits.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Company Snapshot & Sticky Apply Card */}
        <div className="lg:col-span-4 space-y-5">
          {/* Company Card */}
          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              About the Employer
            </h3>

            <div className="flex items-center gap-3">
              <img
                src={job.company?.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100'}
                alt={job.company?.company_name}
                className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-slate-700"
              />
              <div>
                <h4 className="text-sm font-bold text-white">{job.company?.company_name}</h4>
                <p className="text-[11px] text-slate-400">{job.company?.company_size} Employees</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
              {job.company?.description}
            </p>

            <div className="pt-2 border-t border-slate-800 text-xs space-y-2 text-slate-400">
              <div className="flex justify-between">
                <span>Headquarters</span>
                <span className="text-white">{job.company?.city}, {job.company?.country}</span>
              </div>
              <div className="flex justify-between">
                <span>Founded</span>
                <span className="text-white">{job.company?.founded_year || '2019'}</span>
              </div>
            </div>

            <Link
              to={`/companies/${job.company?.id}`}
              className="block text-center w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2 rounded-xl transition"
            >
              View Company Profile &amp; Jobs
            </Link>
          </div>

          {/* Sticky Apply Action Card */}
          <div className="bg-gradient-to-b from-slate-900/70 to-slate-900/40 border border-emerald-500/30 p-5 rounded-2xl space-y-3">
            <h4 className="text-sm font-semibold text-white">Ready to apply?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Applications are reviewed directly by the {job.company?.company_name} hiring team. You will receive real-time notifications on status changes.
            </p>
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 uppercase tracking-wider"
            >
              APPLY NOW
            </button>
          </div>
        </div>
      </div>

      {/* Multi-step Application Modal */}
      <ApplyJobModal
        job={job}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={(ref) => {
          // Handled inside modal, then can navigate to applications
        }}
      />

      {/* Report Job Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Job Posting"
      >
        {reportSubmitted ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-semibold text-white">Report Submitted</h4>
            <p className="text-xs text-slate-400">
              Thank you for keeping our platform safe. Our content moderation team will review this listing.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Reason for Report</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Misleading salary or position info">Misleading salary or position info</option>
                <option value="Suspected scam or fraudulent recruiter">Suspected scam or fraudulent recruiter</option>
                <option value="Discriminatory requirements">Discriminatory requirements</option>
                <option value="Expired or duplicate job">Expired or duplicate job</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Additional Details</label>
              <textarea
                rows={4}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Please describe why this listing violates guidelines..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-semibold rounded-xl text-xs"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
