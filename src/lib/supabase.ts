import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'jobhub_supabase_url';
const STORAGE_KEY_KEY = 'jobhub_supabase_anon_key';
const LEGACY_STORAGE_URL_KEY = 'talentforge_supabase_url';
const LEGACY_STORAGE_KEY_KEY = 'talentforge_supabase_anon_key';
const SAFE_FALLBACK_URL = 'https://placeholder-project.supabase.co';
const SAFE_FALLBACK_KEY = 'placeholder-anon-key-jobhub';

export function extractSupabaseUrl(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  // Check if string contains an embedded http/https url (e.g. from pasted .env format or NEXT_PUBLIC_SUPABASE_URL=https://...)
  const match = trimmed.match(/https?:\/\/[^\s"'=]+/i);
  if (match) {
    return match[0].replace(/[\/]+$/, '');
  }
  if (trimmed.includes('.supabase.co')) {
    const hostMatch = trimmed.match(/[a-z0-9_-]+\.supabase\.co/i);
    if (hostMatch) return `https://${hostMatch[0]}`;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.replace(/[\/]+$/, '');
  }
  return trimmed ? `https://${trimmed}`.replace(/[\/]+$/, '') : '';
}

export function extractSupabaseKey(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (trimmed.startsWith('eyJ') || trimmed.startsWith('sb_')) {
    return trimmed;
  }
  const jwtMatch = trimmed.match(/eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/);
  if (jwtMatch) return jwtMatch[0];
  const sbMatch = trimmed.match(/sb_publishable_[A-Za-z0-9_-]+/);
  if (sbMatch) return sbMatch[0];
  return trimmed;
}

export function isValidSupabaseUrl(urlString?: string | null): boolean {
  if (!urlString || typeof urlString !== 'string') return false;
  const clean = extractSupabaseUrl(urlString);
  if (!clean) return false;
  try {
    const url = new URL(clean);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      !url.hostname.includes('your-project-id') &&
      !url.hostname.includes('placeholder-project')
    );
  } catch {
    return false;
  }
}

export function normalizeSupabaseUrl(urlString: string): string {
  return extractSupabaseUrl(urlString);
}

export function getSupabaseCredentials(): { url: string; anonKey: string; source: 'env' | 'storage' | 'none' } {
  const envUrl = extractSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
  const envKey = extractSupabaseKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

  if (envUrl && envKey && isValidSupabaseUrl(envUrl)) {
    return { url: envUrl, anonKey: envKey, source: 'env' };
  }

  const storedUrl =
    typeof window !== 'undefined'
      ? (localStorage.getItem(STORAGE_URL_KEY) || localStorage.getItem(LEGACY_STORAGE_URL_KEY))?.trim()
      : null;
  const storedKey =
    typeof window !== 'undefined'
      ? (localStorage.getItem(STORAGE_KEY_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY_KEY))?.trim()
      : null;

  if (storedUrl && storedKey && isValidSupabaseUrl(storedUrl)) {
    return { url: normalizeSupabaseUrl(storedUrl), anonKey: extractSupabaseKey(storedKey), source: 'storage' };
  }

  // If stored URL was corrupted, clean it up so it doesn't cause recurring errors
  if (typeof window !== 'undefined' && storedUrl && !isValidSupabaseUrl(storedUrl)) {
    try {
      localStorage.removeItem(STORAGE_URL_KEY);
      localStorage.removeItem(STORAGE_KEY_KEY);
      localStorage.removeItem(LEGACY_STORAGE_URL_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY_KEY);
    } catch {
      // ignore in restrictive environments
    }
  }

  return { url: '', anonKey: '', source: 'none' };
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    const normalizedUrl = normalizeSupabaseUrl(url);
    const trimmedKey = anonKey.trim();

    if (isValidSupabaseUrl(normalizedUrl) && trimmedKey) {
      localStorage.setItem(STORAGE_URL_KEY, normalizedUrl);
      localStorage.setItem(STORAGE_KEY_KEY, trimmedKey);
    } else {
      localStorage.removeItem(STORAGE_URL_KEY);
      localStorage.removeItem(STORAGE_KEY_KEY);
      localStorage.removeItem(LEGACY_STORAGE_URL_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY_KEY);
    }
  }
}

export function clearSupabaseCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_KEY_KEY);
    localStorage.removeItem(LEGACY_STORAGE_URL_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY_KEY);
  }
}

const creds = getSupabaseCredentials();

// Fallback safe URL to avoid crashing the client constructor under any condition
const hasValidConfig = isValidSupabaseUrl(creds.url) && Boolean(creds.anonKey?.trim());
const clientUrl = hasValidConfig ? creds.url : SAFE_FALLBACK_URL;
const clientKey = hasValidConfig ? creds.anonKey : SAFE_FALLBACK_KEY;

function initSupabaseClient(): SupabaseClient {
  try {
    return createClient(clientUrl, clientKey, {
      auth: {
        persistSession: hasValidConfig,
        autoRefreshToken: hasValidConfig,
        detectSessionInUrl: hasValidConfig,
      },
    });
  } catch (e) {
    console.warn('Initial Supabase client initialization fell back to safe client', e);
    return createClient(SAFE_FALLBACK_URL, SAFE_FALLBACK_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
}

export const supabase: SupabaseClient = initSupabaseClient();

export interface ConnectionTestResult {
  connected: boolean;
  status: 'connected' | 'unauthorized' | 'not_configured' | 'error';
  message: string;
  tablesFound?: string[];
  latencyMs?: number;
  errorDetail?: string;
}

export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<ConnectionTestResult> {
  const rawUrl = (customUrl ?? getSupabaseCredentials().url)?.trim();
  const key = (customKey ?? getSupabaseCredentials().anonKey)?.trim();
  const url = normalizeSupabaseUrl(rawUrl || '');

  if (!url || !key || !isValidSupabaseUrl(url) || url.includes('placeholder-project')) {
    return {
      connected: false,
      status: 'not_configured',
      message: 'Please provide a valid Supabase HTTP or HTTPS URL (e.g. https://your-project.supabase.co) and Anonymous Key.',
    };
  }

  const startTime = performance.now();
  try {
    const testClient = createClient(url, key, {
      auth: { persistSession: false },
    });

    // Check basic query to public.job_categories or profiles
    const { data, error } = await testClient.from('job_categories').select('id, name').limit(3);

    const latencyMs = Math.round(performance.now() - startTime);

    if (error) {
      // Check if it's table not found (migration needed) vs auth failure
      if (error.code === '42P01') {
        return {
          connected: true,
          status: 'connected',
          latencyMs,
          message: 'Connected to Supabase successfully, but database schema has not been migrated yet. Run migration SQL below in Supabase SQL Editor.',
          errorDetail: error.message,
        };
      }
      return {
        connected: false,
        status: error.code === 'PGRST301' || error.message.includes('JWT') ? 'unauthorized' : 'error',
        latencyMs,
        message: `Database query failed: ${error.message} (code: ${error.code})`,
        errorDetail: error.details || error.hint || error.message,
      };
    }

    return {
      connected: true,
      status: 'connected',
      latencyMs,
      message: `Successfully connected to Supabase and queried tables (${data?.length ?? 0} sample categories retrieved).`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      status: 'error',
      message: `Network or configuration error connecting to Supabase: ${message}`,
      errorDetail: message,
    };
  }
}
