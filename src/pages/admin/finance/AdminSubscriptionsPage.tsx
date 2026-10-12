import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  Download,
  Edit3,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  Layers,
  Save,
  X,
  Check,
  AlertCircle,
  TrendingUp,
  Zap,
  Send,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../lib/adminService';
import { Subscription, SubscriptionPlan } from '../../../types/database';
import { useAuth } from '../../../context/AuthContext';
import { billingPricingService, PlatformAddonPrice } from '../../../lib/billingPricingService';
import { adminNotificationService } from '../../../services/adminNotificationService';

export function AdminSubscriptionsPage() {
  const navigate = useNavigate();
  const { profile: currentAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'pricing' | 'addons'>('subscriptions');

  // Subscribed clients
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoadingSubs, setIsLoadingSubs] = useState(true);

  // Pricing Plans
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [addons, setAddons] = useState<PlatformAddonPrice[]>([]);

  // Editing Plan Modal State
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isNewPlanModal, setIsNewPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState<Partial<SubscriptionPlan>>({});
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');

  // Notification Toast
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = () => {
    adminService.getSubscriptions().then((res) => {
      setSubscriptions(res);
      setIsLoadingSubs(false);
    });
    setPlans(billingPricingService.getPlans());
    setAddons(billingPricingService.getAddons());
  };

  useEffect(() => {
    loadData();

    const handlePricingUpdate = () => {
      setPlans(billingPricingService.getPlans());
      setAddons(billingPricingService.getAddons());
    };

    window.addEventListener('jobhub_pricing_updated', handlePricingUpdate);
    return () => {
      window.removeEventListener('jobhub_pricing_updated', handlePricingUpdate);
    };
  }, []);

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setIsNewPlanModal(false);
    setPlanForm({ ...plan });
    setFeaturesList([...plan.features]);
  };

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setIsNewPlanModal(true);
    setPlanForm({
      name: '',
      description: '',
      price: 149,
      currency: 'USD',
      billing_interval: 'month',
      max_active_jobs: 15,
      max_applications: 1000,
      is_active: true,
    });
    setFeaturesList(['Up to 15 active jobs', 'Candidate resume database', 'Priority email support']);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name?.trim()) return;

    try {
      if (editingPlan) {
        billingPricingService.updatePlan(editingPlan.id, {
          ...planForm,
          features: featuresList,
        });
        setSuccessMsg(`Successfully updated "${planForm.name}" pricing and entitlements.`);

        // Trigger Edge Function automated notification for price/plan update
        adminNotificationService.triggerSubscriptionNotification({
          subscriptionId: `sub_tier_${editingPlan.id}`,
          customerName: 'Active Plan Subscribers',
          customerEmail: 'subscribers@jobhub.platform',
          companyName: 'Apex Cloud & Enterprise Cohorts',
          planName: planForm.name || editingPlan.name,
          eventType: 'plan_price_changed',
          amount: Number(planForm.price) || 0,
          currency: planForm.currency || 'USD',
          newPrice: Number(planForm.price) || 0,
          effectiveDate: 'Immediate',
        }).catch((err) => console.warn('Edge notification trigger notice:', err));
      } else {
        billingPricingService.createPlan({
          name: planForm.name!,
          description: planForm.description || '',
          price: Number(planForm.price) || 0,
          currency: planForm.currency || 'USD',
          billing_interval: planForm.billing_interval || 'month',
          max_active_jobs: Number(planForm.max_active_jobs) || 10,
          max_applications: Number(planForm.max_applications) || 500,
          is_active: planForm.is_active !== false,
          features: featuresList,
        });
        setSuccessMsg(`New subscription plan "${planForm.name}" has been created.`);

        adminNotificationService.triggerSubscriptionNotification({
          subscriptionId: `sub_plan_new`,
          customerName: 'Platform Recruiter Community',
          customerEmail: 'recruiting-news@jobhub.platform',
          planName: planForm.name!,
          eventType: 'subscription_created',
          amount: Number(planForm.price) || 0,
          currency: planForm.currency || 'USD',
        }).catch((err) => console.warn('Edge notification trigger notice:', err));
      }

      setEditingPlan(null);
      setIsNewPlanModal(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error saving plan');
    }
  };

  const handleDeletePlan = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the plan "${name}"?`)) {
      billingPricingService.deletePlan(id);
      setSuccessMsg(`Plan "${name}" removed.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all subscription plans to original platform defaults?')) {
      billingPricingService.resetToDefaults();
      setSuccessMsg('Reset all subscription plan rates to platform factory defaults.');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeaturesList([...featuresList, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeaturesList(featuresList.filter((_, i) => i !== index));
  };

  const getCurrencySymbol = (cur?: string) => {
    switch (cur) {
      case 'NGN':
        return '₦';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      default:
        return '$';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-400" />
            Billing &amp; Subscription Pricing Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure employer recruitment subscription tiers, adjust monthly/annual pricing, and monitor active subscriptions
          </p>
        </div>

        {/* Tab Switcher & Email Engine Link */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/admin/notifications/email-automation')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs text-indigo-300 font-semibold transition cursor-pointer"
            title="Manage automated subscription & application notification emails"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Email Automation Engine</span>
          </button>

          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'subscriptions'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Subscribed Clients ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'pricing'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Change Plan Prices ({plans.length})
          </button>
          <button
            onClick={() => setActiveTab('addons')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'addons'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Transactional Add-ons
          </button>
        </div>
      </div>
    </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: ACTIVE CLIENT SUBSCRIPTIONS */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Subscribed Enterprise</th>
                    <th className="py-3 px-4">Plan Tier</th>
                    <th className="py-3 px-4">Recurring Rate</th>
                    <th className="py-3 px-4">Period Renewal Date</th>
                    <th className="py-3 px-4">Auto-Renew</th>
                    <th className="py-3 px-4">Billing Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {sub.company_name || 'Apex Cloud Solutions'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          {sub.plan?.name || 'Growth'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-200">
                        {getCurrencySymbol(sub.plan?.currency)}{sub.plan?.price || 149}.00 / {sub.plan?.billing_interval || 'month'}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : 'Active cycle'}
                      </td>

                      <td className="py-3.5 px-4 text-emerald-400 font-mono text-[11px]">
                        {!sub.cancel_at_period_end ? 'Active' : 'Cancelled at term'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRICING PLANS EDITOR */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Live Employer Subscription Plans
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Prices and allowances updated here take effect instantly across the employer checkout and billing portals.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDefaults}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-semibold transition shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Plan Tier</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((p) => {
              const sym = getCurrencySymbol(p.currency);
              return (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition relative group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-white text-base">{p.name}</h3>
                        <span className="text-[10px] font-mono text-indigo-400 uppercase">
                          {p.is_active ? 'Active Tier' : 'Archived'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 text-slate-300 border border-slate-800">
                        {p.currency}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 min-h-[36px]">{p.description}</p>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-white font-mono">
                          {sym}{p.price}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          /{p.billing_interval}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                        <span>Jobs: {p.max_active_jobs}</span>
                        <span>Applicants: {p.max_applications}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                      <span className="text-[10px] font-mono uppercase text-slate-500 block">Features:</span>
                      {p.features.slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                      {p.features.length > 4 && (
                        <span className="text-[10px] text-slate-500 italic block">
                          +{p.features.length - 4} more features
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Edit Price &amp; Tiers</span>
                    </button>
                    {plans.length > 1 && (
                      <button
                        onClick={() => handleDeletePlan(p.id, p.name)}
                        title="Delete Plan"
                        className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TRANSACTIONAL ADD-ONS */}
      {activeTab === 'addons' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              Transactional Add-on &amp; Recruitment Boosting Rates
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Set individual transaction fees for job boosts, candidate assessments, and talent verification ribbons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {addons.map((add) => {
              const sym = getCurrencySymbol(add.currency);
              return (
                <div key={add.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div>
                    <h3 className="font-bold text-white text-base">{add.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[36px]">{add.description}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                    <span className="text-xs text-slate-400">{add.billingType.replace('_', ' ')}:</span>
                    <span className="text-xl font-bold text-emerald-400">
                      {sym}{add.price}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Update Price ({add.currency})</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={add.price}
                        id={`input-addon-${add.id}`}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById(`input-addon-${add.id}`) as HTMLInputElement;
                          const newPrice = Number(input?.value) || 0;
                          billingPricingService.updateAddon(add.id, newPrice);
                          setSuccessMsg(`Updated ${add.name} rate to ${sym}${newPrice}.`);
                          setTimeout(() => setSuccessMsg(null), 3000);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EDIT / CREATE PLAN MODAL */}
      {(editingPlan || isNewPlanModal) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <CreditCard className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">
                  {editingPlan ? `Edit Subscription: ${editingPlan.name}` : 'Create Subscription Plan'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingPlan(null);
                  setIsNewPlanModal(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 font-medium mb-1 font-mono">Plan Name</label>
                  <input
                    type="text"
                    value={planForm.name || ''}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    placeholder="e.g., Growth Scale or Enterprise Elite"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 font-medium mb-1 font-mono">Description</label>
                  <input
                    type="text"
                    value={planForm.description || ''}
                    onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                    placeholder="Brief description of who this plan is tailored for"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1 font-mono">Price Rate</label>
                  <input
                    type="number"
                    value={planForm.price ?? 0}
                    onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                    required
                    min={0}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1 font-mono">Currency</label>
                  <select
                    value={planForm.currency || 'USD'}
                    onChange={(e) => setPlanForm({ ...planForm, currency: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="NGN">NGN (₦)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1 font-mono">Billing Frequency</label>
                  <select
                    value={planForm.billing_interval || 'month'}
                    onChange={(e) => setPlanForm({ ...planForm, billing_interval: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Annually</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1 font-mono">Max Active Jobs</label>
                  <input
                    type="number"
                    value={planForm.max_active_jobs || 10}
                    onChange={(e) => setPlanForm({ ...planForm, max_active_jobs: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 font-medium mb-1 font-mono">Max Applications Capacity</label>
                  <input
                    type="number"
                    value={planForm.max_applications || 1000}
                    onChange={(e) => setPlanForm({ ...planForm, max_applications: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-slate-300 font-medium font-mono">Included Plan Features</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    placeholder="e.g., Automated candidate assessments"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                  {featuresList.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200"
                    >
                      <span className="truncate">{f}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(i)}
                        className="text-slate-500 hover:text-rose-400 p-0.5 ml-2"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlan(null);
                    setIsNewPlanModal(false);
                  }}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Plan Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
