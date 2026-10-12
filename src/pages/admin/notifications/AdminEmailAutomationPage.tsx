import React, { useState, useEffect } from 'react';
import {
  Mail,
  Zap,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Eye,
  Send,
  FileCheck2,
  CreditCard,
  Settings,
  Code2,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Layers,
  ChevronRight,
  Filter,
  Search,
  ExternalLink,
  ShieldCheck,
  Radio,
  Sliders,
  DollarSign,
  User,
  Building2,
  Calendar,
  X,
  FileText,
  Activity,
} from 'lucide-react';
import { adminNotificationService } from '../../../services/adminNotificationService';
import {
  TriggerRuleConfig,
  EdgeNotificationResponse,
  ApplicationEmailTrigger,
  SubscriptionEmailTrigger,
  ApplicationNotificationStatus,
  SubscriptionNotificationEvent,
} from '../../../types/edgeNotification';
import { getSupabaseCredentials, isValidSupabaseUrl } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

export function AdminEmailAutomationPage() {
  const { profile: currentAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'triggers' | 'console' | 'logs' | 'setup'>('triggers');

  // Trigger states
  const [triggers, setTriggers] = useState<TriggerRuleConfig[]>([]);
  const [triggerCategoryFilter, setTriggerCategoryFilter] = useState<'all' | 'application_status' | 'subscription_update'>('all');

  // Logs states
  const [logs, setLogs] = useState<EdgeNotificationResponse[]>([]);
  const [logSearch, setLogSearch] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'application_status' | 'subscription_update'>('all');
  const [selectedLogForDetail, setSelectedLogForDetail] = useState<EdgeNotificationResponse | null>(null);

  // Health ping state
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{
    connected: boolean;
    latencyMs: number;
    message: string;
    mode: string;
  } | null>(null);

  // Preview Modal
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Manual Dispatch Console Form state
  const [dispatchCategory, setDispatchCategory] = useState<'application' | 'subscription'>('application');
  const [isDispatching, setIsDispatching] = useState(false);
  const [latestDispatchResult, setLatestDispatchResult] = useState<EdgeNotificationResponse | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Application dispatch fields
  const [appId, setAppId] = useState('APP-2026-0812');
  const [appName, setAppName] = useState('Alex Morgan');
  const [appEmail, setAppEmail] = useState('alex.morgan@example.com');
  const [appJob, setAppJob] = useState('Senior Staff Frontend Architect');
  const [appCompany, setAppCompany] = useState('Apex Cloud Solutions');
  const [appStatus, setAppStatus] = useState<ApplicationNotificationStatus>('interview');
  const [appNotes, setAppNotes] = useState('Candidate passed initial ATS evaluation and invited for 45-min architectural interview.');
  const [appInterviewDate, setAppInterviewDate] = useState('Tomorrow at 3:00 PM UTC');
  const [appMeetingLink, setAppMeetingLink] = useState('https://meet.jobhub.platform/apex-frontend');
  const [appSalaryOffer, setAppSalaryOffer] = useState('$175,000 / year + equity options');

  // Subscription dispatch fields
  const [subId, setSubId] = useState('sub_apex_01');
  const [subCustName, setSubCustName] = useState('Marcus Vance');
  const [subCustEmail, setSubCustEmail] = useState('billing@apexcloud.example.com');
  const [subCompany, setSubCompany] = useState('Apex Cloud Solutions');
  const [subPlan, setSubPlan] = useState('Growth Recruiter Tier');
  const [subEvent, setSubEvent] = useState<SubscriptionNotificationEvent>('plan_price_changed');
  const [subAmount, setSubAmount] = useState<number>(149);
  const [subCurrency, setSubCurrency] = useState('USD');
  const [subInvoice, setSubInvoice] = useState('INV-2026-0041');
  const [subPaymentChannel, setSubPaymentChannel] = useState('Paystack Multi-Currency Rail');
  const [subNextBillingDate, setSubNextBillingDate] = useState('November 12, 2026');

  // Copy code state
  const [copiedCode, setCopiedCode] = useState(false);

  const creds = getSupabaseCredentials();
  const settings = adminNotificationService.getSettings();

  const loadData = () => {
    setTriggers(adminNotificationService.getTriggers());
    setLogs(adminNotificationService.getLogs());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = adminNotificationService.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePing = async () => {
    setIsPinging(true);
    try {
      const res = await adminNotificationService.testEdgeFunctionConnection();
      setPingResult(res);
      showToast(`Edge ping response: ${res.latencyMs}ms (${res.mode})`);
    } catch (e: any) {
      showToast(`Edge ping error: ${e.message}`);
    } finally {
      setIsPinging(false);
    }
  };

  const handleToggleTrigger = (id: string, name: string) => {
    adminNotificationService.toggleTrigger(id);
    showToast(`Updated trigger rule: ${name}`);
  };

  const handleQuickPresetApp = (preset: 'alex' | 'samantha' | 'david') => {
    if (preset === 'alex') {
      setAppId('APP-2026-0812');
      setAppName('Alex Morgan');
      setAppEmail('alex.morgan@example.com');
      setAppJob('Senior Staff Frontend Architect');
      setAppCompany('Apex Cloud Solutions');
      setAppStatus('interview');
      setAppNotes('Round 2 Technical System Architecture interview with VP of Engineering.');
      setAppInterviewDate('Tomorrow at 3:00 PM UTC');
      setAppSalaryOffer('');
    } else if (preset === 'samantha') {
      setAppId('APP-2026-0813');
      setAppName('Samantha Reed');
      setAppEmail('samantha.reed@example.com');
      setAppJob('Lead Cloud Infrastructure & DevOps');
      setAppCompany('Apex Cloud Solutions');
      setAppStatus('shortlisted');
      setAppNotes('Shortlisted into top 5% candidate tier based on Kubernetes & Terraform credentials.');
      setAppInterviewDate('');
      setAppSalaryOffer('');
    } else if (preset === 'david') {
      setAppId('APP-2026-0815');
      setAppName('David Chen');
      setAppEmail('david.applicant@example.com');
      setAppJob('Senior Staff Frontend Architect');
      setAppCompany('Apex Cloud Solutions');
      setAppStatus('offer');
      setAppNotes('Formal job offer approved by Executive Hiring Board.');
      setAppSalaryOffer('$185,000 / year + 0.25% equity grant');
    }
  };

  const handleQuickPresetSub = (preset: 'apex' | 'fintech' | 'scaleup') => {
    if (preset === 'apex') {
      setSubId('sub_apex_01');
      setSubCustName('Marcus Vance');
      setSubCustEmail('billing@apexcloud.example.com');
      setSubCompany('Apex Cloud Solutions');
      setSubPlan('Growth Recruiter Tier');
      setSubEvent('plan_price_changed');
      setSubAmount(149);
      setSubCurrency('USD');
      setSubInvoice('INV-2026-0041');
      setSubPaymentChannel('Paystack Multi-Currency Rail');
      setSubNextBillingDate('November 12, 2026');
    } else if (preset === 'fintech') {
      setSubId('sub_fintech_02');
      setSubCustName('Amina Adeleke');
      setSubCustEmail('finance@fintechpulse.com');
      setSubCompany('FinTech Pulse Payments');
      setSubPlan('Enterprise Scale Tier');
      setSubEvent('payment_received');
      setSubAmount(399);
      setSubCurrency('USD');
      setSubInvoice('INV-2026-0042');
      setSubPaymentChannel('Direct Bank Transfer (Automated)');
      setSubNextBillingDate('December 1, 2026');
    } else if (preset === 'scaleup') {
      setSubId('sub_scale_03');
      setSubCustName('Elena Rostova');
      setSubCustEmail('elena@scaleup.dev');
      setSubCompany('ScaleUp Dev Studios');
      setSubPlan('Starter Recruiter');
      setSubEvent('subscription_renewed');
      setSubAmount(49);
      setSubCurrency('USD');
      setSubInvoice('INV-2026-0043');
      setSubPaymentChannel('OPay Automated Direct Debit');
      setSubNextBillingDate('November 28, 2026');
    }
  };

  const handleDispatchApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDispatching(true);
    try {
      const res = await adminNotificationService.triggerApplicationStatusNotification({
        applicationId: appId,
        applicantName: appName,
        applicantEmail: appEmail,
        jobTitle: appJob,
        companyName: appCompany,
        status: appStatus,
        notes: appNotes,
        interviewDate: appInterviewDate || undefined,
        interviewMeetingLink: appMeetingLink || undefined,
        salaryOffer: appSalaryOffer || undefined,
      });

      setLatestDispatchResult(res);
      showToast(`Dispatched application email to ${appEmail} via Supabase Edge Function!`);
    } catch (err: any) {
      showToast(`Dispatch failed: ${err.message}`);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleDispatchSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDispatching(true);
    try {
      const res = await adminNotificationService.triggerSubscriptionNotification({
        subscriptionId: subId,
        customerName: subCustName,
        customerEmail: subCustEmail,
        companyName: subCompany,
        planName: subPlan,
        eventType: subEvent,
        amount: Number(subAmount) || 0,
        currency: subCurrency,
        invoiceNumber: subInvoice,
        paymentChannel: subPaymentChannel,
        nextBillingDate: subNextBillingDate,
      });

      setLatestDispatchResult(res);
      showToast(`Dispatched subscription email to ${subCustEmail} via Supabase Edge Function!`);
    } catch (err: any) {
      showToast(`Dispatch failed: ${err.message}`);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleOpenTriggerPreset = (t: TriggerRuleConfig) => {
    if (t.category === 'application_status') {
      setDispatchCategory('application');
      setAppStatus(t.eventType as ApplicationNotificationStatus);
      setAppEmail(t.sampleRecipient);
      setActiveTab('console');
    } else {
      setDispatchCategory('subscription');
      setSubEvent(t.eventType as SubscriptionNotificationEvent);
      setSubCustEmail(t.sampleRecipient);
      setActiveTab('console');
    }
  };

  const filteredTriggers = triggers.filter((t) => {
    if (triggerCategoryFilter === 'all') return true;
    return t.category === triggerCategoryFilter;
  });

  const filteredLogs = logs.filter((log) => {
    const matchCat = logFilter === 'all' || log.category === logFilter;
    const matchSearch =
      !logSearch ||
      log.recipient.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.subject.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.eventType.toLowerCase().includes(logSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalDispatchedCount = triggers.reduce((acc, t) => acc + t.totalTriggered, 0);

  const edgeSampleCode = `// Supabase Edge Function: dispatch-notification
// Deploy with: supabase functions deploy dispatch-notification --no-verify-jwt
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const { type, recipientEmail, recipientName, data } = await req.json();

  // Handle Application Status or Subscription Update templates...
  return new Response(JSON.stringify({
    success: true,
    executionId: 'edge_' + Date.now(),
    recipient: recipientEmail,
    status: 'delivered'
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});`;

  return (
    <div className="space-y-6 animate-in fade-in max-w-7xl mx-auto pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            &times;
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Supabase Edge Functions Runtime
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Service Layer Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Automated Email Notification Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Manage and trigger automated email notifications for <strong className="text-indigo-300">job application statuses</strong> and{' '}
              <strong className="text-emerald-300">subscription updates</strong> powered by Supabase Edge Functions with zero latency bottlenecks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePing}
              disabled={isPinging}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer shadow-sm"
            >
              <Activity className={`w-4 h-4 text-indigo-400 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'Pinging Edge...' : 'Ping Edge Function'}</span>
            </button>

            <button
              onClick={() => setActiveTab('console')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch Notification</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Active Triggers</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{triggers.filter((t) => t.enabled).length} of {triggers.length} Active</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Total Dispatched</span>
            <span className="text-lg font-bold text-indigo-300 mt-0.5 block">{totalDispatchedCount.toLocaleString()} Delivered</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Edge Runtime</span>
            <span className="text-lg font-bold text-emerald-400 mt-0.5 block font-mono">Deno Edge (v1)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Target Function</span>
            <span className="text-xs font-bold text-slate-200 mt-1 block font-mono truncate" title={settings.functionName}>
              /{settings.functionName}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 gap-2 sm:gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('triggers')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'triggers'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Triggers & Automation Workflows</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
            {triggers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('console')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'console'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Manual Dispatch Console</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'logs'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Dispatched Logs & Telemetry</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300">
            {logs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('setup')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'setup'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Edge Function Deployment & Code</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: TRIGGERS & AUTOMATION WORKFLOWS */}
      {/* ==================================================================== */}
      {activeTab === 'triggers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono uppercase">Filter Category:</span>
              <div className="flex gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setTriggerCategoryFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    triggerCategoryFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Triggers ({triggers.length})
                </button>
                <button
                  onClick={() => setTriggerCategoryFilter('application_status')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    triggerCategoryFilter === 'application_status'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Job Applications (6)</span>
                </button>
                <button
                  onClick={() => setTriggerCategoryFilter('subscription_update')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    triggerCategoryFilter === 'subscription_update'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Subscriptions & Pricing (6)</span>
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Auto-dispatches via Supabase Edge Function: <span className="text-indigo-400 font-bold">/{settings.functionName}</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTriggers.map((t) => {
              const isApp = t.category === 'application_status';
              return (
                <div
                  key={t.id}
                  className={`bg-slate-900/90 border rounded-2xl p-5 flex flex-col justify-between transition hover:border-slate-700 shadow-sm ${
                    t.enabled ? 'border-slate-800' : 'border-slate-800/60 opacity-70'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`p-2 rounded-xl text-xs ${
                            isApp
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isApp ? <FileCheck2 className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                        </span>
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                            {isApp ? 'ATS Funnel' : 'Billing & Pricing'}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                            {t.eventType}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleTrigger(t.id, t.name)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold transition cursor-pointer ${
                          t.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {t.enabled ? 'ENABLED' : 'PAUSED'}
                      </button>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-white">{t.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] font-mono space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Dispatched:</span>
                        <span className="text-indigo-300 font-bold">{t.totalTriggered} times</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Sample Target:</span>
                        <span className="text-slate-300 truncate max-w-[170px]">{t.sampleRecipient}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-800">
                    <button
                      onClick={() => handleOpenTriggerPreset(t)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Trigger Test</span>
                    </button>

                    <button
                      onClick={() => {
                        if (isApp) {
                          setPreviewTitle(`${t.name} (Preview)`);
                          setPreviewHtml(
                            adminNotificationService['generateApplicationHtmlPreview'](
                              {
                                applicationId: 'APP-2026-0812',
                                applicantName: 'Alex Morgan',
                                applicantEmail: t.sampleRecipient,
                                jobTitle: 'Senior Staff Frontend Architect',
                                companyName: 'Apex Cloud Solutions',
                                status: t.eventType as ApplicationNotificationStatus,
                                interviewDate: 'Thursday, 3:00 PM UTC',
                                salaryOffer: '$175,000 / year',
                                notes: 'Triggered from automated ATS rules engine.',
                              },
                              t.name
                            )
                          );
                        } else {
                          setPreviewTitle(`${t.name} (Preview)`);
                          setPreviewHtml(
                            adminNotificationService['generateSubscriptionHtmlPreview'](
                              {
                                subscriptionId: 'sub_sample_01',
                                customerName: 'Marcus Vance',
                                customerEmail: t.sampleRecipient,
                                companyName: 'Apex Cloud Solutions',
                                planName: 'Growth Recruiter Tier',
                                eventType: t.eventType as SubscriptionNotificationEvent,
                                amount: 149,
                                currency: 'USD',
                                invoiceNumber: 'INV-2026-0041',
                                paymentChannel: 'Paystack Multi-Currency Rail',
                                nextBillingDate: 'November 12, 2026',
                              },
                              t.name
                            )
                          );
                        }
                      }}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                      title="Preview rendered HTML template"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: MANUAL DISPATCH CONSOLE */}
      {/* ==================================================================== */}
      {activeTab === 'console' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Column */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-indigo-400" />
                  Direct Edge Function Trigger Console
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simulate or dispatch automated transactional email payloads directly via Supabase Edge Function
                </p>
              </div>

              {/* Category Switcher */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setDispatchCategory('application')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    dispatchCategory === 'application'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Job Application</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDispatchCategory('subscription')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    dispatchCategory === 'subscription'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Subscription Update</span>
                </button>
              </div>
            </div>

            {/* APPLICATION DISPATCH FORM */}
            {dispatchCategory === 'application' && (
              <form onSubmit={handleDispatchApplication} className="space-y-4">
                {/* Presets */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">Load Sample Candidate:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetApp('alex')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
                  >
                    Alex (Interview)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetApp('samantha')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
                  >
                    Samantha (Shortlist)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetApp('david')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
                  >
                    David (Offer)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Applicant Name</label>
                    <input
                      type="text"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Applicant Email</label>
                    <input
                      type="email"
                      value={appEmail}
                      onChange={(e) => setAppEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Job Title</label>
                    <input
                      type="text"
                      value={appJob}
                      onChange={(e) => setAppJob(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Hiring Company</label>
                    <input
                      type="text"
                      value={appCompany}
                      onChange={(e) => setAppCompany(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">New Application Status</label>
                    <select
                      value={appStatus}
                      onChange={(e) => setAppStatus(e.target.value as ApplicationNotificationStatus)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                    >
                      <option value="applied">applied (Application Received)</option>
                      <option value="under_review">under_review (Resume Screening)</option>
                      <option value="shortlisted">shortlisted (Top Candidate Stage)</option>
                      <option value="interview">interview (Interview Scheduled)</option>
                      <option value="offer">offer (Formal Offer Extended)</option>
                      <option value="hired">hired (Offer Accepted / Welcome)</option>
                      <option value="rejected">rejected (Respectful Decision)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Application Reference</label>
                    <input
                      type="text"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Conditional Fields based on status */}
                {appStatus === 'interview' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-3.5 rounded-xl bg-slate-950/80 border border-indigo-900/40">
                    <div>
                      <label className="block text-indigo-300 font-medium mb-1">Interview Date & Time</label>
                      <input
                        type="text"
                        value={appInterviewDate}
                        onChange={(e) => setAppInterviewDate(e.target.value)}
                        placeholder="e.g. Tomorrow at 3:00 PM UTC"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-indigo-300 font-medium mb-1">Meeting Room Link</label>
                      <input
                        type="url"
                        value={appMeetingLink}
                        onChange={(e) => setAppMeetingLink(e.target.value)}
                        placeholder="https://meet.jobhub.platform/..."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {appStatus === 'offer' && (
                  <div className="text-xs p-3.5 rounded-xl bg-slate-950/80 border border-emerald-900/40">
                    <label className="block text-emerald-300 font-medium mb-1">Compensation & Offer Package</label>
                    <input
                      type="text"
                      value={appSalaryOffer}
                      onChange={(e) => setAppSalaryOffer(e.target.value)}
                      placeholder="e.g. $185,000 / year + equity"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>
                )}

                <div className="text-xs">
                  <label className="block text-slate-300 font-medium mb-1">Recruiter Notes / Email Body Snippet</label>
                  <textarea
                    rows={2}
                    value={appNotes}
                    onChange={(e) => setAppNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isDispatching}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  <Send className={`w-4 h-4 ${isDispatching ? 'animate-bounce' : ''}`} />
                  <span>{isDispatching ? 'Dispatching via Edge Function...' : 'Trigger Application Email via Supabase Edge'}</span>
                </button>
              </form>
            )}

            {/* SUBSCRIPTION DISPATCH FORM */}
            {dispatchCategory === 'subscription' && (
              <form onSubmit={handleDispatchSubscription} className="space-y-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">Load Sample Subscriber:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetSub('apex')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
                  >
                    Apex (Price Update)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetSub('fintech')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
                  >
                    FinTech Pulse (Payment)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetSub('scaleup')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
                  >
                    ScaleUp (Renewed)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Subscriber / Customer Name</label>
                    <input
                      type="text"
                      value={subCustName}
                      onChange={(e) => setSubCustName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Customer Email</label>
                    <input
                      type="email"
                      value={subCustEmail}
                      onChange={(e) => setSubCustEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Plan Tier Name</label>
                    <input
                      type="text"
                      value={subPlan}
                      onChange={(e) => setSubPlan(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={subCompany}
                      onChange={(e) => setSubCompany(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Subscription Event Type</label>
                    <select
                      value={subEvent}
                      onChange={(e) => setSubEvent(e.target.value as SubscriptionNotificationEvent)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
                    >
                      <option value="plan_price_changed">plan_price_changed (Price / Limits Adjusted)</option>
                      <option value="subscription_created">subscription_created (New Welcome Activation)</option>
                      <option value="subscription_upgraded">subscription_upgraded (Tier Upgrade)</option>
                      <option value="payment_received">payment_received (Payment Receipt & Tax Invoice)</option>
                      <option value="subscription_renewed">subscription_renewed (Billing Cycle Renewed)</option>
                      <option value="subscription_expiring">subscription_expiring (Renewal Warning)</option>
                      <option value="subscription_cancelled">subscription_cancelled (Cancellation Notice)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Billing Amount & Currency</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={subAmount}
                        onChange={(e) => setSubAmount(Number(e.target.value))}
                        required
                        className="w-2/3 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <input
                        type="text"
                        value={subCurrency}
                        onChange={(e) => setSubCurrency(e.target.value)}
                        className="w-1/3 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Payment Rail</label>
                    <input
                      type="text"
                      value={subPaymentChannel}
                      onChange={(e) => setSubPaymentChannel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Invoice / Reference Number</label>
                    <input
                      type="text"
                      value={subInvoice}
                      onChange={(e) => setSubInvoice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isDispatching}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  <Send className={`w-4 h-4 ${isDispatching ? 'animate-bounce' : ''}`} />
                  <span>{isDispatching ? 'Dispatching via Edge Function...' : 'Trigger Subscription Email via Supabase Edge'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Telemetry & Output Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Live Edge Execution Telemetry
              </h3>

              {latestDispatchResult ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Dispatched via Edge Function
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/20">
                        HTTP {latestDispatchResult.httpStatusCode}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Execution Duration:</span>
                        <span className="text-emerald-300 font-bold">{latestDispatchResult.durationMs}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Execution ID:</span>
                        <span className="text-slate-300 truncate max-w-[160px]">{latestDispatchResult.edgeExecutionId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Recipient:</span>
                        <span className="text-slate-200 truncate max-w-[160px]">{latestDispatchResult.recipient}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Runtime Mode:</span>
                        <span className="text-indigo-300 font-bold">{latestDispatchResult.executionMode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Generated Email Subject</span>
                      <button
                        onClick={() => {
                          setPreviewTitle(latestDispatchResult.subject);
                          setPreviewHtml(latestDispatchResult.htmlPreview);
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview Full Email</span>
                      </button>
                    </div>
                    <p className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono break-all">
                      {latestDispatchResult.subject}
                    </p>
                  </div>

                  {/* HTML Mini Preview Box */}
                  <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
                    <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>HTML Output Render</span>
                      <span>Sandboxed Preview</span>
                    </div>
                    <div className="h-44 overflow-y-auto p-3 text-xs bg-slate-950/90 text-slate-300">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: latestDispatchResult.htmlPreview,
                        }}
                        className="scale-90 origin-top pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-300">Ready to Dispatch</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Fill out the form on the left or select a sample candidate / subscriber to test the automated Supabase Edge pipeline.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Config Quick Check */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
              <span className="font-mono text-slate-400 uppercase text-[10px] block">Target Edge Endpoint</span>
              <p className="font-mono text-indigo-300 break-all text-[11px]">
                {creds.url || 'https://placeholder-project.supabase.co'}/functions/v1/{settings.functionName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: DISPATCHED LOGS & TELEMETRY */}
      {/* ==================================================================== */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search recipient, subject, or event..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 w-64"
                />
              </div>

              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono"
              >
                <option value="all">All Notification Types</option>
                <option value="application_status">Application Status Only</option>
                <option value="subscription_update">Subscription Update Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm('Clear all local edge notification history logs?')) {
                    adminNotificationService.clearLogs();
                    showToast('Notification logs cleared');
                  }
                }}
                className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 font-medium cursor-pointer"
              >
                Clear History
              </button>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Recipient & Event</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Execution Latency</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No dispatched notification logs matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const isApp = log.category === 'application_status';
                      return (
                        <tr key={log.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4">
                            <div>
                              <p className="font-semibold text-white font-mono text-[11px]">{log.recipient}</p>
                              <span className="text-[10px] font-mono text-indigo-400 uppercase">
                                {log.eventType}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase ${
                                isApp
                                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {isApp ? 'Application ATS' : 'Subscription'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-slate-300 truncate" title={log.subject}>
                              {log.subject}
                            </p>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            <span className="text-emerald-400 font-bold">{log.durationMs}ms</span>
                            <span className="text-slate-500 block text-[10px]">
                              {log.executionMode === 'live_edge_function' ? 'Live Edge' : 'Simulated'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setPreviewTitle(log.subject);
                                  setPreviewHtml(log.htmlPreview);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                                title="View Email Preview"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setSelectedLogForDetail(log)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white transition cursor-pointer"
                                title="View Edge JSON Payload"
                              >
                                <Code2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: EDGE FUNCTION DEPLOYMENT & CODE */}
      {/* ==================================================================== */}
      {activeTab === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-400" />
                Supabase Edge Function Deployment Guide
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                The service layer triggers the <code className="text-indigo-300 font-mono">dispatch-notification</code> function deployed on your Supabase project. Follow these steps to deploy with the Supabase CLI.
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-mono text-slate-400 text-[11px] uppercase block">Step 1: Install & Link Supabase CLI</span>
                  <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-[11px] text-slate-200">
                    supabase link --project-ref {creds.url ? creds.url.replace('https://', '').split('.')[0] : 'your-project-id'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-mono text-slate-400 text-[11px] uppercase block">Step 2: Deploy Edge Function</span>
                  <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-[11px] text-slate-200">
                    supabase functions deploy dispatch-notification --no-verify-jwt
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-mono text-slate-400 text-[11px] uppercase block">Step 3: Optional Mail Delivery Key (Resend / SendGrid)</span>
                  <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-[11px] text-slate-200">
                    supabase secrets set RESEND_API_KEY=re_your_api_key
                  </div>
                </div>
              </div>
            </div>

            {/* Supabase Environment Status */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Environment Configuration Status
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Supabase Project URL:</span>
                  <span className="font-mono text-slate-200 truncate max-w-[200px]">{creds.url || 'Not set'}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Anon API Key:</span>
                  <span className="font-mono text-slate-200">{creds.anonKey ? 'Present (Configured)' : 'Missing'}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Service Fallback Mode:</span>
                  <span className="font-mono text-emerald-400 font-bold">Enabled (Resilient zero-crash)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Deno Source Code Preview */}
          <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">Edge Function Source Code</h3>
                  <p className="text-[11px] font-mono text-slate-400">supabase/functions/dispatch-notification/index.ts</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(edgeSampleCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2500);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[460px]">
                <pre>{edgeSampleCode}</pre>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-mono">
              The project root contains full ready-to-deploy files in <code className="text-slate-400">/supabase/functions</code>.
            </p>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: LIVE EMAIL PREVIEW */}
      {/* ==================================================================== */}
      {previewHtml && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{previewTitle}</h3>
                <span className="text-[11px] font-mono text-slate-400">Rendered HTML Output</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                      previewDevice === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                      previewDevice === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Mobile
                  </button>
                </div>

                <button
                  onClick={() => setPreviewHtml(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-950/70 flex justify-center">
              <div
                className={`transition-all duration-300 w-full ${
                  previewDevice === 'mobile' ? 'max-w-sm border border-slate-800 rounded-3xl p-2' : 'max-w-2xl'
                }`}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                  className="rounded-2xl overflow-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: LOG DETAILS & JSON PAYLOAD */}
      {/* ==================================================================== */}
      {selectedLogForDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Edge Function Execution Log</h3>
                <span className="text-[11px] font-mono text-indigo-400">{selectedLogForDetail.id}</span>
              </div>
              <button
                onClick={() => setSelectedLogForDetail(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Execution ID</span>
                <span className="text-slate-200">{selectedLogForDetail.edgeExecutionId}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Execution Duration</span>
                <span className="text-emerald-400 font-bold">{selectedLogForDetail.durationMs}ms</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-mono text-slate-400 block mb-1">Raw JSON Payload</span>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto max-h-56">
                {JSON.stringify(selectedLogForDetail.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
