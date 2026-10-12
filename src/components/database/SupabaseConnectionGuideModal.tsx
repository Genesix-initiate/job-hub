import React, { useState } from 'react';
import {
  X,
  Database,
  Key,
  Link2,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Code2,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Terminal,
  Layers,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  normalizeSupabaseUrl,
  isValidSupabaseUrl,
  ConnectionTestResult,
} from '../../lib/supabase';
import { CONSOLIDATED_SQL } from '../../data/sqlMigrations';

export interface SupabaseConnectionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionSuccess?: () => void;
}

export function SupabaseConnectionGuideModal({
  isOpen,
  onClose,
  onConnectionSuccess,
}: SupabaseConnectionGuideModalProps) {
  const [credentials, setCredentials] = useState(getSupabaseCredentials());
  const [urlInput, setUrlInput] = useState(credentials.url || '');
  const [keyInput, setKeyInput] = useState(credentials.anonKey || '');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  if (!isOpen) return null;

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleSaveAndTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    const normalizedUrl = normalizeSupabaseUrl(urlInput.trim());
    const trimmedKey = keyInput.trim();

    if (!isValidSupabaseUrl(normalizedUrl)) {
      setTestResult({
        connected: false,
        status: 'not_configured',
        message: 'Invalid Supabase URL format. Please enter a valid URL such as https://your-project.supabase.co',
      });
      setIsTesting(false);
      return;
    }

    if (!trimmedKey) {
      setTestResult({
        connected: false,
        status: 'not_configured',
        message: 'Supabase anon API key is required.',
      });
      setIsTesting(false);
      return;
    }

    // Save inputs
    saveSupabaseCredentials(normalizedUrl, trimmedKey);
    setUrlInput(normalizedUrl);
    setCredentials({ url: normalizedUrl, anonKey: trimmedKey, source: 'storage' });

    try {
      const result = await testSupabaseConnection(normalizedUrl, trimmedKey);
      setTestResult(result);
      if (result.connected && onConnectionSuccess) {
        onConnectionSuccess();
      }
    } catch (e: any) {
      setTestResult({
        connected: false,
        status: 'error',
        message: e?.message || 'Failed to connect to Supabase endpoint.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-4 sm:p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  How to Connect JOBHUB to Your Supabase Database
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  STEP-BY-STEP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Follow this simple 4-step guide to connect your real PostgreSQL backend and sync all tables.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Navigation Bar */}
        <div className="bg-slate-950 px-4 sm:px-6 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-semibold overflow-x-auto gap-2">
          <button
            onClick={() => setActiveStep(1)}
            className={`py-1.5 px-3 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeStep === 1 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>1. Create Project</span>
          </button>
          <button
            onClick={() => setActiveStep(2)}
            className={`py-1.5 px-3 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeStep === 2 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>2. Copy API Keys</span>
          </button>
          <button
            onClick={() => setActiveStep(3)}
            className={`py-1.5 px-3 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeStep === 3 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>3. Run SQL Migration</span>
          </button>
          <button
            onClick={() => setActiveStep(4)}
            className={`py-1.5 px-3 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeStep === 4 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>4. Test & Save</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 text-xs">
          {/* STEP 1: CREATE PROJECT */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">1</span>
                  Create a Free Supabase Project
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Supabase provides an open-source Postgres database, authentication, and instant REST APIs.
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pt-1">
                  <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline font-semibold">https://supabase.com</a> and sign in or sign up.</li>
                  <li>Click <strong>&quot;New Project&quot;</strong> in your Supabase organization.</li>
                  <li>Enter a Project Name (e.g., <code className="text-white font-mono bg-slate-900 px-1 py-0.5 rounded">jobhub-db</code>) and choose a secure database password.</li>
                  <li>Select your closest region (e.g. EU West or US East) and click <strong>&quot;Create new project&quot;</strong>.</li>
                </ol>
              </div>

              <div className="flex justify-between items-center pt-2">
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Supabase Dashboard
                </a>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                >
                  Next: Copy API Keys &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: COPY API KEYS */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">2</span>
                  Locate Your Project URL &amp; Anon Key
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Inside your Supabase project dashboard:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                  <li>Click on the <strong>Project Settings</strong> gear icon in the bottom-left sidebar.</li>
                  <li>Select <strong>API</strong> under Configuration.</li>
                  <li>Find the <strong>Project URL</strong> (looks like <code className="text-emerald-300 font-mono">https://xxxxxxxxxxxx.supabase.co</code>).</li>
                  <li>Find the <strong>Project API Keys</strong> &rarr; copy the <code className="text-emerald-300 font-mono">anon</code> (public) key.</li>
                </ol>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white">Enter Your Credentials Now:</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Project URL (VITE_SUPABASE_URL)</label>
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://your-project.supabase.co"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Anon Public Key (VITE_SUPABASE_ANON_KEY)</label>
                    <input
                      type="password"
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="text-slate-400 hover:text-white"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                >
                  Next: Run SQL Schema &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: RUN SQL SCHEMA */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">3</span>
                    Execute the Complete Database Schema in SQL Editor
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleCopy(CONSOLIDATED_SQL, 'sql')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer shadow-md"
                  >
                    {copiedSection === 'sql' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'sql' ? 'Copied to Clipboard!' : '1-Click Copy Full SQL Schema'}</span>
                  </button>
                </div>

                <p className="text-slate-300 leading-relaxed">
                  We have prepared the complete consolidated SQL script that sets up all 18 tables, custom enums, RLS security policies, triggers, and indices for JOBHUB.
                </p>

                <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                  <li>In your Supabase dashboard, click <strong>SQL Editor</strong> in the left navigation.</li>
                  <li>Click <strong>&quot;New query&quot;</strong>.</li>
                  <li>Click the <strong>&quot;1-Click Copy Full SQL Schema&quot;</strong> button above, paste the code into the query box.</li>
                  <li>Click the green <strong>&quot;Run&quot;</strong> button. That&apos;s it! All tables will be generated instantly.</li>
                </ol>

                <div className="mt-2 bg-slate-900 border border-slate-800 rounded-xl p-3 max-h-36 overflow-y-auto font-mono text-[11px] text-slate-400">
                  <pre>{CONSOLIDATED_SQL.slice(0, 500)}...</pre>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="text-slate-400 hover:text-white"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                >
                  Next: Test Connection &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: TEST & SAVE */}
          {activeStep === 4 && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">4</span>
                  Save Credentials &amp; Verify Connection
                </h3>
                <p className="text-slate-300">
                  Click the button below to test connectivity to your Supabase instance.
                </p>

                <div className="space-y-2 pt-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Target Project URL:</label>
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://your-project.supabase.co"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Target Anon Key:</label>
                    <input
                      type="password"
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isTesting || !urlInput.trim() || !keyInput.trim()}
                  onClick={handleSaveAndTest}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Testing Supabase Ping & Schema...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save &amp; Test Live Supabase Connection</span>
                    </>
                  )}
                </button>

                {/* Test Result Feedback */}
                {testResult && (
                  <div
                    className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                      testResult.connected
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                        : 'bg-rose-950/60 border-rose-800 text-rose-300'
                    }`}
                  >
                    {testResult.connected ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <h4 className="font-bold text-xs">
                        {testResult.connected ? 'Connected to Supabase Successfully!' : 'Connection Check Failed'}
                      </h4>
                      <p className="text-[11px] mt-0.5 opacity-90">{testResult.message}</p>
                      {testResult.latencyMs && (
                        <p className="text-[10px] font-mono mt-1 opacity-75">
                          API Response Latency: {testResult.latencyMs}ms
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Environment Variables Reference */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-300">Permanent Production Setup (.env):</span>
                <p className="text-[11px] text-slate-400">
                  For permanent hosting, set these variables in your deployment environment:
                </p>
                <div className="bg-slate-900 p-2 rounded font-mono text-[11px] text-emerald-400 flex justify-between items-center">
                  <span>VITE_SUPABASE_URL=https://your-project.supabase.co<br />VITE_SUPABASE_ANON_KEY=your-anon-key</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(`VITE_SUPABASE_URL=${urlInput || 'https://your-project.supabase.co'}\nVITE_SUPABASE_ANON_KEY=${keyInput || 'your-anon-key'}`, 'env')}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    {copiedSection === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="text-slate-400 hover:text-white"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
                >
                  Close Guide
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
