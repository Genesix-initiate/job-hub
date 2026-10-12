import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export function AdminVerifyEmailPage() {
  const [isResent, setIsResent] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 rounded-2xl bg-rose-600 shadow-xl shadow-rose-600/20 mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Verify Administrator Email</h2>
        <p className="mt-2 text-sm text-slate-400">
          A secure verification token has been dispatched to your corporate administrator email address.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur text-center space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Please click the verification link sent to your inbox to activate your administrative session and authorize Row-Level Security permissions.
          </p>

          {isResent ? (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verification email re-dispatched. Check your spam folder if delayed.</span>
            </div>
          ) : (
            <button
              onClick={() => setIsResent(true)}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition cursor-pointer"
            >
              Resend Verification Email
            </button>
          )}

          <div className="pt-4 border-t border-slate-800">
            <NavLink
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              Proceed to Admin Login &rarr;
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
