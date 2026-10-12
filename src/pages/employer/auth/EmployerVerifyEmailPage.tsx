import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export function EmployerVerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, employerProfile, demoLoginAsEmployer } = useAuth();
  const email = (location.state as any)?.email || 'recruiter@company.com';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleContinue = () => {
    if (!user || !employerProfile) {
      demoLoginAsEmployer('employer_owner', email);
    }
    navigate('/employer/dashboard');
  };

  const handleResend = () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
      setResent(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-10 px-6 shadow-2xl ring-1 ring-slate-800 rounded-2xl sm:px-10 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
            <Mail className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Check Your Work Inbox</h2>
          <p className="text-sm text-slate-300 mb-4">
            We sent a verification link to <span className="font-semibold text-white">{email}</span>.
          </p>
          <p className="text-xs text-slate-400 mb-8 leading-relaxed">
            Please click the confirmation link to activate your organization's recruitment portal and unlock job posting tools.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleContinue}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer"
            >
              <span>Continue to Employer Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
              <span>{resent ? 'Verification Link Sent!' : 'Resend Verification Email'}</span>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <NavLink to="/employer/login" className="text-xs text-slate-400 hover:text-slate-200">
              &larr; Back to sign in
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
