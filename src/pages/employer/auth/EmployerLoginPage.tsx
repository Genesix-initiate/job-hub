import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase, getSupabaseCredentials } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { SEO } from '../../../components/common/SEO';

export function EmployerLoginPage() {
  const navigate = useNavigate();
  const { signInEmployer } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both your work email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await signInEmployer(email, password);
    setIsLoading(false);

    if (res.success) {
      navigate('/employer/dashboard');
    } else {
      setErrorMessage(res.error || 'Invalid work email or password. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <SEO
        title="Employer Portal Sign In | JOBHUB"
        description="Access your JOBHUB powered by genesix initiate group ltd employer suite: post jobs, manage candidate pipelines, run assessments, and schedule interviews."
        canonicalPath="/employer/login"
      />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center font-black text-white text-xl shadow-xl shadow-indigo-500/20">
            JH
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
          Employer Portal Sign In
        </h2>
        <p className="mt-1 text-center text-xs text-indigo-300 uppercase tracking-wider font-semibold">
          JOBHUB &bull; powered by genesix initiate group ltd
        </p>
        <p className="mt-1 text-center text-xs text-slate-400">
          Sign in to post jobs, manage candidate pipelines, and access recruitment tools
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/90 py-8 px-6 shadow-2xl ring-1 ring-slate-800 rounded-2xl sm:px-10 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{errorMessage}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recruiter@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <NavLink
                  to="/employer/forgot-password"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Forgot password?
                </NavLink>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Verifying Credentials...' : 'Sign In to Employer Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 space-y-2 border-t border-slate-800 pt-5">
            <p>
              New employer?{' '}
              <NavLink to="/employer/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                Register company account &rarr;
              </NavLink>
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-1">
              <NavLink to="/login" className="text-emerald-400 hover:text-emerald-300">
                Candidate Portal &rarr;
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
