import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  BadgeCheck,
  AlertTriangle,
  Upload,
  CheckCircle2,
  ExternalLink,
  Edit2,
  Save,
  X,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { employerService } from '../../../lib/employerService';
import { Company } from '../../../types/database';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export function CompanyProfilePage() {
  const { company, updateCompany } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [form, setForm] = useState<Partial<Company>>({
    company_name: '',
    industry: '',
    company_size: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    city: '',
    address: '',
    founded_year: 2020,
    logo_url: '',
  });

  useEffect(() => {
    if (company) {
      setForm({
        company_name: company.company_name || '',
        industry: company.industry || '',
        company_size: company.company_size || '',
        description: company.description || '',
        website: company.website || '',
        email: company.email || '',
        phone: company.phone || '',
        country: company.country || 'United States',
        state: company.state || '',
        city: company.city || '',
        address: company.address || '',
        founded_year: company.founded_year || 2019,
        logo_url: company.logo_url || '',
      });
    }
  }, [company]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateCompany(form);
      if (company.id) {
        await employerService.updateCompany(company.id, form);
      }
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && company) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, logo_url: previewUrl }));
      await updateCompany({ logo_url: previewUrl });
      if (company.id) {
        await employerService.updateCompany(company.id, { logo_url: previewUrl });
      }
    }
  };

  const isVerified = company?.verification_status === 'verified';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Company Profile</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your organization's brand identity, contact channels, and public profile
          </p>
        </div>

        <div className="flex items-center gap-2">
          {company && (
            <NavLink
              to={`/companies/${company.id}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Page</span>
            </NavLink>
          )}

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Company profile details updated successfully!</span>
        </div>
      )}

      {/* Verification Card Status */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isVerified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {isVerified ? <BadgeCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base">Verification Status:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  isVerified
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}
              >
                {company?.verification_status || 'Pending'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isVerified
                ? 'Your organization is verified. All published jobs will display the verified badge.'
                : 'Government verification is required before publishing jobs to candidates.'}
            </p>
          </div>
        </div>

        <NavLink
          to="/employer/verification"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 text-center shrink-0 transition-colors"
        >
          {isVerified ? 'View Documents' : 'Submit Verification Docs'}
        </NavLink>
      </div>

      {/* Profile Form / View */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        {/* Brand Logo & Basic Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-slate-800">
          <div className="relative group shrink-0">
            <img
              src={form.logo_url || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=150'}
              alt={form.company_name}
              className="w-24 h-24 rounded-2xl object-cover ring-2 ring-slate-800 bg-slate-950 shadow-xl"
            />
            {isEditing && (
              <label className="absolute inset-0 bg-slate-950/70 rounded-2xl flex flex-col items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload className="w-5 h-5 mb-1 text-indigo-400" />
                <span>Upload Logo</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            )}
          </div>

          <div className="space-y-1.5 flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Industry Sector</label>
                    <input
                      type="text"
                      value={form.industry || ''}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      placeholder="Information Technology"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Company Size</label>
                    <select
                      value={form.company_size || '51-200'}
                      onChange={(e) => setForm({ ...form, company_size: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500-1000">500-1000 employees</option>
                      <option value="1000+">1000+ enterprise</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-white">{company?.company_name}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                  <span>{company?.industry || 'Information Technology'}</span>
                  <span>•</span>
                  <span>{company?.company_size || '51-200'} employees</span>
                  <span>•</span>
                  <span>Founded {company?.founded_year || 2019}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Company Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            About the Company & Mission
          </label>
          {isEditing ? (
            <textarea
              rows={4}
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your organization, mission, engineering culture, and value proposition to prospective candidates..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          ) : (
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
              {company?.description || 'No description provided.'}
            </p>
          )}
        </div>

        {/* Contact & Location Details */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
            Contact Channels & Office Location
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Website URL</label>
              {isEditing ? (
                <input
                  type="url"
                  value={form.website || ''}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              ) : (
                <a
                  href={company?.website || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-indigo-400 hover:underline flex items-center gap-1.5"
                >
                  <Globe className="w-4 h-4 text-slate-500" />
                  <span className="truncate">{company?.website || 'Not configured'}</span>
                </a>
              )}
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Recruitment Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="careers@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              ) : (
                <div className="text-sm text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span className="truncate">{company?.email || 'careers@company.com'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={form.phone || ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              ) : (
                <div className="text-sm text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span>{company?.phone || 'Not configured'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Country</label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.country || ''}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              ) : (
                <div className="text-sm text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>{company?.country || 'United States'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">City, State</label>
              {isEditing ? (
                <input
                  type="text"
                  value={`${form.city || ''}${form.state ? `, ${form.state}` : ''}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(',');
                    setForm({ ...form, city: parts[0]?.trim(), state: parts[1]?.trim() || '' });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              ) : (
                <div className="text-sm text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>{company?.city}, {company?.state || company?.country}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Founded Year</label>
              {isEditing ? (
                <input
                  type="number"
                  value={form.founded_year || 2020}
                  onChange={(e) => setForm({ ...form, founded_year: parseInt(e.target.value) || 2020 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              ) : (
                <div className="text-sm text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Est. {company?.founded_year || 2019}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Physical Headquarters Address</label>
          {isEditing ? (
            <input
              type="text"
              value={form.address || ''}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="100 Pine Street, Suite 1200"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
            />
          ) : (
            <p className="text-sm text-slate-300">{company?.address || '100 Pine Street, Suite 1200'}</p>
          )}
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Company Details'}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
