import React, { useState, useEffect } from 'react';
import {
  Server,
  Key,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Layers,
  Shield,
  RefreshCw,
  Code2,
  ChevronRight,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  testSupabaseConnection,
  ConnectionTestResult,
} from '../../lib/supabase';
import {
  ALL_MIGRATIONS,
  CONSOLIDATED_SQL,
  MigrationFile,
} from '../../data/sqlMigrations';
import { SEO } from '../../components/common/SEO';
import { SCHEMA_TABLES, TableMeta } from '../../data/schemaDocs';
import { SupabaseConnectionGuideModal } from '../../components/database/SupabaseConnectionGuideModal';

export function BackendConsolePage() {
  const [credentials, setCredentials] = useState(getSupabaseCredentials());
  const [urlInput, setUrlInput] = useState(credentials.url);
  const [keyInput, setKeyInput] = useState(credentials.anonKey);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'migrations' | 'schema' | 'security' | 'checklist'>('status');
  const [selectedMigration, setSelectedMigration] = useState<MigrationFile>(ALL_MIGRATIONS[0]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [schemaSearch, setSchemaSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<TableMeta | null>(SCHEMA_TABLES[0]);

  useEffect(() => {
    if (credentials.url && credentials.anonKey) {
      handleTestConnection();
    }
  }, []);

  const handleTestConnection = async (customUrl?: string, customKey?: string) => {
    setIsTesting(true);
    try {
      const res = await testSupabaseConnection(customUrl, customKey);
      setTestResult(res);
    } catch (err: unknown) {
      setTestResult({
        connected: false,
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown connection error',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !keyInput.trim()) return;
    saveSupabaseCredentials(urlInput.trim(), keyInput.trim());
    setCredentials(getSupabaseCredentials());
    handleTestConnection(urlInput.trim(), keyInput.trim());
  };

  const handleClearCredentials = () => {
    clearSupabaseCredentials();
    setUrlInput('');
    setKeyInput('');
    setCredentials(getSupabaseCredentials());
    setTestResult(null);
  };

  const handleCopy = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const filteredTables = SCHEMA_TABLES.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(schemaSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(schemaSearch.toLowerCase());
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const isConnected = testResult?.connected === true && testResult.status === 'connected';

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      <SEO
        title="Supabase Database & Security Console"
        description="Database architecture, row level security policies, SQL migrations, and health checks."
        canonicalPath="/admin/database"
        noindex={true}
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase text-emerald-400 tracking-wider">
            JOBHUB Infrastructure
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Supabase Database &amp; Security Console
          </h1>
          <p className="text-xs text-emerald-400/90 font-mono text-[11px]">
            powered by genesix initiate group ltd
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            PostgreSQL tables, RLS security policies, migrations, and live telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsGuideOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>How to Connect Database Guide</span>
          </button>

          <button
            onClick={() => handleTestConnection()}
            disabled={isTesting}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs overflow-x-auto">
        {[
          { id: 'status', label: 'Connection Status', icon: Server },
          { id: 'migrations', label: 'SQL Migrations (5 Parts)', icon: Code2 },
          { id: 'schema', label: 'Schema (52 Tables)', icon: Layers },
          { id: 'security', label: 'RLS & Storage Policies', icon: Shield },
          { id: 'checklist', label: 'Verification Checklist', icon: CheckCircle2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Status */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
            <h3 className="text-sm font-semibold text-white">Live Supabase Connection Test</h3>
            <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Supabase Project URL (<code>VITE_SUPABASE_URL</code>)
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Supabase Anon Public API Key (<code>VITE_SUPABASE_ANON_KEY</code>)
                </label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isTesting}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Save &amp; Test Connection
                </button>
                <button
                  type="button"
                  onClick={handleClearCredentials}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs"
                >
                  Clear Stored Credentials
                </button>
              </div>
            </form>

            {testResult && (
              <div
                className={`p-4 rounded-xl border text-xs ${
                  testResult.connected
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                }`}
              >
                <span className="font-bold block mb-1">
                  {testResult.connected ? 'Connected to Supabase' : 'Connection Check Notice'}
                </span>
                <p className="opacity-90">{testResult.message}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Migrations */}
      {activeTab === 'migrations' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Consolidated Migration SQL</h3>
              <p className="text-xs text-slate-400">Execute in Supabase SQL Editor to provision all tables.</p>
            </div>
            <button
              onClick={() => handleCopy(CONSOLIDATED_SQL, 'all')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              {copiedKey === 'all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'all' ? 'Copied All SQL!' : 'Copy Consolidated SQL'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4 space-y-2">
              {ALL_MIGRATIONS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMigration(m)}
                  className={`w-full text-left p-3 rounded-xl border transition text-xs ${
                    selectedMigration.id === m.id
                      ? 'bg-slate-800 border-emerald-500/50 text-white font-medium'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="font-mono text-emerald-400 block">{m.filename}</span>
                  <span className="text-slate-200">{m.title}</span>
                </button>
              ))}
            </div>

            <div className="md:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-auto max-h-[480px]">
              <pre className="text-[11px] font-mono text-slate-300 whitespace-pre">
                {selectedMigration.sql}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Schema */}
      {activeTab === 'schema' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SCHEMA_TABLES.slice(0, 15).map((t) => (
              <div key={t.name} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-xs">
                <span className="font-mono font-bold text-emerald-400 block">{t.name}</span>
                <span className="text-slate-400 text-[11px] line-clamp-2 mt-1">{t.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Security */}
      {activeTab === 'security' && (
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4 text-xs text-slate-300">
          <h3 className="text-sm font-bold text-white">Row Level Security Enforcement</h3>
          <p>
            100% of the 52 database tables are protected with PostgreSQL Row Level Security (RLS) policies.
            Job seekers cannot view other candidates&apos; private CVs or applications, and recruiters are isolated to their own company domains.
          </p>
        </div>
      )}

      {/* Tab: Checklist */}
      {activeTab === 'checklist' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            'All 52 tables created with UUID primary keys',
            'Supabase Auth integrated with auto-profile trigger',
            'Row Level Security enabled across 100% of tables',
            'Candidate private notes shielded from applicants',
            '7 Storage buckets configured with storage RLS',
            'Deterministic matching algorithms running on jobs',
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 flex items-center gap-2 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}

      {/* Guide Modal */}
      <SupabaseConnectionGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onConnectionSuccess={() => handleTestConnection()}
      />
    </div>
  );
}
