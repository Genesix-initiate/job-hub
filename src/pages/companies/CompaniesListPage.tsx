import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, MapPin, Users, CheckCircle2, Search, ExternalLink } from 'lucide-react';
import { dataService } from '../../lib/dataService';
import { Company } from '../../types/database';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SEO } from '../../components/common/SEO';

export function CompaniesListPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dataService.getCompanies().then((list) => {
      setCompanies(list);
      setIsLoading(false);
    });
  }, []);

  const filtered = companies.filter(
    (c) =>
      c.company_name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      <SEO
        title="Top Hiring Companies & Tech Employers"
        description="Discover vetted tech employers, unicorns, and industry leaders hiring talent across Nigeria and worldwide on JOBHUB powered by genesix initiate group ltd."
        canonicalPath="/companies"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Companies', path: '/companies' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase text-emerald-400 tracking-wider">
            Verified Employers
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Top Hiring Companies
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Discover verified enterprise teams actively recruiting top talent worldwide.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search companies or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading employers..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((comp) => (
            <div
              key={comp.id}
              onClick={() => navigate(`/companies/${comp.id}`)}
              className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-5 rounded-2xl transition cursor-pointer flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3.5">
                  <img
                    src={comp.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100'}
                    alt={comp.company_name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-slate-700 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-white tracking-tight">{comp.company_name}</h3>
                      {comp.verification_status === 'verified' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <span className="text-[11px] text-emerald-400 font-medium">{comp.industry}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {comp.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {comp.city}, {comp.country}
                </span>
                <span>{comp.company_size} Employees</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
