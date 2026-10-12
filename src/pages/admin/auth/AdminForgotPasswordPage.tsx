import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase, getSupabaseCredentials } from '../../../lib/supabase';

export function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const creds = getSupabaseCredentials();
    if (creds.url && creds.anonKey && !creds.url.includes('placeholder')) {
      try {
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/admin/reset-password`,
        });
      } catch (err: any) {
        console.warn('Reset notice', err);
      }
    }

    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 rounded-2xl bg-rose-600 shadow-xl shadow-rose-600/20 mb-4">
          <ShieldAlert className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Admin Password Recovery</h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter your registered administrative account address to receive secure reset credentials.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur">
          {isSubmitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Recovery Instructions Dispatched</h3>
              <p className="text-xs text-slate-400">
                If <strong className="text-slate-200">{email}</strong> corresponds to an active administrator account, an encrypted recovery link has been sent.
              </p>
              <div className="pt-4">
                <NavLink
                  to="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold"
                >
                  &larr; Return to Admin Login
                </NavLink>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
                  Administrative Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@jobhub.platform"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Send Recovery Dispatch'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <NavLink to="/admin/login" className="text-xs text-slate-400 hover:text-slate-200 transition">
                  &larr; Back to Admin Login
                </NavLink>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
