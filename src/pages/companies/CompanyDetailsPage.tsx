import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Users,
  CheckCircle2,
  ExternalLink,
  Mail,
  Phone,
  ArrowLeft,
  Briefcase,
} from 'lucide-react';
import { dataService, JobWithCompany } from '../../lib/dataService';
import { Company } from '../../types/database';
import { JobCard } from '../../components/common/JobCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SEO, buildOrganizationSchema } from '../../components/common/SEO';

export function CompanyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyJobs, setCompanyJobs] = useState<JobWithCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      Promise.all([
        dataService.getCompanyById(id),
        dataService.getJobs({ limit: 20 }),
      ]).then(([comp, allJobs]) => {
        setCompany(comp);
        setCompanyJobs(allJobs.jobs.filter((j) => j.company_id === id));
        setIsLoading(false);
      });
    }
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner message="Loading company profile and vacancies..." />;
  }

  if (!company) {
    return (
      <div className="text-center py-16 space-y-3">
        <h3 className="text-base font-bold text-white">Company Not Found</h3>
        <button
          onClick={() => navigate('/companies')}
          className="bg-emerald-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs"
        >
          Back to Companies
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200">
      <SEO
        title={`${company.company_name} - Careers & Jobs`}
        description={company.description ? `${company.description.slice(0, 140)}...` : `Explore career opportunities at ${company.company_name} on JOBHUB powered by genesix initiate group ltd.`}
        canonicalPath={`/companies/${company.id}`}
        ogImage={company.logo_url}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Companies', path: '/companies' },
          { name: company.company_name, path: `/companies/${company.id}` },
        ]}
        jsonLd={buildOrganizationSchema(company, typeof window !== 'undefined' ? `${window.location.origin}/companies/${company.id}` : `/companies/${company.id}`)}
      />

      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to listings</span>
      </button>

      {/* Header Profile */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <img
              src={company.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150'}
              alt={company.company_name}
              className="w-20 h-20 rounded-2xl object-cover bg-slate-800 border border-slate-700 shrink-0 shadow-lg"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {company.company_name}
                </h1>
                {company.verification_status === 'verified' && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Employer
                  </span>
                )}
              </div>

              <p className="text-xs text-emerald-400 font-medium">{company.industry}</p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {company.city}, {company.country}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  {company.company_size} Employees
                </span>
                <span>&bull;</span>
                <span>Founded {company.founded_year || '2018'}</span>
              </div>
            </div>
          </div>

          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition inline-flex items-center gap-1.5 shrink-0"
            >
              <span>Visit Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="pt-5 border-t border-slate-800/80">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Company Overview
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            {company.description}
          </p>
        </div>
      </div>

      {/* Open Positions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>Active Openings ({companyJobs.length})</span>
          </h2>
        </div>

        {companyJobs.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
            There are currently no active published job openings for {company.company_name}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companyJobs.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
