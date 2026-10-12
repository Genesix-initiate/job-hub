import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase, getSupabaseCredentials } from '../../../lib/supabase';

export function EmployerForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const creds = getSupabaseCredentials();
    if (creds.url && creds.anonKey && !creds.url.includes('placeholder')) {
      try {
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/employer/reset-password`,
        });
      } catch (err: any) {
        console.warn('Password reset notice:', err);
      }
    }

    setIsLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-10 px-6 shadow-2xl ring-1 ring-slate-800 rounded-2xl sm:px-10">
          <h2 className="text-xl font-bold text-white mb-2 text-center">Reset Employer Password</h2>
          <p className="text-xs text-slate-400 mb-6 text-center">
            Enter your work email address and we'll send you a password recovery link.
          </p>

          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Check Your Email</h3>
              <p className="text-xs text-slate-400 mb-6">
                If an employer account exists for <span className="text-white font-medium">{email}</span>, you will receive password reset instructions.
              </p>
              <NavLink
                to="/employer/login"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-800 text-xs font-medium text-slate-200 hover:bg-slate-700"
              >
                Return to Sign In
              </NavLink>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="recruiter@company.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Recovery Link'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <NavLink to="/employer/login" className="text-xs text-slate-400 hover:text-slate-200">
                  Cancel and return to sign in
                </NavLink>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
