import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Server, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { signInUser } from '../../lib/auth';
import { useAuth } from '../../context/AuthContext';
import { SEO } from '../../components/common/SEO';

export function LoginPage() {
  const navigate = useNavigate();
  const { signInCandidate } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await signInCandidate(email, password);
    setIsLoading(false);

    if (res.success) {
      navigate('/job-seeker/dashboard');
    } else {
      setErrorMsg(res.error || 'Invalid email or password. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Candidate Sign In | JOBHUB"
        description="Sign in to your JOBHUB powered by genesix initiate group ltd candidate portal to access ATS-ready CV builder, application tracking, and personalized job recommendations."
        canonicalPath="/login"
      />
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-xl shadow-emerald-500/20">
            <Server className="w-6 h-6" />
          </div>
        </div>
        <h2 className="mt-5 text-center text-2xl font-bold tracking-tight text-white">
          Candidate Portal Sign In
        </h2>
        <p className="mt-1 text-center text-xs text-emerald-400 font-semibold uppercase tracking-wider">
          JOBHUB &bull; powered by genesix initiate group ltd
        </p>
        <p className="mt-1 text-center text-xs text-slate-400">
          Access your job applications, tailored alerts, and ATS resume builder
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/80 border border-slate-800/80 py-8 px-6 shadow-2xl rounded-2xl sm:px-8 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                />
                <span>Remember session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2.5 px-4 rounded-xl text-xs transition duration-150 cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to Candidate Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800/80 space-y-2">
            <div>
              <span className="text-xs text-slate-500">Don&apos;t have an account? </span>
              <Link to="/register" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                Create Job Seeker Account
              </Link>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-1">
              <Link to="/employer/login" className="text-indigo-400 hover:text-indigo-300">
                Employer Sign In &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
