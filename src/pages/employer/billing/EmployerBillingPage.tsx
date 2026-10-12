import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Briefcase,
  Users,
  AlertTriangle,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { employerService } from '../../../lib/employerService';
import { Subscription, SubscriptionPlan } from '../../../types/database';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { PaymentModal } from '../../../components/payment/PaymentModal';

export function EmployerBillingPage() {
  const { company } = useAuth();
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<{
    subscription: Subscription | null;
    plans: SubscriptionPlan[];
    usage: { activeJobs: number; maxJobs: number; applicants: number; maxApplicants: number };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (company?.id) {
        setIsLoading(true);
        const data = await employerService.getEmployerSubscription(company.id);
        setSubscriptionData(data);
        setIsLoading(false);
      }
    }
    loadData();

    const handlePricingUpdate = () => {
      if (company?.id) {
        employerService.getEmployerSubscription(company.id).then(setSubscriptionData);
      }
    };

    window.addEventListener('jobhub_pricing_updated', handlePricingUpdate);
    return () => {
      window.removeEventListener('jobhub_pricing_updated', handlePricingUpdate);
    };
  }, [company?.id]);

  if (isLoading || !subscriptionData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Checking subscription entitlements and usage meters..." />
      </div>
    );
  }

  const { subscription, plans, usage } = subscriptionData;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <CreditCard className="w-6 h-6 text-indigo-400" />
          Subscription & Recruitment Entitlements
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your organization's hiring plan tier, applicant search limits, and billing details
        </p>
      </div>

      {/* Payment Gateway Configuration Warning (Section 57 requirement) */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Payment gateway architecture prepared</h4>
          <p className="text-xs text-slate-400">
            Payment integration pending configuration. In accordance with system instructions, payments are not faked or charged until a production gateway provider (Stripe / Paystack) is configured in environment secrets.
          </p>
        </div>
      </div>

      {/* Current Plan Card & Usage Quotas (Section 57 & 58) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold block mb-1">
              Active Corporate Plan
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">{subscription?.plan?.name || 'Professional'}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Active Tier
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Renews automatically on {subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'Next billing cycle'}
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold text-white font-mono">
              ${subscription?.plan?.price || 249}
            </span>
            <span className="text-xs text-slate-400"> / month</span>
          </div>
        </div>

        {/* Usage Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Active Job Postings</span>
              <span className="font-bold text-white font-mono">
                {usage.activeJobs} / {usage.maxJobs} Live
              </span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${Math.min((usage.activeJobs / usage.maxJobs) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Candidate Applications Processed</span>
              <span className="font-bold text-white font-mono">
                {usage.applicants} / {usage.maxApplicants} Monthly
              </span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min((usage.applicants / usage.maxApplicants) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans Catalog (Section 58) */}
      <div>
        <h3 className="text-base font-bold text-white mb-4">Available Employer Plans</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => {
            const isCurrent = p.id === (subscription?.plan_id || 'plan-pro');
            return (
              <div
                key={p.id}
                className={`rounded-2xl p-5 border flex flex-col justify-between space-y-4 ${
                  isCurrent
                    ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/50 shadow-xl'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{p.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{p.description}</p>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-white font-mono">${p.price}</span>
                    <span className="text-xs text-slate-400"> / {p.billing_interval}</span>
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-slate-300">
                    {p.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={isCurrent}
                  onClick={() => {
                    setSelectedPlanForPayment(p);
                    setIsPaymentModalOpen(true);
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : 'Select Plan & Pay'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Currency Payment Modal for Employer Portal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        defaultPlanName={selectedPlanForPayment?.name || 'Recruiter Plan'}
        defaultPriceUSD={selectedPlanForPayment?.price || 149}
        paymentType="subscription"
        onPaymentSuccess={() => {
          // reload subscription data
          if (company?.id) {
            employerService.getEmployerSubscription(company.id).then(setSubscriptionData);
          }
        }}
      />
    </div>
  );
}
