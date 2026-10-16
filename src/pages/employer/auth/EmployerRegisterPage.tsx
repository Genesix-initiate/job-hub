import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, Phone, MapPin, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase, getSupabaseCredentials } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { saveRegisteredAccount } from '../../../lib/authAccounts';
import { Company, EmployerProfile, Profile } from '../../../types/database';

export function EmployerRegisterPage() {
  const navigate = useNavigate();
  const { signInEmployer, isSupabaseConnected } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    jobTitle: '',
    country: 'United States',
    state: '',
    city: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    const displayName = `${formData.firstName} ${formData.lastName}`.trim();
    const newCompany: Company = {
      id: `comp-${Date.now()}`,
      company_name: formData.companyName,
      slug: formData.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      logo_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=150',
      description: `${formData.companyName} on JOBHUB.`,
      industry: 'Information Technology',
      company_size: '11-50',
      founded_year: 2020,
      website: `https://${formData.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '')}.example.com`,
      email: formData.email,
      phone: formData.phone || '+234 800 000 0000',
      country: formData.country,
      state: formData.state,
      city: formData.city,
      address: `${formData.city}, ${formData.state}`,
      verification_status: 'verified',
      verified_at: new Date().toISOString(),
      created_by: `emp-prof-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newProfile: Profile = {
      id: `emp-prof-${Date.now()}`,
      auth_user_id: `auth-emp-${Date.now()}`,
      role: 'employer',
      first_name: formData.firstName,
      last_name: formData.lastName,
      display_name: displayName,
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      account_status: 'active',
      email_verified: true,
      phone_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newEmpDetails: EmployerProfile = {
      id: `emp-details-${Date.now()}`,
      profile_id: newProfile.id,
      company_id: newCompany.id,
      job_title: formData.jobTitle || 'Talent Acquisition Lead',
      department: 'Human Resources',
      company_role: 'employer_owner',
      employer_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveRegisteredAccount({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: 'employer',
      profile: newProfile,
      employerProfile: newEmpDetails,
      company: newCompany,
      createdAt: new Date().toISOString(),
    });

    if (isSupabaseConnected) {
      try {
        await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              full_name: displayName,
              role: 'employer',
              company_name: formData.companyName,
              job_title: formData.jobTitle,
              phone: formData.phone,
              country: formData.country,
              state: formData.state,
              city: formData.city,
            },
          },
        });
      } catch (err: any) {
        console.warn('Supabase employer signup notice:', err);
      }
    }

    await signInEmployer(formData.email, formData.password);
    setIsLoading(false);
    navigate('/employer/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center font-black text-white text-xl shadow-xl shadow-indigo-500/20">
            JH
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-white">
          Create JOBHUB Employer Account
        </h2>
        <p className="mt-1 text-center text-xs text-indigo-300 uppercase tracking-wider font-semibold">
          powered by genesix initiate group ltd
        </p>
        <p className="mt-1 text-center text-sm text-slate-400">
          Register your organization to access verified candidate talent and automated hiring workflows
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-slate-900 py-8 px-6 shadow-2xl ring-1 ring-slate-800 rounded-2xl sm:px-10">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{errorMessage}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleRegister}>
            {/* Step 1: Personal / Recruiter Info */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" /> 1. Recruiter / Account Lead Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email Address *</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="recruiter@company.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Work Phone Number *</label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Company Information */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> 2. Company & Organizational Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Legal Entity Name *</label>
                  <input
                    type="text"
                    required
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Acme Global Technologies Inc."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Job Title / Position *</label>
                  <input
                    type="text"
                    required
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="Head of Talent Acquisition"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Country *</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Germany">Germany</option>
                    <option value="Australia">Australia</option>
                    <option value="Singapore">Singapore</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">State / Province</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="California"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="San Francisco"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Security Credentials */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4" /> 3. Security Credentials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password (min 8 chars) *</label>
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Creating Enterprise Account...' : 'Complete Registration & Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already registered?{' '}
            <NavLink to="/employer/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Sign into Employer Portal &rarr;
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
